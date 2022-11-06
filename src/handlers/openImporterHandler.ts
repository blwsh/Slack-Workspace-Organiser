import * as ui from "../ui";

export function openImporterHandler() {
  ui.importer.show(true);
  ui.introduction.show(false)
}
