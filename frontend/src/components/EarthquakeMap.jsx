import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { getSeverity, markerRadius } from '../utils/severity';

/**
 * Light-themed Leaflet map. Markers are sized by magnitude and colored
 * by the shared severity scale so the map matches the event-card view.
 */
export default function EarthquakeMap({ earthquakes }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom
      worldCopyJump
      style={{ height: '100%', width: '100%' }}
    >
      <MapAutoSize />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      {earthquakes.map((eq) => {
        if (eq.latitude == null || eq.longitude == null) return null;
        const sev = getSeverity(eq.magnitude);
        return (
          <CircleMarker
            key={eq.id}
            center={[eq.latitude, eq.longitude]}
            radius={markerRadius(eq.magnitude)}
            pathOptions={{
              color: sev.color,
              fillColor: sev.color,
              fillOpacity: 0.55,
              weight: 1.5,
              opacity: 0.9,
            }}
          >
            <Popup>
              <strong>{eq.title}</strong>
              <div style={{ marginTop: 6, lineHeight: 1.5 }}>
                <div>Magnitude: <b style={{ color: sev.color }}>{eq.magnitude}</b> ({sev.label})</div>
                <div>Place: {eq.place}</div>
                <div>Depth: {eq.depth != null ? `${eq.depth} km` : '—'}</div>
                <div>Time (UTC): {eq.time
                  ? new Date(eq.time).toLocaleString('en-US', { timeZone: 'UTC' })
                  : '—'}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

/**
 * Leaflet caches the container size at initialization. When the container
 * mounts inside a flex/grid child, its size can be 0 until after the first
 * layout pass, which leaves the map blank or mis-tiled. This helper calls
 * `invalidateSize()` after mount and observes container resizes so the map
 * always matches its actual rendered size.
 */
function MapAutoSize() {
  const map = useMap();
  useEffect(() => {
    if (!map) return undefined;

    // Defer the first invalidation to the next frame so layout has settled.
    const rafId = requestAnimationFrame(() => map.invalidateSize());

    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [map]);
  return null;
}
