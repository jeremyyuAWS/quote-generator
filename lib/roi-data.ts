import { ROICalculation, CostItem, BenefitItem, MetricItem, ROITimeframe } from "@/types/roi";

export const timeframeOptions: ROITimeframe[] = [
  { months: 12, label: "1 Year" },
  { months: 24, label: "2 Years" },
  { months: 36, label: "3 Years" },
  { months: 60, label: "5 Years" }
];

export function generateSyntheticROIData(quoteName: string = "Quote A", alternativeName: string = "Quote B"): ROICalculation {
  // Initial and alternative investments
  const initialInvestment = 12450;
  const alternativeInvestment = 13125;
  const costDifference = alternativeInvestment - initialInvestment;
  
  // Calculate annual savings and benefits
  const powerSavings = 1250; // Annual power savings
  const maintenanceSavings = 2100; // Annual maintenance savings
  const productivityGain = 8500; // Annual productivity gain
  const downtimeReduction = 3200; // Annual downtime cost reduction
  
  const annualSavings = powerSavings + maintenanceSavings + productivityGain + downtimeReduction;
  
  // Calculate payback period in months
  const paybackPeriodMonths = Math.round((costDifference / (annualSavings / 12)) * 10) / 10;
  
  // Calculate 5-year savings
  const fiveYearSavings = (annualSavings * 5) - costDifference;
  
  // Calculate NPV (Net Present Value) with 5% discount rate
  const discountRate = 0.05;
  const periods = 60; // 5 years in months
  let npv = -costDifference;
  const monthlySavings = annualSavings / 12;
  
  for (let i = 1; i <= periods; i++) {
    npv += monthlySavings / Math.pow(1 + (discountRate / 12), i);
  }
  
  // Calculate IRR (Internal Rate of Return) - simplified approximation
  const irr = (annualSavings / costDifference) * 100;
  
  // Cost breakdown
  const costs: CostItem[] = [
    {
      category: "Hardware",
      initialQuote: 9850,
      recommendedQuote: 10125,
      difference: 275
    },
    {
      category: "Software & Licenses",
      initialQuote: 1350,
      recommendedQuote: 1850,
      difference: 500
    },
    {
      category: "Installation",
      initialQuote: 1250,
      recommendedQuote: 1150,
      difference: -100
    },
    {
      category: "Support & Maintenance",
      initialQuote: 0,
      recommendedQuote: 0,
      difference: 0
    }
  ];
  
  // Benefits breakdown
  const benefits: BenefitItem[] = [
    {
      category: "Power Efficiency",
      value: powerSavings,
      description: "Reduced power consumption from newer, more efficient hardware"
    },
    {
      category: "Maintenance Reduction",
      value: maintenanceSavings,
      description: "Fewer service calls and parts replacements with current generation equipment"
    },
    {
      category: "Productivity Improvement",
      value: productivityGain,
      description: "Faster network speeds and better reliability increase staff productivity"
    },
    {
      category: "Downtime Prevention",
      value: downtimeReduction,
      description: "Fewer outages and faster recovery means less costly downtime"
    }
  ];
  
  // Performance metrics
  const metrics: MetricItem[] = [
    {
      name: "Network Throughput",
      initialQuote: 1,
      recommendedQuote: 2.5,
      unit: "Gbps",
      higherIsBetter: true,
      description: "Maximum end-to-end throughput capacity"
    },
    {
      name: "Max Wireless Clients",
      initialQuote: 100,
      recommendedQuote: 200,
      unit: "clients",
      higherIsBetter: true,
      description: "Maximum number of concurrent wireless connections"
    },
    {
      name: "Power Consumption",
      initialQuote: 520,
      recommendedQuote: 410,
      unit: "watts",
      higherIsBetter: false,
      description: "Total power draw of all network equipment"
    },
    {
      name: "Expected Lifetime",
      initialQuote: 3,
      recommendedQuote: 5,
      unit: "years",
      higherIsBetter: true,
      description: "Expected useful lifetime before replacement"
    },
    {
      name: "Annual Maintenance",
      initialQuote: 1800,
      recommendedQuote: 1200,
      unit: "USD",
      higherIsBetter: false,
      description: "Estimated annual maintenance costs"
    }
  ];
  
  // Generate monthly cash flow for 5 years (60 months)
  const monthlyCashFlow = Array.from({ length: 60 }, (_, i) => {
    const month = i + 1;
    
    // Initial quote monthly costs (hardware + maintenance)
    const initialQuoteMonthly = initialInvestment / 60 + (1800 / 12); // investment amortized + monthly maintenance
    
    // Recommended quote monthly costs (hardware + maintenance)
    const recommendedQuoteMonthly = alternativeInvestment / 60 + (1200 / 12); // investment amortized + monthly maintenance
    
    // Monthly savings (benefits - cost difference)
    const monthlySaving = annualSavings / 12;
    
    // Cumulative savings
    const cumulativeSavings = (monthlySaving * month) - costDifference;
    
    return {
      month,
      initialQuote: initialQuoteMonthly,
      recommendedQuote: recommendedQuoteMonthly,
      savings: monthlySaving,
      cumulativeSavings
    };
  });
  
  return {
    quoteName,
    alternativeName,
    initialInvestment,
    alternativeInvestment,
    costDifference,
    annualSavings,
    paybackPeriodMonths,
    fiveYearSavings,
    npv,
    irr,
    costs,
    benefits,
    metrics,
    monthlyCashFlow
  };
}