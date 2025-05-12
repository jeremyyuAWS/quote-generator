"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileDiff, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSyntheticQuoteComparison } from "@/lib/comparison-data";

export function QuoteComparisonTable() {
  const [quotes] = useState(generateSyntheticQuoteComparison());
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [highlightRecommended, setHighlightRecommended] = useState(true);
  
  // Filter items based on the "show only differences" toggle
  const getFilteredItems = () => {
    if (!showOnlyDifferences) return quotes.items;
    
    return quotes.items.filter(item => {
      const values = Object.values(item.quoteValues);
      // Check if there are different values across quotes
      return new Set(values.filter(v => v !== null).map(String)).size > 1;
    });
  };
  
  const filteredItems = getFilteredItems();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quote Comparison</h2>
          <p className="text-muted-foreground">
            Compare pricing and configurations across multiple quotes
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-differences"
              checked={showOnlyDifferences}
              onCheckedChange={setShowOnlyDifferences}
            />
            <Label htmlFor="show-differences">Show only differences</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="highlight-recommended"
              checked={highlightRecommended}
              onCheckedChange={setHighlightRecommended}
            />
            <Label htmlFor="highlight-recommended">Highlight recommended</Label>
          </div>
          
          <Button variant="outline" size="sm" className="gap-1">
            <FileDiff size={16} />
            Generate Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {quotes.quoteHeaders.map((header, index) => (
          <Card key={index} className={cn(
            "border",
            header.recommended && highlightRecommended ? "border-2 border-primary" : ""
          )}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>{header.name}</CardTitle>
                {header.recommended && highlightRecommended && (
                  <Badge className="bg-primary hover:bg-primary/90 gap-1">
                    <ThumbsUp size={12} />
                    Recommended
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{header.vendor}</div>
              <div className="text-2xl font-bold">${header.totalPrice.toLocaleString()}</div>
            </CardHeader>
            <CardContent className="text-xs">
              <div className="flex justify-between mb-1">
                <span>Quote Date:</span>
                <span>{header.quoteDate}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Valid Until:</span>
                <span>{header.validUntil}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Reference:</span>
                <span>{header.reference}</span>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-1 mt-2">
                <Download size={14} />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Item</th>
                  {quotes.quoteHeaders.map((header, index) => (
                    <th key={index} className={cn(
                      "py-3 px-4 text-left font-medium",
                      header.recommended && highlightRecommended ? "bg-primary/10" : ""
                    )}>
                      {header.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr 
                    key={index} 
                    className={cn(
                      "border-b",
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{item.sku}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                      {item.eosDate && (
                        <Badge variant="destructive" className="mt-1 text-xs">
                          EOS: {item.eosDate}
                        </Badge>
                      )}
                    </td>
                    
                    {quotes.quoteHeaders.map((header, quoteIndex) => {
                      const value = item.quoteValues[header.id];
                      const isHighlighted = value !== null && 
                        item.recommendedQuoteId === header.id &&
                        highlightRecommended;
                      
                      return (
                        <td 
                          key={quoteIndex} 
                          className={cn(
                            "py-3 px-4",
                            header.recommended && highlightRecommended ? "bg-primary/10" : "",
                            isHighlighted ? "font-bold text-primary" : ""
                          )}
                        >
                          {value === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : value === true ? (
                            <Badge variant="outline" className="bg-green-100 dark:bg-green-900 border-green-500">
                              Included
                            </Badge>
                          ) : value === false ? (
                            <Badge variant="outline" className="bg-red-100 dark:bg-red-900 border-red-500">
                              Not Included
                            </Badge>
                          ) : typeof value === 'number' ? (
                            <div>
                              <div>${value.toLocaleString()}</div>
                              {item.notes && item.recommendedQuoteId === header.id && (
                                <div className="text-xs text-green-600 dark:text-green-400">
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>{value}</div>
                          )}
                          
                          {isHighlighted && (
                            <ThumbsUp 
                              size={14} 
                              className="inline-block ml-1 text-green-600 dark:text-green-400" 
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                <tr className="bg-muted/40 font-bold">
                  <td className="py-3 px-4">Total</td>
                  {quotes.quoteHeaders.map((header, index) => (
                    <td 
                      key={index} 
                      className={cn(
                        "py-3 px-4",
                        header.recommended && highlightRecommended ? "bg-primary/20" : ""
                      )}
                    >
                      ${header.totalPrice.toLocaleString()}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Analysis & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Pricing Comparison</h3>
            <p className="text-muted-foreground">
              Quote B offers the best value with only a 5% price premium over Quote A, 
              but includes enterprise support and all recommended accessories.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Configuration Differences</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-medium">AP Model:</span> Quote A uses the older AP-300 model, 
                while Quotes B and C use the newer AP-500 with better performance.
              </li>
              <li>
                <span className="font-medium">Licensing:</span> Quote B includes 3-year licenses compared 
                to 1-year in Quote A, providing better long-term value.
              </li>
              <li>
                <span className="font-medium">Support:</span> Quote C includes premium 24/7 support, 
                but at a 15% price premium compared to Quote B.
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">End-of-Sale Concerns</h3>
            <p className="text-muted-foreground">
              Quote A includes the SW-1200-24 switch which is end-of-sale. 
              We recommend choosing Quote B or C which include current generation products.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}