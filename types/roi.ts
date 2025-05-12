export interface ROITimeframe {
  months: number;
  label: string;
}

export interface CostItem {
  category: string;
  initialQuote: number;
  recommendedQuote: number;
  difference: number;
}

export interface BenefitItem {
  category: string;
  value: number;
  description: string;
}

export interface MetricItem {
  name: string;
  initialQuote: number;
  recommendedQuote: number;
  unit: string;
  higherIsBetter: boolean;
  description: string;
}

export interface ROICalculation {
  quoteName: string;
  alternativeName: string;
  initialInvestment: number;
  alternativeInvestment: number;
  costDifference: number;
  annualSavings: number;
  paybackPeriodMonths: number;
  fiveYearSavings: number;
  npv: number;
  irr: number;
  costs: CostItem[];
  benefits: BenefitItem[];
  metrics: MetricItem[];
  monthlyCashFlow: {
    month: number;
    initialQuote: number;
    recommendedQuote: number;
    savings: number;
    cumulativeSavings: number;
  }[];
}