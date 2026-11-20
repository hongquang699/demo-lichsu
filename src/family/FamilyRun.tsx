import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
// @ts-ignore CSS side-effect imports are handled by the bundler.
import './family.css';

/*
 * Mỗi người là một bộ ảnh tĩnh trong public/family/<folder>/:
 *   - frame1, frame2, ... : các khung hình khi chạy (lặp lại theo thứ tự)
 *   - pose               : ảnh đứng tạo dáng khi chụp
 * Ảnh vẽ nhân vật quay mặt sang PHẢI; người chạy từ bên phải sẽ được lật ngang bằng CSS.
 * Muốn thay ảnh: bỏ file của bạn vào đúng thư mục và sửa tên/đuôi file trong FAMILY bên dưới.
 */

type Side = 'left' | 'right';

interface Member {
  name: string;
  side: Side;
  /** Vị trí cuối cùng trong ảnh gia đình (% chiều ngang sân khấu). */
  x: number;
  scale: number;
  delay: number;
  frames: string[];
  pose: string;
}

/** Thư mục ảnh trong public/ (Vite phục vụ public/ ở gốc trang). */
const BASE = '/family/';

const sprite = (folder: string, runFrames = ['frame1.svg', 'frame2.svg'], pose = 'pose.svg') => ({
  frames: runFrames.map((f) => `${BASE}${folder}/${f}`),
  pose: `${BASE}${folder}/${pose}`,
});

const FAMILY: Member[] = [
  { name: 'Ông', side: 'left', x: 24, scale: 1, delay: 0, ...sprite('ong') },
  { name: 'Bố', side: 'left', x: 38, scale: 1.05, delay: 0.25, ...sprite('bo') },
  { name: 'Bé trai', side: 'left', x: 47, scale: 0.62, delay: 0.5, ...sprite('be-trai') },
  { name: 'Bé gái', side: 'right', x: 56, scale: 0.58, delay: 0.4, ...sprite('be-gai') },
  { name: 'Mẹ', side: 'right', x: 66, scale: 0.98, delay: 0.15, ...sprite('me') },
  { name: 'Bà', side: 'right', x: 80, scale: 0.94, delay: 0, ...sprite('ba') },
];

/** Thời gian mỗi khung hình chạy (ms). */
const FRAME_MS = 160;

type Phase = 'run' | 'pose' | 'photo';

/** Các thành viên chạy từ hai phía vào giữa rồi đứng chụp ảnh gia đình. */
export function FamilyRun() {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>('run');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setPhase('run');
    setTick(0);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t1 = window.setTimeout(() => setPhase('pose'), reduce ? 0 : 3800);
    const t2 = window.setTimeout(() => setPhase('photo'), reduce ? 0 : 4600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [run]);

  // Đổi khung hình liên tục khi đang chạy
  useEffect(() => {
    if (phase !== 'run') return;
    const id = window.setInterval(() => setTick((t) => t + 1), FRAME_MS);
    return () => window.clearInterval(id);
  }, [phase, run]);

  return (
    <section className="fam" aria-label="Ảnh gia đình">
      <div className={`fam__stage fam__stage--${phase}`} key={run}>
        <div className="fam__sky" />
        <div className="fam__ground" />

        <div className="fam__frame" aria-hidden={phase !== 'photo'}>
          <span className="fam__caption">Gia đình mình</span>
        </div>

        {FAMILY.map((m) => {
          const current = phase === 'run' ? m.frames[tick % m.frames.length] : m.pose;
          return (
            <div
              key={m.name}
              className={`fam__runner fam__runner--${m.side}`}
              style={{ '--x': `${m.x}%`, '--s': m.scale, '--delay': `${m.delay}s` } as CSSProperties}
            >
              <div className="fam__body">
                {/* Render sẵn mọi khung để ảnh được tải trước, chỉ hiện khung hiện tại */}
                {[...m.frames, m.pose].map((src) => (
                  <img
                    key={src}
                    className={`fam__img${src === current ? ' is-active' : ''}`}
                    src={src}
                    alt=""
                    draggable={false}
                  />
                ))}
              </div>
              <span className="fam__name">{m.name}</span>
            </div>
          );
        })}

        <div className="fam__flash" />
      </div>

      <button type="button" className="fam__replay" onClick={() => setRun((r) => r + 1)}>
        Chạy lại
      </button>
    </section>
  );
}
