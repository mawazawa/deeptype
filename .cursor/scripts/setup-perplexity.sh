#!/bin/bash

# Setup script for Perplexity integration in Cursor

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Perplexity integration for Cursor...${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Install required dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --save openai@latest

# Create necessary directories
mkdir -p .cursor/extensions
mkdir -p .cursor/config

# Check if PERPLEXITY_API_KEY is set
if [ -z "$PERPLEXITY_API_KEY" ]; then
    echo -e "${YELLOW}Please enter your Perplexity API key:${NC}"
    read -s PERPLEXITY_API_KEY
    echo "export PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY" >> ~/.bashrc
    source ~/.bashrc
fi

# Update VS Code settings
echo -e "${YELLOW}Updating VS Code settings...${NC}"
VSCODE_SETTINGS=".vscode/settings.json"
if [ -f "$VSCODE_SETTINGS" ]; then
    # Add Perplexity-specific settings
    tmp=$(mktemp)
    jq '. + {
        "cursor.experimental.contextWindow": true,
        "cursor.experimental.semanticSearch": true,
        "cursor.experimental.enhancedTypeInference": true,
        "cursor.experimental.codeAnalysis": true,
        "cursor.experimental.autoImport": true,
        "cursor.composer.enhancedContext": true
    }' "$VSCODE_SETTINGS" > "$tmp" && mv "$tmp" "$VSCODE_SETTINGS"
else
    echo -e "${RED}Warning: .vscode/settings.json not found. Please run this script from your project root.${NC}"
fi

# Create symbolic links
ln -sf ../.cursor/extensions/perplexity-search.ts node_modules/@cursor/perplexity-search

echo -e "${GREEN}Perplexity integration setup complete!${NC}"
echo -e "${YELLOW}Please restart Cursor for the changes to take effect.${NC}"

# Instructions for usage
echo -e "\n${GREEN}Usage Instructions:${NC}"
echo -e "1. Use ${YELLOW}Cmd/Ctrl + K${NC} to open the enhanced context window"
echo -e "2. Use ${YELLOW}Cmd/Ctrl + Shift + P${NC} and type 'Perplexity' to access Perplexity-specific commands"
echo -e "3. The composer will now use Perplexity for enhanced context and search results"