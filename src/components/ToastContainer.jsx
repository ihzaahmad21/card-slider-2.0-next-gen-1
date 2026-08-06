import React, { useEffect, useState } from 'react';

export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <ToastItem key={toast.id} message={toast.message} />
      ))}
    </div>
  );
}

function ToastItem({ message }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setShow(true);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className={`toast-notification ${show ? 'show' : ''}`}>
      {message}
    </div>
  );
}
