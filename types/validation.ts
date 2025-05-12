export interface ValidationIssue {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  suggestion?: string;
  impact?: string;
  itemsAffected?: string[];
}

export interface SuggestedItem {
  sku: string;
  reason: string;
  details?: string;
  price?: string;
  compatibility?: string[];
}

export interface TroubleshootingStep {
  step: string;
  description: string;
  resolution?: string;
}

export interface OptimizationSuggestion {
  type: string;
  description: string;
  benefit: string;
  implementationEffort: 'low' | 'medium' | 'high';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  suggestedItems?: SuggestedItem[];
  confidence: number;
  patterns: string[];
  troubleshooting?: TroubleshootingStep[];
  optimizationSuggestions?: OptimizationSuggestion[];
}