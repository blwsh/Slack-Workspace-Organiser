import * as yaml from "js-yaml";
import * as ui from "../ui";
import {InitSlack, swap} from "../utils/popupUtils";
import {ChannelSection} from "../types";
import Slack from "../services/slack";

type ImportRows = Record<string, { emoji?: string, channels?: string[] }>

export async function processImportHandler() {
  ui.loadingIndicator.show(true)
  ui.processImportButton.setEnabled(false);
  ui.processImportButton.setText('Importing...');
  ui.importerMessage.setMessage('Do not close window.');

  console.log('Parsing YAML');
  const sectionsToImport = (yaml.load(ui.importer.textElement.value) || {}) as ImportRows;

  try {
    const slack = await InitSlack();
    console.log('Importing', sectionsToImport);

    console.group('Create maps for import');

    // Create all maps which are required to resolve channel names and usernames to conversation ids.
    console.log('Getting users');
    const userIdToUsernameMap = await slack.listUsers();

    console.log('Getting channels');
    const channelNameToIdMap = swap(await slack.getConversationIdsToNameMap(userIdToUsernameMap));
    console.log('Channel names to channel ID map', channelNameToIdMap)

    console.log('Getting sections');
    const {channel_sections: existingSections} = await slack.postMessage('users.channelSections.list') as { channel_sections: ChannelSection[] };
    const sectionNameToIdMap = Object.fromEntries(
      existingSections.map(({channel_section_id: id, name}) => [name, id])
    );
    console.log('Section names to section ID map', sectionNameToIdMap);

    const channelIdToSectionIdMap: Record<string, any> = {};
    existingSections.forEach(({channel_section_id: sectionId, channel_ids_page}) => {
      channel_ids_page.channel_ids.forEach(channelId => {
        channelIdToSectionIdMap[channelId] = sectionId;
      });
    });
    console.log('Channel name to section ID map', channelIdToSectionIdMap);

    console.groupEnd();

    console.group('Importing sections');

    // Iterate over each section to import
    for (const [sectionName, section] of Object.entries(sectionsToImport)) {
      let destinationSectionId = sectionNameToIdMap[sectionName];

      const {emoji, channels = []} = section || {};

      // If destinationSectionId is falsey it's because a mapping for the section name to section id doesn't exist which in turn
      // means the section doesn't exist in the slack workspace yet and needs to be created.
      if (!destinationSectionId) {
        // Create the section and update the destinationSectionId variable
        sectionNameToIdMap[sectionName] = destinationSectionId = await createSection(sectionName, emoji, slack);
        console.log('Created new section', destinationSectionId);

        // If the destinationSectionId is still falsey, it means the section couldn't be created, and we should skip this section.
        if (!destinationSectionId) {
          console.warn('Unable to create section', sectionName);
          continue;
        }
      }

      // Move channels to section
      if (channels.length) {
        // Group channels by section id
        const groupedChannels = {} as Record<string, string[]>;
        channels.forEach(channelName => {
          const sectionId = channelIdToSectionIdMap[channelNameToIdMap[channelName]];
          const arr = groupedChannels[sectionId] || []
          groupedChannels[sectionId] = [...arr, channelName];
        })

        Object.entries(groupedChannels).forEach(([currentSectionId, groupChannels]) => {
          console.log(`Moving conversations from section ${currentSectionId} to ${destinationSectionId}`, groupChannels);

          moveChannelsToSection(
            destinationSectionId,
            currentSectionId,
            groupChannels.map(channelName => channelNameToIdMap[channelName] || channelName).filter(Boolean),
            slack
          ).catch(console.warn);
        });
      }
    }

    console.groupEnd();

    console.log('✅ Import complete');
    ui.modal.showWithMessage(`<h1>✅ Import successful!</h1>`);
    ui.importerMessage.setMessage('Import successful!');
  } catch (e) {
    console.error(e);
    ui.modal.showWithMessage(`<h1>❌ There was an error importing your sections.</h1>`);
    ui.importerMessage.setMessage('There was an error importing your sections.');
  }

  resetUI();
}

function resetUI() {
  ui.processImportButton.setText('Import');
  ui.processImportButton.setEnabled(true);
  ui.loadingIndicator.show(false);
}

async function createSection(name: string, emoji: string = '', slack: Slack): Promise<string> {
  return slack.postMessage('users.channelSections.create', {name, emoji}).then(res => {
    return res.channel_section_id;
  })
}

async function moveChannelsToSection(
  newSectionId: string,
  oldSectionId: string,
  channelIds: string[],
  slack: Slack
) {
  const body: Record<string, any> = {
    insert: JSON.stringify([{channel_section_id: newSectionId, channel_ids: channelIds}]),
  }

  if (oldSectionId && oldSectionId !== 'undefined') {
    body['remove'] = JSON.stringify([{channel_section_id: oldSectionId, channel_ids: channelIds}]);
  }

  return slack.postMessage('users.channelSections.channels.bulkUpdate', body)
}
