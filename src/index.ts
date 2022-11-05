import {captureXoxcToken} from "./util";
import {cancelImportHandler, exportHandler, processImportHandler} from "./handlers";
import * as ui from "./ui";
import {openImporterHandler} from "./handlers/openImporterHandler";

// Find and store tokens which are used to authenticate with Slack
chrome.webRequest.onBeforeRequest
  .addListener(captureXoxcToken, {urls: ["https://*.slack.com/api/*"]}, ["requestBody"]);

// Attach handlers to popup buttons
ui.exportButton.element.addEventListener('click', exportHandler);
ui.openImporterButton.element.addEventListener('click', openImporterHandler);
ui.processImportButton.element.addEventListener('click', processImportHandler);
ui.cancelImportButton.element.addEventListener('click', cancelImportHandler);
