import { useEffect, useRef, useState } from 'react';
import { desktopScene, phoneScene, type Drag, type Flip, type Phase } from './BookScenes';
import { ERAS } from './data';
import { prefersReducedMotion, useInView, useMediaQuery, useVisible } from './hooks';
import { Chevron } from './Ornament';
import { Timeline } from './Timeline';

/* ---------- Cuốn sách ----------
   Nội dung trang: BookPages.tsx. Tờ giấy cong: TurningLeaf.tsx.
   Các trang và tờ giấy nằm trên sách ở mỗi lúc: BookScenes.tsx. Thanh mốc thời gian: Timeline.tsx. */

interface BookProps {
  page: number;
  onPage: (i: number) => void;
}

/** Chạy việc khi trình duyệt rảnh (Safari chưa có requestIdleCallback thì chờ một chút). */
const hasIdle = typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function';
const whenIdle = (fn: () => void): number =>
  hasIdle ? window.requestIdleCallback(fn, { timeout: 900 }) : window.setTimeout(fn, 250);
const cancelIdle = (id: number) => (hasIdle ? window.cancelIdleCallback(id) : window.clearTimeout(id));

const AUTO_MS = 6500; // đang xem sách thì cứ chừng này lại tự giở sang trang mới
const LAST = ERAS.length - 1;

