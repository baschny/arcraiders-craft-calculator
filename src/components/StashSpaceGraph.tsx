import type { CraftingDataPoint } from '../types/crafting';

interface StashSpaceGraphProps {
  dataPoints: CraftingDataPoint[];
  currentSlots: number;
  optimalAmount: number;
  minCraftForReduction: number | null;
}

export function StashSpaceGraph({
  dataPoints,
  currentSlots,
  optimalAmount,
  minCraftForReduction,
}: StashSpaceGraphProps) {
  if (dataPoints.length === 0) return null;

  const maxSlots = Math.max(...dataPoints.map((p) => p.slots));
  const minSlots = Math.min(...dataPoints.map((p) => p.slots));
  const slotRange = maxSlots - minSlots || 1;

  const getBarColor = (index: number, slots: number) => {
    // For optimal, use category color (green/blue) not distinct optimal color
    if (index === optimalAmount) {
      if (slots < currentSlots) {
        return '#4caf50'; // Green for optimal that saves space
      } else if (slots > currentSlots) {
        return 'rgba(229, 57, 53, 0.6)'; // Red for optimal that uses more
      } else {
        return 'rgba(79, 195, 247, 0.5)'; // Blue for optimal with same space
      }
    }
    // Min for reduction uses same color logic as optimal but without star
    if (minCraftForReduction && index === minCraftForReduction) {
      if (slots < currentSlots) {
        return '#4caf50'; // Green - same as optimal
      } else if (slots > currentSlots) {
        return 'rgba(229, 57, 53, 0.6)'; // Red - same as optimal
      } else {
        return 'rgba(79, 195, 247, 0.5)'; // Blue - same as optimal
      }
    }
    if (slots < currentSlots) {
      return 'rgba(76, 175, 80, 0.4)'; // Faded green for savings
    }
    if (slots > currentSlots) {
      return 'rgba(229, 57, 53, 0.4)'; // Faded red for more space
    }
    return 'rgba(79, 195, 247, 0.3)'; // Neutral
  };

  const maxHeight = 100;
  const minBarHeight = 20;

  return (
    <div className="stash-graph">
      <div className="graph-title">Stash Space by Craft Amount</div>
      <div className="graph-container">
        <div className="graph-bars">
          {dataPoints.map((point, index) => {
            const barHeight = ((point.slots - minSlots) / slotRange) * maxHeight + minBarHeight;
            const isOptimal = index === optimalAmount;

            const barColor = getBarColor(index, point.slots);
            const showOptimalBorder = isOptimal && point.slots < currentSlots;

            return (
              <div key={index} className="graph-bar-wrapper">
                <div
                  className={`graph-bar ${showOptimalBorder ? 'optimal' : ''}`}
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: barColor,
                  }}
                  title={`Craft ${point.amount}: ${point.slots} slots (${point.slots - currentSlots >= 0 ? '+' : ''}${point.slots - currentSlots})`}
                >
                  {isOptimal && <div className="bar-label optimal-label">★</div>}
                </div>
                <div className="graph-x-label">
                  {(index === 0 ||
                    isOptimal ||
                    point.slots !== dataPoints[index - 1]?.slots) &&
                    point.amount}
                </div>
              </div>
            );
          })}
        </div>
        <div className="graph-y-axis">
          <div className="y-label">{maxSlots} slots</div>
          <div className="y-label" style={{ position: 'absolute', bottom: '0' }}>
            {minSlots} slots
          </div>
        </div>
      </div>
      <div className="graph-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#4caf50' }} />
          <span>★ Optimal</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: 'rgba(76, 175, 80, 0.4)' }} />
          <span>Saves Space</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: 'rgba(229, 57, 53, 0.4)' }} />
          <span>Uses More</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: 'rgba(79, 195, 247, 0.3)' }} />
          <span>Same Space</span>
        </div>
      </div>
    </div>
  );
}
