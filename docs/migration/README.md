# Kế hoạch migration PrimeReact/Sakai sang Ant Design Pro

## 1. Mục tiêu

`mixi-config-ui` là pilot đầu tiên trong chương trình chuyển đổi giao diện từ
PrimeReact/Sakai sang Ant Design và các pattern của `ant-design-pro`.

Mục tiêu của pilot:

- giữ nguyên route, API, authentication, authorization và nghiệp vụ hiện tại;
- thay thế dần các UI primitive PrimeReact bằng Ant Design;
- xây dựng application shell, theme token và wrapper dùng chung;
- migration theo route/feature, có thể release và rollback độc lập;
- không copy toàn bộ repository `ant-design-pro` vào ứng dụng.

## 2. Phạm vi pilot

### Trong phạm vi

- authenticated shell: topbar, sidebar, menu, account actions;
- `/login`, `/config-center` và các trạng thái loading/error/not-found;
- dashboard header và bộ lọc service/environment;
- danh sách service/config bằng `Table` hoặc `ProTable`;
- form/dialog cho project, service, environment và config;
- runtime history, bulk edit, confirmation và feedback;
- responsive desktop/tablet/mobile;
- test hồi quy, accessibility và production build.

### Ngoài phạm vi

- nâng cấp Next.js hoặc chuyển Pages Router/App Router;
- thay đổi API contract hoặc cơ chế authorization;
- chuyển token từ browser storage sang HttpOnly cookie;
- thay đổi backend, deployment hoặc domain nghiệp vụ;
- migrate các repository khác trước khi pilot đạt tiêu chí nghiệm thu.

## 3. Hiện trạng đã xác nhận

| Hạng mục        | Hiện trạng                                         |
| --------------- | -------------------------------------------------- |
| Framework       | Next.js 14 App Router                              |
| React           | 18.3.1                                             |
| Data            | TanStack React Query 5                             |
| Form            | React Hook Form                                    |
| UI              | PrimeReact 10.9.x, PrimeFlex, PrimeIcons           |
| Shared UI       | `@w-iris/react` 0.1.15, `@w-iris/themes`           |
| Test            | Vitest, Testing Library, Playwright                |
| Quality scripts | lint, typecheck, test, E2E, build, standards check |
| Git             | branch `main`, clean tại thời điểm lập tài liệu    |

Các điểm PrimeReact được phát hiện ở layout, shell, config-center page và các
feature component. `@w-iris/react` cũng khai báo phụ thuộc PrimeReact/PrimeFlex;
do đó chỉ xóa trực tiếp các package khỏi `package.json` sau khi kiểm tra và xử
lý compatibility của package này.

## 4. Thiết kế mục tiêu

```text
src/
├── app/                         # route composition, providers, metadata
├── components/
│   ├── shell/                   # AppShell và menu model
│   └── ui/                      # wrapper Ant Design/Pro Components
├── features/config-center/      # nghiệp vụ và state theo feature
└── shared/                      # API, env, auth contracts, utilities
```

Dependency direction:

```text
route -> feature -> shared/API
route -> components/shell
feature -> components/ui
components/ui -> antd/@ant-design/pro-components
```

Feature không import PrimeReact hoặc Ant Design trực tiếp nếu đã có wrapper
tương ứng. Wrapper chỉ chứa policy UI chung, không chứa nghiệp vụ config-center.

## 5. Lộ trình thực hiện

### Phase 0 — Baseline và backup

- chạy quality gates hiện tại;
- chụp baseline các route trên desktop/mobile;
- tạo backup branch và tag theo [backup-runbook.md](./backup-runbook.md);
- ghi commit hash và dependency versions vào PR migration.

### Phase 1 — Spike tương thích

- cài `antd`, `@ant-design/icons`, `@ant-design/pro-components` với version
  tương thích React 18/Next.js 14;
- kiểm tra SSR/App Router, CSS injection và `ConfigProvider`;
- kiểm tra `@w-iris/react` có thể chạy song song với Ant Design hay không;
- dựng một trang thử nghiệm nhỏ, chưa thay route production;
- đo build, bundle và lỗi hydration.

Exit criteria: có quyết định version và ADR, không có lỗi SSR/hydration, có
phương án giữ hoặc thay thế các component `@w-iris/react` phụ thuộc PrimeReact.

