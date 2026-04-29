import packageJson from '../../../package.json'

type Row = { label: string; value: string }

const rows: Row[] = [
  { label: 'DATABASE STATUS',  value: `UP TO DATE (V.${packageJson.version})` },
  { label: 'ACTIVE SESSIONS',  value: '1 ANALYST' },
  { label: 'REGIONAL LATENCY', value: 'OPTIMAL' },
]

export function StatusPanel() {
  return (
    <section className="p-5 rounded-xl bg-card border border-border">
      {rows.map((r, idx) => (
        <div
          key={r.label}
          className={`flex flex-col gap-1 pl-3 border-l-2 ${
            idx === 0 ? 'border-primary' : 'border-border'
          } ${idx > 0 ? 'mt-4' : ''}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {r.label}
          </span>
          <span className="text-sm font-semibold text-foreground">{r.value}</span>
        </div>
      ))}
    </section>
  )
}
