import { useState } from 'react';
import { COLOPHON, ERAS, type Era } from './data';
import { Lotus } from './Ornament';
import { PhotoView, ZoomablePhoto } from './Photo';

/* ---------- Nội dung từng trang ---------- */

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function LeftPage({ era, index }: { era: Era; index: number }) {
  return (
    <div className="h-page h-page--left">
      <p className="h-page__running">Chương {ROMAN[index]} · {era.title}</p>
      <p className="h-page__range">{era.range}</p>
      <figure className="h-page__figure">
        <ZoomablePhoto kind={era.photo.kind} src={era.photo.src} alt={era.photo.caption} caption={era.photo.caption} />
        <figcaption>{era.photo.caption}</figcaption>
      </figure>
      <span className="h-page__folio">{index * 2 + 1}</span>
    </div>
  );
}

function RightPage({ era, index }: { era: Era; index: number }) {
  const [tab, setTab] = useState(era.principals.length - 1);
  const p = era.principals[tab] ?? era.principals[0];

  return (
    <div className="h-page h-page--right">
      <p className="h-page__running h-page__running--right">Sử ký Trường THPT Chuyên Phan Bội Châu</p>
      <div className="h-principal-card">
        <div className="h-principal-card__head">
          <p className="h-page__kicker">Hiệu trưởng</p>
          {era.principals.length > 1 && (
            <div className="h-tabs" role="tablist" aria-label="Các đời hiệu trưởng trong giai đoạn">
              {era.principals.map((x, i) => (
                <button
                  key={x.term}
                  type="button"
                  role="tab"
                  aria-selected={i === tab}
                  className={`h-tab${i === tab ? ' is-active' : ''}`}
                  onClick={() => setTab(i)}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {x.term.replace('Hiệu trưởng nhiệm kỳ ', '')}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="h-principal" key={tab}>
          <PhotoView kind="portrait" src={p.photo} alt={`Chân dung ${p.name}`} className="h-principal__photo" />
          <div>
            <p className="h-principal__name">{p.name}</p>
            <p className="h-principal__meta">{p.title}</p>
            <p className="h-principal__term">{p.term}</p>
          </div>
        </div>
      </div>
      <h4 className="h-page__subhead">Bối cảnh và thành tựu</h4>
      <p className="h-page__summary">{era.summary}</p>
      <ol className="h-page__milestones" aria-label="Cột mốc trong giai đoạn">
        {era.milestones.map((m) => (
          <li key={m.label}>
            <strong>{m.label}</strong>
            <span>{m.note}</span>
          </li>
        ))}
      </ol>
      <span className="h-page__folio">{index * 2 + 2}</span>
    </div>
  );
}

export function Cover() {
  return (
    <div className="h-cover">
      <PhotoView kind="old" alt="" className="h-cover__art" />
      <div className="h-cover__frame">
        <p className="h-cover__over">Trường THPT Chuyên</p>
        <Lotus className="h-cover__rule" />
        <p className="h-cover__name">Phan Bội Châu</p>
        <Lotus className="h-cover__rule" />
        <p className="h-cover__years">Sử ký 1974 – nay</p>
      </div>
    </div>
  );
}

/* ---------- Cuối sách: trang tác giả, mặt trong bìa sau, mặt sau bìa ---------- */

/** Trang tác giả (trang ghi tên sách, người biên soạn, nguồn tư liệu), ở trang trái của mặt sách cuối. */
function AuthorPage() {
  return (
    <div className="h-page h-page--left h-author">
      <p className="h-page__running">Thông tin sách</p>
      <div className="h-author__body">
        <Lotus className="h-author__rule" />
        <p className="h-author__title">{COLOPHON.title}</p>
        <p className="h-author__years">{COLOPHON.years}</p>
        <dl className="h-author__credits">
          {COLOPHON.credits.map((c) => (
            <div key={c.role}>
              <dt>{c.role}</dt>
              <dd>{c.name}</dd>
            </div>
          ))}
        </dl>
        <p className="h-author__note">{COLOPHON.note}</p>
        <p className="h-author__place">
          {COLOPHON.place}, {COLOPHON.year}
        </p>
      </div>
      <span className="h-page__folio">{ERAS.length * 2 + 1}</span>
    </div>
  );
}

/** Mặt trong bìa sau: giấy lót, chữ "Hết" ở giữa. */
function EndPage() {
  return (
    <div className="h-page h-page--right h-endpage">
      <div className="h-endpage__mark">
        <Lotus className="h-endpage__rule" />
        <p>Hết</p>
        <Lotus className="h-endpage__rule" />
      </div>
    </div>
  );
}

/** Mặt sau bìa sách: da thuộc như bìa trước, tên trường và hoa văn ép nhũ vàng, không có ảnh. */
function BackCover() {
  return (
    <div className="h-cover h-cover--back">
      <div className="h-cover__back">
        <Lotus className="h-cover__rule" />
        <p className="h-cover__over">Trường THPT Chuyên Phan Bội Châu</p>
        <p className="h-cover__years">Nghệ An · 1974 – nay</p>
        <Lotus className="h-cover__rule" />
      </div>
    </div>
  );
}

export const left = (i: number) => <LeftPage key={`l${i}`} era={ERAS[i]} index={i} />;
export const right = (i: number) => <RightPage key={`r${i}`} era={ERAS[i]} index={i} />;

const N = ERAS.length;

/*
 * Máy tính: mặt sách thứ v. 0..N-1 là các giai đoạn; N là mặt sách cuối (trang tác giả | mặt trong bìa sau);
 * N+1 là sách đã gập, chỉ còn mặt sau bìa nằm ở nửa trái.
 */
export const leftOf = (v: number) => (v < N ? left(v) : v === N ? <AuthorPage key="author" /> : <BackCover key="back" />);
export const rightOf = (v: number) => (v < N ? right(v) : v === N ? <EndPage key="end" /> : null);
/** Mặt sách cuối cùng (N+1) là bìa sau gập lại: tờ lật tới đó là bìa cứng, không cong. */
export const DESK_LAST = N + 1;

/**
 * Điện thoại: trang thứ v. Mỗi giai đoạn là hai trang liền nhau (trang chẵn là ảnh, trang lẻ là hiệu trưởng và bối cảnh),
 * sau đó là trang tác giả rồi mặt sau bìa.
 */
export const face = (v: number) =>
  v < 2 * N ? (v % 2 ? right(v >> 1) : left(v >> 1)) : v === 2 * N ? <AuthorPage key="author" /> : <BackCover key="back" />;
export const PHONE_LAST = 2 * N + 1;
/** Mặt sau tờ giấy trên điện thoại: giấy trắng. */
export const blank = <div className="h-page h-page--blank" />;
