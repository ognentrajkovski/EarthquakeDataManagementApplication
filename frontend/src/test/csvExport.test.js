import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { earthquakesToCsv, downloadCsv } from '../utils/csvExport';

const sample = [
  {
    title: 'M 3.2 — 10km N of Somewhere',
    magnitude: 3.2,
    magType: 'ml',
    place: '10km N of Somewhere',
    time: Date.UTC(2025, 0, 15, 12, 30, 0),
    latitude: 34.5,
    longitude: -118.25,
    depth: 5.6,
    usgsId: 'ci12345',
  },
  {
    title: 'M 4.0 — "Offshore", CA',
    magnitude: 4.0,
    magType: 'mw',
    place: 'Offshore, CA',
    time: Date.UTC(2025, 0, 16, 8, 0, 0),
    latitude: 33.1,
    longitude: -119.0,
    depth: 12.3,
    usgsId: 'us67890',
  },
];

describe('earthquakesToCsv', () => {
  it('emits the header row', () => {
    const csv = earthquakesToCsv([]);
    expect(csv.split('\n')[0]).toBe(
      'Title,Magnitude,Mag Type,Place,Time (UTC),Latitude,Longitude,Depth,USGS ID',
    );
  });

  it('produces one row per earthquake', () => {
    const csv = earthquakesToCsv(sample);
    expect(csv.split('\n')).toHaveLength(3); // header + 2 rows
  });

  it('escapes values containing commas and quotes', () => {
    const csv = earthquakesToCsv(sample);
    // Row 2 has a comma in place and quotes in title — both must be wrapped & escaped
    expect(csv).toContain('"Offshore, CA"');
    expect(csv).toContain('"M 4.0 — ""Offshore"", CA"');
  });

  it('renders empty string for null/undefined fields', () => {
    const csv = earthquakesToCsv([
      { title: 'X', magnitude: null, magType: undefined, place: 'p',
        time: null, latitude: 0, longitude: 0, depth: 0, usgsId: 'u' },
    ]);
    const row = csv.split('\n')[1];
    // magnitude and magType and time should be blank
    expect(row).toBe('X,,,p,,0,0,0,u');
  });
});

describe('downloadCsv', () => {
  let createObjectURL;
  let revokeObjectURL;
  let appendChild;
  let removeChild;
  let clickSpy;

  beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:mock');
    revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURL;

    clickSpy = vi.fn();
    appendChild = vi.spyOn(document.body, 'appendChild');
    removeChild = vi.spyOn(document.body, 'removeChild');

    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = originalCreate(tag);
      if (tag === 'a') el.click = clickSpy;
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a blob URL, clicks the link, and revokes the URL', () => {
    downloadCsv(sample, 'quakes.csv');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });
});
