# Mixi Config UI

Giao diện quản trị cấu hình theo project, service và environment, xây dựng bằng
Next.js App Router, React Query, PrimeReact và `@w-iris/react`.

## Chạy local

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Các biến `NEXT_PUBLIC_*` được gửi xuống trình duyệt, vì vậy không đặt token hoặc
secret vào những biến này.

## Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run standards:check
```

E2E chạy trên Chromium desktop và mobile. Cài browser lần đầu bằng
`npx playwright install chromium`.

## Lưu ý xác thực

Ứng dụng hiện giao tiếp trực tiếp với auth API bằng bearer token do kiến trúc API
hiện tại yêu cầu. Phương án ưu tiên dài hạn là chuyển session sang cookie
`HttpOnly`, `Secure`, `SameSite` thông qua backend/BFF để token không còn nằm
trong browser storage.
