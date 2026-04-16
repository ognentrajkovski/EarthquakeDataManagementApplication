import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Toast from '../components/Toast';

describe('Toast', () => {
  it('renders message with correct type class', () => {
    render(<Toast message="Test error" type="danger" onClose={vi.fn()} />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('text-bg-danger');
  });

  it('renders success type', () => {
    render(<Toast message="Success!" type="success" onClose={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveClass('text-bg-success');
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<Toast message="Close me" onClose={onClose} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClose).toHaveBeenCalled();
  });

  it('auto-dismisses after timeout', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<Toast message="Auto close" onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(4000);
    expect(onClose).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
