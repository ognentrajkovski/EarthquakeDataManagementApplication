import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

function getColor(magnitude) {
  if (magnitude >= 4) return 'red';
  if (magnitude >= 2) return 'orange';
  return 'green';
}

function getRadius(magnitude) {
  return Math.max(magnitude * 3, 3);
}

export default function EarthquakeMap({ earthquakes }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {earthquakes.map((eq) => (
        <CircleMarker
          key={eq.id}
          center={[eq.latitude, eq.longitude]}
          radius={getRadius(eq.magnitude)}
          pathOptions={{
            color: getColor(eq.magnitude),
            fillColor: getColor(eq.magnitude),
            fillOpacity: 0.6,
          }}
        >
          <Popup>
            <strong>{eq.title}</strong>
            <br />
            Magnitude: {eq.magnitude}
            <br />
            Place: {eq.place}
            <br />
            Time: {eq.time ? new Date(eq.time).toLocaleString() : '-'}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
