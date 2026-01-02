#!/bin/bash

# Update Arc Raiders item data from the arcraiders-data repository
# This script copies the latest item JSON files into the public data directory

SOURCE_DIR="../arcraiders-data/items"
TARGET_DIR="public/data/items"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source directory '$SOURCE_DIR' not found."
  echo "Make sure the arcraiders-data repository is cloned in the parent directory."
  exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Target directory '$TARGET_DIR' not found."
  exit 1
fi

echo "Copying item data from $SOURCE_DIR to $TARGET_DIR..."
/bin/cp -f "$SOURCE_DIR"/*.json "$TARGET_DIR/"

if [ $? -ne 0 ]; then
  echo "✗ Failed to copy item data."
  exit 1
fi

echo "✓ Item data copied successfully!"
echo "Files copied:"
ls -1 "$TARGET_DIR"/*.json | wc -l | xargs echo "  Total:"

echo ""
echo "Generating items-list.json..."

# Generate items-list.json with all item filenames
ITEMS_LIST="public/data/items-list.json"
echo '[' > "$ITEMS_LIST"
ls -1 "$TARGET_DIR"/*.json | xargs -n 1 basename | sed 's/^/  "/;s/$/",/' | sed '$ s/,$//' >> "$ITEMS_LIST"
echo ']' >> "$ITEMS_LIST"

if [ $? -eq 0 ]; then
  echo "✓ items-list.json generated successfully!"
  ITEM_COUNT=$(ls -1 "$TARGET_DIR"/*.json | wc -l | xargs)
  echo "  Total items: $ITEM_COUNT"
else
  echo "✗ Failed to generate items-list.json."
  exit 1
fi
