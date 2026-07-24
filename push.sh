#!/bin/bash
# Auto add + commit + push toàn bộ thay đổi lên GitHub (qua SSH).
# Cách dùng:
#   ./push.sh                 -> commit với thời gian hiện tại
#   ./push.sh "nội dung mô tả" -> commit với message tự chọn
set -e
cd "$(dirname "$0")"

MSG="${1:-"Update $(date '+%Y-%m-%d %H:%M:%S')"}"

if git diff --quiet && git diff --cached --quiet && [ -z "$(git status --porcelain)" ]; then
  echo "Không có thay đổi nào để push."
  exit 0
fi

git add -A
git commit -m "$MSG"
git push origin main
echo "✅ Đã push xong: $MSG"
