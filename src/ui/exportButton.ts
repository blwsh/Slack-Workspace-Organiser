export const element = document.getElementById('exportButton') as HTMLButtonElement;

export function disableButton() {
  element.disabled = true;
  element.textContent = 'Exporting...';
}

export function enableButton() {
  element.disabled = false;
  element.textContent = 'Export';
}
