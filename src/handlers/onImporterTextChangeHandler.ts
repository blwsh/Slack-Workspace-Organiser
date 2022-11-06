import * as yaml from "js-yaml";
import * as ui from "../ui";

export function onImporterTextChangeHandler(changeEvent: Event) {
  const textElement = changeEvent.target as HTMLTextAreaElement;
  const text = textElement.value;

  if (text === "Importing...") return;

  const loaded = yaml.load(text);
  const isOk = loaded instanceof Object && Object.keys(loaded).length > 0

  ui.importerMessage.setMessage(isOk ? "" : "Invalid YAML");
  ui.processImportButton.setEnabled(isOk);
}
