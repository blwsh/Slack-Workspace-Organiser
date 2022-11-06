export const element = document.getElementById('importer') as HTMLDivElement

export const textElement = document.getElementById('importerText') as HTMLTextAreaElement;

export function show(show: boolean = true) {
  element.style.display = show ? 'block' : 'none';
}
