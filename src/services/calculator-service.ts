export interface SipResult {
  monthlyInvestment: number;
  expectedReturnRate: number;
  timePeriodYears: number;
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  yearlyBreakdown: Array<{
    year: number;
    investedAmount: number;
    estimatedReturns: number;
    totalValue: number;
  }>;
}

export interface EmiResult {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  amortization: Array<{
    year: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }>;
}

export interface CagrResult {
  beginningValue: number;
  endingValue: number;
  years: number;
  cagrPercentage: number;
  absoluteReturnPercentage: number;
}

export interface CompoundInterestResult {
  principal: number;
  annualRate: number;
  frequency: "annual" | "semiannual" | "quarterly" | "monthly";
  years: number;
  totalValue: number;
  totalInterest: number;
}

export interface SwpResult {
  totalInvestment: number;
  monthlyWithdrawal: number;
  expectedReturnRate: number;
  tenureYears: number;
  totalWithdrawn: number;
  finalValue: number;
  monthlyDepletion: Array<{
    year: number;
    withdrawnSoFar: number;
    remainingBalance: number;
  }>;
}

export interface RetirementResult {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentMonthlyExpense: number;
  expectedInflation: number;
  preRetirementReturn: number;
  postRetirementReturn: number;
  futureMonthlyExpense: number;
  requiredCorpus: number;
  recommendedMonthlySip: number;
}

export class CalculatorService {
  /**
   * Systematic Investment Plan (SIP) Calculator
   * Formula: M * [ (1 + i)^n - 1 ] * (1 + i) / i
   */
  calculateSip(monthlyInvestment: number, annualRate: number, years: number): SipResult {
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = Math.round(years * 12);
    const yearlyBreakdown: SipResult["yearlyBreakdown"] = [];

    let runningValue = 0;
    for (let month = 1; month <= totalMonths; month++) {
      runningValue = (runningValue + monthlyInvestment) * (1 + monthlyRate);

      if (month % 12 === 0 || month === totalMonths) {
        const year = Math.ceil(month / 12);
        const invested = monthlyInvestment * month;
        const returns = Math.max(0, runningValue - invested);
        yearlyBreakdown.push({
          year,
          investedAmount: Math.round(invested),
          estimatedReturns: Math.round(returns),
          totalValue: Math.round(runningValue),
        });
      }
    }

    const investedAmount = Math.round(monthlyInvestment * totalMonths);
    const totalValue = Math.round(runningValue);
    const estimatedReturns = Math.max(0, totalValue - investedAmount);

    return {
      monthlyInvestment,
      expectedReturnRate: annualRate,
      timePeriodYears: years,
      investedAmount,
      estimatedReturns,
      totalValue,
      yearlyBreakdown,
    };
  }

  /**
   * Equated Monthly Installment (EMI) Calculator
   * Formula: [P * r * (1 + r)^n] / [(1 + r)^n - 1]
   */
  calculateEmi(loanAmount: number, annualInterestRate: number, tenureYears: number): EmiResult {
    const monthlyRate = annualInterestRate / 100 / 12;
    const totalMonths = Math.round(tenureYears * 12);

    let monthlyEmi = 0;
    if (monthlyRate === 0) {
      monthlyEmi = loanAmount / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyEmi = (loanAmount * monthlyRate * factor) / (factor - 1);
    }

    let remainingBalance = loanAmount;
    const amortization: EmiResult["amortization"] = [];

    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyEmi - interestPayment;
      remainingBalance = Math.max(0, remainingBalance - principalPayment);

      yearlyPrincipal += principalPayment;
      yearlyInterest += interestPayment;

      if (month % 12 === 0 || month === totalMonths) {
        const year = Math.ceil(month / 12);
        amortization.push({
          year,
          principalPaid: Math.round(yearlyPrincipal),
          interestPaid: Math.round(yearlyInterest),
          remainingBalance: Math.round(remainingBalance),
        });
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    }

    const totalPayment = Math.round(monthlyEmi * totalMonths);
    const totalInterest = Math.max(0, totalPayment - Math.round(loanAmount));

    return {
      loanAmount,
      interestRate: annualInterestRate,
      tenureYears,
      monthlyEmi: Math.round(monthlyEmi),
      totalInterest,
      totalPayment,
      amortization,
    };
  }

