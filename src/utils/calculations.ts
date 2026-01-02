import type {
  CraftingRecipe,
  StashCalculation,
  CraftingResult,
  RequiredItem,
} from '../types/crafting';

/**
 * Calculate how many slots an item takes in stash
 */
function calculateSlots(amount: number, stackSize: number): number {
  if (amount === 0) return 0;
  return Math.ceil(amount / stackSize);
}

/**
 * Calculate stash space for all items
 */
function calculateStashSpace(
  craftedStackSize: number,
  craftedIncomplete: number,
  requiredItems: RequiredItem[],
  craftCount: number
): StashCalculation {
  const items: StashCalculation['items'] = [];

  // Calculate crafted item space
  const totalCrafted = craftedIncomplete + craftCount;
  if (totalCrafted > 0) {
    const fullStacks = Math.floor(totalCrafted / craftedStackSize);
    const remainder = totalCrafted % craftedStackSize;
    const slots = calculateSlots(totalCrafted, craftedStackSize);
    items.push({
      stackSize: craftedStackSize,
      amount: totalCrafted,
      fullStacks,
      remainder,
      slots,
    });
  }

  // Calculate required items space (after crafting)
  requiredItems.forEach((item) => {
    const used = craftCount * item.amountRequired;
    const remaining = item.amountPossessed - used;

    if (remaining > 0) {
      const fullStacks = Math.floor(remaining / item.stackSize);
      const remainder = remaining % item.stackSize;
      const slots = calculateSlots(remaining, item.stackSize);
      items.push({
        stackSize: item.stackSize,
        amount: remaining,
        fullStacks,
        remainder,
        slots,
      });
    }
  });

  const totalSlots = items.reduce((sum, item) => sum + item.slots, 0);

  return { totalSlots, items };
}

/**
 * Calculate maximum craftable amount
 */
function calculateMaxCraftable(requiredItems: RequiredItem[]): number {
  if (requiredItems.length === 0) return 0;

  const maxPerItem = requiredItems.map((item) =>
    Math.floor(item.amountPossessed / item.amountRequired)
  );

  return Math.min(...maxPerItem);
}

/**
 * Find optimal crafting amount to minimize stash space
 */
function findOptimalCraftAmount(
  recipe: CraftingRecipe,
  maxCraftable: number,
  currentSlots: number
): { amount: number; slots: number } {
  let minSlots = Infinity;
  let optimalAmount = 0;

  // Try all possible craft amounts from 0 to max
  for (let craftAmount = 0; craftAmount <= maxCraftable; craftAmount++) {
    const stash = calculateStashSpace(
      recipe.craftedItem.stackSize,
      recipe.craftedItem.incompleteStackSize,
      recipe.requiredItems,
      craftAmount
    );

    if (stash.totalSlots < minSlots) {
      minSlots = stash.totalSlots;
      optimalAmount = craftAmount;
    }
  }

  // If the minimum slots found is still more than current (all crafting increases slots),
  // find the maximum craft amount that keeps slots equal to current
  if (minSlots > currentSlots) {
    let maxSameSlots = 0;
    for (let craftAmount = 1; craftAmount <= maxCraftable; craftAmount++) {
      const stash = calculateStashSpace(
        recipe.craftedItem.stackSize,
        recipe.craftedItem.incompleteStackSize,
        recipe.requiredItems,
        craftAmount
      );
      
      if (stash.totalSlots === currentSlots) {
        maxSameSlots = craftAmount;
      }
    }
    
    // If we found amounts that keep slots equal, use the maximum one
    if (maxSameSlots > 0) {
      optimalAmount = maxSameSlots;
      minSlots = currentSlots;
    }
  }
  // If optimal is 0 (don't craft) but there's an incomplete stack,
  // recommend filling the incomplete stack instead (unless current is already optimal)
  else if (optimalAmount === 0 && recipe.craftedItem.incompleteStackSize > 0) {
    const incomplete = recipe.craftedItem.incompleteStackSize;
    const toFillStack = recipe.craftedItem.stackSize - incomplete;
    
    // Only recommend filling if we can craft enough and it doesn't increase slots
    if (toFillStack <= maxCraftable) {
      const stashAfterFilling = calculateStashSpace(
        recipe.craftedItem.stackSize,
        recipe.craftedItem.incompleteStackSize,
        recipe.requiredItems,
        toFillStack
      );
      
      // Only recommend filling if it maintains or reduces slot count
      if (stashAfterFilling.totalSlots <= currentSlots) {
        optimalAmount = toFillStack;
        minSlots = stashAfterFilling.totalSlots;
      }
    }
  }

  return { amount: optimalAmount, slots: minSlots };
}

/**
 * Find minimum craft amount that reduces stash space
 */
function findMinCraftForReduction(
  recipe: CraftingRecipe,
  maxCraftable: number,
  currentSlots: number
): { amount: number; slots: number } | null {
  // Try craft amounts from 1 to max
  for (let craftAmount = 1; craftAmount <= maxCraftable; craftAmount++) {
    const stash = calculateStashSpace(
      recipe.craftedItem.stackSize,
      recipe.craftedItem.incompleteStackSize,
      recipe.requiredItems,
      craftAmount
    );

    if (stash.totalSlots < currentSlots) {
      return { amount: craftAmount, slots: stash.totalSlots };
    }
  }

  return null;
}

/**
 * Calculate complete crafting result
 */
export function calculateCrafting(recipe: CraftingRecipe): CraftingResult {
  const maxCraftable = calculateMaxCraftable(recipe.requiredItems);

  // Current stash (without crafting)
  const currentStash = calculateStashSpace(
    recipe.craftedItem.stackSize,
    recipe.craftedItem.incompleteStackSize,
    recipe.requiredItems,
    0
  );

  // Stash after crafting max
  const afterMaxCraftStash = calculateStashSpace(
    recipe.craftedItem.stackSize,
    recipe.craftedItem.incompleteStackSize,
    recipe.requiredItems,
    maxCraftable
  );

  // Find optimal craft amount
  const optimal = findOptimalCraftAmount(recipe, maxCraftable, currentStash.totalSlots);

  const optimalStash = calculateStashSpace(
    recipe.craftedItem.stackSize,
    recipe.craftedItem.incompleteStackSize,
    recipe.requiredItems,
    optimal.amount
  );

  // Find minimum craft amount for reduction
  const minCraft = findMinCraftForReduction(recipe, maxCraftable, currentStash.totalSlots);

  // Calculate all data points for graphing
  const allDataPoints = [];
  for (let i = 0; i <= maxCraftable; i++) {
    const stash = calculateStashSpace(
      recipe.craftedItem.stackSize,
      recipe.craftedItem.incompleteStackSize,
      recipe.requiredItems,
      i
    );
    allDataPoints.push({ amount: i, slots: stash.totalSlots });
  }

  return {
    maxCraftable,
    currentStash,
    afterMaxCraftStash,
    optimalCraftAmount: optimal.amount,
    optimalStash,
    spaceChange: afterMaxCraftStash.totalSlots - currentStash.totalSlots,
    optimalSpaceChange: optimalStash.totalSlots - currentStash.totalSlots,
    minCraftForReduction: minCraft?.amount ?? null,
    minCraftStash: minCraft ? calculateStashSpace(
      recipe.craftedItem.stackSize,
      recipe.craftedItem.incompleteStackSize,
      recipe.requiredItems,
      minCraft.amount
    ) : null,
    allDataPoints,
  };
}
