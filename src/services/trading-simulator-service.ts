export type TradeSide = "long" | "short";
export type AssetCategory = "crypto" | "us_stock" | "india_stock" | "forex" | "commodity";

export interface TradableAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change: number;
  changePercent: number;
  currency: "USD" | "INR";
  maxLeverage: number;
  icon?: string;
}

export interface TradePosition {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  side: TradeSide;
  leverage: number;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  margin: number;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  liquidationPrice: number;
  openedAt: string;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  side: TradeSide;
  leverage: number;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  realizedPnl: number;
  realizedPnlPercent: number;
  closeReason: "manual" | "take_profit" | "stop_loss" | "liquidation";
  openedAt: string;
  closedAt: string;
}

export interface DemoAccount {
  balance: number; // Cash balance
  equity: number; // Balance + total unrealized PnL
  marginUsed: number; // Sum of margins in open positions
  freeMargin: number; // Equity - marginUsed
  currency: "USD";
  initialBalance: number;
}

export const INITIAL_DEMO_BALANCE = 100000; // $100,000 USD virtual capital

export const DEFAULT_TRADABLE_ASSETS: TradableAsset[] = [
  // Crypto (Exness / Binance CFD style)
  {
    symbol: "BTC-USD",
    name: "Bitcoin",
    category: "crypto",
    price: 68450.0,
    change: 1420.0,
    changePercent: 2.12,
    currency: "USD",
    maxLeverage: 20,
  },
  {
    symbol: "ETH-USD",
    name: "Ethereum",
    category: "crypto",
    price: 3620.0,
    change: 85.5,
    changePercent: 2.42,
    currency: "USD",
    maxLeverage: 20,
  },
  {
    symbol: "SOL-USD",
    name: "Solana",
    category: "crypto",
    price: 154.2,
    change: -2.3,
    changePercent: -1.47,
    currency: "USD",
    maxLeverage: 10,
  },
  {
    symbol: "XRP-USD",
    name: "Ripple",
    category: "crypto",
    price: 0.58,
    change: 0.02,
    changePercent: 3.57,
    currency: "USD",
    maxLeverage: 10,
  },

  // US Equities
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    category: "us_stock",
    price: 125.4,
    change: 3.85,
    changePercent: 3.17,
    currency: "USD",
    maxLeverage: 5,
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "us_stock",
    price: 228.15,
    change: -1.25,
    changePercent: -0.54,
    currency: "USD",
    maxLeverage: 5,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    category: "us_stock",
    price: 218.8,
    change: 6.4,
    changePercent: 3.01,
    currency: "USD",
    maxLeverage: 5,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    category: "us_stock",
    price: 442.8,
    change: 5.1,
    changePercent: 1.16,
    currency: "USD",
    maxLeverage: 5,
  },

  // Indian Equities
  {
    symbol: "TATAMOTORS.NS",
    name: "Tata Motors Ltd",
    category: "india_stock",
    price: 995.0,
    change: 18.7,
    changePercent: 1.92,
    currency: "INR",
    maxLeverage: 5,
  },
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries",
    category: "india_stock",
    price: 2980.5,
    change: 34.2,
    changePercent: 1.16,
    currency: "INR",
    maxLeverage: 5,
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    category: "india_stock",
    price: 4210.0,
    change: -15.0,
    changePercent: -0.35,
    currency: "INR",
    maxLeverage: 5,
  },

  // Commodities & Forex
  {
    symbol: "GC=F",
    name: "Gold (XAU/USD)",
    category: "commodity",
    price: 2432.5,
    change: 14.8,
    changePercent: 0.61,
    currency: "USD",
    maxLeverage: 20,
  },
  {
    symbol: "EURUSD=X",
    name: "EUR / USD",
    category: "forex",
    price: 1.0875,
    change: 0.0018,
    changePercent: 0.17,
    currency: "USD",
    maxLeverage: 20,
  },
];

export class TradingSimulatorService {
  /**
   * Calculate required margin based on notional position size and leverage
   * Margin = (Price * Quantity) / Leverage
   */
  calculateMargin(price: number, quantity: number, leverage: number): number {
    const lev = Math.max(1, leverage);
    return (price * quantity) / lev;
  }

  /**
   * Calculate P&L for a position
   * Long:  (CurrentPrice - EntryPrice) * Quantity
   * Short: (EntryPrice - CurrentPrice) * Quantity
   */
  calculatePnl(
    side: TradeSide,
    entryPrice: number,
    currentPrice: number,
    quantity: number
  ): { pnl: number; pnlPercent: number } {
    if (entryPrice <= 0 || quantity <= 0) {
      return { pnl: 0, pnlPercent: 0 };
    }

    const priceDiff = side === "long" ? currentPrice - entryPrice : entryPrice - currentPrice;
    const pnl = priceDiff * quantity;
    const pnlPercent = (priceDiff / entryPrice) * 100;

    return {
      pnl: Number(pnl.toFixed(2)),
      pnlPercent: Number(pnlPercent.toFixed(2)),
    };
  }

