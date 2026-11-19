import { useRef, useState } from 'react';
import { CAMPUS_COMPARE } from './data';
import { Chevron, Fleuron } from './Ornament';
import { PhotoView } from './Photo';

/** Thanh kéo ở giữa: trường cũ bên trái, trường mới bên phải. */
export function Compare() {
  const [pos, setPos] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const moveTo = (clientX: number) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    setPos(Math.min(100, Math.max(0, ((clientX - box.left) / box.width) * 100)));
  };

  const { old, next } = CAMPUS_COMPARE;

  return (
    <section className="h-section h-compare" id="h-compare" aria-labelledby="h-compare-title">
      <header className="h-head">
        <h2 id="h-compare-title" className="h-section__title">
          Xưa và nay, từ trên cao nhìn xuống
        </h2>
        <Fleuron />
      </header>
      <p className="h-section__lead">Kéo thanh ở giữa sang trái hoặc phải để so sánh trường cũ và trường mới.</p>

      <div
        ref={boxRef}
        className="h-compare__box"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <PhotoView kind={next.kind} src={next.src} alt={`Ảnh flycam ${next.label.toLowerCase()}`} className="h-compare__img" />
        <div className="h-compare__clip" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <PhotoView kind={old.kind} src={old.src} alt={`Ảnh flycam ${old.label.toLowerCase()}`} className="h-compare__img" />
        </div>
        <span className="h-compare__tag h-compare__tag--old">{old.label}</span>
        <span className="h-compare__tag h-compare__tag--new">{next.label}</span>
        <div className="h-compare__handle" style={{ left: `${pos}%` }} aria-hidden="true">
          <span className="h-compare__knob">
            <Chevron dir="left" />
            <Chevron dir="right" />
          </span>
        </div>
        <input
          className="h-compare__range"
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Tỉ lệ hiển thị trường cũ và trường mới"
        />
      </div>
    </section>
  );
}
