import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ERAS, type Era } from './data';
import { prefersReducedMotion, useInView, useMediaQuery, useVisible } from './hooks';
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
/** Tờ giấy đang được kéo bằng tay. `p`: 0 = nằm yên, 1 = đã lật hẳn sang bên kia. */
interface Drag extends Flip {
  p: number;
  release?: 0 | 1; // đã buông tay: lật nốt (1) hay rơi về chỗ cũ (0)
}

interface BookProps {
  page: number;
  onPage: (i: number) => void;
}

const AUTO_MS = 6500; // đang xem sách thì cứ chừng này lại tự giở sang trang mới
const LAST = ERAS.length - 1;

/** Số dải dọc ghép thành một tờ giấy: mỗi dải nghiêng thêm một chút nên cả tờ cong như giấy thật. */
const SEGS = 6;

/**
 * Dải thứ i của tờ giấy, tính từ gáy ra mép ngoài. Dải sau lồng trong dải trước và quay quanh mép chung,
 * nên độ cong (--bend) cộng dồn dọc theo tờ. Mỗi mặt của dải chỉ hiện đúng phần trang nằm ở chỗ đó.
 */
function LeafSegment({ i, fwd, front, back }: { i: number; fwd: boolean; front: ReactNode; back: ReactNode }) {
  const far = SEGS - 1 - i;
  return (
    <div className="h-seg" style={{ '--i': i } as CSSProperties}>
      <div className="h-leaf__face h-leaf__front">
        <div className="h-seg__in" style={{ '--o': fwd ? i : far } as CSSProperties}>
          {front}
        </div>
      </div>
      <div className="h-leaf__face h-leaf__back">
        <div className="h-seg__in" style={{ '--o': fwd ? far : i } as CSSProperties}>
          {back}
        </div>
      </div>
      {i < SEGS - 1 && <LeafSegment i={i + 1} fwd={fwd} front={front} back={back} />}
    </div>
  );
}

/** Tờ giấy đang lật và bóng đổ của nó; mọi chuyển động tính theo biến --p (0 -> 1) và độ cong --bend. */
function TurningLeaf({
  dir,
  faces,
  className,
  style,
  front,
  back,
  onEnd,
}: {
  dir: 1 | -1;
  /** Đổi khi nội dung hai mặt đổi; giữ nguyên thì không vẽ lại các dải khi đang kéo. */
  faces: string;
  className: string;
  style?: CSSProperties;
  front: ReactNode;
  back: ReactNode;
  onEnd: () => void;
}) {
  const fwd = dir === 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leaf = useMemo(() => <LeafSegment i={0} fwd={fwd} front={front} back={back} />, [faces, fwd]);
  return (
    <div className={`h-turning ${className}`} style={style} onAnimationEnd={own(onEnd)}>
      <div className={`h-cast h-cast--${fwd ? 'reveal-right' : 'reveal-left'}`} aria-hidden="true" />
      <div className={`h-cast h-cast--${fwd ? 'land-left' : 'land-right'}`} aria-hidden="true" />
      <div className={`h-leaf h-leaf--${fwd ? 'right' : 'left'}`}>{leaf}</div>
    </div>
  );
}

