import { describe, it, expect } from "vitest";
import { calculatorService } from "@/services/calculator-service";

describe("CalculatorService", () => {
  it("calculates SIP correctly", () => {
    // 10,000 monthly for 10 years at 12%
    const res = calculatorService.calculateSip(10000, 12, 10);
    expect(res.investedAmount).toBe(1200000);
    // Standard FV of SIP at 12% for 10 yrs is ~2,323,391
    expect(res.totalValue).toBeGreaterThan(2300000);
    expect(res.totalValue).toBeLessThan(2400000);
    expect(res.yearlyBreakdown.length).toBe(10);
  });

  it("calculates EMI correctly", () => {
    // 1,000,000 loan at 8.5% for 15 years
    const res = calculatorService.calculateEmi(1000000, 8.5, 15);
    // Standard EMI is ~9847
    expect(res.monthlyEmi).toBeGreaterThan(9500);
    expect(res.monthlyEmi).toBeLessThan(10200);
    expect(res.totalPayment).toBeGreaterThan(res.loanAmount);
    expect(res.amortization.length).toBe(15);
  });

  it("calculates CAGR correctly", () => {
    // 100,000 to 200,000 in 5 years (doubling in 5 yrs is ~14.87%)
    const res = calculatorService.calculateCagr(100000, 200000, 5);
    expect(res.cagrPercentage).toBeCloseTo(14.87, 1);
    expect(res.absoluteReturnPercentage).toBe(100);
  });
});
