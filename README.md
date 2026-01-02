# Arc Raiders - Craft Calculator

A calculator app for the Arc Raiders game that helps you optimize stash space when crafting items.

## Features

- Calculate if crafting items will increase or decrease stash space usage
- Support for multiple required items per recipe
- Automatic calculation of optimal craft amount to minimize stash space
- Support for incomplete stacks (items already in your stash)
- Real-time results as you enter data

## How to Use

1. **Crafted Item**: Set the stack size and optionally the incomplete stack size if you already have some of this item
2. **Required Items**: For each material needed:
   - Set the stack size
   - Enter amount required per craft
   - Enter amount you currently possess
   - Optionally enter incomplete stack size
3. **Add more items**: Click "Add Required Item" to add more materials to the recipe
4. **View Results**: The calculator shows:
   - Maximum craftable amount
   - Current stash usage
   - Stash usage after crafting all items
   - **Optimal recommendation**: Exact number to craft for minimal stash space

## Stack Sizes

Available stack sizes match the game: 3, 5, 10, 15, 50, 100

## Development

### Setup

\`\`\`bash
npm install
\`\`\`

### Updating Game Data

The calculator uses item data from the `arcraiders-data` repository. To update the item data:

\`\`\`bash
./update-data.sh
\`\`\`

This script copies the latest item JSON files from `../arcraiders-data/items/` to `public/data/items/`.

**Requirements:**
- The `arcraiders-data` repository must be cloned in the parent directory
- Run this script whenever the game data is updated

### Run Dev Server

\`\`\`bash
npm run dev
\`\`\`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## Tech Stack

- React 18
- TypeScript
- Vite
- SCSS

## Future Enhancements

- Pre-loaded game data with item types and recipes
- Item selection dropdowns instead of manual input
- Save/load recipes
- Multiple recipe comparison
