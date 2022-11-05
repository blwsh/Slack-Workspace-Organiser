export const element = document.getElementById('introduction') as HTMLDivElement;

export function show() {
  element.style.display = 'block';
}

export function hide() {
  element.style.display = 'none';
}
