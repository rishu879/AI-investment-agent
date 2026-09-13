import { describe, it, expect } from "vitest";
import { tradingSimulatorService, INITIAL_DEMO_BALANCE, type DemoAccount } from "@/services/trading-simulator-service";

describe("TradingSimulatorService", () => {
  it("calculates margin correctly for different leverage levels", () => {
    // 1 BTC at $60,000 with 1x leverage = $60,000 margin
    expect(tradingSimulatorService.calculateMargin(60000, 1, 1)).toBe(60000);

    // 1 BTC at $60,000 with 10x leverage = $6,000 margin
    expect(tradingSimulatorService.calculateMargin(60000, 1, 10)).toBe(6000);

    // 100 shares at $200 with 5x leverage = $4,000 margin
    expect(tradingSimulatorService.calculateMargin(200, 100, 5)).toBe(4000);
  });

  it("calculates Long position P&L correctly", () => {
    // Bought 2 BTC at $60,000, sold at $65,000 -> Profit of $10,000
    const longWin = tradingSimulatorService.calculatePnl("long", 60000, 65000, 2);
    expect(longWin.pnl).toBe(10000);
    expect(longWin.pnlPercent).toBeCloseTo(8.33, 1);

    // Bought 100 shares at $150, current price $140 -> Loss of -$1,000
    const longLoss = tradingSimulatorService.calculatePnl("long", 150, 140, 100);
    expect(longLoss.pnl).toBe(-1000);
    expect(longLoss.pnlPercent).toBeCloseTo(-6.67, 1);
  });

  it("calculates Short position P&L correctly", () => {
    // Shorted 1 BTC at $70,000, price drops to $65,000 -> Profit of $5,000
    const shortWin = tradingSimulatorService.calculatePnl("short", 70000, 65000, 1);
    expect(shortWin.pnl).toBe(5000);
    expect(shortWin.pnlPercent).toBeCloseTo(7.14, 1);

    // Shorted 100 shares at $200, price rises to $220 -> Loss of -$2,000
    const shortLoss = tradingSimulatorService.calculatePnl("short", 200, 220, 100);
    expect(shortLoss.pnl).toBe(-2000);
    expect(shortLoss.pnlPercent).toBeCloseTo(-10.0, 1);
  });

  it("calculates liquidation prices accurately for leveraged trades", () => {
    // Long 10x from $60,000 -> liquidation when down ~8.5% = ~$54,900
    const longLiq = tradingSimulatorService.calculateLiquidationPrice("long", 60000, 10);
    expect(longLiq).toBeLessThan(60000);
    expect(longLiq).toBe(54900);

    // Short 10x from $60,000 -> liquidation when up ~8.5% = ~$65,100
    const shortLiq = tradingSimulatorService.calculateLiquidationPrice("short", 60000, 10);
    expect(shortLiq).toBeGreaterThan(60000);
    expect(shortLiq).toBe(65100);
  });

  it("triggers Take-Profit and Stop-Loss correctly", () => {
    const position = {
      id: "test-pos",
      symbol: "BTC-USD",
      name: "Bitcoin",
      category: "crypto" as const,
      side: "long" as const,
      leverage: 5,
      quantity: 1,
      entryPrice: 60000,
      currentPrice: 60000,
      margin: 12000,
      pnl: 0,
      pnlPercent: 0,
      takeProfit: 65000,
      stopLoss: 58000,
      liquidationPrice: 49800,
      openedAt: new Date().toISOString(),
    };

    // Normal price between SL and TP
    expect(tradingSimulatorService.checkRiskTriggers(position, 61000).triggered).toBe(false);

    // Hit Take Profit
    const tpResult = tradingSimulatorService.checkRiskTriggers(position, 65200);
    expect(tpResult.triggered).toBe(true);
    expect(tpResult.reason).toBe("take_profit");

    // Hit Stop Loss
    const slResult = tradingSimulatorService.checkRiskTriggers(position, 57900);
    expect(slResult.triggered).toBe(true);
    expect(slResult.reason).toBe("stop_loss");
  });

  it("opens and closes positions with updated account balances", () => {
    const initialAccount: DemoAccount = {
      balance: INITIAL_DEMO_BALANCE,
      equity: INITIAL_DEMO_BALANCE,
      marginUsed: 0,
      freeMargin: INITIAL_DEMO_BALANCE,
      currency: "USD",
      initialBalance: INITIAL_DEMO_BALANCE,
    };

    const openResult = tradingSimulatorService.openPosition({
      account: initialAccount,
      symbol: "AAPL",
      name: "Apple Inc.",
      category: "us_stock",
      side: "long",
      leverage: 5,
      quantity: 100,
      price: 200,
    });

    expect(openResult.success).toBe(true);
    expect(openResult.position?.margin).toBe(4000);
    expect(openResult.updatedAccount?.marginUsed).toBe(4000);
    expect(openResult.updatedAccount?.freeMargin).toBe(96000);

    // Close position with price rising to $210 (+$1,000 profit)
    const closeResult = tradingSimulatorService.closePosition(
      openResult.position!,
      210,
      openResult.updatedAccount!
    );

    expect(closeResult.closedTrade.realizedPnl).toBe(1000);
    expect(closeResult.updatedAccount.balance).toBe(101000);
    expect(closeResult.updatedAccount.marginUsed).toBe(0);
  });
});
