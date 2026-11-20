export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  loadVideoById(id: string): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  cueVideoById(id: string): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

export interface YTStateChangeEvent {
  target: YTPlayer;
  data: number;
}

export interface YTPlayerConfig {
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: YTStateChangeEvent) => void;
  };
}

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, config: YTPlayerConfig) => YTPlayer; PlayerState: { PLAYING: number; ENDED: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

/** Tải YouTube IFrame API đúng một lần, dùng để phát âm thanh. */
export function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise<void>((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

/** Lấy tên bài và tên tác giả từ oEmbed của YouTube. */
export async function fetchOEmbed(id: string, signal: AbortSignal) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('oEmbed failed');
  const data = (await res.json()) as { title: string; author_name: string };
  return { title: data.title, author: data.author_name };
}
