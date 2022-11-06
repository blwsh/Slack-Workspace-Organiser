export const element = document.getElementById('status-indicator') as HTMLDivElement

export function setIsOk(b: boolean) {
  element.classList.toggle('status-indicator--ok', b);
}

