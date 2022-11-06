export const element = document.getElementById('processImport') as HTMLButtonElement;

export function setText(text: string) {
  element.innerText = text;
}

export function setEnabled(enabled: boolean) {
  element.disabled = !enabled;
}
