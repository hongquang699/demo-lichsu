export interface Track {
  /** ID của video YouTube (phần sau `watch?v=`) */
  id: string;
}

export const TRACKS: Track[] = [
  { id: '45FqbFwLdLY' },
  { id: '0FcTl1UQRYk' },
  { id: 'EmbXTI5BEuQ' },
  { id: 'xdk4RBgRT-Y' },
  { id: 'P3b-mVALP_A' },
  { id: 'z5qEsKAtuTQ' },
];

export const coverUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
};
