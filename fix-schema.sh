#!/bin/bash

# CRITICAL FIX: Remove all forbidden .schema('care_connector') calls
# These break the entire app according to ASS BURN FUCKUP 001

echo "🚨 CRITICAL FIX: Removing all forbidden .schema('care_connector') calls..."
echo "These calls completely break the Care Connector app!"

# Count occurrences before fix
BEFORE_COUNT=$(grep -r "\.schema('care_connector')" src/ | wc -l)
echo "Found $BEFORE_COUNT forbidden schema calls to remove"

# Fix all TypeScript and TSX files
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i.bak "s/\.schema('care_connector')//g" {} \;

# Count occurrences after fix
AFTER_COUNT=$(grep -r "\.schema('care_connector')" src/ | wc -l)
echo "✅ Fixed! Remaining forbidden calls: $AFTER_COUNT"

# Clean up backup files
find src/ -name "*.bak" -delete

echo "🎉 All forbidden schema calls have been removed!"
echo "The schema is already configured at CLIENT level in supabase.ts"