### Phase 2 — Design system adapter

Tạo các wrapper tối thiểu:

```text
src/components/ui/
├── AppButton
├── AppTable
├── AppForm
├── AppDialog
├── AppDrawer
├── AppFeedback
├── AppLoading
├── AppEmpty
└── AppError
```

Tạo theme tại `ConfigProvider`, dùng semantic token thay vì rải màu và spacing
trực tiếp trong feature.

### Phase 3 — Shell và auth layout

- thay shell PrimeReact/Sakai bằng shell theo pattern Ant Design Pro;
- giữ typed menu, active route, permission filtering và account links;
- đảm bảo keyboard navigation, Escape, focus restoration và mobile overlay;
- giữ `AuthGuard`, auth storage và API behavior hiện tại.

### Phase 4 — Config Center vertical slices

Thứ tự đề xuất:

1. dashboard header và service/environment selector;
2. service list;
3. config detail table và inline save;
4. project/service/environment/config dialogs;
5. bulk edit và runtime history;
6. account/profile/settings/security states.

Mỗi slice phải có pending, empty, error, success, disabled, unauthorized và
validation state; đồng thời cập nhật test trước khi chuyển slice tiếp theo.

### Phase 5 — Dọn dẹp và nghiệm thu

- kiểm tra không còn import PrimeReact trong phần đã migrate;
- chỉ gỡ PrimeReact/PrimeFlex/PrimeIcons khi không còn consumer trực tiếp hoặc
  gián tiếp từ `@w-iris/react`;
- cập nhật README và architecture ADR;
- chạy toàn bộ quality gates;
- phát hành pilot qua preview/staging trước production.

## 6. Component mapping sơ bộ

| PrimeReact                            | Ant Design/Pro                  |
| ------------------------------------- | ------------------------------- |
| `Button`                              | `Button`                        |
| `InputText`                           | `Input`                         |
| `InputTextarea`                       | `Input.TextArea`                |
| `Dropdown`                            | `Select`                        |
| `Checkbox`                            | `Checkbox`                      |
| `Dialog`                              | `Modal`                         |
| `OverlayPanel`                        | `Popover` hoặc `Dropdown`       |
| `DataTable` / wrapper `@w-iris/react` | `Table` hoặc `ProTable`         |
| `Skeleton`                            | `Skeleton`                      |
| PrimeIcons                            | `@ant-design/icons`             |
| Toast/feedback                        | `message`/`notification`        |
| Sidebar                               | `Drawer` hoặc `ProLayout` sider |

Mapping không được làm máy móc. Đặc biệt cần giữ server-side contract, filter,
pagination, row action, mutation concurrency và optimistic rollback của bảng.

## 7. Tiêu chí nghiệm thu pilot

- route và URL hiện tại không đổi;
- API request/response và authorization không đổi;
- login, logout và account actions hoạt động;
- CRUD project/service/environment/config hoạt động;
- bulk save và runtime history hoạt động;
- loading/empty/error/success/denied states có test;
- không có lỗi console, hydration hoặc duplicate submission;
- keyboard/focus/label/contrast cơ bản đạt yêu cầu;
- mobile không mất action hoặc dữ liệu quan trọng;
- các lệnh sau đều pass:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run standards:check
```

## 8. Rủi ro và quyết định cần ghi nhận

| Rủi ro                                                  | Cách xử lý                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| React 18 không khớp version mới nhất của Ant Design Pro | chốt version qua spike, không nâng React trong pilot         |
| `@w-iris/react` kéo PrimeReact                          | giữ compatibility layer hoặc lập kế hoạch nâng package riêng |
| CSS PrimeReact và Ant Design cùng tồn tại               | scope provider/style, migration route-by-route               |
| Copy cả `ant-design-pro` tạo coupling lớn               | chỉ dùng pattern, dependency và wrapper cần thiết            |
| auth/menu bị thay đổi khi đổi shell                     | test route/permission và giữ API auth hiện tại               |
| rollback không tương thích asset/cache                  | phát hành artifact immutable, kiểm thử rollback preview      |

Các quyết định có ảnh hưởng lâu dài phải ghi thành ADR trong
`docs/migration/adr/`.
