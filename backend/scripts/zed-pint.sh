
#!/usr/bin/env bash
set -euo pipefail

# Backend root, regardless of the current working directory
BACKEND_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

# Local Laravel Pint
PINT="$BACKEND_DIR/vendor/bin/pint"

if [[ ! -f "$PINT" ]]; then
    echo "Laravel Pint не найден: $PINT" >&2
    exit 1
fi

# Temporary PHP file
TEMP_FILE="$(mktemp "$BACKEND_DIR/zed-pint-XXXXXXXX.php")"

# Remove the temporary file on any exit
trap 'rm -f -- "$TEMP_FILE"' EXIT

# Get the code from Zed
cat > "$TEMP_FILE"

# Format using the Laravel project settings
(
    cd "$BACKEND_DIR"
    php "$PINT" --quiet "$TEMP_FILE" >&2
)

# Return the formatted code to Zed
cat "$TEMP_FILE"

