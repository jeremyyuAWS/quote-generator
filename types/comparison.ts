export interface QuoteHeader {
  id: string;
  name: string;
  vendor: string;
  quoteDate: string;
  validUntil: string;
  reference: string;
  totalPrice: number;
  recommended: boolean;
}

export interface QuoteItem {
  sku: string;
  description: string;
  quoteValues: {
    [quoteId: string]: number | boolean | null;
  };
  eosDate: string | null;
  recommendedQuoteId: string | null;
  notes: string | null;
}

export interface QuoteComparison {
  quoteHeaders: QuoteHeader[];
  items: QuoteItem[];
}