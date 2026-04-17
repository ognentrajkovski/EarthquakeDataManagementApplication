/**
 * Compact metric tile for KPI rows. Value is rendered in monospace for
 * tabular alignment; an optional colored accent bar ties the card to a
 * semantic (severity / status) color.
 */
export default function StatCard({ label, value, unit, hint, accent }) {
  return (
    <div className="stat-card">
      {accent && (
        <div className="stat-card-accent" style={{ background: accent }} />
      )}
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">
        <span>{value}</span>
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>
      {hint && <div className="stat-card-hint">{hint}</div>}
    </div>
  );
}
