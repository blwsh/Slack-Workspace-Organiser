export const element = document.getElementById('visit-slack-notice') as HTMLDivElement;

export function show(show: boolean) {
  element.style.display = show ? 'block' : 'none';
}
