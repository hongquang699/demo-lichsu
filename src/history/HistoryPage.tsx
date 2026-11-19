import { useEffect, useRef, useState } from 'react';
import { Book } from './Book';
import { Compare } from './Compare';
import { ERAS } from './data';
import { prefersReducedMotion } from './hooks';
import { Intro } from './Intro';
import { Leaders } from './Leaders';
// @ts-ignore: CSS imports are handled by the Vite build.
import './history.css';

const SECTIONS = ['h-intro', 'h-book', 'h-compare', 'h-leaders'];
const IDLE_MS = 7000; // không thao tác trong 7 giây thì trang tự chạy tiếp

/** Phần đang chiếm giữa màn hình. */
function currentSection() {
  const mid = window.innerHeight / 2;
  let best = 0;
  SECTIONS.forEach((id, i) => {
    const r = document.getElementById(id)?.getBoundingClientRect();
    if (r && r.top <= mid) best = i;
  });
  return best;
}

export function HistoryPage() {
  const [page, setPage] = useState(0);
  const [auto, setAuto] = useState(() => !prefersReducedMotion());
  const pageRef = useRef(page);
  pageRef.current = page;

  // Tự chạy: sau một lúc không thao tác thì cuộn xuống phần kế tiếp;
  // khi đang ở cuốn sách thì lật sang trang mới thay vì cuộn.
  useEffect(() => {
    if (!auto) return;
    let timer = 0;
    const step = () => {
      const i = currentSection();
      if (SECTIONS[i] === 'h-book' && pageRef.current < ERAS.length - 1) {
        setPage((p) => p + 1);
      } else if (i < SECTIONS.length - 1) {
        document.getElementById(SECTIONS[i + 1])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        setAuto(false); // tới cuối trang thì dừng
        return;
      }
      timer = window.setTimeout(step, IDLE_MS);
    };
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(step, IDLE_MS);
    };
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [auto]);

  return (
    <div className="history">
      <Intro />
      <Book page={page} onPage={setPage} />
      <Compare />
      <Leaders />

      <button
        type="button"
        className={`h-autoplay${auto ? ' is-on' : ''}`}
        onClick={() => setAuto((a) => !a)}
        aria-pressed={auto}
        title="Sau vài giây không thao tác, trang tự cuộn xuống và tự lật sách"
      >
        <span className="h-autoplay__dot" aria-hidden="true" />
        {auto ? 'Đang tự chạy' : 'Tự chạy'}
      </button>
    </div>
  );
}
