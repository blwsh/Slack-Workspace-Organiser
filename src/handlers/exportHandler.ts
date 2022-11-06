import {InitSlack} from "../util";
import {ChannelSection} from "../types";
import copy from "copy-to-clipboard";
import * as yaml from "js-yaml";
import * as ui from "../ui";

export async function exportHandler() {
  try {
    ui.exportButton.disableButton();

    const slack = await InitSlack();

    const channelIdToNameMap = await slack.getConversationIdsToNameMap(await slack.listUsers())

    // Get current state of channel sections, so they can be exported
    slack.postMessage('users.channelSections.list').then(res => {
      const {channel_sections: sections} = res as { channel_sections: ChannelSection[] };

      if (!sections) {
        console.log('No sections found', res);
        return;
      }

      const yamlStruct: {[key: string]: { emoji: string, channels: string[]}} = {};

      sections.forEach(({name, emoji, channel_ids_page: channels}) => {
        yamlStruct[name] = {
          emoji,
          channels: channels.channel_ids.map(id => channelIdToNameMap[id] || id)
        }
      })

      copy(yaml.dump(yamlStruct));
      ui.exportButton.enableButton();
      alert('✅ Channel sections copied to clipboard.');
    });
  } catch (e) {
    alert('❌ Error exporting channel sections.');
    console.error(e);
    throw e;
  }

  ui.exportButton.enableButton();
}
