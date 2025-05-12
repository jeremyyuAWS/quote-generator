"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  AreaChart, Area, ComposedChart, Scatter, ScatterChart, ZAxis, ReferenceLine
} from "recharts";
import { 
  Download, Info, FileText, BarChart4, ArrowRight, Calculator, 
  DollarSign, Printer, Maximize, Minimize, ChevronDown, ChevronUp,
  Check, Save, Share2, Mail, Edit2, UndoDot, Clock, ThumbsUp, Scale,
  TrendingUp, PieChart as PieChartIcon, Zap, CircleDollarSign, Percent,
  Wrench, CalendarClock
} from "lucide-react";
import { ROICalculation, ROITimeframe } from "@/types/roi";
import { generateSyntheticROIData, timeframeOptions } from "@/lib/roi-data";
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ROICalculator() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(36);
  const [roiData, setRoiData] = useState<ROICalculation | null>(null);
  const [editedRoiData, setEditedRoiData] = useState<ROICalculation | null>(null);
  const [quoteName, setQuoteName] = useState("Quote A");
  const [alternativeName, setAlternativeName] = useState("Quote B (Recommended)");
  const [metricView, setMetricView] = useState<"chart" | "data">("chart");
  const [benefitView, setBenefitView] = useState<"chart" | "data">("chart");
  const [cashFlowView, setCashFlowView] = useState<"chart" | "data">("chart");
  const [scenarioComparison, setScenarioComparison] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const data = generateSyntheticROIData(quoteName, alternativeName);
    setRoiData(data);
    setEditedRoiData(data);
  }, [quoteName, alternativeName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);
  
  const handleDataChange = (field: string, value: number) => {
    if (!editedRoiData) return;
    
    setEditedRoiData(prev => {
      if (!prev) return prev;
      
      // Create deep copy
      const data = JSON.parse(JSON.stringify(prev)) as ROICalculation;
      
      // Update the field
      switch (field) {
        case "initialInvestment":
          data.initialInvestment = value;
          data.costDifference = data.alternativeInvestment - value;
          break;
        case "alternativeInvestment":
          data.alternativeInvestment = value;
          data.costDifference = value - data.initialInvestment;
          break;
        case "annualSavings":
          data.annualSavings = value;
          // Recalculate payback period
          data.paybackPeriodMonths = Math.round((data.costDifference / (value / 12)) * 10) / 10;
          // Recalculate 5-year savings
          data.fiveYearSavings = (value * 5) - data.costDifference;
          break;
        default:
          break;
      }
      
      return data;
    });
  };

  const handleSaveChanges = () => {
    setRoiData(editedRoiData);
    setEditMode(false);
  };

  const handleResetChanges = () => {
    setEditedRoiData(roiData);
    setEditMode(false);
  };

  const toggleExpandSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exportROIReport = () => {
    if (!roiData) return;
    
    const dataStr = JSON.stringify(roiData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'roi-calculator-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printROIReport = () => {
    window.print();
  };

  const shareROIReport = () => {
    // In a real app, this would generate a shareable link
    console.log('Sharing ROI report');
  };
  
  if (!roiData || !editedRoiData) {
    return <div className="flex items-center justify-center p-8">Loading ROI data...</div>;
  }
  
  // Filter cash flow data based on selected timeframe
  const filteredCashFlow = roiData.monthlyCashFlow.filter(item => item.month <= selectedTimeframe);
  
  // Calculate break-even point
  const breakEvenPoint = roiData.monthlyCashFlow.findIndex(item => item.cumulativeSavings >= 0) + 1;
  
  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  // Calculate additional business metrics
  const irr = roiData.irr; // Already calculated in data
  const roi = (roiData.annualSavings * 5 - roiData.costDifference) / roiData.costDifference * 100;
  const riskAdjustedROI = roi * 0.8; // Simplified risk adjustment
  const costBenefitRatio = (roiData.annualSavings * 5) / roiData.alternativeInvestment;
  
  // Generate alternative scenario data for comparison
  const alternativeScenario = {
    initialInvestment: roiData.initialInvestment,
    alternativeInvestment: roiData.alternativeInvestment * 0.9, // 10% cheaper alternative
    costDifference: roiData.alternativeInvestment * 0.9 - roiData.initialInvestment,
    annualSavings: roiData.annualSavings * 0.8, // 20% less savings
    paybackPeriodMonths: Math.round((roiData.alternativeInvestment * 0.9 - roiData.initialInvestment) / (roiData.annualSavings * 0.8 / 12) * 10) / 10,
    fiveYearSavings: (roiData.annualSavings * 0.8 * 5) - (roiData.alternativeInvestment * 0.9 - roiData.initialInvestment),
  };

  // Format currency values consistently
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Container style for fullscreen mode
  const containerStyle = isFullscreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: 'var(--background)',
    padding: '1rem',
    overflow: 'auto',
  } as React.CSSProperties : {};
  
  return (
    <div style={containerStyle} ref={containerRef} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            ROI Analysis Calculator
          </h2>
          <p className="text-muted-foreground">
            Compare costs and calculate return on investment for network solutions
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {editMode ? (
            <>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSaveChanges}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetChanges}
                className="gap-1"
              >
                <UndoDot className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditMode(true)}
              className="gap-1"
            >
              <Edit2 className="h-4 w-4" />
              <span className="hidden sm:inline">Edit Values</span>
            </Button>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Share ROI Analysis</h4>
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={exportROIReport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={printROIReport}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={shareROIReport}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Report
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="quoteName" className="text-xs">Original Quote</Label>
              <Input 
                id="quoteName" 
                value={quoteName} 
                onChange={(e) => setQuoteName(e.target.value)} 
                className="h-8" 
                disabled={editMode}
              />
            </div>
            <div>
              <Label htmlFor="alternativeName" className="text-xs">Alternative Quote</Label>
              <Input 
                id="alternativeName" 
                value={alternativeName} 
                onChange={(e) => setAlternativeName(e.target.value)} 
                className="h-8" 
                disabled={editMode}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="timeframe" className="text-xs">Timeframe</Label>
            <Select 
              value={selectedTimeframe.toString()} 
              onValueChange={(value) => setSelectedTimeframe(parseInt(value))}
            >
              <SelectTrigger id="timeframe" className="w-[120px] h-8">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map((option) => (
                  <SelectItem key={option.months} value={option.months.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              id="comparison" 
              checked={scenarioComparison} 
              onCheckedChange={setScenarioComparison}
            />
            <Label htmlFor="comparison" className="text-xs">
              Compare Scenarios
            </Label>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <CircleDollarSign className="h-4 w-4 text-destructive" />
              Additional Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {editMode ? (
                <Input 
                  type="number" 
                  value={editedRoiData.costDifference} 
                  onChange={(e) => handleDataChange("costDifference", Number(e.target.value))}
                  className="h-10 text-3xl font-bold"
                />
              ) : (
                formatCurrency(roiData.costDifference)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost difference between quotes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Annual Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {editMode ? (
                <Input 
                  type="number" 
                  value={editedRoiData.annualSavings} 
                  onChange={(e) => handleDataChange("annualSavings", Number(e.target.value))}
                  className="h-10 text-3xl font-bold"
                />
              ) : (
                formatCurrency(roiData.annualSavings)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Operational savings per year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <CalendarClock className="h-4 w-4" />
              Payback Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {roiData.paybackPeriodMonths.toFixed(1)} <span className="text-base font-normal">months</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <p className="text-muted-foreground">
                Time to recover investment
              </p>
              <Badge variant={roiData.paybackPeriodMonths < 12 ? "default" : (roiData.paybackPeriodMonths < 24 ? "outline" : "secondary")}>
                {roiData.paybackPeriodMonths < 12 ? "Excellent" : (roiData.paybackPeriodMonths < 24 ? "Good" : "Average")}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
              5-Year Net Benefit
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <Info size={12} className="ml-1 inline-block opacity-70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Total savings over 5 years minus the additional investment cost
                    </p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(roiData.fiveYearSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net benefit over 5 years
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              <h3 className="font-medium">Cash Flow Analysis</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCashFlowView(cashFlowView === "chart" ? "data" : "chart")}
                className="gap-1 h-8"
              >
                {cashFlowView === "chart" ? (
                  <>
                    <BarChart4 className="h-4 w-4" />
                    <span>View Data</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span>View Chart</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleExpandSection('cash-flow')}
              >
                {expandedSections.includes('cash-flow') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <CardContent className={expandedSections.includes('cash-flow') ? 'pt-4' : 'pt-4 pb-4'}>
            {cashFlowView === "chart" ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={filteredCashFlow}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }} 
                      label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Cumulative Savings ($)', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative Savings']}
                      labelFormatter={(month) => `Month ${month}`}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    {/* Add a reference line at y=0 (break-even point) */}
                    <ReferenceLine y={0} stroke="gray" strokeDasharray="5 5" />
                    {/* Add a vertical line at break-even point */}
                    {breakEvenPoint > 0 && breakEvenPoint <= selectedTimeframe && (
                      <ReferenceLine 
                        x={breakEvenPoint} 
                        stroke={chartColors[3]} 
                        strokeWidth={2}
                        label={{ 
                          value: `Break-even: Month ${breakEvenPoint}`, 
                          position: 'top',
                          fill: chartColors[3],
                          fontSize: 12
                        }} 
                      />
                    )}
                    <Area 
                      type="monotone" 
                      dataKey="cumulativeSavings" 
                      stroke={chartColors[0]}
                      fillOpacity={1}
                      fill="url(#colorSavings)"
                      name="Cumulative Savings"
                      activeDot={{ r: 8, strokeWidth: 1 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="savings" 
                      stroke={chartColors[4]} 
                      dot={false}
                      name="Monthly Savings"
                      strokeDasharray="5 5"
                    />
                    {scenarioComparison && (
                      <Line 
                        type="monotone" 
                        dataKey={(entry) => {
                          const monthlyAltSavings = alternativeScenario.annualSavings / 12;
                          return (monthlyAltSavings * entry.month) - alternativeScenario.costDifference;
                        }}
                        stroke={chartColors[2]} 
                        dot={false}
                        strokeDasharray="3 3"
                        name="Alternative Scenario"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Month</th>
                      <th className="text-right py-2">Monthly Savings</th>
                      <th className="text-right py-2">Cumulative Savings</th>
                      {scenarioComparison && (
                        <th className="text-right py-2">Alt. Scenario</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCashFlow.map((entry, index) => {
                      // Calculate alternative scenario cumulative savings
                      const monthlyAltSavings = alternativeScenario.annualSavings / 12;
                      const altCumulativeSavings = (monthlyAltSavings * entry.month) - alternativeScenario.costDifference;
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-2">{entry.month}</td>
                          <td className="text-right py-2">{formatCurrency(entry.savings)}</td>
                          <td className={`text-right py-2 ${entry.cumulativeSavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                            {formatCurrency(entry.cumulativeSavings)}
                          </td>
                          {scenarioComparison && (
                            <td className={`text-right py-2 ${altCumulativeSavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                              {formatCurrency(altCumulativeSavings)}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {expandedSections.includes('cash-flow') && (
              <div className="mt-6">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Cash Flow Analysis</h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    The chart shows the monthly costs of both configurations and the resulting cumulative savings over time.
                    While {alternativeName} requires an additional investment of {formatCurrency(roiData.costDifference)}, it generates
                    consistent monthly savings of approximately {formatCurrency(roiData.annualSavings / 12)} per month.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Monthly Savings:</span>
                        <span className="text-sm font-medium">{formatCurrency(roiData.annualSavings / 12)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Annual Savings:</span>
                        <span className="text-sm font-medium">{formatCurrency(roiData.annualSavings)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Break-even Point:</span>
                        <span className="text-sm font-medium">{breakEvenPoint} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Break-even Year:</span>
                        <span className="text-sm font-medium">Year {Math.ceil(breakEvenPoint / 12)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">5-Year Net Savings:</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">{formatCurrency(roiData.fiveYearSavings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average Monthly Return:</span>
                        <span className="text-sm font-medium">{formatCurrency((roiData.fiveYearSavings) / 60)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
              <h3 className="font-medium">Benefits Breakdown</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setBenefitView(benefitView === "chart" ? "data" : "chart")}
                className="gap-1 h-8"
              >
                {benefitView === "chart" ? (
                  <>
                    <BarChart4 className="h-4 w-4" />
                    <span>View Data</span>
                  </>
                ) : (
                  <>
                    <PieChartIcon className="h-4 w-4" />
                    <span>View Chart</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleExpandSection('benefits')}
              >
                {expandedSections.includes('benefits') ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <CardContent className={expandedSections.includes('benefits') ? 'pt-4' : 'pt-4 pb-4'}>
            {benefitView === "chart" ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roiData.benefits}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="category"
                      label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {roiData.benefits.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Annual Savings']} />
                    <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Category</th>
                      <th className="text-right py-2">Annual Value</th>
                      <th className="text-right py-2">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roiData.benefits.map((benefit, index) => {
                      const percentage = (benefit.value / roiData.annualSavings) * 100;
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-2">{benefit.category}</td>
                          <td className="text-right py-2">{formatCurrency(benefit.value)}</td>
                          <td className="text-right py-2">{percentage.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                    <tr className="border-b font-bold">
                      <td className="py-2">Total</td>
                      <td className="text-right py-2">{formatCurrency(roiData.annualSavings)}</td>
                      <td className="text-right py-2">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            
            {expandedSections.includes('benefits') && (
              <div className="space-y-4 mt-6">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Benefit Analysis</h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    The primary benefits from {alternativeName} come from improved operational efficiency,
                    reduced maintenance costs, and increased productivity. Each benefit category contributes 
                    to the overall annual savings of {formatCurrency(roiData.annualSavings)}.
                  </p>
                  
                  <div className="space-y-4">
                    {roiData.benefits.map((benefit, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{benefit.category}</span>
                          <Badge className="bg-primary/10 text-primary border-0">
                            {formatCurrency(benefit.value)}/year
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{benefit.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart4 size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="costs" className="gap-1.5">
            <DollarSign size={16} />
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-1.5">
            <Scale size={16} />
            Performance
          </TabsTrigger>
          <TabsTrigger value="assumptions" className="gap-1.5">
            <Info size={16} />
            Assumptions
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-1.5">
            <FileText size={16} />
            Report
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ROI Summary</CardTitle>
              <CardDescription>Key financial metrics comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Investment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{quoteName}:</span>
                      <span className="font-medium">{formatCurrency(roiData.initialInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{alternativeName}:</span>
                      <span className="font-medium">{formatCurrency(roiData.alternativeInvestment)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-muted-foreground">Additional Investment:</span>
                      <span className="font-medium text-destructive">{formatCurrency(roiData.costDifference)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-center mt-2" 
                    size="sm"
                    onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                  >
                    {showCostBreakdown ? (
                      <>
                        <ChevronUp className="mr-1 h-4 w-4" />
                        Hide Cost Breakdown
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-4 w-4" />
                        Show Cost Breakdown
                      </>
                    )}
                  </Button>
                  
                  {showCostBreakdown && (
                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-medium">Cost Breakdown</p>
                      <div className="bg-muted/20 p-3 rounded-md space-y-2">
                        {roiData.costs.map((cost, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span>{cost.category}</span>
                            <span className={cost.difference > 0 ? 'text-destructive' : cost.difference < 0 ? 'text-green-600 dark:text-green-400' : ''}>
                              {formatCurrency(cost.difference)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Return Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Savings:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(roiData.annualSavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payback Period:</span>
                      <span className="font-medium">{roiData.paybackPeriodMonths.toFixed(1)} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Return on Investment (ROI):</span>
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium flex items-center">
                              {Math.round(roi)}%
                              <Info className="h-3 w-3 ml-1 opacity-50" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">5-year net benefit divided by additional investment</p>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Internal Rate of Return (IRR):</span>
                      <span className="font-medium">{Math.round(roiData.irr)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Present Value (NPV):</span>
                      <span className="font-medium">{formatCurrency(roiData.npv)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost-Benefit Ratio:</span>
                      <span className="font-medium">{costBenefitRatio.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Timeline Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Break-even Point:</span>
                      <span className="font-medium">{breakEvenPoint} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">1-Year Net Benefit:</span>
                      <span className={`font-medium ${(roiData.annualSavings - roiData.costDifference) > 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                        {formatCurrency(roiData.annualSavings - roiData.costDifference)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">3-Year Net Benefit:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency((roiData.annualSavings * 3) - roiData.costDifference)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">5-Year Net Benefit:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(roiData.fiveYearSavings)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="bg-muted/20 p-3 rounded-md">
                      <h4 className="text-sm font-medium mb-1">Monthly Cost Comparison</h4>
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between">
                          <span>{quoteName}:</span>
                          <span>{formatCurrency(roiData.initialInvestment / 60 + 150)}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{alternativeName}:</span>
                          <span>{formatCurrency(roiData.alternativeInvestment / 60 + 100)}/month</span>
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between">
                          <span>Monthly Savings:</span>
                          <span className="text-green-600 dark:text-green-400">
                            {formatCurrency(roiData.annualSavings / 12)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Key ROI Drivers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-primary/10 text-primary border-0">Primary</Badge>
                        <h4 className="font-medium">Reduced Operating Costs</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alternativeName} reduces ongoing operational expenses through lower power 
                        consumption (21% reduction) and decreased maintenance requirements. This 
                        accounts for approximately {formatCurrency(roiData.benefits[0].value)} in 
                        annual savings.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-primary/10 text-primary border-0">Secondary</Badge>
                        <h4 className="font-medium">Enhanced Productivity</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Improved network performance translates to enhanced workforce productivity 
                        with fewer disruptions and faster application response times. This generates 
                        approximately {formatCurrency(roiData.benefits[2].value)} in annual productivity gains.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-primary/10 text-primary border-0">Key Benefit</Badge>
                        <h4 className="font-medium">Extended Equipment Lifecycle</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alternativeName} includes current-generation equipment with a 67% longer 
                        expected lifespan compared to {quoteName}, reducing future capital expenditures 
                        and providing an extended useful life of the investment.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-primary/10 text-primary border-0">Strategic Value</Badge>
                        <h4 className="font-medium">Future-Proofing</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The solution's scalability and compatibility with emerging technologies 
                        provides strategic value by extending the investment's viability and 
                        reducing the risk of premature obsolescence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Recommendation</h3>
                <div className="rounded-lg border border-primary/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ThumbsUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Proceed with {alternativeName}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on the comprehensive analysis of costs, benefits, and performance metrics,
                        we strongly recommend proceeding with {alternativeName}. The additional investment
                        of {formatCurrency(roiData.costDifference)} will be recovered in less than {Math.ceil(roiData.paybackPeriodMonths)} months,
                        after which the solution will continue to generate positive returns throughout its
                        operational lifetime.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Comparison</CardTitle>
              <CardDescription>Detailed breakdown of costs by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={roiData.costs}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="initialQuote" name={quoteName} fill={chartColors[0]} />
                    <Bar dataKey="recommendedQuote" name={alternativeName} fill={chartColors[1]} />
                    {scenarioComparison && (
                      <Bar 
                        dataKey={(entry) => entry.recommendedQuote * 0.9} 
                        name="Alternative Scenario" 
                        fill={chartColors[2]} 
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Category</th>
                      <th className="text-right py-2">{quoteName}</th>
                      <th className="text-right py-2">{alternativeName}</th>
                      <th className="text-right py-2">Difference</th>
                      {scenarioComparison && (
                        <th className="text-right py-2">Alt. Scenario</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {roiData.costs.map((cost, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">{cost.category}</td>
                        <td className="text-right py-2">{formatCurrency(cost.initialQuote)}</td>
                        <td className="text-right py-2">{formatCurrency(cost.recommendedQuote)}</td>
                        <td className={`text-right py-2 ${cost.difference > 0 ? 'text-destructive' : cost.difference < 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                          {cost.difference > 0 && '+'}
                          {formatCurrency(cost.difference)}
                        </td>
                        {scenarioComparison && (
                          <td className="text-right py-2">
                            {formatCurrency(cost.recommendedQuote * 0.9)}
                          </td>
                        )}
                      </tr>
                    ))}
                    <tr className="border-b font-bold">
                      <td className="py-2">Total</td>
                      <td className="text-right py-2">{formatCurrency(roiData.initialInvestment)}</td>
                      <td className="text-right py-2">{formatCurrency(roiData.alternativeInvestment)}</td>
                      <td className={`text-right py-2 ${roiData.costDifference > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                        {roiData.costDifference > 0 && '+'}
                        {formatCurrency(roiData.costDifference)}
                      </td>
                      {scenarioComparison && (
                        <td className="text-right py-2">
                          {formatCurrency(roiData.alternativeInvestment * 0.9)}
                        </td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cost Analysis</h3>
                    <p className="text-muted-foreground">
                      {alternativeName} requires an additional investment of {formatCurrency(roiData.costDifference)} compared to {quoteName}.
                      The main differences are in software licenses (+{formatCurrency(roiData.costs[1].difference)}) and hardware 
                      (+{formatCurrency(roiData.costs[0].difference)}), partially offset by reduced installation costs 
                      ({formatCurrency(roiData.costs[2].difference)}). These additional costs are justified by the significant 
                      operational benefits and improved performance metrics.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Total Cost of Ownership</h3>
                    <div className="rounded-lg bg-muted/20 p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">5-Year TCO ({quoteName}):</span>
                          <span className="font-medium">
                            {formatCurrency(roiData.initialInvestment + 1800 * 5)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">5-Year TCO ({alternativeName}):</span>
                          <span className="font-medium">
                            {formatCurrency(roiData.alternativeInvestment + 1200 * 5)}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-sm">TCO Difference:</span>
                          <span className={`font-medium ${(roiData.alternativeInvestment + 1200 * 5) - (roiData.initialInvestment + 1800 * 5) < 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                            {formatCurrency((roiData.alternativeInvestment + 1200 * 5) - (roiData.initialInvestment + 1800 * 5))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Life Cycle Cost Analysis</CardTitle>
              <CardDescription>Costs over the complete product lifecycle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={Array.from({ length: 5 }, (_, i) => ({
                      year: i + 1,
                      // Maintenance costs increase over time for Quote A
                      quoteAMaintenance: 1800 + (i * 200),
                      // Maintenance costs remain stable for Quote B
                      quoteBMaintenance: 1200,
                      // Both quotes have one-time capital costs in year 1
                      quoteACapital: i === 0 ? roiData.initialInvestment : 0,
                      quoteBCapital: i === 0 ? roiData.alternativeInvestment : 0,
                      // Include upgrade costs in year 3 for Quote A
                      quoteAUpgrade: i === 2 ? 2500 : 0,
                      quoteBUpgrade: 0,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="quoteACapital" stackId="a" name={`${quoteName} Capital`} fill={chartColors[0]} />
                    <Bar dataKey="quoteAMaintenance" stackId="a" name={`${quoteName} Maintenance`} fill={chartColors[0]} fillOpacity={0.5} />
                    <Bar dataKey="quoteAUpgrade" stackId="a" name={`${quoteName} Upgrades`} fill={chartColors[0]} fillOpacity={0.3} />
                    <Bar dataKey="quoteBCapital" stackId="b" name={`${alternativeName} Capital`} fill={chartColors[1]} />
                    <Bar dataKey="quoteBMaintenance" stackId="b" name={`${alternativeName} Maintenance`} fill={chartColors[1]} fillOpacity={0.5} />
                    <Bar dataKey="quoteBUpgrade" stackId="b" name={`${alternativeName} Upgrades`} fill={chartColors[1]} fillOpacity={0.3} />
                    <Line
                      type="monotone"
                      dataKey={(entry) => {
                        // Calculate cumulative costs for Quote A
                        const cumQuoteA = (entry.quoteACapital || 0) +
                                          (entry.quoteAMaintenance || 0) +
                                          (entry.quoteAUpgrade || 0);
                        // Calculate cumulative costs for Quote B
                        const cumQuoteB = (entry.quoteBCapital || 0) +
                                          (entry.quoteBMaintenance || 0) +
                                          (entry.quoteBUpgrade || 0);
                        // Return the difference
                        return cumQuoteB - cumQuoteA;
                      }}
                      name="Cumulative Cost Difference"
                      stroke={chartColors[4]}
                      strokeWidth={2}
                      dot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Life Cycle Analysis</h3>
                <p className="text-muted-foreground">
                  While {alternativeName} requires a higher initial investment, its total cost of ownership over 5 years is actually
                  {(roiData.alternativeInvestment + 1200 * 5) - (roiData.initialInvestment + 1800 * 5) < 0 ? ' lower' : ' comparable'}. 
                  The {quoteName} solution would likely require a major upgrade in year 3, which is not accounted for in the base price. 
                  When factoring in all costs over the 5-year lifecycle, {alternativeName} proves to be the more economical choice.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Lifecycle Considerations</h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-start gap-2">
                        <Wrench className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>Annual maintenance requirements are 33% lower with {alternativeName}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>Expected equipment lifetime is 2 years longer with {alternativeName}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>No major upgrades required during the 5-year period for {alternativeName}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>Lower energy consumption reduces ongoing operational costs</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Cumulative 5-Year Costs</h4>
                    <div className="rounded-lg border p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{quoteName} Total:</span>
                          <span>
                            {formatCurrency(roiData.initialInvestment + (1800 * 5) + 2500)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{alternativeName} Total:</span>
                          <span>
                            {formatCurrency(roiData.alternativeInvestment + (1200 * 5))}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm font-medium">
                          <span>Lifecycle Savings:</span>
                          <span className="text-green-600 dark:text-green-400">
                            {formatCurrency((roiData.initialInvestment + (1800 * 5) + 2500) - (roiData.alternativeInvestment + (1200 * 5)))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center">
                <Scale className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Performance Metrics Comparison</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setMetricView(metricView === "chart" ? "data" : "chart")}
                  className="gap-1 h-8"
                >
                  {metricView === "chart" ? (
                    <>
                      <BarChart4 className="h-4 w-4" />
                      <span>View Data</span>
                    </>
                  ) : (
                    <>
                      <Scale className="h-4 w-4" />
                      <span>View Chart</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleExpandSection('metrics')}
                >
                  {expandedSections.includes('metrics') ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <CardContent className={expandedSections.includes('metrics') ? 'pt-4' : 'pt-4 pb-4'}>
              {metricView === "chart" ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={roiData.metrics}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const metric = roiData.metrics.find(m => m.name === props.payload.name);
                          return [`${value} ${metric?.unit || ''}`, name];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="initialQuote" name={quoteName} fill={chartColors[0]} />
                      <Bar dataKey="recommendedQuote" name={alternativeName} fill={chartColors[1]} />
                      {scenarioComparison && (
                        <Bar 
                          dataKey={(entry) => Math.round(entry.recommendedQuote * 0.9)} 
                          name="Alternative Scenario" 
                          fill={chartColors[2]} 
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Metric</th>
                        <th className="text-right py-2">{quoteName}</th>
                        <th className="text-right py-2">{alternativeName}</th>
                        <th className="text-right py-2">Improvement</th>
                        {scenarioComparison && (
                          <th className="text-right py-2">Alt. Scenario</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {roiData.metrics.map((metric, i) => {
                        const diff = metric.recommendedQuote - metric.initialQuote;
                        const percentChange = (diff / metric.initialQuote) * 100;
                        const isPositive = metric.higherIsBetter ? diff > 0 : diff < 0;
                        
                        return (
                          <tr key={i} className="border-b">
                            <td className="py-2">
                              <div className="font-medium">{metric.name}</div>
                              <div className="text-xs text-muted-foreground">{metric.description}</div>
                            </td>
                            <td className="text-right py-2">{metric.initialQuote} {metric.unit}</td>
                            <td className="text-right py-2">{metric.recommendedQuote} {metric.unit}</td>
                            <td className={`text-right py-2 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                              {percentChange > 0 && '+'}
                              {Math.abs(percentChange).toFixed(0)}%
                            </td>
                            {scenarioComparison && (
                              <td className="text-right py-2">
                                {Math.round(metric.recommendedQuote * 0.9)} {metric.unit}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              {expandedSections.includes('metrics') && (
                <div className="space-y-6 mt-6">
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Performance Analysis</h4>
                    <p className="text-muted-foreground text-sm">
                      {alternativeName} offers significant performance improvements over {quoteName} across key metrics.
                      Network throughput is 2.5x higher, client capacity is doubled, and power consumption is reduced by 21%.
                      These improvements directly contribute to better user experience, reduced operational costs, and longer 
                      useful life of the equipment.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Business Impact by Performance Category</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Performance Improvements
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Network Throughput</span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">+150%</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Directly impacts application responsiveness and user productivity
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Client Capacity</span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">+100%</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Enables support for more devices and future growth
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Expected Lifetime</span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">+67%</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Reduces frequency of capital refreshes and extends investment value
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CircleDollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            Cost Reductions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Power Consumption</span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">-21%</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Reduces energy costs and improves sustainability
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Annual Maintenance</span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">-33%</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Lowers ongoing support costs and service requirements
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">5-Year TCO</span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">-12%</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Reduces overall cost of ownership over the solution lifetime
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Comparative Business Impact Analysis</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            type="number" 
                            dataKey="x" 
                            name="Performance" 
                            domain={[0, 10]}
                            label={{ value: 'Performance Rating', position: 'bottom' }}
                          />
                          <YAxis 
                            type="number" 
                            dataKey="y" 
                            name="Cost" 
                            domain={[0, 10]}
                            label={{ value: 'Cost Efficiency', angle: -90, position: 'insideLeft' }}
                          />
                          <ZAxis 
                            type="number" 
                            dataKey="z" 
                            range={[60, 400]} 
                            name="Business Impact" 
                          />
                          <Tooltip 
                            formatter={(value, name) => {
                              if (name === "Business Impact") return [`${value} impact points`, name];
                              return [`${value}/10`, name];
                            }}
                          />
                          <Legend />
                          <Scatter 
                            name={quoteName} 
                            data={[{ x: 4.5, y: 5.2, z: 100, name: quoteName }]} 
                            fill={chartColors[0]}
                          />
                          <Scatter 
                            name={alternativeName} 
                            data={[{ x: 8.5, y: 7.5, z: 300, name: alternativeName }]} 
                            fill={chartColors[1]}
                          />
                          {scenarioComparison && (
                            <Scatter 
                              name="Alternative Scenario" 
                              data={[{ x: 7.2, y: 8.2, z: 200, name: "Alternative Scenario" }]} 
                              fill={chartColors[2]}
                            />
                          )}
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      Bubble size represents overall business impact. {alternativeName} provides significantly higher 
                      business value through superior performance and better cost efficiency.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Strategic Business Value</CardTitle>
              <CardDescription>
                Qualitative benefits beyond measurable metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="rounded-full bg-primary/10 h-12 w-12 flex items-center justify-center mx-auto">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-center">Scalability</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {alternativeName} provides 3x better scalability for future growth, enabling seamless 
                    expansion without forklift upgrades. This reduces future capital expenditures and 
                    minimizes disruption during growth phases.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="rounded-full bg-primary/10 h-12 w-12 flex items-center justify-center mx-auto">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-center">Competitive Advantage</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Enhanced network performance translates to better customer experiences and faster response times. 
                    Organizations with superior network infrastructure gain competitive advantages through 
                    improved customer satisfaction and operational agility.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="rounded-full bg-primary/10 h-12 w-12 flex items-center justify-center mx-auto">
                    <Percent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-center">Risk Reduction</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Current-generation equipment reduces security vulnerabilities and unplanned downtime risk. 
                    The solution includes enhanced security features and more reliable components, 
                    minimizing business disruption potential.
                  </p>
                </div>
              </div>
              
              {/* Qualitative Benefits Matrix */}
              <div className="mt-8">
                <h3 className="font-medium mb-4">Qualitative Benefit Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Benefit Category</th>
                        <th className="text-center py-2">{quoteName}</th>
                        <th className="text-center py-2">{alternativeName}</th>
                        <th className="text-left py-2">Business Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          category: "Future-Proofing",
                          quoteA: "Limited",
                          quoteB: "Excellent",
                          impact: "Reduces need for premature refreshes and extends investment lifespan",
                        },
                        {
                          category: "Reliability",
                          quoteA: "Good",
                          quoteB: "Excellent",
                          impact: "Minimizes network downtime and improves business continuity",
                        },
                        {
                          category: "Security",
                          quoteA: "Basic",
                          quoteB: "Advanced",
                          impact: "Protects against evolving threats and reduces breach risks",
                        },
                        {
                          category: "Supportability",
                          quoteA: "Standard",
                          quoteB: "Enhanced",
                          impact: "Easier to maintain and troubleshoot, reducing IT burden",
                        },
                        {
                          category: "Innovation Enablement",
                          quoteA: "Limited",
                          quoteB: "High",
                          impact: "Supports deployment of emerging technologies and applications",
                        },
                      ].map((row, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2 font-medium">{row.category}</td>
                          <td className="text-center py-2">
                            <Badge variant="outline" className={
                              row.quoteA === "Excellent" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                              row.quoteA === "Good" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                              row.quoteA === "Standard" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                              "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }>
                              {row.quoteA}
                            </Badge>
                          </td>
                          <td className="text-center py-2">
                            <Badge variant="outline" className={
                              row.quoteB === "Excellent" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                              row.quoteB === "Good" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                              row.quoteB === "Standard" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                              "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }>
                              {row.quoteB}
                            </Badge>
                          </td>
                          <td className="py-2 text-sm text-muted-foreground">{row.impact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assumptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ROI Calculation Assumptions</CardTitle>
              <CardDescription>
                Underlying assumptions used in the analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Financial Assumptions</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Discount Rate:</span>
                        <span>5% annually</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used for NPV calculation, reflecting the time value of money and risk
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Analysis Period:</span>
                        <span>5 years (60 months)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Standard timeframe for networking equipment lifecycle
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Capital Depreciation:</span>
                        <span>Straight-line, 5 years</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Accounting method for depreciating the hardware investment
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Tax Rate:</span>
                        <span>25%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used to calculate after-tax cash flows
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Inflation Rate:</span>
                        <span>3% annually</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied to operational costs and maintenance
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Operational Assumptions</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Productivity Improvement:</span>
                        <span>1.5 hours per employee per month</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Time saved due to improved network performance
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Average Employee Cost:</span>
                        <span>$50 per hour</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Fully loaded employee cost including benefits
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Downtime Reduction:</span>
                        <span>4 hours per year</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Reduction in network outages and service disruptions
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Downtime Cost:</span>
                        <span>$800 per hour</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cost of lost productivity during network outages
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Energy Cost:</span>
                        <span>$0.15 per kWh</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cost of electricity for powering network equipment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Sensitivity Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  This analysis shows how the ROI and payback period are affected by changes in key assumptions.
                  It helps understand the robustness of the investment decision under different scenarios.
                </p>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="changePercentage" 
                        domain={[-50, 50]} 
                        tickCount={5}
                        label={{ value: 'Parameter Change (%)', position: 'bottom' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        label={{ value: 'Payback Period (months)', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        label={{ value: 'ROI (%)', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip formatter={(value) => [`${value}`, '']} />
                      <Legend />
                      
                      {/* Payback period sensitivity to annual savings */}
                      <Line
                        yAxisId="left"
                        name="Payback Period (Savings)"
                        data={[
                          { changePercentage: -50, value: roiData.costDifference / (roiData.annualSavings * 0.5 / 12) },
                          { changePercentage: -25, value: roiData.costDifference / (roiData.annualSavings * 0.75 / 12) },
                          { changePercentage: 0, value: roiData.paybackPeriodMonths },
                          { changePercentage: 25, value: roiData.costDifference / (roiData.annualSavings * 1.25 / 12) },
                          { changePercentage: 50, value: roiData.costDifference / (roiData.annualSavings * 1.5 / 12) },
                        ]}
                        dataKey="value"
                        stroke={chartColors[0]}
                        dot={{ strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      
                      {/* Payback period sensitivity to cost difference */}
                      <Line
                        yAxisId="left"
                        name="Payback Period (Cost)"
                        data={[
                          { changePercentage: -50, value: roiData.costDifference * 0.5 / (roiData.annualSavings / 12) },
                          { changePercentage: -25, value: roiData.costDifference * 0.75 / (roiData.annualSavings / 12) },
                          { changePercentage: 0, value: roiData.paybackPeriodMonths },
                          { changePercentage: 25, value: roiData.costDifference * 1.25 / (roiData.annualSavings / 12) },
                          { changePercentage: 50, value: roiData.costDifference * 1.5 / (roiData.annualSavings / 12) },
                        ]}
                        dataKey="value"
                        stroke={chartColors[1]}
                        strokeDasharray="3 3"
                        dot={{ strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      
                      {/* ROI sensitivity to annual savings */}
                      <Line
                        yAxisId="right"
                        name="ROI (Savings)"
                        data={[
                          { changePercentage: -50, value: (roiData.annualSavings * 0.5 * 5 - roiData.costDifference) / roiData.costDifference * 100 },
                          { changePercentage: -25, value: (roiData.annualSavings * 0.75 * 5 - roiData.costDifference) / roiData.costDifference * 100 },
                          { changePercentage: 0, value: (roiData.annualSavings * 5 - roiData.costDifference) / roiData.costDifference * 100 },
                          { changePercentage: 25, value: (roiData.annualSavings * 1.25 * 5 - roiData.costDifference) / roiData.costDifference * 100 },
                          { changePercentage: 50, value: (roiData.annualSavings * 1.5 * 5 - roiData.costDifference) / roiData.costDifference * 100 },
                        ]}
                        dataKey="value"
                        stroke={chartColors[4]}
                        dot={{ strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Sensitivities</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>
                          <strong>Annual Savings:</strong> A 25% reduction in expected annual savings would 
                          increase the payback period to {(roiData.costDifference / (roiData.annualSavings * 0.75 / 12)).toFixed(1)} months
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>
                          <strong>Initial Cost:</strong> A 25% increase in the cost difference would 
                          increase the payback period to {(roiData.costDifference * 1.25 / (roiData.annualSavings / 12)).toFixed(1)} months
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-1 text-muted-foreground" />
                        <span>
                          <strong>Break-even Threshold:</strong> Annual savings would need to drop 
                          below {formatCurrency((roiData.costDifference / 24) * 12)} (a {Math.round((1 - ((roiData.costDifference / 24) * 12) / roiData.annualSavings) * 100)}% reduction) 
                          to push payback beyond 2 years
                        </span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Risk-Adjusted Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Base ROI:</span>
                        <span className="text-sm font-medium">{Math.round(roi)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Risk-Adjusted ROI (80% confidence):</span>
                        <span className="text-sm font-medium">{Math.round(riskAdjustedROI)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Base Payback Period:</span>
                        <span className="text-sm font-medium">{roiData.paybackPeriodMonths.toFixed(1)} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Conservative Payback Period:</span>
                        <span className="text-sm font-medium">{(roiData.paybackPeriodMonths * 1.2).toFixed(1)} months</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="report" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none dark:prose-invert">
                <h3>Investment Value Analysis</h3>
                <p>
                  This analysis compares the financial and operational impacts of two networking solutions:
                  {quoteName} and {alternativeName}. While {alternativeName} requires an additional upfront investment
                  of {formatCurrency(roiData.costDifference)}, this report demonstrates how this premium delivers
                  substantial returns through operational savings, improved performance, and extended equipment lifespan.
                </p>
                
                <h3>Key Financial Findings</h3>
                <ul>
                  <li><strong>Initial Investment Gap:</strong> {formatCurrency(roiData.costDifference)}</li>
                  <li><strong>Annual Operational Savings:</strong> {formatCurrency(roiData.annualSavings)}</li>
                  <li><strong>Payback Period:</strong> {roiData.paybackPeriodMonths.toFixed(1)} months</li>
                  <li><strong>5-Year Net Benefit:</strong> {formatCurrency(roiData.fiveYearSavings)}</li>
                  <li><strong>Internal Rate of Return (IRR):</strong> {Math.round(roiData.irr)}%</li>
                </ul>
                
                <h3>Performance Improvements</h3>
                <p>
                  {alternativeName} delivers substantial operational benefits, including:
                </p>
                <ul>
                  <li>2.5x higher network throughput</li>
                  <li>2x more concurrent wireless clients</li>
                  <li>21% reduction in power consumption</li>
                  <li>67% longer expected equipment lifespan</li>
                  <li>33% lower annual maintenance costs</li>
                </ul>
                
                <h3>Recommendation</h3>
                <p>
                  Based on the comprehensive analysis of costs, benefits, and performance metrics,
                  we strongly recommend proceeding with {alternativeName}. The additional investment
                  will be recovered in less than 1 year, after which the solution will continue to
                  generate positive returns throughout its operational lifetime. The performance improvements
                  will also support future growth and changing technology requirements, protecting your
                  investment for years to come.
                </p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" className="gap-1" onClick={printROIReport}>
                  <Printer size={16} />
                  Print Report
                </Button>
                <Button variant="outline" className="gap-1" onClick={exportROIReport}>
                  <Download size={16} />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Business Case Summary</CardTitle>
              <CardDescription>Complete analysis findings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Project Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Project:</span>
                        <span className="text-sm font-medium">Network Infrastructure Upgrade</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Options Compared:</span>
                        <span className="text-sm font-medium">{quoteName} vs. {alternativeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Investment ({alternativeName}):</span>
                        <span className="text-sm font-medium">{formatCurrency(roiData.alternativeInvestment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Incremental Investment:</span>
                        <span className="text-sm font-medium">{formatCurrency(roiData.costDifference)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Expected Lifespan:</span>
                        <span className="text-sm font-medium">5+ years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Implementation Timeframe:</span>
                        <span className="text-sm font-medium">4-6 weeks</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Decision Deadline:</span>
                        <span className="text-sm font-medium">End of Q2 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Business Stakeholders:</span>
                        <span className="text-sm font-medium">IT, Finance, Operations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Strategic Alignment</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 text-green-600 dark:text-green-400" />
                      <span className="text-sm">
                        <strong>Digital Transformation Support:</strong> Enhanced infrastructure capabilities 
                        align with broader digital transformation initiatives
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 text-green-600 dark:text-green-400" />
                      <span className="text-sm">
                        <strong>Operational Excellence:</strong> Improved reliability and performance 
                        support operational optimization goals
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 text-green-600 dark:text-green-400" />
                      <span className="text-sm">
                        <strong>IT Modernization:</strong> Current-generation equipment addresses 
                        technical debt and modernizes infrastructure
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-1 text-green-600 dark:text-green-400" />
                      <span className="text-sm">
                        <strong>Sustainability Goals:</strong> Reduced power consumption supports 
                        corporate sustainability objectives
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Risk Assessment</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Low Risk</Badge>
                      <span className="text-sm font-medium">Implementation Risks</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Standardized deployment with experienced implementation team mitigates risks. 
                      Phased cutover strategy ensures minimal business disruption.
                    </p>
                    
                    <div className="flex items-center gap-2 mb-1 mt-3">
                      <Badge variant="outline">Low Risk</Badge>
                      <span className="text-sm font-medium">Financial Risks</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Even with conservative estimates (80% of projected savings), 
                      the investment still yields positive returns within 18 months.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Project Timeline & Milestones</h3>
                <div className="relative overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-3">
                        <div className="h-12 bg-primary/10 rounded-md flex items-center justify-center text-xs font-medium">
                          Project Approval
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="h-12 bg-primary/10 rounded-md flex items-center justify-center text-xs font-medium">
                          Procurement
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="h-12 bg-primary/10 rounded-md flex items-center justify-center text-xs font-medium">
                          Implementation
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="h-12 bg-primary/10 rounded-md flex items-center justify-center text-xs font-medium">
                          Testing
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="h-12 bg-primary/10 rounded-md flex items-center justify-center text-xs font-medium">
                          Handover
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Week 1</span>
                      <span>Week 2</span>
                      <span>Week 4</span>
                      <span>Week 6</span>
                      <span>Week 8</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Decision Recommendation</h3>
                <div className="rounded-lg bg-primary/10 p-4 border border-primary">
                  <div className="flex items-start gap-3">
                    <ThumbsUp className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Proceed with {alternativeName}</p>
                      <p className="text-sm mt-2">
                        The compelling financial and operational benefits make {alternativeName} the clear 
                        choice for this investment. With a payback period of {roiData.paybackPeriodMonths.toFixed(1)} months 
                        and 5-year savings of {formatCurrency(roiData.fiveYearSavings)}, the investment is 
                        strongly justified. The superior performance, extended lifespan, and enhanced 
                        capabilities provide both immediate returns and long-term strategic value.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}