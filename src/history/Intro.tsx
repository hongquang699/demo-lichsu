import { INTRO_VIDEO, STATS } from './data';
import { useCountUp, useInView } from './hooks';
import { Fleuron } from './Ornament';
import { PhotoView } from './Photo';

function Stat({ stat, run, index }: { stat: (typeof STATS)[number]; run: boolean; index: number }) {
  const n = useCountUp(stat.value, run);
  const text = stat.display ?? `${String(n).padStart(2, '0')}${stat.suffix ?? ''}`;
  return (
    <li className={`h-stat${stat.display ? ' h-stat--date' : ''}`} style={{ transitionDelay: `${index * 120}ms` }}>
      <span className="h-stat__value">{text}</span>
      <span className="h-stat__label">{stat.label}</span>
    </li>
  );
}

export function Intro() {
  const [statsRef, statsSeen] = useInView<HTMLUListElement>(0.4);

  return (
    <section className="h-intro" id="h-intro" aria-labelledby="h-intro-title">
      <div className="h-video">
        {INTRO_VIDEO.src ? (
          <video className="h-video__media" src={INTRO_VIDEO.src} autoPlay muted playsInline loop />
        ) : (
          // Chưa có video: dựng tạm cảnh "ảnh trắng đen cũ -> toàn cảnh flycam hiện tại"
          <div className="h-video__media h-video__mock" aria-hidden="true">
            <PhotoView kind="old" alt="" className="h-video__then" />
            <PhotoView kind="aerial-new" alt="" className="h-video__now" />
            <span className="h-video__grain" />
            <span className="h-video__stamp">
              <span className="h-video__stamp-then">1974</span>
              <span className="h-video__stamp-now">Hôm nay</span>
            </span>
          </div>
        )}
        <div className="h-video__shade" />
        <div className="h-video__text">
          <h1 id="h-intro-title" className="h-video__title">
            Hơn nửa thế kỷ <em>một ngôi trường</em>
          </h1>
          <p className="h-video__school">Trường THPT Chuyên Phan Bội Châu · Nghệ An</p>
          <p className="h-video__caption">{INTRO_VIDEO.caption}</p>
        </div>
        <a
          className="h-scroll-cue"
          href="#h-book"
          onClick={(e) => {
            // Không đổi hash: App dùng hash để chọn trang (#/lich-su), đổi sang #h-book sẽ về trang chủ
            e.preventDefault();
            document.getElementById('h-book')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          Lướt xuống để mở sách
        </a>
      </div>

      <Fleuron className="h-stats__ornament" />
      <ul ref={statsRef} className={`h-stats${statsSeen ? ' is-in' : ''}`}>
        {STATS.map((s, i) => (
          <Stat key={s.label} stat={s} run={statsSeen} index={i} />
        ))}
      </ul>
    </section>
  );
}
