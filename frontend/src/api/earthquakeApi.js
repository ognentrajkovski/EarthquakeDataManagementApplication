import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export function fetchLatest() {
  return api.post('/api/earthquakes/fetch');
}

export function getAllEarthquakes(minMag, after) {
  const params = {};
  if (minMag !== undefined && minMag !== '') params.minMag = minMag;
  if (after) params.after = new Date(after).getTime();
  return api.get('/api/earthquakes', { params });
}

export function deleteEarthquake(id) {
  return api.delete(`/api/earthquakes/${id}`);
}
