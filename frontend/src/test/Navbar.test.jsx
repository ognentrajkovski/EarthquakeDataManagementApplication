import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../components/Navbar';

vi.mock('../api/earthquakeApi', () => ({
  fetchLatest: vi.fn(),
}));

import { fetchLatest } from '../api/earthquakeApi';

describe('Navbar', () => {
  it('renders title and fetch button', () => {
    render(<Navbar onRefresh={vi.fn()} showToast={vi.fn()} />);
    expect(screen.getByText('Earthquake Data Manager')).toBeInTheDocument();
    expect(screen.getByText('Fetch Latest')).toBeInTheDocument();
  });

  it('calls fetchLatest and shows success toast on click', async () => {
    const onRefresh = vi.fn();
    const showToast = vi.fn();
    fetchLatest.mockResolvedValue({ data: { count: 3 } });

    render(<Navbar onRefresh={onRefresh} showToast={showToast} />);
    await userEvent.click(screen.getByText('Fetch Latest'));

    expect(fetchLatest).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('Fetched 3 earthquakes from USGS', 'success');
    expect(onRefresh).toHaveBeenCalled();
  });

  it('shows error toast when fetch fails', async () => {
    const showToast = vi.fn();
    fetchLatest.mockRejectedValue(new Error('fail'));

    render(<Navbar onRefresh={vi.fn()} showToast={showToast} />);
    await userEvent.click(screen.getByText('Fetch Latest'));

    expect(showToast).toHaveBeenCalledWith('Failed to fetch latest earthquake data');
  });
});
