import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FilterBar from '../components/FilterBar';

describe('FilterBar', () => {
  it('renders inputs and buttons', () => {
    render(<FilterBar onApply={vi.fn()} />);
    expect(screen.getByPlaceholderText('e.g. 2.5')).toBeInTheDocument();
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('emits filter values on Apply', async () => {
    const onApply = vi.fn();
    render(<FilterBar onApply={onApply} />);

    await userEvent.type(screen.getByPlaceholderText('e.g. 2.5'), '3.5');
    await userEvent.click(screen.getByText('Apply Filters'));

    expect(onApply).toHaveBeenCalledWith({ minMag: '3.5', after: '' });
  });

  it('clears inputs and emits empty values on Clear', async () => {
    const onApply = vi.fn();
    render(<FilterBar onApply={onApply} />);

    await userEvent.type(screen.getByPlaceholderText('e.g. 2.5'), '4.0');
    await userEvent.click(screen.getByText('Clear'));

    expect(onApply).toHaveBeenCalledWith({ minMag: '', after: '' });
    expect(screen.getByPlaceholderText('e.g. 2.5')).toHaveValue(null);
  });
});
