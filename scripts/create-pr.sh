#!/usr/bin/env bash

set -euo pipefail

base_branch="staging"
remote="origin"
branch="$(git branch --show-current)"
title="$(git log -1 --pretty=%s)"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required to create a pull request." >&2
  exit 1
fi

if [[ -z "$branch" ]]; then
  echo "Cannot create a pull request from a detached HEAD." >&2
  exit 1
fi

if [[ "$branch" == "$base_branch" ]]; then
  echo "Create the pull request from a branch other than $base_branch." >&2
  exit 1
fi

git push --set-upstream "$remote" "$branch"
gh pr create --base "$base_branch" --head "$branch" --title "$title" --fill
