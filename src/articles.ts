export interface Article {
  /** Đường link tới bài báo gốc */
  url: string;
  /** Ảnh minh hoạ của bài báo */
  image: string;
  title: string;
  /** Mô tả khái quát bài báo nói về gì */
  summary: string;
  /** Tên trang báo, ví dụ "VnExpress" */
  source: string;
  /** Ngày đăng, dạng hiển thị sẵn */
  date: string;
}

export const ARTICLES: Article[] = [
  {
    url: 'https://baonghean.vn/ky-niem-50-nam-thanh-lap-truong-60-nam-he-chuyen-viet-tiep-truyen-thong-ngoi-truong-mang-ten-nha-chi-si-yeu-nuoc-phan-boi-chau-10280603.html',
    image: 'https://bna.1cdn.vn/thumbs/1200x630/2024/09/18/10.-hoi-dong-su-pham-nha-truong.jpg',
    title: 'Kỷ niệm 50 năm thành lập trường, 60 năm hệ chuyên: Viết tiếp truyền thống ngôi trường mang tên Phan Bội Châu',
    summary:
      'Nhìn lại hành trình 60 năm xây dựng và phát triển của trường THPT chuyên Phan Bội Châu, cùng những kỷ niệm và niềm tự hào của nhiều thế hệ thầy trò.',
    source: 'Báo Nghệ An',
    date: '18/09/2024',
  },
  {
    url: 'https://znews.vn/toan-canh-ngoi-truong-cap-3-noi-tieng-xu-nghe-post611138.html',
    image: 'https://photo.znews.vn/w1250/Uploaded/Ycgmvlbp/2015_12_16/phanboichau_gvn.JPG',
    title: 'Toàn cảnh ngôi trường cấp 3 nổi tiếng xứ Nghệ',
    summary:
      'Loạt ảnh đưa người đọc dạo quanh khuôn viên trường THPT chuyên Phan Bội Châu, từ cổng trường khắc thơ Chế Lan Viên đến các góc học tập quen thuộc.',
    source: 'Znews',
    date: '17/12/2015',
  },
  {
    url: 'https://vietnamnet.vn/hon-nua-the-ky-chuyen-minh-cua-truong-thpt-chuyen-phan-boi-chau-2324351.html',
    image:
      'https://static-images.vnncdn.net/vps_images_publish/000001/000003/2024/9/20/hon-nua-the-ky-chuyen-minh-cua-ngoi-truong-chuyen-dau-tien-tai-mien-bac-31680.jpg?width=0&s=vOWg3MTvFKOSy2WyMgbtfg',
    title: 'Hơn nửa thế kỷ ‘chuyển mình’ của ngôi trường chuyên đầu tiên tại miền Bắc',
    summary:
      'Kể lại sự ra đời của những lớp chuyên Toán đầu tiên giữa thời chiến, nền móng để trường chuyên Phan Bội Châu chính thức được thành lập và lớn mạnh.',
    source: 'VietNamNet',
    date: '20/09/2024',
  },
];
