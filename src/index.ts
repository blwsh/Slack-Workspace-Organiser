import {captureXoxcToken} from "./util";
import {
  cancelImportHandler,
  exportHandler,
  onImporterTextChangeHandler,
  openImporterHandler,
  processImportHandler
} from "./handlers";
import * as ui from "./ui";
import * as util from "./util";

// Find and store tokens which are used to authenticate with Slack
chrome.webRequest.onBeforeRequest
  .addListener(captureXoxcToken, {urls: ["https://*.slack.com/api/*"]}, ["requestBody"]);

// Attach handlers to popup buttons
ui.exportButton.element.addEventListener('click', exportHandler);
ui.openImporterButton.element.addEventListener('click', openImporterHandler);
ui.processImportButton.element.addEventListener('click', processImportHandler);
ui.cancelImportButton.element.addEventListener('click', cancelImportHandler);
ui.importer.textElement.addEventListener('change', onImporterTextChangeHandler);
ui.importer.textElement.addEventListener('mouseleave', onImporterTextChangeHandler);

// Update the status indicator
util.getSlackToken().then(token => {
  ui.statusIndicator.setIsOk(!!token);
  ui.introduction.show(!!token);
  ui.visitSlackNotice.show(!token);
});
