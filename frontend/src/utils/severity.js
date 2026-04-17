/**
 * Earthquake magnitude severity scale.
 *
 * Levels roughly follow the USGS / Richter effect classification,
 * compressed for UI purposes. Each level carries a label, CSS custom
 * property reference, and a hex color for non-CSS contexts (e.g. Leaflet).
 */

export const SEVERITY_LEVELS = [
  { level: 'minor',    max: 2.5, label: 'Minor',    color: '#22c55e', cssVar: '--sev-minor' },
  { level: 'light',    max: 4.0, label: 'Light',    color: '#eab308', cssVar: '--sev-light' },
  { level: 'moderate', max: 5.0, label: 'Moderate', color: '#f97316', cssVar: '--sev-moderate' },
  { level: 'strong',   max: 6.0, label: 'Strong',   color: '#ef4444', cssVar: '--sev-strong' },
  { level: 'major',    max: Infinity, label: 'Major', color: '#dc2626', cssVar: '--sev-major' },
];

const UNKNOWN = {
  level: 'unknown', label: 'Unknown', color: '#6b7280', cssVar: '--sev-unknown',
};

export function getSeverity(magnitude) {
  if (magnitude == null || Number.isNaN(Number(magnitude))) return UNKNOWN;
  const mag = Number(magnitude);
  return SEVERITY_LEVELS.find((s) => mag < s.max) ?? SEVERITY_LEVELS[SEVERITY_LEVELS.length - 1];
}

/** Map marker radius based on magnitude (capped so big ones don't dominate). */
export function markerRadius(magnitude) {
  if (magnitude == null) return 4;
  return Math.min(Math.max(Number(magnitude) * 2.5, 4), 20);
}
