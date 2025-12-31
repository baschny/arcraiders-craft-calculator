import { useState, useEffect } from 'react';
import type { StackSize, RequiredItem, CraftingRecipe } from '../types/crafting';
import type { Item } from '../types/item';
import { calculateCrafting } from '../utils/calculations';
import { CraftingResults } from './CraftingResults';
import { ItemSearch } from './ItemSearch';
import { loadItems, getItem } from '../utils/itemData';

const STACK_SIZES: StackSize[] = [3, 5, 10, 15, 50, 100];

interface RequiredItemWithName extends RequiredItem {
  name?: string;
  imageUrl?: string;
}

export function CraftCalculator() {
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [craftedStackSize, setCraftedStackSize] = useState<StackSize>(10);
  const [craftedIncomplete, setCraftedIncomplete] = useState(0);
  const [requiredItems, setRequiredItems] = useState<RequiredItemWithName[]>([]);
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    loadItems()
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('Failed to load items:', err);
        setManualMode(true);
        setRequiredItems([{
          id: crypto.randomUUID(),
          stackSize: 10,
          amountRequired: 1,
          amountPossessed: 0,
          incompleteStackSize: 0,
        }]);
        setLoading(false);
      });
  }, []);

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    setCraftedStackSize((item.stackSize as StackSize) || 10);
    setCraftedIncomplete(0);

    if (item.recipe) {
      const materials = Object.entries(item.recipe).map(([materialId, amount]) => {
        const materialItem = getItem(materialId);
        return {
          id: materialId,
          stackSize: (materialItem?.stackSize as StackSize) || 10,
          amountRequired: amount,
          amountPossessed: 0,
          incompleteStackSize: 0,
          name: materialItem?.name.en || materialId,
          imageUrl: materialItem?.imageFilename,
        };
      });
      setRequiredItems(materials);
    }
  };

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

  if (loading) {
    return (
      <div className="calculator">
        <div className="card">
          <p style={{ textAlign: 'center', color: '#888' }}>Loading item data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="calculator">
      {!manualMode && (
        <div className="card">
          <h2 className="card-title">Select Item to Craft</h2>
          <div className="form-group">
            <label>Search for craftable item</label>
            <ItemSearch
              onSelect={handleItemSelect}
              placeholder="Type item name..."
              filter={(item) => !!item.recipe && Object.keys(item.recipe).length > 0}
            />
          </div>
          {!selectedItem && (
            <p style={{ color: '#888', fontSize: '14px', marginTop: '12px' }}>
              Or{' '}
              <button
                onClick={() => setManualMode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4fc3f7',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit',
                }}
              >
                enter recipe manually
              </button>
            </p>
          )}
        </div>
      )}

      {selectedItem && (
        <div className="card">
          <h2 className="card-title">Crafted Item</h2>
          <div className="selected-item-display">
            {selectedItem.imageFilename && (
              <img
                src={selectedItem.imageFilename}
                alt={selectedItem.name.en}
                className="selected-item-image"
              />
            )}
            <div>
              <h3>{selectedItem.name.en}</h3>
              <p style={{ color: '#888', fontSize: '14px' }}>
                Stack Size: {selectedItem.stackSize}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedItem(null);
                setRequiredItems([]);
              }}
              className="remove-btn"
              style={{ marginLeft: 'auto' }}
            >
              Change Item
            </button>
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
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
      )}

      {manualMode && !selectedItem && (
        <div className="card">
          <h2 className="card-title">Crafted Item (Manual Mode)</h2>
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
      )}

      {(selectedItem || (manualMode && requiredItems.length > 0)) && (
        <div className="card">
          <h2 className="card-title">Required Items</h2>
          {requiredItems.map((item, index) => (
            <div key={item.id} className={`required-item ${manualMode ? 'manual-mode' : ''}`}>
              <div className="item-header">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name || `Item ${index + 1}`}
                    style={{
                      width: '24px',
                      height: '24px',
                      objectFit: 'contain',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '4px',
                      padding: '2px',
                    }}
                  />
                )}
                <h4>{item.name || `Item ${index + 1}`}</h4>
              </div>
              {selectedItem && (
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Req: {item.amountRequired} | Stack: {item.stackSize}
                </div>
              )}
              {!selectedItem && (
                <>
                  <input
                    type="number"
                    min="1"
                    value={item.amountRequired}
                    onChange={(e) =>
                      updateRequiredItem(item.id, {
                        amountRequired: Math.max(1, Number(e.target.value)),
                      })
                    }
                    placeholder="Required"
                    style={{ width: '90px' }}
                  />
                  <select
                    value={item.stackSize}
                    onChange={(e) =>
                      updateRequiredItem(item.id, {
                        stackSize: Number(e.target.value) as StackSize,
                      })
                    }
                    style={{ width: '80px' }}
                  >
                    {STACK_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <input
                type="number"
                min="0"
                value={item.amountPossessed}
                onChange={(e) =>
                  updateRequiredItem(item.id, {
                    amountPossessed: Math.max(0, Number(e.target.value)),
                  })
                }
                placeholder="Possessed"
                style={{ width: '100px' }}
              />
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
                placeholder="Incomplete"
                style={{ width: '100px' }}
              />
              {manualMode && requiredItems.length > 1 && (
                <button
                  className="remove-btn"
                  onClick={() => removeRequiredItem(item.id)}
                  type="button"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {manualMode && (
            <button className="add-item-btn" onClick={addRequiredItem} type="button">
              + Add Required Item
            </button>
          )}
        </div>
      )}
      </div>

      {canCalculate && (
        <div className="results-sidebar">
          <div className="card">
            <CraftingResults result={result} />
          </div>
        </div>
      )}
    </>
  );
}
