import { ResourceType, MarketPrice, MarketListing, Empire } from '../types';

export class MarketSystem {
  private prices: Map<ResourceType, MarketPrice>;
  private listings: MarketListing[] = [];
  private priceHistory: Map<ResourceType, number[]> = new Map();

  constructor() {
    this.prices = this.initializeMarketPrices();
  }

  private initializeMarketPrices(): Map<ResourceType, MarketPrice> {
    const prices = new Map<ResourceType, MarketPrice>();
    const baseValues: Record<ResourceType, number> = {
      [ResourceType.IRON]: 100,
      [ResourceType.COPPER]: 150,
      [ResourceType.SILVER]: 500,
      [ResourceType.SILICON]: 200,
      [ResourceType.TITANIUM]: 800,
      [ResourceType.GOLD]: 2000,
      [ResourceType.STEEL]: 300,
      [ResourceType.ALLOY]: 600,
      [ResourceType.CIRCUITS]: 1500,
      [ResourceType.FUEL]: 250,
      [ResourceType.ANTIMATERIA]: 10000,
      [ResourceType.FOOD]: 50,
      [ResourceType.OXYGEN]: 75,
      [ResourceType.WATER]: 30,
    };

    for (const [resource, basePrice] of Object.entries(baseValues)) {
      const price: MarketPrice = {
        resource: resource as ResourceType,
        price: basePrice as number,
        trend: 'stable',
        history: [basePrice as number],
      };
      prices.set(resource as ResourceType, price);
      this.priceHistory.set(resource as ResourceType, [basePrice as number]);
    }

    return prices;
  }

  /**
   * Calculate market price based on supply/demand
   */
  public calculatePrice(
    resource: ResourceType,
    supplyLevel: number,
    demandLevel: number,
    historicalPrice: number
  ): number {
    const basePrice = this.prices.get(resource)?.price || 100;
    const demandSupplyRatio = demandLevel / (supplyLevel + 1);
    
    // Price elasticity: if demand >> supply, price explodes
    let newPrice = basePrice * demandSupplyRatio;
    
    // Smooth out extreme fluctuations
    newPrice = (historicalPrice * 0.7) + (newPrice * 0.3);
    
    // Floor at 10% of base price
    newPrice = Math.max(newPrice, basePrice * 0.1);
    
    return Math.round(newPrice);
  }

  /**
   * Update market prices based on game state
   */
  public updateMarketCycle(
    supplyByResource: Map<ResourceType, number>,
    demandByResource: Map<ResourceType, number>
  ): void {
    for (const [resource, marketPrice] of this.prices.entries()) {
      const supply = supplyByResource.get(resource) || 1;
      const demand = demandByResource.get(resource) || 10;

      const newPrice = this.calculatePrice(
        resource,
        supply,
        demand,
        marketPrice.price
      );

      // Update trend
      if (newPrice > marketPrice.price * 1.05) {
        marketPrice.trend = 'rising';
      } else if (newPrice < marketPrice.price * 0.95) {
        marketPrice.trend = 'falling';
      } else {
        marketPrice.trend = 'stable';
      }

      marketPrice.price = newPrice;

      // Keep history for trend analysis
      const history = this.priceHistory.get(resource) || [];
      history.push(newPrice);
      if (history.length > 100) history.shift();
      this.priceHistory.set(resource, history);
      marketPrice.history = history;
    }
  }

  /**
   * Place a market listing
   */
  public listForSale(
    empire: Empire,
    resource: ResourceType,
    quantity: number,
    locationId: string,
    pricePerUnit?: number
  ): MarketListing {
    const marketPrice = this.prices.get(resource) || this.getMarketPrice(resource);
    const finalPrice = pricePerUnit || marketPrice.price;

    const listing: MarketListing = {
      id: `listing_${Date.now()}_${Math.random()}`,
      resourceType: resource,
      locationId,
      sellerEmpireId: empire.id,
      quantity,
      pricePerUnit: finalPrice,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    this.listings.push(listing);
    return listing;
  }

  /**
   * Execute a market trade
   */
  public executeTrade(
    buyerId: string,
    listingId: string,
    quantity: number
  ): { success: boolean; cost: number; error?: string } {
    const listing = this.listings.find(l => l.id === listingId);
    if (!listing) {
      return { success: false, cost: 0, error: 'Listing not found' };
    }

    if (listing.quantity < quantity) {
      return {
        success: false,
        cost: 0,
        error: `Not enough quantity. Available: ${listing.quantity}`,
      };
    }

    const cost = quantity * listing.pricePerUnit;
    listing.quantity -= quantity;

    if (listing.quantity === 0) {
      this.listings = this.listings.filter(l => l.id !== listingId);
    }

    return { success: true, cost };
  }

  /**
   * Get current market price for a resource
   */
  public getMarketPrice(resource: ResourceType): MarketPrice {
    return (
      this.prices.get(resource) || {
        resource,
        price: 100,
        trend: 'stable',
        history: [100],
      }
    );
  }

  /**
   * Get all active listings for a resource
   */
  public getListings(resource: ResourceType): MarketListing[] {
    return this.listings.filter(l => l.resourceType === resource && l.quantity > 0);
  }

  /**
   * Cancel a market listing
   */
  public cancelListing(listingId: string, empireId: string): boolean {
    const index = this.listings.findIndex(
      l => l.id === listingId && l.sellerEmpireId === empireId
    );
    if (index >= 0) {
      this.listings.splice(index, 1);
      return true;
    }
    return false;
  }
}
