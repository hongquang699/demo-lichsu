import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PhotoKind } from './data';

/* Ảnh minh hoạ tạm, vẽ bằng SVG, dùng khi chưa có ảnh tư liệu thật. */

function Portrait() {
  return (
    <svg viewBox="0 0 100 120" className="h-art" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="pt-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4dcc2" />
          <stop offset="1" stopColor="#cfc4a3" />
        </linearGradient>
      </defs>
      <rect width="100" height="120" fill="url(#pt-bg)" />
      <path d="M10 120c3-26 18-38 40-38s37 12 40 38z" fill="#8f8467" />
      <path d="M40 80l10 14 10-14z" fill="#efe9d6" />
      <ellipse cx="50" cy="50" rx="17" ry="20" fill="#a39678" />
      <path d="M33 46c0-14 8-21 17-21s17 7 17 21c-3-7-9-10-17-10s-14 3-17 10z" fill="#6f654c" />
    </svg>
  );
}

function Facade() {
  // Mặt tiền dãy nhà 2 tầng có hành lang, cột cờ và hàng cây
  return (
    <svg viewBox="0 0 400 260" className="h-art" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="fc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fbfd6" />
          <stop offset="1" stopColor="#e8e2c8" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#fc-sky)" />
      <rect y="196" width="400" height="64" fill="#9aa36b" />
      <path d="M0 214h400v8H0z" fill="#c9b98c" />
      {/* Nhà */}
      <rect x="44" y="96" width="312" height="100" fill="#ecd59b" />
      <path d="M32 98 L200 62 L368 98z" fill="#9c3b2e" />
      <rect x="44" y="142" width="312" height="5" fill="#c9ad6c" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x={56 + i * 34} y="106" width="20" height="26" fill="#5b6f7f" />
          <rect x={56 + i * 34} y="154" width="20" height="30" fill="#5b6f7f" />
          <rect x={50 + i * 34} y="147" width="4" height="49" fill="#f4e6bd" />
        </g>
      ))}
      <rect x="182" y="150" width="36" height="46" fill="#6b4a2f" />
      {/* Cột cờ */}
      <rect x="199" y="16" width="2" height="48" fill="#4a4a4a" />
      <path d="M201 17h26v16h-26z" fill="#c8102e" />
      <path d="M212 21l1.4 4.2h4.4l-3.6 2.6 1.4 4.2-3.6-2.6-3.6 2.6 1.4-4.2-3.6-2.6h4.4z" fill="#ffd34d" transform="translate(0 -3) scale(1)" />
      {/* Cây */}
      {[[18, 176, 30], [382, 172, 34], [96, 202, 14], [304, 202, 14]].map(([x, y, r], i) => (
        <g key={i}>
          <rect x={x - 2} y={y} width="4" height={220 - y} fill="#5d4a32" />
          <circle cx={x} cy={y - r * 0.4} r={r} fill="#55703f" />
          <circle cx={x + r * 0.4} cy={y - r * 0.8} r={r * 0.7} fill="#648446" />
        </g>
      ))}
    </svg>
  );
}

function Aerial({ isNew }: { isNew: boolean }) {
  // Ảnh chụp từ trên cao: khối nhà chữ U, sân trường, đường, cây
  const roof = isNew ? '#b5473b' : '#7c6a50';
  const roof2 = isNew ? '#c9c2b2' : '#8e7c60';
  return (
    <svg viewBox="0 0 400 250" className="h-art" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="250" fill={isNew ? '#7a9656' : '#9a916f'} />
      <path d="M0 200 L400 168 L400 196 L0 228z" fill={isNew ? '#4b4b4d' : '#b2a582'} />
      {isNew && <path d="M0 214 L400 182" stroke="#e8e2c8" strokeWidth="1.5" strokeDasharray="10 8" />}
      {/* Sân trường */}
      <rect x="120" y="70" width="150" height="70" fill={isNew ? '#d8cfb5' : '#b9ab85'} />
      {/* Khối nhà chữ U */}
      <rect x="90" y="40" width="210" height="28" fill={roof} />
      <rect x="90" y="68" width="28" height="86" fill={roof} />
      <rect x="272" y="68" width="28" height="86" fill={roof} />
      <path d="M90 54h210" stroke="rgba(0,0,0,0.18)" strokeWidth="2" />
      {isNew ? (
        <>
          <rect x="320" y="36" width="64" height="58" fill={roof2} />
          <rect x="16" y="40" width="58" height="104" rx="29" fill="#b0563c" />
          <rect x="26" y="50" width="38" height="84" rx="19" fill="#6f9a4c" />
          <rect x="150" y="160" width="96" height="10" fill="#c8102e" opacity="0.8" />
          <circle cx="195" cy="104" r="5" fill="#f4f0e2" />
        </>
      ) : (
        <rect x="320" y="56" width="56" height="40" fill={roof2} />
      )}
      {[
        [40, 180], [80, 172], [350, 130], [370, 150], [140, 20], [250, 20], [330, 18], [60, 20],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={isNew ? 13 : 10} fill={isNew ? '#3f5f2c' : '#6d6a48'} />
      ))}
    </svg>
  );
}

function PlaceholderArt({ kind }: { kind: PhotoKind }) {
  if (kind === 'portrait') return <Portrait />;
  if (kind === 'aerial-old' || kind === 'aerial-new') return <Aerial isNew={kind === 'aerial-new'} />;
  return <Facade />;
}

interface PhotoProps {
  kind: PhotoKind;
  src?: string;
  alt: string;
  className?: string;
}

/** Ảnh tư liệu: ảnh thật nếu có `src`, không thì ảnh minh hoạ. Ảnh 'old' hiển thị trắng đen, có hạt phim. */
export function PhotoView({ kind, src, alt, className = '' }: PhotoProps) {
  return (
    <div className={`h-photo h-photo--${kind} ${className}`} role="img" aria-label={alt}>
      {src ? <img src={src} alt="" draggable={false} /> : <PlaceholderArt kind={kind} />}
    </div>
  );
}

/** Ảnh bấm vào để phóng to. */
export function ZoomablePhoto(props: PhotoProps & { caption: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="h-zoom"
        onClick={() => setOpen(true)}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Phóng to ảnh: ${props.caption}`}
      >
        <PhotoView {...props} />
        <span className="h-zoom__hint" aria-hidden="true">
          Phóng to
        </span>
      </button>
      {/* Đưa ra ngoài cuốn sách (sách xoay 3D nên khung cố định bên trong bị nhốt trong sách),
          nhưng vẫn trong .history để giữ màu và font của trang */}
      {open &&
        createPortal(
        <div
          className="h-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={props.caption}
          onClick={() => setOpen(false)}
          // Sự kiện trong portal vẫn nổi lên cuốn sách theo cây React: chặn lại để kéo hay bấm phím ở đây không lật trang phía sau
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <figure className="h-lightbox__figure" onClick={(e) => e.stopPropagation()}>
            <PhotoView {...props} className="h-lightbox__photo" />
            <figcaption>{props.caption}</figcaption>
          </figure>
          <button type="button" className="h-lightbox__close" onClick={() => setOpen(false)} aria-label="Đóng" title="Đóng" autoFocus>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>,
          btnRef.current?.closest('.history') ?? document.body,
        )}
    </>
  );
}
