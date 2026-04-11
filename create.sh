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

# Create directory if it doesn't exist
mkdir -p "$DIR"

# Create the content.tsx file with a basic template
cat <<EOF > "$FILE"
export const Content = () => {
  return (
    <div id="$UNIQUE_KEY-container" className="p-8 border border-white/10 rounded-3xl shadow-2xl bg-black/40 backdrop-blur-xl text-white">
      <h1 className="text-3xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Widget: $UNIQUE_KEY
      </h1>
      <p className="text-white/60 text-lg leading-relaxed">
        This is a premium, dynamically generated component for the unique key: 
        <span className="ml-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-blue-300 font-mono">
          $UNIQUE_KEY
        </span>
      </p>
      
      <div className="mt-8 grid grid-cols-1 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
          <div className="text-sm uppercase tracking-widest text-white/40 mb-1">Status</div>
          <div className="text-green-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            Active and Ready
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
EOF

echo "✓ Created $FILE"