export function Book({ page, onPage }: BookProps) {
  const [stageRef, inView] = useInView<HTMLElement>(0.45);
  const [sceneRef, visible] = useVisible<HTMLDivElement>(0.5);
  const single = useMediaQuery('(max-width: 760px)');
  // Máy tính: một mặt sách (hai trang) là một giai đoạn. Điện thoại: mỗi lần chỉ một trang, một giai đoạn có hai trang.
  const per = single ? 2 : 1;
  const lastView = (LAST + 1) * per - 1;
  const [phase, setPhase] = useState<Phase>('closed');
  const [target, setTarget] = useState(page * per); // trang cần tới
  const [shown, setShown] = useState(page * per); // trang đang nằm yên trên sách
  const [flip, setFlip] = useState<Flip | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hold, setHold] = useState(false); // chuột đang đặt trên sách hoặc sách đang được chọn bằng bàn phím
  const [nudge, setNudge] = useState(0); // tăng mỗi lần người dùng chạm vào sách để đếm lại từ đầu
  const pointer = useRef<{ x: number; id: number; w: number; left: number } | null>(null);

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

  // Đổi giữa máy tính và điện thoại: đặt lại sách ở đầu giai đoạn đang xem
  useEffect(() => {
    setFlip(null);
    setDrag(null);
    setTarget(page * per);
    setShown(page * per);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [per]);

  // Chọn giai đoạn từ thanh mốc: tới trang đầu của giai đoạn đó
  useEffect(() => {
    if (Math.floor(target / per) !== page) setTarget(page * per);
  }, [page, target, per]);

  // Trang đích thay đổi (nút, thanh mốc, tự giở) -> lật từ trang đang hiện sang trang đích
  useEffect(() => {
    if (phase !== 'open' || flip || drag || target === shown) return;
    if (prefersReducedMotion()) {
      setShown(target);
      return;
    }
    setFlip({ from: shown, to: target, dir: target > shown ? 1 : -1 });
  }, [target, shown, phase, flip, drag]);

  const step = (d: 1 | -1) => {
    const next = Math.min(lastView, Math.max(0, target + d));
    setTarget(next);
    onPage(Math.floor(next / per));
  };

  // Tự giở trang: chỉ chạy khi sách đang hiện trên màn hình, đứng yên và người dùng không đặt tay lên sách
  const autoRunning =
    visible && !hold && phase === 'open' && !flip && !drag && target === shown && target < lastView && !prefersReducedMotion();
  useEffect(() => {
    if (!autoRunning) return;
    const t = window.setTimeout(() => step(1), AUTO_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunning, target, nudge]);

  const finishFlip = () => {
    if (!flip) return;
    setShown(flip.to);
    setFlip(null);
  };

  const go = (d: 1 | -1) => {
    setNudge((n) => n + 1);
    if (phase !== 'open') {
      setPhase('open');
      return;
    }
    step(d);
  };

  /* Kéo mép trang: tờ giấy đi theo tay, buông ra thì lật nốt hoặc rơi về chỗ cũ */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = { x: e.clientX, id: e.pointerId, w: r.width, left: r.left };
    setNudge((n) => n + 1);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = pointer.current;
    if (!s || phase !== 'open' || flip) return;
    const dx = e.clientX - s.x;
    if (!drag) {
      if (Math.abs(dx) < 12) return;
      const dir: 1 | -1 = dx < 0 ? 1 : -1;
      const to = shown + dir;
      if (to < 0 || to > lastView || target !== shown) {
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
    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    const a = clamp((-dx * drag.dir) / (s.w * (single ? 0.95 : 0.8)));
    // Máy tính: kéo được chừng 80% bề ngang cuốn sách là tờ giấy lật hẳn sang bên kia.
    // Điện thoại: góc lật tính sao cho mép giấy nằm dưới ngón tay (tờ giấy quay quanh gáy trái, bề ngang nhìn thấy là cos góc).
    // Lật tới thì tính theo quãng đã vuốt; lật lui thì trang trước đi vào từ ngoài màn hình nên đặt mép ngay chỗ ngón tay.
    let p = a;
    if (single) {
      const u = Math.min(1, Math.max(-1, (e.clientX - s.left) / s.w));
      p = drag.dir === 1 ? Math.acos(1 - a) / Math.PI : clamp(1 - Math.acos(u) / Math.PI);
    }
    setDrag({ ...drag, p });
  };
  const releaseDrag = (complete: boolean) => {
    if (drag && drag.release === undefined) setDrag({ ...drag, release: complete ? 1 : 0 });
  };
  const onPointerUp = () => {
    const s = pointer.current;
    pointer.current = null;
    if (!s) return;
    // Điện thoại lật lui: mép trang trước phải qua chừng 1/4 bề ngang trang mới lật hẳn về
    if (drag) releaseDrag(drag.p > (!single ? 0.3 : drag.dir === 1 ? 0.25 : 0.58));
  };
  const onPointerCancel = () => {
    pointer.current = null;
    releaseDrag(false);
  };
  const endDrag = () => {
    if (!drag || drag.release === undefined) return;
    if (drag.release === 1) {
      setShown(drag.to);
      setTarget(drag.to);
      onPage(Math.floor(drag.to / per));
    }
    setDrag(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  /* Dựng tờ giấy (bìa khi sách còn đóng, tờ dựng sẵn cho lần lật kế tiếp) lúc trình duyệt rảnh,
     để việc dựng 12 bản sao trang không chen vào lúc vừa vào trang hay lúc tờ giấy vừa đáp xuống.
     Chưa dựng xong thì bìa hiện dạng phẳng (trông y hệt), còn lần lật kế tiếp tự dựng như bình thường. */
  const warmKey = `${phase === 'closed' ? 'closed' : 'open'}-${shown}-${single ? 'phone' : 'desk'}`;
  const [warm, setWarm] = useState('');
  useEffect(() => {
    if (flip || drag) return;
    const id = whenIdle(() => setWarm(warmKey));
    return () => cancelIdle(id);
  }, [warmKey, flip, drag]);

  const scene = {
    prebuilt: warm === warmKey,
    phase,
    flip,
    drag,
    shown,
    lastView,
    onOpened: () => setPhase('open'),
    onTurned: drag ? endDrag : finishFlip,
  };
  const content = single ? phoneScene(scene) : desktopScene(scene);

  const pick = (i: number) => {
    setNudge((n) => n + 1);
    if (phase !== 'open') setPhase('open');
    onPage(i);
  };

  return (
    <section ref={stageRef} className="h-book-stage" id="h-book" aria-label="Cuốn sách lịch sử">
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
              {/* Bìa cứng bọc da nằm dưới xấp giấy, lộ ra một viền quanh các trang */}
              <div className="h-book__board h-book__board--left" aria-hidden="true" />
              <div className="h-book__board h-book__board--right" aria-hidden="true" />
              {content}
              <div className="h-book__spine" aria-hidden="true" />
            </div>
          </div>
          {/* Bóng sách đổ xuống mặt bàn */}
          <div className="h-book-shadow" aria-hidden="true" />

          <div className="h-book-nav">
            <button type="button" className="h-arrow" onClick={() => go(-1)} disabled={phase === 'open' && target === 0} aria-label="Trang trước">
              <Chevron dir="left" />
            </button>
            <div className="h-book-nav__mid">
              <p className="h-book-nav__hint">
                {phase !== 'open' ? 'Đang mở sách…' : single ? 'Vuốt trang sang trái để lật' : 'Kéo mép trang để lật'}
              </p>
              {/* Vạch đếm giờ tới lần tự giở trang kế tiếp */}
              <span className="h-autoflip" aria-hidden="true">
                <span key={`${page}-${nudge}`} className={`h-autoflip__fill${autoRunning ? ' is-running' : ''}`} />
              </span>
            </div>
            <button type="button" className="h-arrow" onClick={() => go(1)} disabled={phase === 'open' && target === lastView} aria-label="Trang sau">
              <Chevron dir="right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
