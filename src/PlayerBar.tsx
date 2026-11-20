import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { TRACKS, coverUrl, formatTime } from './tracks';
import { fetchOEmbed, loadYouTubeApi } from './youtube';
import type { YTPlayer } from './youtube';

interface Meta {
  title: string;
  author: string;
}

const PLAYING_STATE = 1;
const PAUSED_STATE = 2;
const ENDED_STATE = 0;

export function PlayerBar() {
  const hostRef = useRef<HTMLDivElement>(null);
  const ytRef = useRef<YTPlayer | null>(null);
  const creatingRef = useRef<Promise<YTPlayer> | null>(null);
  const wantPlayRef = useRef(false);
  const indexRef = useRef(0);

  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const [metas, setMetas] = useState<(Meta | null)[]>(TRACKS.map(() => null));
  const [dragRatio, setDragRatio] = useState<number | null>(null);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const volumeRef = useRef(80);
  const mutedRef = useRef(false);

  const changeVolume = (value: number) => {
    volumeRef.current = value;
    setVolume(value);
    const p = ytRef.current;
    p?.setVolume(value);
    // Kéo thanh âm lượng khi đang tắt tiếng thì bật tiếng lại
    if (value > 0 && mutedRef.current) {
      mutedRef.current = false;
      setMuted(false);
      p?.unMute();
    }
  };

  const toggleMute = () => {
    const next = !mutedRef.current;
    // Bật tiếng khi âm lượng đang 0 thì đưa về mức nghe được
    if (!next && volumeRef.current === 0) changeVolume(50);
    mutedRef.current = next;
    setMuted(next);
    if (next) ytRef.current?.mute();
    else ytRef.current?.unMute();
  };
  const barRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Đóng danh sách khi bấm ra ngoài thanh phát hoặc nhấn Esc
  useEffect(() => {
    if (!listOpen) return;
    const onPointerDownOutside = (event: globalThis.PointerEvent) => {
      if (!footerRef.current?.contains(event.target as Node)) setListOpen(false);
    };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setListOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDownOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onPointerDownOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [listOpen]);

  // Tạo trình phát YouTube (một trình phát duy nhất) khi cần
  const ensurePlayer = (videoId: string): Promise<YTPlayer> => {
    if (ytRef.current) return Promise.resolve(ytRef.current);
    if (!creatingRef.current) {
      creatingRef.current = loadYouTubeApi().then(
        () =>
          new Promise<YTPlayer>((resolve) => {
            const mount = document.createElement('div');
            hostRef.current?.appendChild(mount);
            new window.YT!.Player(mount, {
              videoId,
              playerVars: { playsinline: 1, controls: 0 },
              events: {
                onReady: (event) => {
                  ytRef.current = event.target;
                  // Áp âm lượng người nghe đã chọn trước khi trình phát sẵn sàng
                  event.target.setVolume(volumeRef.current);
                  if (mutedRef.current) event.target.mute();
                  setDuration(event.target.getDuration());
                  resolve(event.target);
                },
                onStateChange: (event) => {
                  setDuration(event.target.getDuration());
                  if (event.data === PLAYING_STATE) {
                    setPlaying(true);
                    setLoading(false);
                  }
                  if (event.data === PAUSED_STATE && !wantPlayRef.current) setPlaying(false);
                  if (event.data === ENDED_STATE) {
                    // Hết bài thì chuyển sang bài kế tiếp và phát
                    loadTrack((indexRef.current + 1) % TRACKS.length, true);
                  }
                },
              },
            });
          }),
      );
    }
    return creatingRef.current;
  };

  // Dọn trình phát khi component bị gỡ
  useEffect(() => {
    return () => {
      ytRef.current?.destroy();
      ytRef.current = null;
      creatingRef.current = null;
    };
  }, []);

  // Lấy tên và tác giả của tất cả bài
  useEffect(() => {
    const controller = new AbortController();
    TRACKS.forEach((track, i) => {
      fetchOEmbed(track.id, controller.signal)
        .then((m) => setMetas((prev) => prev.map((old, j) => (j === i ? m : old))))
        .catch(() => {});
    });
    return () => controller.abort();
  }, []);

  // Cập nhật thanh tiến trình khi đang phát
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const p = ytRef.current;
      if (!p) return;
      setCurrent(p.getCurrentTime());
      setDuration(p.getDuration());
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing]);

  // Nạp bài theo chỉ số; autoplay quyết định có phát ngay không
  const loadTrack = (i: number, autoplay: boolean) => {
    const id = TRACKS[i].id;
    indexRef.current = i;
    setIndex(i);
    setCurrent(0);
    setDuration(0);
    setListOpen(false);
    wantPlayRef.current = autoplay;
    setPlaying(autoplay);

    const existing = ytRef.current;
    if (existing) {
      if (autoplay) {
        setLoading(true);
        existing.loadVideoById(id);
      } else {
        existing.cueVideoById(id);
      }
      return;
    }
    if (autoplay) setLoading(true);
    ensurePlayer(id)
      .then((p) => {
        if (wantPlayRef.current) p.playVideo();
      })
      .catch(() => {
        wantPlayRef.current = false;
        setPlaying(false);
        setLoading(false);
      });
  };

  const togglePlay = () => {
    if (playing) {
      wantPlayRef.current = false;
      setPlaying(false);
      ytRef.current?.pauseVideo();
      return;
    }
    const p = ytRef.current;
    if (p) {
      wantPlayRef.current = true;
      setPlaying(true);
      setLoading(true);
      p.playVideo();
    } else {
      loadTrack(indexRef.current, true);
    }
  };

  // Tua: giữ vị trí kéo (0–1) đến khi thả chuột
  const ratioFromPointer = (clientX: number) => {
    const rect = barRef.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const seekToRatio = (ratio: number) => {
    const apply = (p: YTPlayer) => {
      const total = p.getDuration();
      const time = ratio * total;
      p.seekTo(time, true);
      setDuration(total);
      setCurrent(time);
      // Đang tắt nhạc mà tua: phát tiếp ngay từ đoạn vừa tua
      if (wantPlayRef.current) p.playVideo();
    };
    if (ytRef.current) apply(ytRef.current);
    else ensurePlayer(TRACKS[indexRef.current].id).then(apply).catch(() => {});
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragRatio(ratioFromPointer(event.clientX));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRatio === null) return;
    setDragRatio(ratioFromPointer(event.clientX));
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRatio === null) return;
    const ratio = ratioFromPointer(event.clientX);
    setDragRatio(null);
    if (!wantPlayRef.current) {
      // Cập nhật giao diện ngay sang trạng thái đang phát
      wantPlayRef.current = true;
      setPlaying(true);
      setLoading(true);
    }
    seekToRatio(ratio);
  };

  const onPointerCancel = () => setDragRatio(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    if (duration <= 0) return;
    event.preventDefault();
    const step = 5 / duration;
    const ratio = Math.min(1, Math.max(0, current / duration + (event.key === 'ArrowRight' ? step : -step)));
    seekToRatio(ratio);
  };

  const shown = dragRatio !== null ? dragRatio * duration : current;
  const progress = dragRatio !== null ? dragRatio * 100 : duration > 0 ? (current / duration) * 100 : 0;
  const level = muted ? 0 : volume;
  const meta = metas[index];
  const track = TRACKS[index];

  return (
    <footer className="player-bar" ref={footerRef}>
      <div className="player-bar__host" ref={hostRef} aria-hidden="true" />

      {/* Danh sách và nút bài hát nằm chung một khối để danh sách rộng bằng nút */}
      <div className="player-bar__song">
      {/* Luôn render để có hiệu ứng mở/đóng; khi đóng thì ẩn bằng CSS (visibility) */}
      <ul
        id="track-list"
        className={`track-list${listOpen ? ' is-open' : ''}`}
        aria-label="Danh sách bài hát"
      >
        {TRACKS.map((t, i) => (
          <li key={t.id} style={{ '--i': i, '--count': TRACKS.length } as CSSProperties}>
            <button
              type="button"
              className={`track-list__item${i === index ? ' is-current' : ''}`}
              onClick={() => loadTrack(i, true)}
              aria-current={i === index ? 'true' : undefined}
            >
              <img className="track-list__cover" src={coverUrl(t.id)} alt="" />
              <span className="track-list__text">
                <span className="track-list__title">{metas[i]?.title ?? 'Đang tải...'}</span>
                <span className="track-list__author">{metas[i]?.author ?? ''}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Bấm vào ảnh + tên bài để mở danh sách chuyển bài */}
      <button
        type="button"
        className="player-bar__info"
        onClick={() => setListOpen((v) => !v)}
        aria-expanded={listOpen}
        aria-controls="track-list"
        aria-label={`${meta?.title ?? 'Bài hát'}. ${listOpen ? 'Đóng' : 'Mở'} danh sách bài hát`}
      >
        <img className="player-bar__cover" src={coverUrl(track.id)} alt="" />
        <span className="player-bar__text">
          <span className="player-bar__title">{meta?.title ?? 'Đang tải...'}</span>
          <span className="player-bar__author">{meta?.author ?? ''}</span>
        </span>
        <svg className="player-bar__chevron" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      </div>

      <div className="player-bar__center">
        <button
          type="button"
          className={`play-btn${loading ? ' is-loading' : ''}`}
          onClick={togglePlay}
          onPointerEnter={() => void ensurePlayer(track.id).catch(() => {})}
          aria-label={playing ? 'Tạm dừng' : 'Phát'}
          aria-busy={loading}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
          )}
        </button>

        <div className="player-bar__progress">
          <span className="player-bar__time">{formatTime(shown)}</span>
          <div
            ref={barRef}
            className={`progress${dragRatio !== null ? ' is-dragging' : ''}`}
            role="slider"
            tabIndex={0}
            aria-label="Tiến trình bài hát"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(shown)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onKeyDown={onKeyDown}
          >
            <div className="progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="player-bar__time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="volume">
        <button
          type="button"
          className="volume__btn"
          onClick={toggleMute}
          aria-label={level === 0 ? 'Bật tiếng' : 'Tắt tiếng'}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
              {level === 0 ? (
                <path d="M15.5 10.25l3.5 3.5M19 10.25l-3.5 3.5" />
              ) : (
                <>
                  <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
                  {level > 50 && <path d="M18 7a7 7 0 0 1 0 10" />}
                </>
              )}
            </g>
          </svg>
        </button>
        <input
          type="range"
          className="volume__slider"
          min={0}
          max={100}
          step={1}
          value={level}
          onChange={(event) => changeVolume(Number(event.target.value))}
          aria-label="Âm lượng"
          style={{ '--val': `${level}%` } as CSSProperties}
        />
      </div>
    </footer>
  );
}
