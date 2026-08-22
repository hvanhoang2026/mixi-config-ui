# Backup và rollback runbook

## Nguyên tắc

Backup được tạo trong chính repository `mixi-config-ui`. Dùng cả branch và tag:

```text
backup/primereact-sakai-before-antd-2026-08-22
backup-primereact-sakai-2026-08-22
```

Branch phục vụ tra cứu/đối chiếu; tag là mốc bất biến cần bảo vệ trên remote.
Không xóa hoặc force-push tag backup.

## Kiểm tra trước khi backup

Chạy tại thư mục repository:

```bash
git status --short --branch
git remote -v
git branch --show-current
git log -1 --oneline
```

Tại thời điểm lập tài liệu, repository đang ở branch `main` và không có thay đổi
local chưa commit.

## Tạo backup

PowerShell:

```powershell
$repo = "C:\Users\HUNGHV2\Documents\GitHub\mixi-config-ui"
$base = "main"
$backupBranch = "backup/primereact-sakai-before-antd-2026-08-22"
$backupTag = "backup-primereact-sakai-2026-08-22"

git -C $repo status --short
git -C $repo switch $base
git -C $repo pull --ff-only origin $base
git -C $repo branch $backupBranch
git -C $repo tag $backupTag
git -C $repo push origin $backupBranch
git -C $repo push origin $backupTag
```

Nếu branch hoặc tag đã tồn tại, dừng và kiểm tra commit trước khi dùng lại; không
dùng `-f` một cách tùy tiện.

Sau khi push, xác nhận:

```bash
git show-ref --verify refs/remotes/origin/backup/primereact-sakai-before-antd-2026-08-22
git show-ref --verify refs/tags/backup-primereact-sakai-2026-08-22
```

Nên cấu hình branch/tag protection trên Git server nếu quyền quản trị cho phép.

## Branch migration

Sau khi backup thành công:

```bash
git switch -c migration/antd-pro/mixi-config-ui
git push -u origin migration/antd-pro/mixi-config-ui
```

Mỗi vertical slice dùng branch ngắn:

```text
migration/antd-pro/config-ui-spike
migration/antd-pro/config-ui-shell
migration/antd-pro/config-ui-service-table
migration/antd-pro/config-ui-forms
```

Merge qua pull request, không merge trực tiếp vào `main`.

## Rollback code

Ưu tiên revert pull request migration. Nếu cần quay toàn bộ pilot về mốc backup:

```bash
git fetch origin --tags
git switch -c rollback/mixi-config-ui-antd origin/main
git diff --stat backup-primereact-sakai-2026-08-22..HEAD
```

Sau khi đã review diff và xác nhận không có commit cần giữ:

```bash
git reset --hard backup-primereact-sakai-2026-08-22
git push --force-with-lease origin rollback/mixi-config-ui-antd
```

Không reset trực tiếp `main`. Tạo pull request từ branch rollback để review.

## Điều kiện abort rollout

Dừng rollout và quay về artifact trước đó khi có một trong các điều kiện:

- login, logout hoặc permission sai;
- mutation tạo/sửa/xóa gây sai dữ liệu;
- lỗi hydration hoặc lỗi JavaScript trên route chính;
- mất dữ liệu/action trên mobile;
- E2E critical journey thất bại;
- bundle hoặc thời gian tải tăng vượt budget đã chốt;
- không thể khôi phục trong thời gian vận hành đã thống nhất.

Rollback UI không thay thế rollback API/schema. Nếu contract đã thay đổi, phải
khôi phục contract tương thích trước khi chuyển traffic về artifact cũ.
