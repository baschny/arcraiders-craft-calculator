// Google Analytics event tracking utility
// Only tracks events in production mode

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
  
  if (import.meta.env.DEV) {
    console.log('[Analytics Event]', eventName, params);
  }
};

// Specific event tracking functions
export const trackItemCrafted = (itemName: string, itemId: string) => {
  trackEvent('item_crafted', {
    item_name: itemName,
    item_id: itemId,
  });
};

export const trackCalculation = (
  itemName: string,
  itemId: string,
  amountToCraft: number
) => {
  trackEvent('calculation_performed', {
    item_name: itemName,
    item_id: itemId,
    amount_to_craft: amountToCraft,
  });
};
