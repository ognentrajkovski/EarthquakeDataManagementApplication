import { getSeverity } from '../utils/severity';

/**
 * Small pill showing the severity class of a magnitude value.
 */
export default function SeverityBadge({ magnitude }) {
  const sev = getSeverity(magnitude);
  return (
    <span
      className="sev-badge"
      style={{
        background: `${sev.color}1a`,          // 10% alpha
        color: sev.color,
        borderColor: `${sev.color}40`,         // 25% alpha
      }}
    >
      <span className="sev-dot" style={{ background: sev.color }} />
      {sev.label}
    </span>
  );
}
