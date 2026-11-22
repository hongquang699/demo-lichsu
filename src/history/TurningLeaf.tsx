import { useEffect, useMemo, type CSSProperties, type ReactNode } from 'react';

/* ---------- Tờ giấy đang lật ---------- */

/** Chỉ phản ứng với animation của chính phần tử, bỏ qua animation của con (sự kiện nổi bọt). */
const own = (fn: () => void) => (e: React.AnimationEvent) => {
  if (e.target === e.currentTarget) fn();
};
export const noop = () => {};

/** Số dải dọc ghép thành một tờ giấy: mỗi dải nghiêng thêm một chút nên cả tờ cong như giấy thật. */
const SEGS = 6;

/**
 * Máy yếu: lật phẳng (1 dải, không cong, bóng không vẽ lại) để khỏi xé hình và trắng trang khi lật.
 * Bật sẵn cho điện thoại/máy ít nhân, ít RAM; máy khác bị chuyển sang nếu lần lật đầu đo thấy giật.
 */
const LITE_KEY = 'h-lite-flip';
const nav = navigator as Navigator & { deviceMemory?: number };
let lite = (() => {
  try {
    if (localStorage.getItem(LITE_KEY) === '1') return true;
  } catch {
    /* không có bộ nhớ trình duyệt thì chỉ đoán theo máy */
  }
  return (
    matchMedia('(pointer: coarse)').matches ||
    (navigator.hardwareConcurrency || 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4
  );
})();

/** Đo tốc độ khung hình trong lúc lật; chậm hơn ~30 khung/giây thì những lần lật sau dùng kiểu phẳng. */
function useFlipProbe(active: boolean) {
  useEffect(() => {
    if (!active || lite) return;
    let frames = 0;
    let id = 0;
    const start = performance.now();
    const tick = () => {
      frames++;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(id);
      const ms = performance.now() - start;
      // Tab chạy nền thì trình duyệt tự hãm khung hình: không tính lần đo đó
      if (!document.hidden && ms > 400 && frames / (ms / 1000) < 30) {
        lite = true;
        try {
          localStorage.setItem(LITE_KEY, '1');
        } catch {
          /* chỉ nhớ trong phiên này */
        }
      }
    };
  }, [active]);
}

/**
 * Dải thứ i của tờ giấy, tính từ gáy ra mép ngoài. Dải sau lồng trong dải trước và quay quanh mép chung,
 * nên độ cong (--bend) cộng dồn dọc theo tờ. Mỗi mặt của dải chỉ hiện đúng phần trang nằm ở chỗ đó.
 */
function LeafSegment({
  i,
  segs,
  fwd,
  front,
  back,
}: {
  i: number;
  segs: number;
  fwd: boolean;
  front: ReactNode;
  back: ReactNode;
}) {
  const far = segs - 1 - i;
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
      {i < segs - 1 && <LeafSegment i={i + 1} segs={segs} fwd={fwd} front={front} back={back} />}
    </div>
  );
}

/** Tờ giấy đang lật và bóng đổ của nó; mọi chuyển động tính theo biến --p (0 -> 1) và độ cong --bend. */
export function TurningLeaf({
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
  const segs = lite ? 1 : SEGS;
  useFlipProbe(/is-auto|is-release/.test(className));
  const leaf = useMemo(
    () => <LeafSegment i={0} segs={segs} fwd={fwd} front={front} back={back} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [faces, fwd, segs],
  );
  return (
    // Các trang trên tờ giấy chỉ là bản sao để vẽ: không cho bấm, không cho phím Tab đi vào, trình đọc màn hình bỏ qua
    <div
      className={`h-turning ${className}${lite ? ' is-lite' : ''}`}
      style={style}
      onAnimationEnd={own(onEnd)}
      aria-hidden="true"
      {...{ inert: '' }}
    >
      <div className={`h-cast h-cast--${fwd ? 'reveal-right' : 'reveal-left'}`} aria-hidden="true" />
      <div className={`h-cast h-cast--${fwd ? 'land-left' : 'land-right'}`} aria-hidden="true" />
      <div className={`h-leaf h-leaf--${fwd ? 'right' : 'left'}`} style={{ '--n': segs } as CSSProperties}>
        {leaf}
      </div>
    </div>
  );
}
