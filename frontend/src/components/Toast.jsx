import { useEffect } from 'react';

export default function Toast({ message, type = 'danger', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`toast show align-items-center text-bg-${type} border-0`}
      role="alert"
    >
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
