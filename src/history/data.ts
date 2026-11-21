// Dữ liệu trang Lịch sử.
// Những chỗ ghi "[...]" là nội dung mẫu: cần thay bằng tư liệu thật của nhà trường.
// Ảnh: để trống `src` thì trang dùng ảnh minh hoạ tạm (vẽ bằng SVG).

export type PhotoKind = 'old' | 'color' | 'aerial-old' | 'aerial-new' | 'portrait';

export interface Photo {
  src?: string;
  kind: PhotoKind;
  caption: string;
}

export interface Person {
  name: string;
  title: string; // học hàm, học vị
  term: string; // nhiệm kỳ
  photo?: string;
}

export interface Milestone {
  label: string; // hiện trên thanh thời gian
  note: string;
}

export interface Era {
  id: string;
  range: string; // mốc năm lớn, ví dụ "1974 – 1978"
  title: string;
  milestones: Milestone[];
  photo: Photo;
  principals: Person[]; // 2 người trở lên -> hiện dạng tab
  summary: string;
}

export const INTRO_VIDEO = {
  // Đặt đường dẫn video vào đây (ví dụ '/video/mo-dau.mp4' trong thư mục public)
  src: '',
  caption: 'Từ tấm ảnh trắng đen ngày đầu đến toàn cảnh ngôi trường hôm nay',
};

export const STATS: { value: number; suffix?: string; display?: string; label: string }[] = [
  { value: 50, suffix: '+', label: 'Năm hình thành và phát triển' },
  { value: 3, label: 'Cuộc di chuyển lịch sử' },
  { value: 4, label: 'Cơ sở từng đặt chân' },
  { value: 0, display: '18/02/1995', label: 'Ngày khánh thành Tượng đài cụ Phan' },
];

const PLACEHOLDER_SUMMARY =
  '[Tóm tắt 100–150 chữ về bối cảnh và những cột mốc lớn của giai đoạn này: cơ sở vật chất được xây mới hay di chuyển, số lớp và học sinh, thành tích thi học sinh giỏi quốc gia, quốc tế, các danh hiệu nhà trường nhận được. Nội dung mẫu, cần thay bằng tư liệu chính thức của nhà trường.]';

const unknownPrincipal = (term: string): Person => ({
  name: '[Họ tên Hiệu trưởng]',
  title: '[Học hàm, học vị]',
  term: `Hiệu trưởng nhiệm kỳ ${term}`,
});

export const ERAS: Era[] = [
  {
    id: '1974',
    range: '1974 – 1978',
    title: 'Những ngày đầu thành lập',
    milestones: [
      { label: '20/08/1974', note: '[Sự kiện ngày 20/08/1974]' },
      { label: '14/10/1974', note: '[Sự kiện ngày 14/10/1974]' },
      { label: '1976 – 1978', note: '[Sự kiện giai đoạn 1976 – 1978]' },
    ],
    photo: { kind: 'old', caption: 'Ảnh tư liệu, [năm chụp]: [sự kiện]' },
    principals: [unknownPrincipal('1974 – 1981')],
    summary: PLACEHOLDER_SUMMARY,
  },
  {
    id: '1978',
    range: '1978 – 1981',
    title: 'Ổn định và lớn mạnh',
    milestones: [{ label: '1978 – 1981', note: '[Sự kiện giai đoạn 1978 – 1981]' }],
    photo: { kind: 'old', caption: 'Ảnh tư liệu, [năm chụp]: [sự kiện]' },
    principals: [unknownPrincipal('1974 – 1981')],
    summary: PLACEHOLDER_SUMMARY,
  },
  {
    id: '1981',
    range: '1981 – 1996',
    title: 'Vượt khó thời bao cấp',
    milestones: [
      { label: '1981 – 1994', note: '[Sự kiện giai đoạn 1981 – 1994]' },
      { label: '18/02/1995', note: 'Khánh thành Tượng đài cụ Phan' },
    ],
    photo: { kind: 'old', caption: 'Ảnh tư liệu, [năm chụp]: [sự kiện]' },
    principals: [unknownPrincipal('1981 – 1996')],
    summary: PLACEHOLDER_SUMMARY,
  },
  {
    id: '1996',
    range: '1996 – 2002',
    title: 'Bước vào thời kỳ đổi mới',
    milestones: [{ label: '1996 – 2002', note: '[Sự kiện giai đoạn 1996 – 2002]' }],
    photo: { kind: 'color', caption: 'Ảnh màu, [năm chụp]: [sự kiện]' },
    principals: [unknownPrincipal('1996 – 2002')],
    summary: PLACEHOLDER_SUMMARY,
  },
  {
    id: '2002',
    range: '2002 – 2004',
    title: 'Chuẩn bị cho chặng đường mới',
    milestones: [{ label: '2002 – 2004', note: '[Sự kiện giai đoạn 2002 – 2004]' }],
    photo: { kind: 'color', caption: 'Ảnh màu, [năm chụp]: [sự kiện]' },
    principals: [unknownPrincipal('2002 – 2004')],
    summary: PLACEHOLDER_SUMMARY,
  },
  {
    id: '2004',
    range: '2004 – Nay',
    title: 'Ngôi trường hôm nay',
    milestones: [
      { label: '2004 – 2023', note: '[Sự kiện giai đoạn 2004 – 2023]' },
      { label: '2023 – Nay', note: '[Sự kiện giai đoạn 2023 – nay]' },
    ],
    photo: { kind: 'color', caption: 'Ảnh màu, [năm chụp]: [sự kiện]' },
    principals: [
      unknownPrincipal('2004 – 2023'),
      { name: 'Cô Cao Thị Lan Thanh', title: '[Học hàm, học vị]', term: 'Hiệu trưởng nhiệm kỳ 2023 – 2028' },
    ],
    summary: PLACEHOLDER_SUMMARY,
  },
];

export interface LeaderPeriod {
  range: string;
  principal: Person;
  vice: Person;
  secretary: Person;
}

const role = (r: string, range: string): Person => ({
  name: `[Họ tên ${r}]`,
  title: r,
  term: range,
});

export const LEADER_PERIODS: LeaderPeriod[] = ['1974 – 1981', '1981 – 1996', '1996 – 2002', '2002 – 2004', '2004 – Nay'].map(
  (range) => ({
    range,
    principal: role('Hiệu trưởng', range),
    vice: role('Phó Hiệu trưởng', range),
    secretary: role('Bí thư Chi bộ', range),
  }),
);

export const CAMPUS_COMPARE = {
  old: { kind: 'aerial-old' as PhotoKind, src: '', label: 'Trường cũ' },
  next: { kind: 'aerial-new' as PhotoKind, src: '', label: 'Trường mới' },
};

/** Trang tác giả ở cuối sách. Những chỗ "[...]" cần thay bằng thông tin thật. */
export const COLOPHON = {
  title: 'Sử ký Trường THPT Chuyên Phan Bội Châu',
  years: '1974 – nay',
  credits: [
    { role: 'Biên soạn', name: '[Họ tên tác giả hoặc ban biên soạn]' },
    { role: 'Tư liệu, hình ảnh', name: '[Nguồn tư liệu: thư viện, phòng truyền thống nhà trường…]' },
    { role: 'Thiết kế', name: '[Họ tên người thiết kế]' },
  ],
  note: '[Lời cảm ơn các thế hệ thầy cô, cựu học sinh đã đóng góp tư liệu.]',
  place: 'Nghệ An',
  year: '2026',
};
