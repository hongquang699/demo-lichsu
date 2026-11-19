/* Hoa văn trang trí vẽ bằng SVG: đường kẻ có bông sen ở giữa, mũi tên. */

interface Props {
  className?: string;
}

/** Đường kẻ trang trí: hai nhánh cuộn đối xứng ôm một bông sen cách điệu. */
export function Fleuron({ className = '' }: Props) {
  const half = (
    <>
      <path d="M8 12 H88" />
      <path d="M88 12 C96 12 100 6 106 6 C111 6 113 10 110 12.6 C107 15 103 12 105 10" />
      <circle cx="4" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <path d="M60 12 l4 -3 l4 3 l-4 3 z" fill="currentColor" stroke="none" />
    </>
  );
  return (
    <svg className={`h-fleuron ${className}`} viewBox="0 0 280 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        {half}
        <g transform="translate(280 0) scale(-1 1)">{half}</g>
        {/* Bông sen */}
        <path d="M140 3 C134 9 134 16 140 21 C146 16 146 9 140 3 Z" fill="currentColor" stroke="none" />
        <path d="M139 21 C131 20 125 15 123 9 C129 10 134 13 137 17" />
        <path d="M141 21 C149 20 155 15 157 9 C151 10 146 13 143 17" />
      </g>
    </svg>
  );
}

/** Bông sen nhỏ dùng làm dấu ngăn. */
export function Lotus({ className = '' }: Props) {
  return (
    <svg className={`h-lotus ${className}`} viewBox="0 0 24 16" aria-hidden="true" focusable="false">
      <path d="M12 1 C9 5 9 10 12 14 C15 10 15 5 12 1 Z" fill="currentColor" />
      <path d="M11 14.5 C6 14 2.5 11 1.5 7 C5 7.5 8 9.5 10 12 M13 14.5 C18 14 21.5 11 22.5 7 C19 7.5 16 9.5 14 12" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function Chevron({ dir, className = '' }: Props & { dir: 'left' | 'right' }) {
  return (
    <svg className={`h-chevron ${className}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d={dir === 'left' ? 'M10 3 L5 8 L10 13' : 'M6 3 L11 8 L6 13'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
