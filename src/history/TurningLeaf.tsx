import { useMemo, type CSSProperties, type ReactNode } from 'react';

/* ---------- Tờ giấy đang lật ---------- */

/** Chỉ phản ứng với animation của chính phần tử, bỏ qua animation của con (sự kiện nổi bọt). */
const own = (fn: () => void) => (e: React.AnimationEvent) => {
  if (e.target === e.currentTarget) fn();
};
export const noop = () => {};

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leaf = useMemo(() => <LeafSegment i={0} fwd={fwd} front={front} back={back} />, [faces, fwd]);
  return (
    // Các trang trên tờ giấy chỉ là bản sao để vẽ: không cho bấm, không cho phím Tab đi vào, trình đọc màn hình bỏ qua
    <div
      className={`h-turning ${className}`}
      style={style}
      onAnimationEnd={own(onEnd)}
      aria-hidden="true"
      {...{ inert: '' }}
    >
      <div className={`h-cast h-cast--${fwd ? 'reveal-right' : 'reveal-left'}`} aria-hidden="true" />
      <div className={`h-cast h-cast--${fwd ? 'land-left' : 'land-right'}`} aria-hidden="true" />
      <div className={`h-leaf h-leaf--${fwd ? 'right' : 'left'}`}>{leaf}</div>
    </div>
  );
}
