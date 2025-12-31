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

  // Find all local minima (sweet spots)
  const sweetSpots: number[] = [];
  for (let i = 1; i < dataPoints.length - 1; i++) {
    if (
      dataPoints[i].slots < dataPoints[i - 1].slots &&
      dataPoints[i].slots < dataPoints[i + 1].slots
    ) {
      sweetSpots.push(i);
    }
  }
  // Include optimal if not already included
  if (!sweetSpots.includes(optimalAmount)) {
    sweetSpots.push(optimalAmount);
  }

  const getBarColor = (index: number, slots: number) => {
    if (index === optimalAmount) {
      return '#4caf50'; // Green for optimal
    }
    if (sweetSpots.includes(index)) {
      return '#66bb6a'; // Light green for sweet spots
    }
    if (minCraftForReduction && index === minCraftForReduction) {
      return '#ffa726'; // Orange for minimum threshold
    }
    if (slots < currentSlots) {
      return 'rgba(76, 175, 80, 0.4)'; // Faded green for savings
    }
    if (slots > currentSlots) {
      return 'rgba(229, 57, 53, 0.4)'; // Faded red for more space
    }
    return 'rgba(79, 195, 247, 0.3)'; // Neutral
  };

  const maxHeight = 120;

  return (
    <div className="stash-graph">
      <div className="graph-title">Stash Space by Craft Amount</div>
      <div className="graph-container">
        <div className="graph-bars">
          {dataPoints.map((point, index) => {
            const barHeight = ((point.slots - minSlots) / slotRange) * maxHeight + 20;
            const isSweetSpot = sweetSpots.includes(index);
            const isOptimal = index === optimalAmount;

            return (
              <div key={index} className="graph-bar-wrapper">
                <div
                  className={`graph-bar ${isSweetSpot ? 'sweet-spot' : ''} ${isOptimal ? 'optimal' : ''}`}
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: getBarColor(index, point.slots),
                  }}
                  title={`Craft ${point.amount}: ${point.slots} slots (${point.slots - currentSlots >= 0 ? '+' : ''}${point.slots - currentSlots})`}
                >
                  {isOptimal && <div className="bar-label optimal-label">★</div>}
                  {isSweetSpot && !isOptimal && <div className="bar-label">●</div>}
                </div>
                <div className="graph-x-label">
                  {(index === 0 ||
                    index === dataPoints.length - 1 ||
                    isSweetSpot ||
                    index === minCraftForReduction) &&
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
          <div className="legend-color" style={{ background: '#66bb6a' }} />
          <span>● Sweet Spot</span>
        </div>
        {minCraftForReduction && (
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#ffa726' }} />
            <span>Min for Reduction</span>
          </div>
        )}
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