  /**
   * Compound Annual Growth Rate (CAGR) Calculator
   * Formula: (Ending Value / Beginning Value) ^ (1 / n) - 1
   */
  calculateCagr(beginningValue: number, endingValue: number, years: number): CagrResult {
    if (beginningValue <= 0 || years <= 0) {
      return {
        beginningValue,
        endingValue,
        years,
        cagrPercentage: 0,
        absoluteReturnPercentage: 0,
      };
    }

    const cagr = Math.pow(endingValue / beginningValue, 1 / years) - 1;
    const absoluteReturn = (endingValue - beginningValue) / beginningValue;

    return {
      beginningValue,
      endingValue,
      years,
      cagrPercentage: Number((cagr * 100).toFixed(2)),
      absoluteReturnPercentage: Number((absoluteReturn * 100).toFixed(2)),
    };
  }

  /**
   * Compound Interest Calculator
   * Formula: A = P * (1 + r/n)^(nt)
   */
  calculateCompoundInterest(
    principal: number,
    annualRate: number,
    years: number,
    frequency: "annual" | "semiannual" | "quarterly" | "monthly" = "annual"
  ): CompoundInterestResult {
    const frequencyMap = {
      annual: 1,
      semiannual: 2,
      quarterly: 4,
      monthly: 12,
    };
    const n = frequencyMap[frequency];
    const r = annualRate / 100;
    const totalValue = principal * Math.pow(1 + r / n, n * years);
    const totalInterest = Math.max(0, totalValue - principal);

    return {
      principal,
      annualRate,
      frequency,
      years,
      totalValue: Math.round(totalValue),
      totalInterest: Math.round(totalInterest),
    };
  }

  /**
   * Systematic Withdrawal Plan (SWP) Calculator
   */
  calculateSwp(
    totalInvestment: number,
    monthlyWithdrawal: number,
    expectedReturnRate: number,
    tenureYears: number
  ): SwpResult {
    const monthlyRate = expectedReturnRate / 100 / 12;
    const totalMonths = Math.round(tenureYears * 12);
    let balance = totalInvestment;
    let totalWithdrawn = 0;
    const monthlyDepletion: SwpResult["monthlyDepletion"] = [];

    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) - monthlyWithdrawal;
      totalWithdrawn += monthlyWithdrawal;

      if (balance < 0) {
        balance = 0;
      }

      if (m % 12 === 0 || m === totalMonths) {
        const year = Math.ceil(m / 12);
        monthlyDepletion.push({
          year,
          withdrawnSoFar: Math.round(totalWithdrawn),
          remainingBalance: Math.round(balance),
        });
      }
    }

    return {
      totalInvestment,
      monthlyWithdrawal,
      expectedReturnRate,
      tenureYears,
      totalWithdrawn: Math.round(totalWithdrawn),
      finalValue: Math.round(balance),
      monthlyDepletion,
    };
  }

  /**
   * Retirement & FIRE Planner
   */
  calculateRetirement(
    currentAge: number,
    retirementAge: number,
    lifeExpectancy: number,
    currentMonthlyExpense: number,
    expectedInflation: number,
    preRetirementReturn: number,
    postRetirementReturn: number
  ): RetirementResult {
    const yearsToRetire = Math.max(1, retirementAge - currentAge);
    const yearsInRetirement = Math.max(1, lifeExpectancy - retirementAge);

    // Future monthly expense at retirement age adjusted for inflation
    const inflationDecimal = expectedInflation / 100;
    const futureMonthlyExpense = currentMonthlyExpense * Math.pow(1 + inflationDecimal, yearsToRetire);
    const futureAnnualExpense = futureMonthlyExpense * 12;

    // Real rate of return in retirement
    const postReturnDecimal = postRetirementReturn / 100;
    const realRate = (1 + postReturnDecimal) / (1 + inflationDecimal) - 1;

    // Present value of annuity for retirement years
    let requiredCorpus = 0;
    if (Math.abs(realRate) < 0.0001) {
      requiredCorpus = futureAnnualExpense * yearsInRetirement;
    } else {
      requiredCorpus = futureAnnualExpense * ((1 - Math.pow(1 + realRate, -yearsInRetirement)) / realRate);
    }

    // Required monthly SIP to reach target corpus
    const preMonthlyRate = preRetirementReturn / 100 / 12;
    const totalMonths = yearsToRetire * 12;
    const sipFactor = (Math.pow(1 + preMonthlyRate, totalMonths) - 1) * (1 + preMonthlyRate) / preMonthlyRate;
    const recommendedMonthlySip = requiredCorpus / Math.max(1, sipFactor);

    return {
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentMonthlyExpense,
      expectedInflation,
      preRetirementReturn,
      postRetirementReturn,
      futureMonthlyExpense: Math.round(futureMonthlyExpense),
      requiredCorpus: Math.round(requiredCorpus),
      recommendedMonthlySip: Math.round(recommendedMonthlySip),
    };
  }
}

export const calculatorService = new CalculatorService();
