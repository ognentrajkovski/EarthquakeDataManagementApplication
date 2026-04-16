import { deleteEarthquake } from '../api/earthquakeApi';

export default function EarthquakeTable({ earthquakes, loading, error, onRefresh }) {
  async function handleDelete(id) {
    try {
      await deleteEarthquake(id);
      onRefresh();
    } catch {
      alert('Failed to delete earthquake');
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
      </div>
    );
  }

  if (earthquakes.length === 0) {
    return <p className="text-center p-3 text-muted">No earthquakes to display.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Magnitude</th>
            <th>Mag Type</th>
            <th>Place</th>
            <th>Time</th>
            <th>Lat</th>
            <th>Lon</th>
            <th>Depth</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {earthquakes.map((eq) => (
            <tr key={eq.id}>
              <td>{eq.title}</td>
              <td>{eq.magnitude}</td>
              <td>{eq.magType}</td>
              <td>{eq.place}</td>
              <td>{eq.time ? new Date(eq.time).toLocaleString() : '-'}</td>
              <td>{eq.latitude}</td>
              <td>{eq.longitude}</td>
              <td>{eq.depth}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(eq.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