  /**
   * Calculate Estimated Liquidation Price for leveraged positions
   * Standard maintenance margin: 80% loss of initial margin triggers liquidation
   */
  calculateLiquidationPrice(side: TradeSide, entryPrice: number, leverage: number): number {
    if (leverage <= 1) return side === "long" ? 0 : entryPrice * 2;

    const maintenanceFactor = 0.85; // 85% loss threshold
    const maxAdverseMovement = (entryPrice / leverage) * maintenanceFactor;

    if (side === "long") {
      return Math.max(0, Number((entryPrice - maxAdverseMovement).toFixed(2)));
    } else {
      return Number((entryPrice + maxAdverseMovement).toFixed(2));
    }
  }

  /**
   * Evaluate whether a position has triggered Stop-Loss, Take-Profit, or Liquidation
   */
  checkRiskTriggers(
    position: TradePosition,
    currentPrice: number
  ): { triggered: boolean; reason?: ClosedTrade["closeReason"] } {
    // Check Liquidation
    if (position.side === "long" && currentPrice <= position.liquidationPrice) {
      return { triggered: true, reason: "liquidation" };
    }
    if (position.side === "short" && currentPrice >= position.liquidationPrice && position.liquidationPrice > 0) {
      return { triggered: true, reason: "liquidation" };
    }

    // Check Take Profit
    if (position.takeProfit != null && position.takeProfit > 0) {
      if (position.side === "long" && currentPrice >= position.takeProfit) {
        return { triggered: true, reason: "take_profit" };
      }
      if (position.side === "short" && currentPrice <= position.takeProfit) {
        return { triggered: true, reason: "take_profit" };
      }
    }

    // Check Stop Loss
    if (position.stopLoss != null && position.stopLoss > 0) {
      if (position.side === "long" && currentPrice <= position.stopLoss) {
        return { triggered: true, reason: "stop_loss" };
      }
      if (position.side === "short" && currentPrice >= position.stopLoss) {
        return { triggered: true, reason: "stop_loss" };
      }
    }

    return { triggered: false };
  }

  /**
   * Open a new position
   */
  openPosition(params: {
    account: DemoAccount;
    symbol: string;
    name: string;
    category: AssetCategory;
    side: TradeSide;
    leverage: number;
    quantity: number;
    price: number;
    stopLoss?: number;
    takeProfit?: number;
  }): { success: boolean; position?: TradePosition; updatedAccount?: DemoAccount; error?: string } {
    const { account, symbol, name, category, side, leverage, quantity, price, stopLoss, takeProfit } = params;

    if (quantity <= 0 || price <= 0) {
      return { success: false, error: "Invalid order quantity or price" };
    }

    const marginRequired = this.calculateMargin(price, quantity, leverage);

    if (marginRequired > account.freeMargin) {
      return {
        success: false,
        error: `Insufficient free margin ($${account.freeMargin.toLocaleString()}). Required: $${marginRequired.toLocaleString()}`,
      };
    }

    const liquidationPrice = this.calculateLiquidationPrice(side, price, leverage);

    const position: TradePosition = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      symbol,
      name,
      category,
      side,
      leverage,
      quantity,
      entryPrice: price,
      currentPrice: price,
      margin: Number(marginRequired.toFixed(2)),
      pnl: 0,
      pnlPercent: 0,
      stopLoss,
      takeProfit,
      liquidationPrice,
      openedAt: new Date().toISOString(),
    };

    const newMarginUsed = account.marginUsed + marginRequired;
    const updatedAccount: DemoAccount = {
      ...account,
      marginUsed: Number(newMarginUsed.toFixed(2)),
      freeMargin: Number((account.equity - newMarginUsed).toFixed(2)),
    };

    return { success: true, position, updatedAccount };
  }

  /**
   * Close an open position
   */
  closePosition(
    position: TradePosition,
    currentPrice: number,
    account: DemoAccount,
    reason: ClosedTrade["closeReason"] = "manual"
  ): { closedTrade: ClosedTrade; updatedAccount: DemoAccount } {
    const { pnl, pnlPercent } = this.calculatePnl(position.side, position.entryPrice, currentPrice, position.quantity);

    const closedTrade: ClosedTrade = {
      id: `closed-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      symbol: position.symbol,
      name: position.name,
      category: position.category,
      side: position.side,
      leverage: position.leverage,
      quantity: position.quantity,
      entryPrice: position.entryPrice,
      exitPrice: currentPrice,
      realizedPnl: pnl,
      realizedPnlPercent: pnlPercent,
      closeReason: reason,
      openedAt: position.openedAt,
      closedAt: new Date().toISOString(),
    };

    // Return margin back to balance, add realized PnL
    const newBalance = account.balance + pnl;
    const newMarginUsed = Math.max(0, account.marginUsed - position.margin);
    const newEquity = newBalance; // Assuming all other positions are unchanged at this moment

    const updatedAccount: DemoAccount = {
      ...account,
      balance: Number(newBalance.toFixed(2)),
      equity: Number(newEquity.toFixed(2)),
      marginUsed: Number(newMarginUsed.toFixed(2)),
      freeMargin: Number((newEquity - newMarginUsed).toFixed(2)),
    };

    return { closedTrade, updatedAccount };
  }
}

export const tradingSimulatorService = new TradingSimulatorService();
