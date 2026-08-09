// Closes only when the backdrop itself is clicked, not its children
export function createBackdropClickHandler(onClose, { stopPropagation = false } = {}) {
  return (event) => {
    if (event.target !== event.currentTarget) return;
    if (stopPropagation) event.stopPropagation();
    onClose();
  };
}
