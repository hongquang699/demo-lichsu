import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ERAS, type Era } from './data';
import { prefersReducedMotion, useInView, useMediaQuery } from './hooks';
import { Chevron, Lotus } from './Ornament';
import { PhotoView, ZoomablePhoto } from './Photo';

/* ---------- Nội dung từng trang ---------- */

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function LeftPage({ era, index }: { era: Era; index: number }) {
  return (
    <div className="h-page h-page--left">
      <p className="h-page__running">Chương {ROMAN[index]} · {era.title}</p>
      <p className="h-page__range">{era.range}</p>
      <figure className="h-page__figure">
        <ZoomablePhoto kind={era.photo.kind} src={era.photo.src} alt={era.photo.caption} caption={era.photo.caption} />
        <figcaption>{era.photo.caption}</figcaption>
      </figure>
      <span className="h-page__folio">{index * 2 + 1}</span>
    </div>
  );
}

function RightPage({ era, index }: { era: Era; index: number }) {
  const [tab, setTab] = useState(era.principals.length - 1);
  const p = era.principals[tab] ?? era.principals[0];

  return (
    <div className="h-page h-page--right">
      <p className="h-page__running h-page__running--right">Sử ký Trường THPT Chuyên Phan Bội Châu</p>
      <div className="h-principal-card">
        <div className="h-principal-card__head">
          <p className="h-page__kicker">Hiệu trưởng</p>
          {era.principals.length > 1 && (
            <div className="h-tabs" role="tablist" aria-label="Các đời hiệu trưởng trong giai đoạn">
              {era.principals.map((x, i) => (
                <button
                  key={x.term}
                  type="button"
                  role="tab"
                  aria-selected={i === tab}
                  className={`h-tab${i === tab ? ' is-active' : ''}`}
                  onClick={() => setTab(i)}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {x.term.replace('Hiệu trưởng nhiệm kỳ ', '')}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="h-principal" key={tab}>
          <PhotoView kind="portrait" src={p.photo} alt={`Chân dung ${p.name}`} className="h-principal__photo" />
          <div>
            <p className="h-principal__name">{p.name}</p>
            <p className="h-principal__meta">{p.title}</p>
            <p className="h-principal__term">{p.term}</p>
          </div>
        </div>
      </div>
      <h4 className="h-page__subhead">Bối cảnh và thành tựu</h4>
      <p className="h-page__summary">{era.summary}</p>
      <ol className="h-page__milestones" aria-label="Cột mốc trong giai đoạn">
        {era.milestones.map((m) => (
          <li key={m.label}>
            <strong>{m.label}</strong>
            <span>{m.note}</span>
          </li>
        ))}
      </ol>
      <span className="h-page__folio">{index * 2 + 2}</span>
    </div>
  );
}

function Cover() {
  return (
    <div className="h-cover">
      <PhotoView kind="old" alt="" className="h-cover__art" />
      <div className="h-cover__frame">
        <p className="h-cover__over">Trường THPT Chuyên</p>
        <Lotus className="h-cover__rule" />
        <p className="h-cover__name">Phan Bội Châu</p>
        <Lotus className="h-cover__rule" />
        <p className="h-cover__years">Sử ký 1974 – nay</p>
      </div>
    </div>
  );
}

const left = (i: number) => <LeftPage key={`l${i}`} era={ERAS[i]} index={i} />;
const right = (i: number) => <RightPage key={`r${i}`} era={ERAS[i]} index={i} />;

/* ---------- Cuốn sách ---------- */

/** Chỉ phản ứng với animation của chính phần tử, bỏ qua animation của con (sự kiện nổi bọt). */
const own = (fn: () => void) => (e: React.AnimationEvent) => {
  if (e.target === e.currentTarget) fn();
};

type Phase = 'closed' | 'opening' | 'open';
interface Flip {
  from: number;
  to: number;
  dir: 1 | -1;
}

interface BookProps {
  page: number;
  onPage: (i: number) => void;
}

export function Book({ page, onPage }: BookProps) {
  const [stageRef, inView] = useInView<HTMLElement>(0.45);
  const single = useMediaQuery('(max-width: 760px)');
  const [phase, setPhase] = useState<Phase>('closed');
  const [shown, setShown] = useState(page);
  const [flip, setFlip] = useState<Flip | null>(null);
  const drag = useRef<number | null>(null);

  // Lướt tới sách thì sách tự mở ra trang đầu
  useEffect(() => {
    if (!inView || phase !== 'closed') return;
    if (prefersReducedMotion()) {
      setPhase('open');
      return;
    }
    const t = window.setTimeout(() => setPhase('opening'), 350);
    return () => window.clearTimeout(t);
  }, [inView, phase]);

  // Trang đích thay đổi -> lật từ trang đang hiện sang trang đích
  useEffect(() => {
    if (single || phase !== 'open' || flip || page === shown) return;
    if (prefersReducedMotion()) {
      setShown(page);
      return;
    }
    setFlip({ from: shown, to: page, dir: page > shown ? 1 : -1 });
  }, [page, shown, phase, flip, single]);

  const finishFlip = () => {
    if (!flip) return;
    setShown(flip.to);
    setFlip(null);
  };

  const go = (d: 1 | -1) => {
    const next = Math.min(ERAS.length - 1, Math.max(0, page + d));
    if (phase !== 'open') {
      setPhase('open');
      return;
    }
    if (next !== page) onPage(next);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (drag.current === null) return;
    const dx = e.clientX - drag.current;
    drag.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  let content: ReactNode;

  if (single) {
    // Màn hình hẹp: một trang dọc, chuyển trang bằng hiệu ứng lật nhẹ
    content =
      phase === 'open' ? (
        <div className="h-sheet h-sheet--single h-turn" key={page} data-dir={page >= shown ? 1 : -1} onAnimationEnd={own(() => setShown(page))}>
          {left(page)}
          {right(page)}
        </div>
      ) : (
        <div
          className={`h-sheet h-sheet--single h-sheet--cover${phase === 'opening' ? ' is-opening' : ''}`}
          onAnimationEnd={own(() => setPhase("open"))}
        >
          <Cover />
        </div>
      );
  } else if (phase !== 'open') {
    content = (
      <>
        <div className="h-sheet h-sheet--left h-sheet--blank" />
        <div className="h-sheet h-sheet--right">{right(0)}</div>
        <div className={`h-leaf h-leaf--right${phase === 'opening' ? ' is-flipping' : ''}`} onAnimationEnd={own(() => setPhase("open"))}>
          <div className="h-leaf__face h-leaf__front">
            <Cover />
          </div>
          <div className="h-leaf__face h-leaf__back">{left(0)}</div>
        </div>
      </>
    );
  } else if (flip) {
    const fwd = flip.dir === 1;
    content = (
      <>
        <div className="h-sheet h-sheet--left">{left(fwd ? flip.from : flip.to)}</div>
        <div className="h-sheet h-sheet--right">{right(fwd ? flip.to : flip.from)}</div>
        <div className={`h-leaf h-leaf--${fwd ? 'right' : 'left'} is-flipping`} onAnimationEnd={own(finishFlip)}>
          <div className="h-leaf__face h-leaf__front">{fwd ? right(flip.from) : left(flip.from)}</div>
          <div className="h-leaf__face h-leaf__back">{fwd ? left(flip.to) : right(flip.to)}</div>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div className="h-sheet h-sheet--left">{left(shown)}</div>
        <div className="h-sheet h-sheet--right">{right(shown)}</div>
      </>
    );
  }

  return (
    <section ref={stageRef} className="h-book-stage" id="h-book" aria-label="Cuốn sách lịch sử">
      <div className="h-book-stage__light" aria-hidden="true" />
      <div className="h-book-layout">
      <Timeline page={page} onPage={(i) => (phase === 'open' ? onPage(i) : (setPhase('open'), onPage(i)))} />
      <div className="h-book-main">
      <div className="h-book-scene">
        <div
          className={`h-book is-${phase}${single ? ' is-single' : ''}`}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (drag.current = null)}
          onKeyDown={onKeyDown}
          tabIndex={0}
          aria-roledescription="sách"
          aria-label={`Trang ${ERAS[page].range}. Kéo ngang hoặc dùng phím mũi tên để lật trang.`}
        >
          {content}
          <div className="h-book__spine" aria-hidden="true" />
        </div>
        <div className="h-book-shadow" aria-hidden="true" />
      </div>

      <div className="h-book-nav">
        <button type="button" className="h-arrow" onClick={() => go(-1)} disabled={phase === 'open' && page === 0} aria-label="Trang trước">
          <Chevron dir="left" />
        </button>
        <p className="h-book-nav__hint">{phase === 'open' ? 'Kéo ngang trên sách để lật trang' : 'Đang mở sách…'}</p>
        <button type="button" className="h-arrow" onClick={() => go(1)} disabled={page === ERAS.length - 1} aria-label="Trang sau">
          <Chevron dir="right" />
        </button>
      </div>
      </div>
      </div>
    </section>
  );
}

/* ---------- Thanh mốc thời gian ---------- */

function Timeline({ page, onPage }: BookProps) {
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
