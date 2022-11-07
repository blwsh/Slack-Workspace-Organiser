import {
  cancelImportHandler,
  exportHandler,
  onImporterTextChangeHandler,
  openImporterHandler,
  processImportHandler
} from "./handlers";
import * as ui from "./ui";
import * as sharedUtils from "./utils/sharedUtils";

// Attach handlers to popup elements
ui.exportButton.element.addEventListener('click', exportHandler);
ui.openImporterButton.element.addEventListener('click', openImporterHandler);
ui.processImportButton.element.addEventListener('click', processImportHandler);
ui.cancelImportButton.element.addEventListener('click', cancelImportHandler);
ui.importer.textElement.addEventListener('change', onImporterTextChangeHandler);
ui.importer.textElement.addEventListener('mouseleave', onImporterTextChangeHandler);

// Initialize popup
(async () => {
  let hasToken = !!await sharedUtils.getSlackToken()

  // Loop until we have a token
  while (!hasToken) {
    console.log('Checking for token...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    hasToken = !!await sharedUtils.getSlackToken()
  }

  // Once we have a token, we can show the UI
  sharedUtils.getSlackToken().then(token => {
    if (token) {
      ui.visitSlackNotice.show(false);
      ui.statusIndicator.setIsOk(true);
      ui.introduction.show(true);
    }
  });
})();
