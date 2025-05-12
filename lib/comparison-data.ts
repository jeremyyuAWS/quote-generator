import { QuoteComparison } from "@/types/comparison";

export function generateSyntheticQuoteComparison(): QuoteComparison {
  return {
    quoteHeaders: [
      {
        id: "quoteA",
        name: "Quote A",
        vendor: "Network Solutions Inc.",
        quoteDate: "2023-08-15",
        validUntil: "2023-11-15",
        reference: "Q-2023-4567",
        totalPrice: 12450,
        recommended: false
      },
      {
        id: "quoteB",
        name: "Quote B",
        vendor: "Enterprise Networks LLC",
        quoteDate: "2023-08-18",
        validUntil: "2023-11-18",
        reference: "ENT-8901",
        totalPrice: 13125,
        recommended: true
      },
      {
        id: "quoteC",
        name: "Quote C",
        vendor: "Global IT Systems",
        quoteDate: "2023-08-20",
        validUntil: "2023-12-01",
        reference: "GIT-2023-112",
        totalPrice: 15300,
        recommended: false
      }
    ],
    items: [
      {
        sku: "SW-1200-24",
        description: "24-Port PoE+ Switch (Max 380W)",
        quoteValues: {
          quoteA: 2950,
          quoteB: null,
          quoteC: null
        },
        eosDate: "2023-05-15",
        recommendedQuoteId: null,
        notes: null
      },
      {
        sku: "SW-2400-24",
        description: "24-Port PoE+ Switch (Max 420W) - Current Generation",
        quoteValues: {
          quoteA: null,
          quoteB: 3225,
          quoteC: 3400
        },
        eosDate: null,
        recommendedQuoteId: "quoteB",
        notes: "Better value with latest generation"
      },
      {
        sku: "AP-300",
        description: "Dual-Band 802.11ax Access Point (Wi-Fi 6)",
        quoteValues: {
          quoteA: 1250,
          quoteB: null,
          quoteC: null
        },
        eosDate: null,
        recommendedQuoteId: null,
        notes: null
      },
      {
        sku: "AP-500",
        description: "Tri-Band 802.11ax Access Point (Wi-Fi 6E)",
        quoteValues: {
          quoteA: null,
          quoteB: 1550,
          quoteC: 1625
        },
        eosDate: null,
        recommendedQuoteId: "quoteB",
        notes: "Better performance at competitive price"
      },
      {
        sku: "CTRL-V3",
        description: "Wireless Controller (up to 100 APs)",
        quoteValues: {
          quoteA: 3200,
          quoteB: 3200,
          quoteC: 3275
        },
        eosDate: null,
        recommendedQuoteId: null,
        notes: null
      },
      {
        sku: "LIC-AP-1YR",
        description: "1-Year AP License",
        quoteValues: {
          quoteA: 450,
          quoteB: null,
          quoteC: null
        },
        eosDate: null,
        recommendedQuoteId: null,
        notes: null
      },
      {
        sku: "LIC-AP-3YR",
        description: "3-Year AP License",
        quoteValues: {
          quoteA: null,
          quoteB: 975,
          quoteC: 975
        },
        eosDate: null,
        recommendedQuoteId: "quoteB",
        notes: "Better long-term value"
      },
      {
        sku: "CAB-SFP-3M",
        description: "SFP+ DAC Cable (3m)",
        quoteValues: {
          quoteA: 75,
          quoteB: 75,
          quoteC: 85
        },
        eosDate: null,
        recommendedQuoteId: null,
        notes: null
      },
      {
        sku: "SFP-10G-SR",
        description: "10G SFP+ Transceiver (Short Range)",
        quoteValues: {
          quoteA: 4525,
          quoteB: 4100,
          quoteC: 4350
        },
        eosDate: null,
        recommendedQuoteId: "quoteB",
        notes: "Better pricing for same specification"
      },
      {
        sku: "SUP-STD",
        description: "Standard 8x5 Support",
        quoteValues: {
          quoteA: true,
          quoteB: true,
          quoteC: false
        },
        eosDate: null,
        recommendedQuoteId: null,
        notes: null
      },
      {
        sku: "SUP-PREM",
        description: "Premium 24x7 Support",
        quoteValues: {
          quoteA: false,
          quoteB: false,
          quoteC: true
        },
        eosDate: null,
        recommendedQuoteId: null,
        notes: null
      },
      {
        sku: "INST-BASIC",
        description: "Basic Installation Service",
        quoteValues: {
          quoteA: false,
          quoteB: true,
          quoteC: false
        },
        eosDate: null,
        recommendedQuoteId: "quoteB",
        notes: "Included at no extra cost"
      },
      {
        sku: "INST-ADV",
        description: "Advanced Installation & Configuration",
        quoteValues: {
          quoteA: false,
          quoteB: false,
          quoteC: 1590
        },
        eosDate: null,
        recommendedQuoteId: null,
        notes: null
      }
    ]
  };
}