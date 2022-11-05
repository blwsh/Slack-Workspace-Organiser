export const element = document.getElementById('importer') as HTMLDivElement

export const textElement = document.getElementById('importerText') as HTMLTextAreaElement;

export function hide() {
  element.style.display = "none";
}

export function show() {
  element.style.display = 'block';
}
