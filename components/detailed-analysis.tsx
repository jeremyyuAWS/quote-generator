"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomProgress } from "@/components/ui/custom-progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, Check, CheckCircle, Download, ExternalLink, 
  Info, List, ShoppingCart, ThumbsUp, X, HelpCircle, 
  AlertCircle, ArrowRight, Layers, Zap, FileText
} from "lucide-react";

type DetailedAnalysisProps = {
  validationResult: {
    valid: boolean;
    issues: Array<{
      type: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
      suggestion?: string;
      impact?: string;
      itemsAffected?: string[];
    }>;
    suggestedItems?: Array<{
      sku: string;
      reason: string;
      details?: string;
      price?: string;
      compatibility?: string[];
    }>;
    confidence: number;
    patterns: string[];
    troubleshooting?: Array<{
      step: string;
      description: string;
      resolution?: string;
    }>;
    optimizationSuggestions?: Array<{
      type: string;
      description: string;
      benefit: string;
      implementationEffort: 'low' | 'medium' | 'high';
    }>;
  };
  onClose?: () => void;
  onAddToQuote?: (items: string[]) => void;
};

export function DetailedAnalysis({ validationResult, onClose, onAddToQuote }: DetailedAnalysisProps) {
  const [selectedTab, setSelectedTab] = useState("issues");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleItemSelect = (sku: string) => {
    if (selectedItems.includes(sku)) {
      setSelectedItems(selectedItems.filter(item => item !== sku));
    } else {
      setSelectedItems([...selectedItems, sku]);
    }
  };

  const handleAddToQuote = () => {
    if (onAddToQuote && selectedItems.length > 0) {
      onAddToQuote(selectedItems);
      setSelectedItems([]);
    }
  };

  const highIssues = validationResult.issues.filter(i => i.severity === 'high');
  const mediumIssues = validationResult.issues.filter(i => i.severity === 'medium');
  const lowIssues = validationResult.issues.filter(i => i.severity === 'low');

  const getConfidenceColor = () => {
    if (validationResult.confidence > 0.9) return "bg-green-500";
    if (validationResult.confidence > 0.7) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Configuration Analysis</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Detailed validation results and recommendations
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">Validation Status</div>
            <div className="flex items-center">
              {validationResult.valid ? (
                <Badge className="bg-green-500 hover:bg-green-600 mr-2">
                  <CheckCircle className="h-3 w-3 mr-1" /> Valid
                </Badge>
              ) : (
                <Badge variant="destructive" className="mr-2">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Issues Found
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Issues Detected</div>
            <div className="flex items-center gap-2">
              {highIssues.length > 0 && (
                <Badge variant="destructive">{highIssues.length} Critical</Badge>
              )}
              {mediumIssues.length > 0 && (
                <Badge variant="outline" className="border-amber-500 text-amber-500">
                  {mediumIssues.length} Warning
                </Badge>
              )}
              {lowIssues.length > 0 && (
                <Badge variant="outline">{lowIssues.length} Info</Badge>
              )}
              {validationResult.issues.length === 0 && (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  No Issues
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Confidence Score</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Analysis Confidence</span>
                <span>{Math.round(validationResult.confidence * 100)}%</span>
              </div>
              <CustomProgress
                value={validationResult.confidence * 100}
                className="h-2"
                indicatorClassName={getConfidenceColor()}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Main Tab Interface */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="issues" className="flex gap-1 items-center">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Issues</span>
              {validationResult.issues.length > 0 && (
                <Badge variant="outline" className="ml-1">{validationResult.issues.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex gap-1 items-center">
              <ThumbsUp className="h-4 w-4" />
              <span className="hidden sm:inline">Recommendations</span>
              {validationResult.suggestedItems && validationResult.suggestedItems.length > 0 && (
                <Badge variant="outline" className="ml-1">{validationResult.suggestedItems.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="flex gap-1 items-center">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Troubleshooting</span>
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex gap-1 items-center">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Optimization</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex gap-1 items-center">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
          </TabsList>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            {validationResult.issues.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium">No Issues Detected</h3>
                <p className="text-muted-foreground">Your configuration appears valid and complete.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {highIssues.length > 0 && (
                  <div>
                    <h3 className="text-destructive font-medium flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Critical Issues
                    </h3>
                    <div className="space-y-2">
                      {highIssues.map((issue, i) => (
                        <Alert key={i} variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>{issue.type.replace(/_/g, ' ')}</AlertTitle>
                          <AlertDescription className="space-y-2">
                            <p>{issue.description}</p>
                            {issue.impact && (
                              <div className="text-sm">
                                <span className="font-medium">Impact: </span>
                                {issue.impact}
                              </div>
                            )}
                            {issue.suggestion && (
                              <div className="text-sm">
                                <span className="font-medium">Suggestion: </span>
                                {issue.suggestion}
                              </div>
                            )}
                            {issue.itemsAffected && issue.itemsAffected.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium">Affected items: </span>
                                {issue.itemsAffected.join(', ')}
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {mediumIssues.length > 0 && (
                  <div>
                    <h3 className="text-amber-500 font-medium flex items-center mb-2">
                      <AlertCircle className="h-4 w-4 mr-1" /> Warnings
                    </h3>
                    <div className="space-y-2">
                      {mediumIssues.map((issue, i) => (
                        <Alert key={i} className="border-amber-300 dark:border-amber-800">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <AlertTitle className="text-amber-700 dark:text-amber-400">{issue.type.replace(/_/g, ' ')}</AlertTitle>
                          <AlertDescription className="space-y-2">
                            <p>{issue.description}</p>
                            {issue.impact && (
                              <div className="text-sm">
                                <span className="font-medium">Impact: </span>
                                {issue.impact}
                              </div>
                            )}
                            {issue.suggestion && (
                              <div className="text-sm">
                                <span className="font-medium">Suggestion: </span>
                                {issue.suggestion}
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {lowIssues.length > 0 && (
                  <div>
                    <h3 className="text-muted-foreground font-medium flex items-center mb-2">
                      <Info className="h-4 w-4 mr-1" /> Information
                    </h3>
                    <div className="space-y-2">
                      {lowIssues.map((issue, i) => (
                        <Alert key={i}>
                          <Info className="h-4 w-4" />
                          <AlertTitle>{issue.type.replace(/_/g, ' ')}</AlertTitle>
                          <AlertDescription>
                            <p>{issue.description}</p>
                            {issue.suggestion && (
                              <div className="text-sm mt-1">
                                <span className="font-medium">Suggestion: </span>
                                {issue.suggestion}
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {validationResult.patterns.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Identified Patterns</h3>
                    <div className="flex flex-wrap gap-2">
                      {validationResult.patterns.map((pattern, i) => (
                        <Badge key={i} variant="outline">
                          {pattern.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            {!validationResult.suggestedItems || validationResult.suggestedItems.length === 0 ? (
              <div className="text-center py-6">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium">No Recommendations Needed</h3>
                <p className="text-muted-foreground">Your configuration appears complete and optimal.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Recommended Items</h3>
                  {selectedItems.length > 0 && (
                    <Button size="sm" onClick={handleAddToQuote}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add {selectedItems.length} to Quote
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {validationResult.suggestedItems.map((item, i) => (
                    <Card key={i} className={`border ${selectedItems.includes(item.sku) ? 'border-primary' : ''}`}>
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{item.sku}</CardTitle>
                          <div className="flex items-center">
                            {item.price && (
                              <span className="text-sm font-medium mr-2">${item.price}</span>
                            )}
                            <Button
                              variant={selectedItems.includes(item.sku) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleItemSelect(item.sku)}
                            >
                              {selectedItems.includes(item.sku) ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" /> Selected
                                </>
                              ) : (
                                "Select"
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-0">
                        <p className="text-sm font-medium">Reason:</p>
                        <p className="text-sm text-muted-foreground mb-2">{item.reason}</p>
                        
                        {item.details && (
                          <>
                            <p className="text-sm font-medium">Details:</p>
                            <p className="text-sm text-muted-foreground mb-2">{item.details}</p>
                          </>
                        )}
                        
                        {item.compatibility && item.compatibility.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium">Compatible with:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.compatibility.map((sku, j) => (
                                <Badge key={j} variant="outline" className="text-xs">
                                  {sku}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Troubleshooting Tab */}
          <TabsContent value="troubleshooting" className="space-y-4">
            {!validationResult.troubleshooting || validationResult.troubleshooting.length === 0 ? (
              <div className="text-center py-6">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium">No Troubleshooting Steps Needed</h3>
                <p className="text-muted-foreground">Your configuration appears to be working correctly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium">Troubleshooting Guide</h3>
                <div className="space-y-6">
                  {validationResult.troubleshooting.map((step, i) => (
                    <div key={i} className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                          {i + 1}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">{step.step}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.resolution && (
                          <div className="rounded-lg bg-secondary/50 p-3 mt-2">
                            <div className="flex items-start">
                              <ArrowRight className="h-4 w-4 mt-0.5 mr-2 text-primary" />
                              <p className="text-sm">{step.resolution}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-4">
            {!validationResult.optimizationSuggestions || validationResult.optimizationSuggestions.length === 0 ? (
              <div className="text-center py-6">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium">Configuration Already Optimized</h3>
                <p className="text-muted-foreground">No further optimization suggestions available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium">Optimization Suggestions</h3>
                <div className="space-y-3">
                  {validationResult.optimizationSuggestions.map((suggestion, i) => (
                    <Card key={i}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-primary" />
                          {suggestion.type.replace(/_/g, ' ')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-0">
                        <p className="text-sm mb-2">{suggestion.description}</p>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Benefit</p>
                            <p className="text-sm">{suggestion.benefit}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Implementation Effort</p>
                            <Badge 
                              variant="outline" 
                              className={
                                suggestion.implementationEffort === 'low' 
                                  ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-800'
                                  : suggestion.implementationEffort === 'medium'
                                  ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800'
                                  : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-800'
                              }
                            >
                              {suggestion.implementationEffort.charAt(0).toUpperCase() + suggestion.implementationEffort.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Analysis Summary</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Validation Status</p>
                      <div className="flex items-center mt-1">
                        {validationResult.valid ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" /> Valid Configuration
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Issues Detected
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Confidence Score</p>
                      <div className="flex items-center mt-1">
                        <CustomProgress
                          value={validationResult.confidence * 100}
                          className="h-2 w-24 mr-2"
                          indicatorClassName={getConfidenceColor()}
                        />
                        <span className="text-sm font-medium">
                          {Math.round(validationResult.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-sm font-medium">Critical Issues</p>
                      <p className="text-xl font-bold text-destructive">{highIssues.length}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Warnings</p>
                      <p className="text-xl font-bold text-amber-500">{mediumIssues.length}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Recommendations</p>
                      <p className="text-xl font-bold text-primary">{validationResult.suggestedItems?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {highIssues.length > 0 && (
                  <div className="rounded-lg border border-destructive/20 p-4">
                    <h3 className="font-medium text-destructive mb-2">Critical Issues Summary</h3>
                    <ul className="space-y-1">
                      {highIssues.map((issue, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <span>{issue.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.suggestedItems && validationResult.suggestedItems.length > 0 && (
                  <div className="rounded-lg border border-primary/20 p-4">
                    <h3 className="font-medium text-primary mb-2">Key Recommendations</h3>
                    <ul className="space-y-1">
                      {validationResult.suggestedItems.map((item, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>
                            <span className="font-medium">{item.sku}</span> - {item.reason}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.optimizationSuggestions && validationResult.optimizationSuggestions.length > 0 && (
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Optimization Opportunities</h3>
                    <ul className="space-y-1">
                      {validationResult.optimizationSuggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{suggestion.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="outline" className="gap-1">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </CardFooter>
    </Card>
  );
}