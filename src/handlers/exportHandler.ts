import {InitSlack} from "../utils/popupUtils";
import {ChannelSection} from "../types";
import copy from "copy-to-clipboard";
import * as yaml from "js-yaml";
import * as ui from "../ui";

const IGNORED_SECTIONS = ['', 'Slack Connect', 'Recent Apps'];

export async function exportHandler() {
  try {
    ui.exportButton.disableButton();
    ui.loadingIndicator.show(true)

    const slack = await InitSlack();

    const channelIdToNameMap = await slack.getConversationIdsToNameMap(await slack.listUsers())

    // Get current state of channel sections, so they can be exported
    slack.postMessage('users.channelSections.list').then(res => {
      const {channel_sections: sections} = res as { channel_sections: ChannelSection[] };

      if (!sections) {
        console.warn('No sections found', res);
        return;
      }

      const yamlStruct: {[key: string]: { emoji: string, channels: string[]}} = {};

      sections.forEach(({name, emoji, channel_ids_page: channels}) => {
        if (IGNORED_SECTIONS.includes(name)) return;

        yamlStruct[name] = {
          emoji,
          channels: channels.channel_ids.map(id => channelIdToNameMap[id] || id)
        }
      })

      // Copies exported yaml to clipboard
      copy(yaml.dump(yamlStruct));

      resetUIWithMessage(`<h1>✅ Channel sections copied to clipboard</h1>`)
    });
  } catch (e) {
    resetUIWithMessage(`<h1>❌ Error exporting channel sections.</h1>`)
    console.error(e);
    throw e;
  }
}

function resetUIWithMessage(message: string) {
  ui.exportButton.enableButton();
  ui.loadingIndicator.show(false)
  ui.modal.setContent(`<h1>${message}</h1>`);
  ui.modal.show(true);
}
