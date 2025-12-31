import type { CraftingResult } from '../types/crafting';

interface CraftingResultsProps {
  result: CraftingResult;
}

export function CraftingResults({ result }: CraftingResultsProps) {
  const getSpaceChangeClass = (change: number) => {
    if (change < 0) return 'positive';
    if (change > 0) return 'negative';
    return 'neutral';
  };

  const formatSpaceChange = (change: number) => {
    if (change === 0) return 'No change';
    if (change < 0) return `${Math.abs(change)} less`;
    return `${change} more`;
  };

  return (
    <div className="results">
      <div className="result-section">
        <h3>Crafting Analysis</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Max Craftable</div>
            <div className="stat-value neutral">{result.maxCraftable}</div>
            <div className="stat-detail">items you can craft</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Current Stash Usage</div>
            <div className="stat-value neutral">{result.currentStash.totalSlots}</div>
            <div className="stat-detail">slots used</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">After Max Craft</div>
            <div className="stat-value neutral">{result.afterMaxCraftStash.totalSlots}</div>
            <div className="stat-detail">
              {formatSpaceChange(result.spaceChange)} slots
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Space Impact (Max)</div>
            <div className={`stat-value ${getSpaceChangeClass(result.spaceChange)}`}>
              {result.spaceChange > 0 ? '+' : ''}
              {result.spaceChange}
            </div>
            <div className="stat-detail">slot change</div>
          </div>
        </div>
      </div>

      <div className="result-section">
        <div className="recommendation">
          <h3>💡 Optimal Recommendation</h3>
          <div className="recommendation-text">
            {result.optimalCraftAmount === 0 ? (
              <>
                <strong>Don't craft anything.</strong> Your current stash is already optimally
                organized. Crafting would increase stash usage.
              </>
            ) : result.optimalCraftAmount === result.maxCraftable ? (
              <>
                <strong>Craft all {result.maxCraftable} items.</strong> This will{' '}
                {result.optimalSpaceChange < 0 ? (
                  <>
                    <span style={{ color: '#4caf50' }}>
                      save {Math.abs(result.optimalSpaceChange)} slot
                      {Math.abs(result.optimalSpaceChange) !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : result.optimalSpaceChange > 0 ? (
                  <>
                    <span style={{ color: '#ff9800' }}>
                      use {result.optimalSpaceChange} more slot
                      {result.optimalSpaceChange !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  'not change your stash usage'
                )}
                .
              </>
            ) : (
              <>
                <strong>Craft exactly {result.optimalCraftAmount} items.</strong> This will
                minimize stash usage to {result.optimalStash.totalSlots} slots (
                {result.optimalSpaceChange < 0 ? (
                  <>
                    <span style={{ color: '#4caf50' }}>
                      saving {Math.abs(result.optimalSpaceChange)} slot
                      {Math.abs(result.optimalSpaceChange) !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : result.optimalSpaceChange > 0 ? (
                  <>
                    <span style={{ color: '#ff9800' }}>
                      using {result.optimalSpaceChange} more slot
                      {result.optimalSpaceChange !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  'no change'
                )}
                ).
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
