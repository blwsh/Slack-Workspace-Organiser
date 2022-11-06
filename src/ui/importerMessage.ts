export const element = document.getElementById('importerMessage') as HTMLSpanElement;

export function setMessage(message: string) {
  element.innerText = message;
}
