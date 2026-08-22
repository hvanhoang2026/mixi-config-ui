# Pilot checklist — mixi-config-ui

## Trước khi code

- [ ] Xác nhận phạm vi route và owner.
- [ ] Backup branch/tag đã push lên remote.
- [ ] Baseline screenshot desktop/mobile đã lưu.
- [ ] Baseline lint/typecheck/test/E2E/build đã ghi lại.
- [ ] Chốt Ant Design version tương thích React 18.
- [ ] Xác định compatibility của `@w-iris/react`.
- [ ] Tạo ADR cho các quyết định breaking hoặc ngoại lệ.

## Spike

- [ ] `ConfigProvider` chạy đúng trong App Router.
- [ ] Không có hydration mismatch.
- [ ] CSS Ant Design không phá auth/shell hiện tại.
- [ ] Có thể chạy route thử nghiệm song song PrimeReact.
- [ ] Bundle/build time được đo và ghi lại.

## Shell

- [ ] Menu model vẫn typed và permission-aware.
- [ ] Active route đúng.
- [ ] Mobile drawer/overlay hoạt động.
- [ ] Escape đóng menu và focus được trả về trigger.
- [ ] Account/profile/settings/security giữ nguyên hành vi.

## Config Center

- [ ] Service/environment selector.
- [ ] Service table.
- [ ] Config detail table.
- [ ] Inline save.
- [ ] Create/edit dialogs.
- [ ] Delete confirmation.
- [ ] Bulk edit.
- [ ] Runtime history.
- [ ] Loading, empty, error, success và denied states.

## Quality gates

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] `npm run standards:check`
- [ ] Keyboard/focus/accessibility review.
- [ ] Desktop/tablet/mobile visual review.
- [ ] Không còn PrimeReact import trong slice đã migrate.
- [ ] Rollback trên preview đã được diễn tập.
