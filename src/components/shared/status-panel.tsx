import packageJson from '../../../package.json'

type Row = { label: string; value: string }

const rows: Row[] = [
  { label: 'DATABASE STATUS',  value: `UP TO DATE (V.${packageJson.version})` },
  { label: 'ACTIVE SESSIONS',  value: '1 ANALYST' },
  { label: 'REGIONAL LATENCY', value: 'OPTIMAL' },
]

export function StatusPanel() {
  return (
    <section className="p-5 rounded-xl bg-surface-container border border-outline-variant">
      {rows.map((r, idx) => (
        <div
          key={r.label}
          className={`flex flex-col gap-1 pl-3 border-l-2 ${
            idx === 0 ? 'border-primary-container' : 'border-outline-variant'
          } ${idx > 0 ? 'mt-4' : ''}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            {r.label}
          </span>
          <span className="text-sm font-semibold text-on-surface">{r.value}</span>
        </div>
      ))}
    </section>
  )
}
