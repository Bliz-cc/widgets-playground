#!/bin/bash

# Prompt user for the component unique key
read -p "Enter component unique key: " RAW_INPUT

# Sanitize input:
# 1. Convert to lowercase
# 2. Replace spaces and underscores with hyphens
# 3. Remove any characters that aren't letters, numbers, or hyphens
# 4. Remove leading/trailing hyphens
UNIQUE_KEY=$(echo "$RAW_INPUT" | tr '[:upper:]' '[:lower:]' | tr ' _' '-' | sed 's/[^a-z0-9-]//g' | sed 's/^-//;s/-$//')

# Check if the name is valid after sanitization
if [ -z "$UNIQUE_KEY" ]; then
  echo "Error: Unique key is invalid. Please use alphanumeric characters and hyphens."
  exit 1
fi

if [ "$RAW_INPUT" != "$UNIQUE_KEY" ]; then
  echo "Notice: Sanitized '$RAW_INPUT' to '$UNIQUE_KEY'"
fi

# Define path
DIR="./src/widgets/$UNIQUE_KEY"
FILE="$DIR/content.tsx"
TEMPLATE="./src/template.tsx"

# Create directory if it doesn't exist
mkdir -p "$DIR"

# Generate PascalCase name for the component
# e.g. redirect-minimal-pkey -> RedirectMinimalPkey
PASCAL_KEY=$(echo "$UNIQUE_KEY" | perl -pe 's/(^|-)(\w)/\U$2/g')

if [ -f "$TEMPLATE" ]; then
  # Read template and replace placeholders
  # 1. Replace WidgetTemplate with PascalCase key
  # 2. Replace widget_id: 'template_v1' with the actual key
  sed "s/WidgetTemplate/$PASCAL_KEY/g; s/widget_id: 'template_v1'/widget_id: '$UNIQUE_KEY'/g" "$TEMPLATE" > "$FILE"
  echo "✓ Created $FILE (cloned from $TEMPLATE)"
else
  echo "Warning: $TEMPLATE not found. Falling back to basic template."
  # Fallback template
  cat <<EOF > "$FILE"
import { type FC } from 'react';

export const $PASCAL_KEY: FC = () => {
  return (
    <div id="$UNIQUE_KEY-container" className="p-8 border border-white/10 rounded-3xl bg-black/40 backdrop-blur-xl text-white">
      <h1 className="text-3xl font-extrabold mb-4 uppercase tracking-tighter">$UNIQUE_KEY</h1>
      <p className="text-white/60">Component generated successfully.</p>
    </div>
  );
};

export default $PASCAL_KEY;
EOF
  echo "✓ Created $FILE (fallback)"
fi
