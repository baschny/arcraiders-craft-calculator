import { useState } from 'react';
import type { StackSize, RequiredItem, CraftingRecipe } from '../types/crafting';
import { calculateCrafting } from '../utils/calculations';
import { CraftingResults } from './CraftingResults';

const STACK_SIZES: StackSize[] = [3, 5, 10, 15, 50, 100];

export function CraftCalculator() {
  const [craftedStackSize, setCraftedStackSize] = useState<StackSize>(10);
  const [craftedIncomplete, setCraftedIncomplete] = useState(0);
  const [requiredItems, setRequiredItems] = useState<RequiredItem[]>([
    {
      id: crypto.randomUUID(),
      stackSize: 10,
      amountRequired: 1,
      amountPossessed: 0,
      incompleteStackSize: 0,
    },
  ]);

  const addRequiredItem = () => {
    setRequiredItems([
      ...requiredItems,
      {
        id: crypto.randomUUID(),
        stackSize: 10,
        amountRequired: 1,
        amountPossessed: 0,
        incompleteStackSize: 0,
      },
    ]);
  };

  const removeRequiredItem = (id: string) => {
    if (requiredItems.length > 1) {
      setRequiredItems(requiredItems.filter((item) => item.id !== id));
    }
  };

  const updateRequiredItem = (id: string, updates: Partial<RequiredItem>) => {
    setRequiredItems(
      requiredItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const recipe: CraftingRecipe = {
    craftedItem: {
      stackSize: craftedStackSize,
      incompleteStackSize: craftedIncomplete,
    },
    requiredItems,
  };

  const result = calculateCrafting(recipe);
  const canCalculate = requiredItems.some((item) => item.amountPossessed > 0);

  return (
    <div className="calculator">
      <div className="card">
        <h2 className="card-title">Crafted Item</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Stack Size</label>
            <select
              value={craftedStackSize}
              onChange={(e) => setCraftedStackSize(Number(e.target.value) as StackSize)}
            >
              {STACK_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>
              Incomplete Stack Size{' '}
              <span style={{ color: '#888', fontSize: '12px' }}>(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              max={craftedStackSize - 1}
              value={craftedIncomplete}
              onChange={(e) => setCraftedIncomplete(Math.max(0, Number(e.target.value)))}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Required Items</h2>
        {requiredItems.map((item, index) => (
          <div key={item.id} className="required-item">
            <div className="item-header">
              <h4>Item {index + 1}</h4>
              {requiredItems.length > 1 && (
                <button
                  className="remove-btn"
                  onClick={() => removeRequiredItem(item.id)}
                  type="button"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Stack Size</label>
                <select
                  value={item.stackSize}
                  onChange={(e) =>
                    updateRequiredItem(item.id, {
                      stackSize: Number(e.target.value) as StackSize,
                    })
                  }
                >
                  {STACK_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount Required</label>
                <input
                  type="number"
                  min="1"
                  value={item.amountRequired}
                  onChange={(e) =>
                    updateRequiredItem(item.id, {
                      amountRequired: Math.max(1, Number(e.target.value)),
                    })
                  }
                  placeholder="1"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Amount Possessed</label>
                <input
                  type="number"
                  min="0"
                  value={item.amountPossessed}
                  onChange={(e) =>
                    updateRequiredItem(item.id, {
                      amountPossessed: Math.max(0, Number(e.target.value)),
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>
                  Incomplete Stack{' '}
                  <span style={{ color: '#888', fontSize: '12px' }}>(optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={item.stackSize - 1}
                  value={item.incompleteStackSize}
                  onChange={(e) =>
                    updateRequiredItem(item.id, {
                      incompleteStackSize: Math.max(0, Number(e.target.value)),
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}
        <button className="add-item-btn" onClick={addRequiredItem} type="button">
          + Add Required Item
        </button>
      </div>

      {canCalculate && (
        <div className="card">
          <CraftingResults result={result} />
        </div>
      )}
    </div>
  );
}
