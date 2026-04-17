import { useEffect } from 'react';

/**
 * Auto-dismissing Bootstrap toast with a restyled dark appearance.
 * Keeps Bootstrap class hooks so existing tests continue to pass.
 */
export default function Toast({ message, type = 'danger', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`toast show align-items-center text-bg-${type} border-0`}
      role="alert"
      aria-live="polite"
    >
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button
          type="button"
          className="btn-close me-2 m-auto"
          aria-label="Dismiss"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
