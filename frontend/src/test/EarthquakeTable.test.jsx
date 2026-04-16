import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EarthquakeTable from '../components/EarthquakeTable';

vi.mock('../api/earthquakeApi', () => ({
  deleteEarthquake: vi.fn(),
}));

import { deleteEarthquake } from '../api/earthquakeApi';

const sampleEarthquakes = [
  {
    id: 1, title: 'M 4.5 - Place A', magnitude: 4.5, magType: 'ml',
    place: 'Place A', time: '2025-06-15T12:00:00', latitude: 34.0,
    longitude: -118.0, depth: 10.0,
  },
  {
    id: 2, title: 'M 2.1 - Place B', magnitude: 2.1, magType: 'md',
    place: 'Place B', time: '2025-06-15T13:00:00', latitude: 35.0,
    longitude: -117.0, depth: 5.0,
  },
];

describe('EarthquakeTable', () => {
  it('shows loading spinner when loading', () => {
    render(
      <EarthquakeTable earthquakes={[]} loading={true} error={null}
        onRefresh={vi.fn()} showToast={vi.fn()} />
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error alert when error is set', () => {
    render(
      <EarthquakeTable earthquakes={[]} loading={false} error="Something went wrong"
        onRefresh={vi.fn()} showToast={vi.fn()} />
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows empty message when no earthquakes', () => {
    render(
      <EarthquakeTable earthquakes={[]} loading={false} error={null}
        onRefresh={vi.fn()} showToast={vi.fn()} />
    );
    expect(screen.getByText('No earthquakes to display.')).toBeInTheDocument();
  });

  it('renders earthquake rows', () => {
    render(
      <EarthquakeTable earthquakes={sampleEarthquakes} loading={false} error={null}
        onRefresh={vi.fn()} showToast={vi.fn()} />
    );
    expect(screen.getByText('M 4.5 - Place A')).toBeInTheDocument();
    expect(screen.getByText('M 2.1 - Place B')).toBeInTheDocument();
    expect(screen.getAllByText('Delete')).toHaveLength(2);
  });

  it('sorts by magnitude when column header is clicked', async () => {
    render(
      <EarthquakeTable earthquakes={sampleEarthquakes} loading={false} error={null}
        onRefresh={vi.fn()} showToast={vi.fn()} />
    );

    await userEvent.click(screen.getByText('Magnitude'));

    const rows = screen.getAllByRole('row');
    // header + 2 data rows; ascending: 2.1 first
    expect(rows[1]).toHaveTextContent('2.1');
    expect(rows[2]).toHaveTextContent('4.5');

    // click again for descending
    await userEvent.click(screen.getByText(/Magnitude/));
    const rowsDesc = screen.getAllByRole('row');
    expect(rowsDesc[1]).toHaveTextContent('4.5');
    expect(rowsDesc[2]).toHaveTextContent('2.1');
  });

  it('shows confirm/cancel on delete click, cancels on Cancel', async () => {
    render(
      <EarthquakeTable earthquakes={sampleEarthquakes} loading={false} error={null}
        onRefresh={vi.fn()} showToast={vi.fn()} />
    );

    await userEvent.click(screen.getAllByText('Delete')[0]);

    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('deletes earthquake on confirm and shows success toast', async () => {
    const onRefresh = vi.fn();
    const showToast = vi.fn();
    deleteEarthquake.mockResolvedValue({});

    render(
      <EarthquakeTable earthquakes={sampleEarthquakes} loading={false} error={null}
        onRefresh={onRefresh} showToast={showToast} />
    );

    await userEvent.click(screen.getAllByText('Delete')[0]);
    await userEvent.click(screen.getByText('Confirm'));

    expect(deleteEarthquake).toHaveBeenCalledWith(1);
    expect(showToast).toHaveBeenCalledWith('Earthquake deleted', 'success');
    expect(onRefresh).toHaveBeenCalled();
  });
});
