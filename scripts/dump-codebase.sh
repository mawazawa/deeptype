#!/bin/bash

# Create dumps directory if it doesn't exist
DUMP_DIR=".codebase-dumps"
mkdir -p $DUMP_DIR

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="$DUMP_DIR/codebase_dump_$TIMESTAMP.txt"

# Initialize word count
TOTAL_WORDS=0
TARGET_WORDS=20000  # This should give us roughly 25-30k tokens

# Function to check if a file should be included
should_include() {
    local file=$1
    # Skip node_modules, .git, dump files, and other non-essential files
    if [[ $file == *"node_modules"* ]] ||
       [[ $file == *".git"* ]] ||
       [[ $file == *"codebase_dump_"* ]] ||
       [[ $file == *".next"* ]] ||
       [[ $file == *"dist"* ]] ||
       [[ $file == *".DS_Store"* ]] ||
       [[ $file == *".env"* ]] ||
       [[ $file == *"package-lock.json"* ]] ||
       [[ $file == *"pnpm-lock.yaml"* ]] ||
       [[ $file == *".ico" ]] ||
       [[ $file == *".png" ]] ||
       [[ $file == *".jpg" ]] ||
       [[ $file == *".svg" ]]; then
        return 1
    fi
    return 0
}

# Function to get file type emoji
get_file_emoji() {
    local file=$1
    case $file in
        *.ts|*.tsx) echo "🟦" ;; # TypeScript
        *.js|*.jsx) echo "🟨" ;; # JavaScript
        *.css) echo "🎨" ;; # CSS
        *.html) echo "🌐" ;; # HTML
        *.json) echo "📝" ;; # JSON
        *.md) echo "📚" ;; # Markdown
        *.sh) echo "⚡️" ;; # Shell
        *.sql) echo "💾" ;; # SQL
        *.test.*|*.spec.*) echo "🧪" ;; # Test files
        *worker*) echo "⚙️" ;; # Web Workers
        *) echo "📄" ;; # Other
    esac
}

# Function to estimate tokens from words
estimate_tokens() {
    local words=$1
    echo "scale=0; $words * 1.3" | bc
}

# Write header
echo "🗂 DeepType Codebase Dump" > "$DUMP_FILE"
echo "📅 Generated on: $(date)" >> "$DUMP_FILE"
echo "═══════════════════════════════════════════════════" >> "$DUMP_FILE"
echo "" >> "$DUMP_FILE"

# Priority files to always include
PRIORITY_FILES=(
    # Core Services
    "src/services/ai-tutor.service.ts"
    "src/adapters/base.adapter.ts"

    # Types and Config
    "src/types/typing.ts"
    "src/config/ai.config.ts"

    # Components
    "src/components/typing/accessible-keyboard.tsx"

    # Hooks
    "src/hooks/use-keyboard-layout.ts"
    "src/hooks/use-sound.ts"
    "src/hooks/use-haptic-feedback.ts"
    "src/hooks/use-screen-reader.ts"

    # Workers
    "src/lib/typing/error-analysis.worker.ts"
)

# Write priority files first
echo "📌 Core System Files" >> "$DUMP_FILE"
echo "───────────────────────────────────────────────────" >> "$DUMP_FILE"
for file in "${PRIORITY_FILES[@]}"; do
    if [ -f "$file" ]; then
        emoji=$(get_file_emoji "$file")
        echo "" >> "$DUMP_FILE"
        echo "$emoji File: $file" >> "$DUMP_FILE"
        echo "───────────────────────────────────────────────────" >> "$DUMP_FILE"
        echo "\`\`\`${file##*.}" >> "$DUMP_FILE"
        cat "$file" >> "$DUMP_FILE"
        echo "\`\`\`" >> "$DUMP_FILE"
        echo "" >> "$DUMP_FILE"

        # Update word count
        WORDS=$(cat "$file" | wc -w)
        TOTAL_WORDS=$((TOTAL_WORDS + WORDS))
    fi
done

