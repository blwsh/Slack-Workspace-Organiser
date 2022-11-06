export const element = document.getElementById('introduction') as HTMLDivElement;

export function show(show: boolean = true) {
  element.style.display = show ? 'block' : 'none';
}
