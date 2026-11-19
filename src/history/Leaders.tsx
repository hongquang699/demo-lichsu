import { useState } from 'react';
import { LEADER_PERIODS, type Person } from './data';
import { Fleuron } from './Ornament';
import { PhotoView } from './Photo';

function LeaderCard({ person, role, main = false, delay }: { person: Person; role: string; main?: boolean; delay: number }) {
  return (
    <figure className={`h-leader${main ? ' h-leader--main' : ''}`} style={{ animationDelay: `${delay}ms` }}>
      <PhotoView kind="portrait" src={person.photo} alt={`Chân dung ${person.name}`} className="h-leader__photo" />
      <figcaption>
        <span className="h-leader__role">{role}</span>
        <span className="h-leader__name">{person.name}</span>
        <span className="h-leader__term">Niên khoá {person.term}</span>
      </figcaption>
    </figure>
  );
}

export function Leaders() {
  const [active, setActive] = useState(0);
  const period = LEADER_PERIODS[active];

  return (
    <section className="h-section h-leaders" id="h-leaders" aria-labelledby="h-leaders-title">
      <header className="h-head">
        <h2 id="h-leaders-title" className="h-section__title">
          Ban giám hiệu qua các thời kỳ
        </h2>
        <Fleuron />
      </header>

      <ol className="h-periods" aria-label="Chọn giai đoạn">
        {LEADER_PERIODS.map((p, i) => (
          <li key={p.range} className={i < active ? 'is-past' : undefined}>
            <button
              type="button"
              className={`h-period${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
            >
              {p.range}
            </button>
          </li>
        ))}
      </ol>

      <div className="h-leaders__board">
        <p className="h-leaders__range" key={`r${active}`} aria-live="polite">
          {period.range}
        </p>
        {/* key đổi theo giai đoạn để chạy lại hiệu ứng xuất hiện */}
        <div className="h-leaders__row" key={active}>
          <LeaderCard person={period.vice} role="Phó Hiệu trưởng" delay={140} />
          <LeaderCard person={period.principal} role="Hiệu trưởng" main delay={0} />
          <LeaderCard person={period.secretary} role="Bí thư Chi bộ" delay={220} />
        </div>
      </div>
    </section>
  );
}
