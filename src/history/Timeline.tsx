import { ERAS } from './data';

/* ---------- Thanh mốc thời gian ---------- */

export function Timeline({ page, onPage }: { page: number; onPage: (i: number) => void }) {
  return (
    <nav className="h-timeline" aria-label="Mốc lịch sử">
      <ol className="h-timeline__eras">
        {ERAS.map((era, i) => (
          <li key={era.id} className={`h-tl-era${i === page ? ' is-active' : ''}${i < page ? ' is-past' : ''}`}>
            <button type="button" className="h-tl-era__btn" onClick={() => onPage(i)} aria-current={i === page ? 'step' : undefined}>
              <span className="h-tl-era__dot" aria-hidden="true" />
              {era.range}
            </button>
            <ul className="h-tl-era__ticks">
              {era.milestones.map((m) => (
                <li key={m.label}>
                  <button type="button" className="h-tl-tick" onClick={() => onPage(i)} title={m.note}>
                    <span className="h-tl-tick__dot" aria-hidden="true" />
                    {m.label}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </nav>
  );
}
