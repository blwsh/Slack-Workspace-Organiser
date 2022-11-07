export const element = document.getElementById('modal') as HTMLDivElement;
export const containerElement = document.getElementById('modal-container') as HTMLDivElement;
export const contentElement = document.getElementById('modal-content') as HTMLDivElement;
export const closeModalElement = document.getElementById('closeModal') as HTMLButtonElement;

closeModalElement.addEventListener('click', () => {
  show(false);
});

export function show(show: boolean = true) {
  containerElement.style.display = show ? 'block' : 'none';
}

export function setContent(content: string) {
  contentElement.innerHTML = content;
}

export function showWithMessage(message: string) {
  setContent(message);
  show(true);
}
