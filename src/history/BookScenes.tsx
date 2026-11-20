import type { CSSProperties, ReactNode } from 'react';
import { blank, Cover, face, left, right } from './BookPages';
import { noop, TurningLeaf } from './TurningLeaf';

/* ---------- Những gì nằm trên cuốn sách ở mỗi lúc: các trang đang mở và tờ giấy đang lật ---------- */

export type Phase = 'closed' | 'opening' | 'open';
export interface Flip {
  from: number;
  to: number;
  dir: 1 | -1;
}
/** Tờ giấy đang được kéo bằng tay. `p`: 0 = nằm yên, 1 = đã lật hẳn sang bên kia. */
export interface Drag extends Flip {
  p: number;
  release?: 0 | 1; // đã buông tay: lật nốt (1) hay rơi về chỗ cũ (0)
}

export interface SceneState {
  phase: Phase;
  flip: Flip | null;
  drag: Drag | null;
  /** Trang đang nằm yên trên sách (máy tính: số giai đoạn; điện thoại: số trang). */
  shown: number;
  lastView: number;
  /** Bìa đã mở xong. */
  onOpened: () => void;
  /** Tờ giấy đã lật xong (hoặc đã rơi về chỗ cũ). */
  onTurned: () => void;
}

/*
 * Cả hai hàm luôn trả về [các trang, tờ giấy] theo cùng một thứ tự, nên khi sách chuyển từ đứng yên sang lật,
 * React giữ nguyên tờ giấy dựng sẵn thay vì dựng lại. Gọi như hàm thường (không phải component) để giữ thứ tự đó.
 */

/**
 * Điện thoại: sách mở một trang cao gần hết màn hình, gáy ở mép trái.
 * Lật tới: trang đang xem cong lên rồi lật qua gáy ra ngoài màn hình, lộ trang sau nằm bên dưới.
 * Lật lui: trang trước từ ngoài mép trái lật về phủ lên trang đang xem.
 */
export function phoneScene({ phase, flip, drag, shown, lastView, onOpened, onTurned }: SceneState): ReactNode {
  const sheet = (v: number) => <div className="h-sheet h-sheet--single">{face(v)}</div>;

  if (phase !== 'open') {
    return (
      <>
        {sheet(0)}
        <TurningLeaf
          dir={1}
          faces="m-cover"
          className={phase === 'opening' ? 'is-auto is-cover' : ''}
          front={<Cover />}
          back={blank}
          onEnd={onOpened}
        />
      </>
    );
  }

  if (flip || drag) {
    const f = (drag ?? flip) as Flip;
    const fwd = f.dir === 1;
    const top = fwd ? f.from : f.to; // trang nằm trên tờ giấy đang lật
    // Tờ giấy luôn quay quanh gáy trái: --p = 0 là nằm trên sách, 1 là đã lật hẳn ra ngoài.
    // Lật lui thì tờ đi ngược (1 -> 0), nên đổi tiến độ kéo tay sang góc của tờ.
    const leafP = (x: number) => (fwd ? x : 1 - x);
    let className: string;
    let style: CSSProperties | undefined;
    if (drag && drag.release === undefined) {
      className = `is-dragging${fwd ? '' : ' is-rev'}`;
      style = { '--p': leafP(drag.p) } as CSSProperties;
    } else if (drag) {
      const from = leafP(drag.p);
      const to = leafP(drag.release === 1 ? 1 : 0);
      const ms = Math.round(600 + 1000 * Math.abs(to - from));
      className = `is-release ${to === 1 ? 'is-done' : 'is-back'}${fwd ? '' : ' is-rev'}`;
      style = { '--from': from, '--to': to, '--release-ms': `${ms}ms` } as CSSProperties;
    } else if (fwd) {
      className = 'is-auto';
    } else {
      className = 'is-release is-back';
      style = { '--from': 1, '--to': 0, '--release-ms': 'var(--flip-ms)' } as CSSProperties;
    }
    return (
      <>
        {sheet(fwd ? f.to : f.from)}
        <TurningLeaf
          dir={1}
          faces={`m${top}`}
          className={className}
          style={style}
          front={face(top)}
          back={blank}
          onEnd={onTurned}
        />
      </>
    );
  }

  // Dựng sẵn tờ giấy cho lần lật tới kế tiếp (ẩn), nên lúc lật không phải dựng các dải giấy nữa
  return (
    <>
      {sheet(shown)}
      {shown < lastView && (
        <TurningLeaf dir={1} faces={`m${shown}`} className="is-parked" front={face(shown)} back={blank} onEnd={noop} />
      )}
    </>
  );
}

/** Máy tính: sách mở hai trang, tờ giấy lật qua gáy ở giữa. */
export function desktopScene({ phase, flip, drag, shown, lastView, onOpened, onTurned }: SceneState): ReactNode {
  const spread = (l: number, r: number) => (
    <>
      <div className="h-sheet h-sheet--left">{left(l)}</div>
      <div className="h-sheet h-sheet--right">{right(r)}</div>
    </>
  );

  if (phase !== 'open') {
    return (
      <>
        <div className="h-sheet h-sheet--left h-sheet--blank" />
        <div className="h-sheet h-sheet--right">{right(0)}</div>
        <TurningLeaf
          dir={1}
          faces="cover"
          className={phase === 'opening' ? 'is-auto is-cover' : ''}
          front={<Cover />}
          back={left(0)}
          onEnd={onOpened}
        />
      </>
    );
  }

  if (flip || drag) {
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
    return (
      <>
        {spread(fwd ? f.from : f.to, fwd ? f.to : f.from)}
        <TurningLeaf
          dir={f.dir}
          faces={`${f.from}-${f.to}`}
          className={className}
          style={style}
          front={fwd ? right(f.from) : left(f.from)}
          back={fwd ? left(f.to) : right(f.to)}
          onEnd={onTurned}
        />
      </>
    );
  }

  // Dựng sẵn (ẩn) tờ giấy cho lần lật tới kế tiếp, cùng chỗ trong cây với tờ đang lật nên được dùng lại nguyên
  return (
    <>
      {spread(shown, shown)}
      {shown < lastView && (
        <TurningLeaf
          dir={1}
          faces={`${shown}-${shown + 1}`}
          className="is-parked"
          front={right(shown)}
          back={left(shown + 1)}
          onEnd={noop}
        />
      )}
    </>
  );
}
