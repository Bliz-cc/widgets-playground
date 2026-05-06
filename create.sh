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
FILE_CONTENT="$DIR/$UNIQUE_KEY-content.tsx"
FILE_SCHEMA="$DIR/$UNIQUE_KEY-schema.ts"
TEMPLATE_CONTENT="./src/template.tsx"

# Create directory if it doesn't exist
mkdir -p "$DIR"

# Generate PascalCase name for the component
# e.g. redirect-minimal-pkey -> RedirectMinimalPkey
PASCAL_KEY=$(echo "$UNIQUE_KEY" | perl -pe 's/(^|-)(\w)/\U$2/g')

# 1. Create schema.ts
cat <<EOF > "$FILE_SCHEMA"
/**
 * $PASCAL_KEY — Developer Schema
 *
 * Only define what your game needs:
 *   - Theme colors
 *   - Content strings (text labels)
 *   - Preview toggle
 *
 * Platform defaults (widget_id, promos, collection config, etc.)
 * are provided by BASE_SCHEMA and injected by the wrapper at runtime.
 */
export const GAME_CONFIG = {
  // ---- Theme ----
  theme_primary: "#7c3aed",
  theme_secondary: "#4b5563",
  theme_accent: "#f472b6",
  theme_line_height: "1.4",

  // ---- Content ----
  text1: "Play to Win",                   // Heading
  text2: "Try your luck and win prizes!", // Sub-heading
  text3: "Play Now",                      // CTA Button
  text4: "Congratulations!",             // Win Modal Title
  text5: "Tap to play",                  // Instruction
  text7: "Ready to play?",               // Overlay Heading
  text8: "Your phone number",            // Input Label
  text10: "Thanks for submitting!",      // Post-submit
  text11: "We'll send your prize to",    // Success Desc
  text14: "Enter a valid phone number",  // Validation Error

  // ---- Dev Toggles ----
  preview_mode: false,
};
EOF

# 2. Create content.tsx
if [ -f "$TEMPLATE_CONTENT" ]; then
  # Read template and replace placeholders
  # 1. Replace WidgetTemplate with PascalCase key
  # 2. Replace './schema' with './$UNIQUE_KEY-schema'
  sed "s/WidgetTemplate/$PASCAL_KEY/g; s|'./schema'|'./$UNIQUE_KEY-schema'|g" "$TEMPLATE_CONTENT" > "$FILE_CONTENT"
  echo "✓ Created $FILE_CONTENT (cloned from $TEMPLATE_CONTENT)"
  echo "✓ Created $FILE_SCHEMA"
else
  echo "Warning: $TEMPLATE_CONTENT not found. Falling back to basic content.tsx."
  # Fallback content
  cat <<EOF > "$FILE_CONTENT"
import { type FC } from 'react';
import { type DynamicWidgetView } from "@blizcc/ui";

export const $PASCAL_KEY: FC<DynamicWidgetView> = (props) => {
  const { 
    theme_primary, 
    text1, 
    is_rules_accepted, 
    show_rules_popup 
  } = props;

  return (
    <div className="p-8 border-2 rounded-3xl text-white text-center" style={{ borderColor: theme_primary }}>
      <h1 className="text-3xl font-black mb-4 uppercase">{text1 || "$UNIQUE_KEY"}</h1>
      <p className="opacity-60 mb-6">Component generated successfully.</p>
      
      {!is_rules_accepted && (
        <button 
          onClick={show_rules_popup}
          className="px-8 py-3 rounded-full font-bold"
          style={{ backgroundColor: theme_primary }}
        >
          Accept Rules to Play
        </button>
      )}
    </div>
  );
};

export default $PASCAL_KEY;
EOF
  echo "✓ Created $FILE_CONTENT (fallback)"
  echo "✓ Created $FILE_SCHEMA"
fi