export function Book({ page, onPage }: BookProps) {
  const [stageRef, inView] = useInView<HTMLElement>(0.45);
  const [sceneRef, visible] = useVisible<HTMLDivElement>(0.5);
  const single = useMediaQuery('(max-width: 760px)');
  const [phase, setPhase] = useState<Phase>('closed');
  const [shown, setShown] = useState(page);
  const [flip, setFlip] = useState<Flip | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hold, setHold] = useState(false); // chuột đang đặt trên sách hoặc sách đang được chọn bằng bàn phím
  const [nudge, setNudge] = useState(0); // tăng mỗi lần người dùng chạm vào sách để đếm lại từ đầu
  const pointer = useRef<{ x: number; id: number; w: number } | null>(null);

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

  // Trang đích thay đổi (nút, thanh mốc, tự giở) -> lật từ trang đang hiện sang trang đích
  useEffect(() => {
    if (single || phase !== 'open' || flip || drag || page === shown) return;
    if (prefersReducedMotion()) {
      setShown(page);
      return;
    }
    setFlip({ from: shown, to: page, dir: page > shown ? 1 : -1 });
  }, [page, shown, phase, flip, drag, single]);

  // Tự giở trang: chỉ chạy khi sách đang hiện trên màn hình, đứng yên và người dùng không đặt tay lên sách
  const autoRunning =
    visible && !hold && phase === 'open' && !flip && !drag && page === shown && page < LAST && !prefersReducedMotion();
  useEffect(() => {
    if (!autoRunning) return;
    const t = window.setTimeout(() => onPage(page + 1), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [autoRunning, page, nudge, onPage]);

  const finishFlip = () => {
    if (!flip) return;
    setShown(flip.to);
    setFlip(null);
  };

  const go = (d: 1 | -1) => {
    setNudge((n) => n + 1);
    const next = Math.min(LAST, Math.max(0, page + d));
    if (phase !== 'open') {
      setPhase('open');
      return;
    }
    if (next !== page) onPage(next);
  };

  /* Kéo mép trang: tờ giấy đi theo tay, buông ra thì lật nốt hoặc rơi về chỗ cũ */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    pointer.current = { x: e.clientX, id: e.pointerId, w: e.currentTarget.getBoundingClientRect().width };
    setNudge((n) => n + 1);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = pointer.current;
    if (!s || single || phase !== 'open' || flip) return;
    const dx = e.clientX - s.x;
    if (!drag) {
      if (Math.abs(dx) < 12) return;
      const dir: 1 | -1 = dx < 0 ? 1 : -1;
      const to = shown + dir;
      if (to < 0 || to > LAST || page !== shown) {
        pointer.current = null;
        return;
      }
      try {
        e.currentTarget.setPointerCapture(s.id); // giữ tờ giấy theo tay kể cả khi con trỏ ra khỏi sách
      } catch {
        /* con trỏ đã nhả trước khi kịp bắt: vẫn kéo bình thường */
      }
      setDrag({ from: shown, to, dir, p: 0 });
      return;
    }
    if (drag.release !== undefined) return;
    // Kéo được chừng 80% bề ngang cuốn sách là tờ giấy lật hẳn sang bên kia
    const p = Math.min(1, Math.max(0, (-dx * drag.dir) / (s.w * 0.8)));
    setDrag({ ...drag, p });
  };
  const releaseDrag = (complete: boolean) => {
    if (drag && drag.release === undefined) setDrag({ ...drag, release: complete ? 1 : 0 });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = pointer.current;
    pointer.current = null;
    if (!s) return;
    if (drag) {
      releaseDrag(drag.p > 0.3);
      return;
    }
    const dx = e.clientX - s.x;
    if (single && Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };
  const onPointerCancel = () => {
    pointer.current = null;
    releaseDrag(false);
  };
  const endDrag = () => {
    if (!drag || drag.release === undefined) return;
    if (drag.release === 1) {
      setShown(drag.to);
      onPage(drag.to);
    }
    setDrag(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  const spread = (l: number, r: number) => (
    <>
      <div className="h-sheet h-sheet--left">{left(l)}</div>
      <div className="h-sheet h-sheet--right">{right(r)}</div>
    </>
  );

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
          onAnimationEnd={own(() => setPhase('open'))}
        >
          <Cover />
        </div>
      );
  } else if (phase !== 'open') {
    content = (
      <>
        <div className="h-sheet h-sheet--left h-sheet--blank" />
        <div className="h-sheet h-sheet--right">{right(0)}</div>
        <TurningLeaf
          dir={1}
          faces="cover"
          className={phase === 'opening' ? 'is-auto is-cover' : ''}
          front={<Cover />}
          back={left(0)}
          onEnd={() => setPhase('open')}
        />
      </>
    );
  } else if (flip || drag) {
    const f = (drag ?? flip) as Flip;
    const fwd = f.dir === 1;
    let className = 'is-auto';
    let style: CSSProperties | undefined;
    if (drag) {
      if (drag.release === undefined) {
        className = 'is-dragging';
        style = { '--p': drag.p } as CSSProperties;
      } else {
        // Buông tay: đi tiếp từ chỗ đang dừng (lật nốt hoặc rơi về), rồi giấy rung nhẹ trước khi nằm yên
        className = `is-release ${drag.release === 1 ? 'is-done' : 'is-back'}`;
        const ms = Math.round(700 + 1100 * Math.abs(drag.release - drag.p));
        style = { '--from': drag.p, '--to': drag.release, '--release-ms': `${ms}ms` } as CSSProperties;
      }
    }
    content = (
      <>
        {spread(fwd ? f.from : f.to, fwd ? f.to : f.from)}
        <TurningLeaf
          dir={f.dir}
          faces={`${f.from}-${f.to}`}
          className={className}
          style={style}
          front={fwd ? right(f.from) : left(f.from)}
          back={fwd ? left(f.to) : right(f.to)}
          onEnd={drag ? endDrag : finishFlip}
        />
      </>
    );
  } else {
    content = spread(shown, shown);
  }

  const pick = (i: number) => {
    setNudge((n) => n + 1);
    if (phase !== 'open') setPhase('open');
    onPage(i);
  };

  return (
    <section ref={stageRef} className="h-book-stage" id="h-book" aria-label="Cuốn sách lịch sử">
      <div className="h-book-stage__light" aria-hidden="true" />
      <div className="h-book-layout">
        <Timeline page={page} onPage={pick} />
        <div className="h-book-main">
          <div
            className="h-book-scene"
            ref={sceneRef}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHold(false)}
          >
            <div
              className={`h-book is-${phase}${single ? ' is-single' : ''}${drag ? ' is-grabbing' : ''}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              onKeyDown={onKeyDown}
              tabIndex={0}
              aria-roledescription="sách"
              aria-label={`Trang ${ERAS[page].range}. Kéo mép trang hoặc dùng phím mũi tên để lật trang.`}
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
            <div className="h-book-nav__mid">
              <p className="h-book-nav__hint">
                {phase !== 'open' ? 'Đang mở sách…' : single ? 'Vuốt ngang để lật trang' : 'Kéo mép trang để lật'}
              </p>
              {/* Vạch đếm giờ tới lần tự giở trang kế tiếp */}
              <span className="h-autoflip" aria-hidden="true">
                <span key={`${page}-${nudge}`} className={`h-autoflip__fill${autoRunning ? ' is-running' : ''}`} />
              </span>
            </div>
            <button type="button" className="h-arrow" onClick={() => go(1)} disabled={page === LAST} aria-label="Trang sau">
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