# Write important directories content
echo "📂 Component Files" >> "$DUMP_FILE"
echo "───────────────────────────────────────────────────" >> "$DUMP_FILE"

# Find and sort files by importance (using a scoring system)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.sql" -o -name "*.json" -o -name "*.md" \) | while read -r file; do
    if should_include "$file"; then
        # Skip if it's already included in priority files
        if [[ " ${PRIORITY_FILES[@]} " =~ " ${file#./} " ]]; then
            continue
        fi

        # Score the file based on its content and path
        SCORE=0
        if [[ $file == *"/ai/"* ]]; then SCORE=$((SCORE + 10)); fi
        if [[ $file == *"/accessibility/"* ]]; then SCORE=$((SCORE + 10)); fi
        if [[ $file == *"/components/typing/"* ]]; then SCORE=$((SCORE + 9)); fi
        if [[ $file == *"/components/"* ]]; then SCORE=$((SCORE + 8)); fi
        if [[ $file == *"/hooks/"* ]]; then SCORE=$((SCORE + 7)); fi
        if [[ $file == *"/providers/"* ]]; then SCORE=$((SCORE + 7)); fi
        if [[ $file == *"/types/"* ]]; then SCORE=$((SCORE + 6)); fi
        if [[ $file == *"/config/"* ]]; then SCORE=$((SCORE + 6)); fi
        if [[ $file == *"/lib/"* ]]; then SCORE=$((SCORE + 5)); fi
        if [[ $file == *"worker"* ]]; then SCORE=$((SCORE + 5)); fi
        if [[ $file == *".test."* ]] || [[ $file == *".spec."* ]]; then SCORE=$((SCORE + 4)); fi
        if [[ $file == *"README"* ]] || [[ $file == *".md" ]]; then SCORE=$((SCORE + 3)); fi

        # Boost score for files with important keywords
        if grep -q -i "accessibility\|performance\|optimization\|security\|worker\|async\|concurrent" "$file" 2>/dev/null; then
            SCORE=$((SCORE + 4))
        fi

        # Check file size (prefer medium-sized files)
        SIZE=$(wc -l < "$file")
        if [ $SIZE -gt 500 ]; then SCORE=$((SCORE - 2)); fi
        if [ $SIZE -lt 10 ]; then SCORE=$((SCORE - 1)); fi

        echo "$SCORE $file"
    fi
done | sort -rn | while read -r score_and_file; do
    file=$(echo "$score_and_file" | cut -d' ' -f2-)

    # Check if we've reached our target
    if [ $TOTAL_WORDS -ge $TARGET_WORDS ]; then
        break
    fi

    # Add file content
    emoji=$(get_file_emoji "$file")
    echo "" >> "$DUMP_FILE"
    echo "$emoji File: ${file#./}" >> "$DUMP_FILE"
    echo "───────────────────────────────────────────────────" >> "$DUMP_FILE"
    echo "\`\`\`${file##*.}" >> "$DUMP_FILE"
    cat "$file" >> "$DUMP_FILE"
    echo "\`\`\`" >> "$DUMP_FILE"
    echo "" >> "$DUMP_FILE"

    # Update word count
    WORDS=$(cat "$file" | wc -w)
    TOTAL_WORDS=$((TOTAL_WORDS + WORDS))
done

# Add summary
echo "📊 Dump Statistics" >> "$DUMP_FILE"
echo "───────────────────────────────────────────────────" >> "$DUMP_FILE"
echo "Total words: $TOTAL_WORDS" >> "$DUMP_FILE"
echo "Estimated tokens: $(estimate_tokens $TOTAL_WORDS)" >> "$DUMP_FILE"
echo "Generated on: $(date)" >> "$DUMP_FILE"

# Make the script executable
chmod +x "$DUMP_FILE"

echo "✅ Codebase dump created at: $DUMP_FILE"
echo "📈 Total words: $TOTAL_WORDS (≈$(estimate_tokens $TOTAL_WORDS) tokens)"