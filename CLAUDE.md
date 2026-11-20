# Quy tắc dự án

## Phạm vi code: chỉ giao diện (UI)

- Chỉ viết code **giao diện người dùng**.
- Ngôn ngữ và công nghệ duy nhất được dùng:
  - **TSX** (TypeScript + JSX) cho component
  - **React** cho cấu trúc và state của giao diện
  - **CSS** cho styling (file `.css` hoặc CSS thuần trong dự án)
- Không viết backend, API server, database, script CLI, hay logic nghiệp vụ ngoài phạm vi UI, trừ khi người dùng yêu cầu rõ ràng.
- Không thêm thư viện styling khác (Tailwind, styled-components, Sass, v.v.) nếu người dùng chưa yêu cầu.
- Nếu một yêu cầu cần thứ ngoài UI (ví dụ dữ liệu từ server), chỉ làm phần giao diện và hỏi người dùng trước khi làm phần còn lại.
