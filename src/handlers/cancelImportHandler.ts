import * as ui from "../ui";

export function cancelImportHandler() {
  ui.importer.hide();
  ui.introduction.show();
}
