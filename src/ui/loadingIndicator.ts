export const element = document.getElementById('loading-indicator') as HTMLDivElement;

export function show(show: boolean = true) {
  element.style.display = show ? 'block' : 'none';
}
