import * as yaml from "js-yaml";
import * as ui from "../ui";
import {InitSlack, swap} from "../util";
import {ChannelSection} from "../types";
import Slack from "../slack";

type ImportRows = Record<string, { emoji?: string, channels?: string[] }>

export async function processImportHandler() {
  ui.importerMessage.setMessage('');
  ui.processImportButton.setEnabled(false);
  ui.processImportButton.setText('Importing...');

  const sectionsToImport = (yaml.load(ui.importer.textElement.value) || {}) as ImportRows;

  try {
    const slack = await InitSlack();
    console.log('Importing', sectionsToImport);

    // Create all maps which are required to resolve channel names and usernames to conversation ids.
    console.log('Getting users');
    const userIdToUsernameMap = await slack.listUsers();

    console.log('Getting channels');
    const channelNameToIdMap = swap(await slack.getConversationIdsToNameMap(userIdToUsernameMap));

    console.log('Getting sections');
    const {channel_sections: existingSections} = await slack.postMessage('users.channelSections.list') as { channel_sections: ChannelSection[] };
    const sectionNameToIdMap = Object.fromEntries(
      existingSections.map(({channel_section_id: id, name}) => [name, id])
    );

    console.log('Channel names to channel ID map', channelNameToIdMap)
    console.log('Section names to section ID map', sectionNameToIdMap);

    // Iterate over each section to import
    for (const [sectionName, section] of Object.entries(sectionsToImport)) {
      let sectionId = sectionNameToIdMap[sectionName];

      const {emoji, channels = []} = section || {};

      // If sectionId is falsey it's because a mapping for the section name to section id doesn't exist which in turn
      // means the section doesn't exist in the slack workspace yet and needs to be created.
      if (!sectionId) {
        // Create the section and update the sectionId variable
        sectionNameToIdMap[sectionName] = sectionId = await createSection(sectionName, emoji, slack);
        console.log('Created new section', sectionId);

        // If the sectionId is still falsey, it means the section couldn't be created, and we should skip this section.
        if (!sectionId) {
          console.warn('Unable to create section', sectionName);
          continue;
        }
      }

      // Move channels to section
      if (channels.length) {
        console.log('Moving conversations to section', sectionName, channels);
        moveChannelsToSection(
          sectionId, channels.map(channelName => channelNameToIdMap[channelName]).filter(Boolean), slack
        ).catch(console.warn);
      }
    }

    // Update the UI
    console.log('✅ Import complete');
    ui.importerMessage.setMessage('Import successful!');
    ui.modal.setContent(`<h1>✅ Import successful!</h1>`);
    ui.modal.show(true);
  } catch (e) {
    // Show error message in UI
    console.error(e);
    ui.importerMessage.setMessage('There was an error importing your sections.');
    ui.modal.setContent(`<h1>❌ There was an error importing your sections.</h1>`);
    ui.modal.show(true);
  }

  ui.processImportButton.setEnabled(true);
  ui.processImportButton.setText('Import');
}

async function createSection(name: string, emoji: string = '', slack: Slack): Promise<string> {
  return slack.postMessage('users.channelSections.create', {name, emoji}).then(res => {
    return res.channel_section_id;
  })
}

async function moveChannelsToSection(sectionId: string, channelIds: string[], slack: Slack): Promise<void> {
  return slack.postMessage('users.channelSections.channels.bulkUpdate', {
    insert: JSON.stringify([{channel_section_id: sectionId, channel_ids: channelIds}])
  })
}
