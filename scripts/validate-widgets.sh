#!/bin/bash

# Configuration
WIDGETS_DIR="./src/widgets"
FAILED=0

echo "🔍 Validating widget naming patterns..."

# Check if directory exists
if [ ! -d "$WIDGETS_DIR" ]; then
  echo "❌ Error: Widgets directory not found at $WIDGETS_DIR"
  exit 1
fi

# Iterate through each subdirectory in src/widgets
for dir in "$WIDGETS_DIR"/*/; do
  # Get the folder name (remove trailing slash and path)
  WIDGET_NAME=$(basename "$dir")
  
  # Skip if not a directory
  [ -d "$dir" ] || continue

  echo "  Checking widget: $WIDGET_NAME"

  # Rule 1: Must contain {widget-name}-content.tsx
  if [ ! -f "$dir/$WIDGET_NAME-content.tsx" ]; then
    echo "    ❌ Missing required file: $WIDGET_NAME-content.tsx"
    FAILED=1
  fi

  # Rule 2: Must contain {widget-name}-schema.ts
  if [ ! -f "$dir/$WIDGET_NAME-schema.ts" ]; then
    echo "    ❌ Missing required file: $WIDGET_NAME-schema.ts"
    FAILED=1
  fi

  # Rule 3: Must NOT contain generic names
  if [ -f "$dir/content.tsx" ]; then
    echo "    ❌ Generic file found: content.tsx (should be renamed to $WIDGET_NAME-content.tsx)"
    FAILED=1
  fi
  if [ -f "$dir/schema.ts" ]; then
    echo "    ❌ Generic file found: schema.ts (should be renamed to $WIDGET_NAME-schema.ts)"
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  echo ""
  echo "❌ Validation failed! Please fix the naming patterns above."
  echo "💡 Tip: Every widget file should be prefixed with its folder name."
  exit 1
else
  echo ""
  echo "✅ All widgets follow the naming convention!"
  exit 0
fi
