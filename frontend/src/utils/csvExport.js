const CSV_HEADERS = [
  'Title',
  'Magnitude',
  'Mag Type',
  'Place',
  'Time (UTC)',
  'Latitude',
  'Longitude',
  'Depth',
  'USGS ID',
];

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function earthquakeToRow(eq) {
  const time = eq.time
    ? new Date(eq.time).toLocaleString('en-US', { timeZone: 'UTC' })
    : '';
  return [
    eq.title,
    eq.magnitude,
    eq.magType,
    eq.place,
    time,
    eq.latitude,
    eq.longitude,
    eq.depth,
    eq.usgsId,
  ].map(escapeCsvValue).join(',');
}

export function earthquakesToCsv(earthquakes) {
  const header = CSV_HEADERS.join(',');
  const rows = earthquakes.map(earthquakeToRow);
  return [header, ...rows].join('\n');
}

export function downloadCsv(earthquakes, filename = 'earthquakes.csv') {
  const csv = earthquakesToCsv(earthquakes);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
