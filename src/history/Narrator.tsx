import { useEffect, useRef, useState } from 'react';
import { ERAS, INTRO_VIDEO, LEADER_PERIODS, STATS } from './data';

/* ---------- Nghe đọc: lướt tới phần nào, trình duyệt đọc phần đó bằng giọng tiếng Việt ---------- */

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** Bỏ các chỗ còn là chữ mẫu "[...]", và đọc "1974 – 1978" thành "1974 đến 1978". */
const clean = (s: string) =>
  s
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s*[–-]\s*(Nay|nay)\b/g, ' đến nay')
    .replace(/(\d)\s*[–-]\s*(\d)/g, '$1 đến $2')
    .replace(/\s+([.,])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

const join = (parts: string[]) =>
  parts
    .map(clean)
    .filter(Boolean)
    .map((p) => p.replace(/[.,:;]+$/, ''))
    .join('. ');

const SECTIONS = ['h-intro', 'h-book', 'h-compare', 'h-leaders'] as const;
type SectionId = (typeof SECTIONS)[number];

function textFor(id: SectionId, page: number): string {
  if (id === 'h-intro') {
    return join([
      'Hơn nửa thế kỷ một ngôi trường',
      'Trường Trung học phổ thông Chuyên Phan Bội Châu, Nghệ An',
      INTRO_VIDEO.caption,
      // "Hơn 50 năm hình thành và phát triển", "3 cuộc di chuyển lịch sử", "18/02/1995: ngày khánh thành..."
      ...STATS.map((s) => {
        const label = s.label.charAt(0).toLowerCase() + s.label.slice(1); // giữ hoa tên riêng như "cụ Phan"
        return s.display ? `${s.display}: ${label}` : `${s.suffix === '+' ? 'Hơn ' : ''}${s.value} ${label}`;
      }),
    ]);
  }
  if (id === 'h-book') {
    const era = ERAS[page];
    return join([
      `Chương ${ROMAN[page]}. ${era.title}, giai đoạn ${era.range}`,
      era.summary,
      // Chỗ nào còn là chữ mẫu thì bỏ hẳn, không để lại dấu câu lẻ
      ...era.principals.map((p) => [clean(p.name), clean(p.term)].filter(Boolean).join(', ')),
      ...era.milestones.map((m) => (clean(m.note) ? `${m.label}: ${clean(m.note)}` : '')),
    ]);
  }
  if (id === 'h-compare') {
    return join(['Xưa và nay, từ trên cao nhìn xuống', 'Kéo thanh ở giữa để so sánh trường cũ và trường mới']);
  }
  return join(['Ban giám hiệu qua các thời kỳ', `Các giai đoạn: ${LEADER_PERIODS.map((p) => p.range).join(', ')}`]);
}

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (!synth) return null;
  const vi = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith('vi'));
  // Ưu tiên giọng tự nhiên (giọng online của Edge/Chrome) nếu có
  return vi.find((v) => /natural|online|google/i.test(v.name)) ?? vi[0] ?? null;
}

export function Narrator({ page }: { page: number }) {
  const [on, setOn] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const [current, setCurrent] = useState<SectionId | null>(null);
  const lastSpoken = useRef('');

  // Phần nào đang chiếm phần lớn màn hình thì là phần đang xem
  useEffect(() => {
    if (!on) return;
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.intersectionRatio * e.boundingClientRect.height));
        let best: string | null = null;
        let most = 0;
        seen.forEach((v, k) => {
          if (v > most) {
            most = v;
            best = k;
          }
        });
        if (best) setCurrent(best as SectionId);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [on]);

  // Đổi phần đang xem (hoặc lật sang giai đoạn khác trong sách) thì đọc phần mới, bỏ câu đang đọc dở
  useEffect(() => {
    if (!on || !synth || !current) return;
    const text = textFor(current, page);
    const key = `${current}:${current === 'h-book' ? page : ''}`;
    if (key === lastSpoken.current) return;
    lastSpoken.current = key;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = 0.95;
    const voice = pickVoice();
    if (voice) u.voice = voice;
    synth.speak(u);
  }, [on, current, page]);

  // Tắt nút hoặc rời trang thì dừng đọc
  useEffect(() => {
    if (on) return;
    synth?.cancel();
    lastSpoken.current = '';
    setCurrent(null);
  }, [on]);
  useEffect(() => () => synth?.cancel(), []);

  // Danh sách giọng có thể nạp muộn: kiểm tra lại khi trình duyệt báo đã nạp xong
  useEffect(() => {
    if (!on || !synth) return;
    const check = () => setNoVoice(!pickVoice());
    check();
    synth.addEventListener('voiceschanged', check);
    return () => synth.removeEventListener('voiceschanged', check);
  }, [on]);

  if (!synth) return null;

  return (
    <div className="h-narrator">
      {on && noVoice && (
        <p className="h-narrator__note" role="status">
          Máy này chưa có giọng tiếng Việt nên giọng đọc có thể không chuẩn.
        </p>
      )}
      <button
        type="button"
        className={`h-narrator__btn${on ? ' is-on' : ''}`}
        aria-pressed={on}
        onClick={() => setOn((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
          {on ? (
            <>
              <path d="M15.5 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </>
          ) : (
            <path d="M16 10l4 4M20 10l-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
        <span>{on ? 'Đang đọc' : 'Nghe đọc'}</span>
      </button>
    </div>
  );
}
