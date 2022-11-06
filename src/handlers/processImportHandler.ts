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

    const userIdToUsernameMap = await slack.listUsers();

    const channelNameToIdMap: Record<string, string> = swap(await slack.getConversationIdsToNameMap(userIdToUsernameMap));

    const {channel_sections: existingSections} = await slack.postMessage('users.channelSections.list') as { channel_sections: ChannelSection[] };
    const sectionNameToIdMap: Record<string, string> = Object.fromEntries(
      existingSections.map(({channel_section_id: id, name}) => [name, id])
    );

    for (const [sectionName, section] of Object.entries(sectionsToImport)) {
      let sectionId = sectionNameToIdMap[sectionName];

      const {emoji, channels = []} = section || {};

      if (!sectionId) {
        sectionNameToIdMap[sectionName] = sectionId = await createSection(sectionName, emoji, slack);

        if (!sectionId) {
          console.warn('Unable to create section', sectionName);
          continue;
        }
      }

      // Move channels to section
      if (channels.length) {
        slack.postMessage('users.channelSections.channels.bulkUpdate', {
          insert: JSON.stringify([
            {
              "channel_section_id": sectionId,
              "channel_ids": channels.map(channelName => channelNameToIdMap[channelName]),
            }
          ])
        }).catch(console.error);
      }
    }

    ui.importerMessage.setMessage('Imported successfully!');
  } catch (e) {
    ui.importerMessage.setMessage('There was an error importing your sections.');
    console.error(e);
  }

  ui.processImportButton.setEnabled(true);
  ui.processImportButton.setText('Import');
}

async function createSection(name: string, emoji: string = '', slack: Slack): Promise<string> {
  return slack.postMessage('users.channelSections.create', {name, emoji}).then(res => {
    console.log('Created new section', res);
    return res.channel_section_id;
  }).catch(err => {
    console.error('Error creating new section', err);
    return '';
  });
}
