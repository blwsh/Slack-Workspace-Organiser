import * as ui from "../ui";

export function cancelImportHandler() {
  ui.importer.show(false);
  ui.introduction.show(true);
}
