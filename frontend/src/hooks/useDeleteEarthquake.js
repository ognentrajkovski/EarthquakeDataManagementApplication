import { useState } from 'react';
import { deleteEarthquake } from '../api/earthquakeApi';

/**
 * Custom hook that encapsulates the full delete flow:
 *   1. First call → enters "confirming" state (UI should show a Confirm/Cancel pair)
 *   2. Second call (confirmed) → calls the API, invokes callbacks on success/failure
 *
 * @param {Function} onDeleted  - called after a successful delete (e.g. trigger list refresh)
 * @param {Function} showToast  - called with (message, type) to display a notification
 * @returns {{ confirming, deleting, requestDelete, cancelDelete, confirmDelete }}
 */
export function useDeleteEarthquake(onDeleted, showToast) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  function requestDelete() {
    setConfirming(true);
  }

  function cancelDelete() {
    setConfirming(false);
  }

  async function confirmDelete(id) {
    setDeleting(true);
    try {
      await deleteEarthquake(id);
      showToast('Earthquake deleted', 'success');
      onDeleted?.();
    } catch {
      showToast('Failed to delete earthquake');
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return { confirming, deleting, requestDelete, cancelDelete, confirmDelete };
}
