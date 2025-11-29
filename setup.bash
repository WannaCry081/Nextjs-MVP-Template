#!/usr/bin/env bash
set -euo pipefail

# new-project.bash - normalize project name, rename repo, reinit git, remove this script

# Resolve script absolute path and project root
script_abs="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/$(basename "${BASH_SOURCE[0]:-$0}")"
project_root="$(pwd)"
parent_dir="$(dirname "$project_root")"
script_rel="${script_abs#"$project_root"/}"
script_name="$(basename "$script_abs")"

read -r -p "Enter project name: " input_name
if [[ -z "${input_name// /}" ]]; then
  echo "No project name provided. Exiting."
  exit 1
fi

# normalize: lowercase, collapse spaces into hyphens, remove disallowed chars, strip leading/trailing hyphens
proj="$(printf '%s' "$input_name" | tr '[:upper:]' '[:lower:]' | sed -E 's/[[:space:]]+/-/g' | sed -E 's/[^a-z0-9._-]//g' | sed -E 's/^-+|-+$//g')"
if [[ -z "$proj" ]]; then
  echo "Normalized project name is empty. Exiting."
  exit 1
fi

echo "Using project name: $proj"

current_dirname="$(basename "$project_root")"
if [[ "$current_dirname" == "$proj" ]]; then
  new_root="$project_root"
else
  new_root="$parent_dir/$proj"
  if [[ -e "$new_root" ]]; then
    read -r -p "Target directory '$new_root' exists. Remove and continue? [y/N] " yn
    if [[ "$yn" != "y" && "$yn" != "Y" ]]; then
      echo "Aborting."
      exit 1
    fi
    rm -rf "$new_root"
  fi

  mv "$project_root" "$new_root"
fi

cd "$new_root"

# Update package.json "name" property if file exists
if [[ -f package.json ]]; then
  if command -v node >/dev/null 2>&1; then
    node -e "const fs=require('fs');const n=process.argv[1];const p='package.json';const j=JSON.parse(fs.readFileSync(p));j.name=n;fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');" "$proj"
    echo "package.json updated: name = $proj"
  else
    # portable sed fallback (creates .bak on macOS/GNU, remove it)
    sed -E -i.bak "s/\"name\"[[:space:]]*:[[:space:]]*\"[^\"]+\"/\"name\": \"$proj\"/" package.json && rm -f package.json.bak
    echo "package.json updated (sed fallback): name = $proj"
  fi
else
  echo "No package.json found; skipping package.json update."
fi

# Remove existing git metadata if present
if [[ -d .git ]]; then
  rm -rf .git
  echo "Removed existing .git directory."
fi

# Initialize new git repository and commit
git init
git add .
# attempt commit; if there's nothing to commit, ignore error
if git commit -m "initial create"; then
  echo "Initial commit created."
else
  echo "Nothing to commit (or commit failed)."
fi

# Remove this script file from the project
new_script_path="$new_root/$script_rel"
if [[ -f "$new_script_path" ]]; then
  rm -f "$new_script_path"
  echo "Removed installer script: $script_rel"
fi

echo "Completed. Project location: $new_root"