import { sampleEosSKUs, compatibilityRules, licensingRules } from './initial-data';

// Define common failure patterns for quick identification
const FAILURE_PATTERNS = {
  POWER_BUDGET_EXCEEDED: 'power_budget_exceeded',
  MISSING_CONTROLLER: 'missing_controller',
  MISSING_LICENSES: 'missing_licenses',
  INCOMPATIBLE_COMPONENTS: 'incompatible_components',
  EOS_PRODUCT: 'eos_product',
  MISSING_POWER_SOURCE: 'missing_power_source',
  INSUFFICIENT_PORTS: 'insufficient_ports',
  INCOMPLETE_CONFIGURATION: 'incomplete_configuration',
};

// Enhanced validation result type with more detailed information
type ValidationResult = {
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

export function validateQuote(quoteText: string): ValidationResult {
  // Initialize the result with enhanced fields
  const result: ValidationResult = {
    valid: true,
    issues: [],
    suggestedItems: [],
    confidence: 0.9,
    patterns: [],
  };

  // Parse the quote text to extract SKUs
  const skus = extractSKUs(quoteText);
  
  // Check for End-of-Sale SKUs
  checkForEosSKUs(skus, result);
  
  // Check for compatibility issues
  checkCompatibility(skus, result);
  
  // Check for missing components
  checkForMissingComponents(skus, result);
  
  // Check for licensing issues
  checkLicensing(skus, result);

  // Enhanced check for power budget
  checkPowerBudget(skus, result);
  
  // Check for port requirements
  checkPortRequirements(skus, result);

  // New: Analyze for redundancy
  analyzeRedundancy(skus, result);

  // New: Analyze for performance bottlenecks
  analyzePerformanceBottlenecks(skus, result);
  
  // New: Generate optimization suggestions
  generateOptimizationSuggestions(skus, result);

  // Generate troubleshooting steps based on identified issues
  generateTroubleshootingSteps(result);
  
  // Identify common failure patterns
  identifyFailurePatterns(result);
  
  // Adjust confidence based on issues
  result.confidence = calculateConfidence(result.issues);
  
  // Set overall validity
  result.valid = result.issues.filter(i => i.severity === 'high').length === 0;
  
  return result;
}

function extractSKUs(quoteText: string): string[] {
  // Enhanced extraction with more patterns
  const skuPattern = /(AP-\d+|SW-\d+[P]?(?:-\d+)?|CTRL-V\d|RTR-[45]G-\d|POE-INJ\d|LIC-[A-Z]+-\d+(?:YR)?|CAB-[A-Z]+-\d+[M]?|SFP-\d+G-[A-Z]+|CLOUD-[A-Z]+)/g;
  const matches = quoteText.match(skuPattern) || [];
  return Array.from(new Set(matches)); // Remove duplicates
}

function checkForEosSKUs(skus: string[], result: ValidationResult) {
  skus.forEach(sku => {
    const eosItem = sampleEosSKUs.find(item => item.sku === sku);
    if (eosItem) {
      result.issues.push({
        type: 'EOS_SKU',
        description: `${sku} is end-of-sale since ${eosItem.eosDate}`,
        severity: 'high',
        suggestion: `Replace with ${eosItem.replacement}`,
        impact: "Using end-of-sale products can lead to support issues and limited future compatibility",
        itemsAffected: [sku]
      });
      
      result.suggestedItems?.push({
        sku: eosItem.replacement,
        reason: `Replacement for end-of-sale ${sku}`,
        details: "Current generation product with improved performance and longer support lifecycle",
        compatibility: skus.filter(s => s !== sku)
      });
    }
  });
}

function checkCompatibility(skus: string[], result: ValidationResult) {
  // Check if APs are compatible with controllers
  const aps = skus.filter(sku => sku.startsWith('AP-'));
  const controllers = skus.filter(sku => sku.startsWith('CTRL-'));
  
  aps.forEach(ap => {
    const apConfig = compatibilityRules[ap as keyof typeof compatibilityRules];
    if (apConfig) {
      controllers.forEach(ctrl => {
        if ('compatibleControllers' in apConfig && apConfig.compatibleControllers && !apConfig.compatibleControllers.includes(ctrl)) {
          result.issues.push({
            type: 'INCOMPATIBLE_COMPONENTS',
            description: `${ap} is not compatible with ${ctrl}`,
            severity: 'high',
            suggestion: `Use one of these controllers instead: ${apConfig.compatibleControllers.join(', ')}`,
            impact: "Incompatible components will not function together, resulting in network failure",
            itemsAffected: [ap, ctrl]
          });
          
          // Add recommended controller as a suggestion
          if (apConfig.compatibleControllers.length > 0) {
            result.suggestedItems?.push({
              sku: apConfig.compatibleControllers[0],
              reason: `Compatible controller for ${ap}`,
              details: "This controller is fully compatible with your chosen access points",
              compatibility: [...aps, ...skus.filter(s => !s.startsWith('CTRL-'))]
            });
          }
        }
      });
    }
  });
}

function checkPowerBudget(skus: string[], result: ValidationResult) {
  // Check PoE power budget with more detailed calculations
  const aps = skus.filter(sku => sku.startsWith('AP-'));
  const switches = skus.filter(sku => sku.startsWith('SW-') && sku.includes('P'));
  
  if (aps.length > 0 && switches.length > 0) {
    let totalPowerNeeded = 0;
    let totalPowerAvailable = 0;
    let switchPortsAvailable = 0;
    
    aps.forEach(ap => {
      const apConfig = compatibilityRules[ap as keyof typeof compatibilityRules];
      if (apConfig && 'powerConsumption' in apConfig) {
        totalPowerNeeded += apConfig.powerConsumption * 1.2; // Add 20% margin for safety
      }
    });
    
    switches.forEach(sw => {
      const swConfig = compatibilityRules[sw as keyof typeof compatibilityRules];
      if (swConfig && 'powerBudget' in swConfig) {
        totalPowerAvailable += swConfig.powerBudget;
        switchPortsAvailable += swConfig.ports;
      }
    });
    
    // Check if power budget is exceeded
    if (totalPowerNeeded > totalPowerAvailable) {
      result.issues.push({
        type: 'POWER_BUDGET_EXCEEDED',
        description: `Power budget exceeded: ${Math.round(totalPowerNeeded)}W required, ${totalPowerAvailable}W available`,
        severity: 'medium',
        suggestion: 'Add additional PoE switch or reduce the number of power-hungry devices',
        impact: "Devices may not power on or function correctly when PoE budget is exceeded",
        itemsAffected: [...aps, ...switches]
      });
      
      // Calculate how many additional switches are needed
      const additionalPowerNeeded = totalPowerNeeded - totalPowerAvailable;
      const recommendedSwitch = 'SW-24P'; // Example recommended switch
      const switchConfig = compatibilityRules['SW-24P' as keyof typeof compatibilityRules];
      
      if (switchConfig && 'powerBudget' in switchConfig) {
        const switchesNeeded = Math.ceil(additionalPowerNeeded / switchConfig.powerBudget);
        
        result.suggestedItems?.push({
          sku: recommendedSwitch,
          reason: `Additional PoE switch to provide ${Math.round(additionalPowerNeeded)}W more power`,
          details: `${switchesNeeded} additional switch(es) recommended to meet power requirements`,
          compatibility: [...aps, ...switches]
        });
      }
    }
    
    // Check power budget utilization (warning if > 80%)
    const utilizationPercentage = (totalPowerNeeded / totalPowerAvailable) * 100;
    if (utilizationPercentage > 80 && utilizationPercentage <= 100) {
      result.issues.push({
        type: 'HIGH_POWER_UTILIZATION',
        description: `High power utilization: ${Math.round(utilizationPercentage)}% of available PoE budget`,
        severity: 'low',
        suggestion: 'Consider adding more power capacity for future expansion',
        impact: "Limited room for adding more powered devices in the future",
        itemsAffected: switches
      });
    }
  }
}

function checkPortRequirements(skus: string[], result: ValidationResult) {
  // Check if there are enough switch ports for all devices
  const connectedDevices = skus.filter(sku => 
    sku.startsWith('AP-') || 
    sku.startsWith('RTR-') || 
    sku.startsWith('CTRL-')
  );
  
  const switches = skus.filter(sku => sku.startsWith('SW-'));
  
  if (connectedDevices.length > 0 && switches.length > 0) {
    let totalPortsNeeded = connectedDevices.length;
    let totalPortsAvailable = 0;
    
    // Account for connections between switches (uplinks)
    if (switches.length > 1) {
      totalPortsNeeded += switches.length - 1;
    }
    
    switches.forEach(sw => {
      const match = sw.match(/SW-\d+-(\d+)/);
      if (match) {
        const ports = parseInt(match[1], 10);
        totalPortsAvailable += ports;
      } else {
        // Default assumption if port count not specified
        totalPortsAvailable += 24;
      }
    });
    
    // Reduce available ports by uplink usage
    if (switches.length > 1) {
      totalPortsAvailable -= (switches.length - 1) * 2; // Each switch uses 2 ports for uplinks
    }
    
    if (totalPortsNeeded > totalPortsAvailable) {
      result.issues.push({
        type: 'INSUFFICIENT_PORTS',
        description: `Insufficient switch ports: ${totalPortsNeeded} needed, ${totalPortsAvailable} available`,
        severity: 'medium',
        suggestion: 'Add additional switch(es) to accommodate all devices',
        impact: "Not all devices can be connected to the network",
        itemsAffected: [...connectedDevices, ...switches]
      });
      
      // Calculate additional ports needed
      const additionalPortsNeeded = totalPortsNeeded - totalPortsAvailable;
      let recommendedSwitch = 'SW-24P';
      
      if (additionalPortsNeeded > 24) {
        recommendedSwitch = 'SW-48P';
      }
      
      result.suggestedItems?.push({
        sku: recommendedSwitch,
        reason: `Additional switch to provide ${additionalPortsNeeded} more ports`,
        details: "Ensures all devices can be properly connected to the network",
        compatibility: [...connectedDevices, ...switches]
      });
    }
    
    // Check port utilization (warning if > 80%)
    const utilizationPercentage = (totalPortsNeeded / totalPortsAvailable) * 100;
    if (utilizationPercentage > 80 && utilizationPercentage <= 100) {
      result.issues.push({
        type: 'HIGH_PORT_UTILIZATION',
        description: `High port utilization: ${Math.round(utilizationPercentage)}% of available switch ports`,
        severity: 'low',
        suggestion: 'Consider adding more switches for future expansion',
        impact: "Limited room for adding more devices in the future",
        itemsAffected: switches
      });
    }
  }
}

function checkForMissingComponents(skus: string[], result: ValidationResult) {
  // Check if APs have power source
  const aps = skus.filter(sku => sku.startsWith('AP-'));
  const poeInjectors = skus.filter(sku => sku.startsWith('POE-INJ'));
  const poeSwitches = skus.filter(sku => sku.startsWith('SW-') && sku.includes('P'));
  const switches = skus.filter(sku => sku.startsWith('SW-'));
  
  if (aps.length > 0 && poeInjectors.length === 0 && poeSwitches.length === 0) {
    result.issues.push({
      type: 'MISSING_POWER_SOURCE',
      description: 'No power source specified for Access Points',
      severity: 'high',
      suggestion: 'Add PoE injectors or PoE switch',
      impact: "Access points will not power on without a PoE source",
      itemsAffected: aps
    });
    
    result.suggestedItems?.push({
      sku: 'SW-24P',
      reason: 'Required to power the Access Points',
      details: "Provides power over Ethernet to all access points in a centralized manner",
      compatibility: aps
    });
  }
  
  // Check if controllers have enough capacity
  const controllers = skus.filter(sku => sku.startsWith('CTRL-'));
  if (aps.length > 0 && controllers.length === 0 && !skus.some(sku => sku.startsWith('LIC-AP-'))) {
    result.issues.push({
      type: 'MISSING_CONTROLLER',
      description: 'No controller or cloud license specified for Access Points',
      severity: 'high',
      suggestion: 'Add controller or cloud management licenses',
      impact: "Access points cannot be managed without a controller or cloud licenses",
      itemsAffected: aps
    });
    
    // Suggest appropriate controller based on AP count
    if (aps.length <= 50) {
      result.suggestedItems?.push({
        sku: 'CTRL-V3',
        reason: 'Required to manage the Access Points',
        details: "On-premises controller for managing up to 100 access points",
        compatibility: aps
      });
    } else {
      result.suggestedItems?.push({
        sku: 'CLOUD-CTRL',
        reason: 'Cloud controller for managing large AP deployments',
        details: "Scalable cloud-based management solution for large networks",
        compatibility: aps
      });
    }
  }
  
  // Check for SFP modules when interconnecting switches
  if (switches.length > 1 && !skus.some(sku => sku.startsWith('SFP-') || sku.startsWith('CAB-'))) {
    result.issues.push({
      type: 'MISSING_INTERCONNECT',
      description: 'Multiple switches with no interconnect modules or cables',
      severity: 'medium',
      suggestion: 'Add SFP modules or direct attach cables for switch interconnection',
      impact: "Switches cannot communicate with each other at high speed",
      itemsAffected: switches
    });
    
    result.suggestedItems?.push({
      sku: 'SFP-10G-SR',
      reason: 'Required for high-speed switch interconnection',
      details: "10Gbps fiber optic modules for inter-switch communication",
      compatibility: switches
    });
    
    result.suggestedItems?.push({
      sku: 'CAB-SFP-3M',
      reason: 'Alternative for direct copper switch connections',
      details: "3-meter direct attach cable for short-distance switch connections",
      compatibility: switches
    });
  }
}

function checkLicensing(skus: string[], result: ValidationResult) {
  const aps = skus.filter(sku => sku.startsWith('AP-'));
  const apLicenses = skus.filter(sku => sku.startsWith('LIC-AP-'));
  
  if (aps.length > 0 && apLicenses.length === 0) {
    result.issues.push({
      type: 'MISSING_LICENSES',
      description: `No licenses specified for ${aps.length} Access Points`,
      severity: 'medium',
      suggestion: 'Add AP licenses (LIC-AP-1YR or LIC-AP-3YR)',
      impact: "Access points will operate with limited functionality without proper licensing",
      itemsAffected: aps
    });
    
    // Recommend 3-year licenses for better long-term value
    result.suggestedItems?.push({
      sku: 'LIC-AP-3YR',
      reason: `Required for each of the ${aps.length} Access Points`,
      details: "3-year licenses provide better long-term value than annual licenses",
      compatibility: aps
    });
  } else if (aps.length > apLicenses.length) {
    result.issues.push({
      type: 'INSUFFICIENT_LICENSES',
      description: `Only ${apLicenses.length} licenses for ${aps.length} Access Points`,
      severity: 'medium',
      suggestion: `Add ${aps.length - apLicenses.length} more licenses`,
      impact: "Some access points will operate with limited functionality",
      itemsAffected: aps
    });
    
    // Check if mixture of license types exists
    const licenseTypes = new Set(apLicenses.map(lic => lic.replace(/\d+$/, '')));
    if (licenseTypes.size > 1) {
      result.issues.push({
        type: 'MIXED_LICENSE_TYPES',
        description: 'Mixed license types may cause management complexity',
        severity: 'low',
        suggestion: 'Standardize on a single license type',
        impact: "Management complexity and potential for licensing confusion",
        itemsAffected: Array.from(apLicenses)
      });
    }
  }
  
  // Check for advanced features licenses when needed
  const advancedAPs = skus.filter(sku => sku.startsWith('AP-5'));
  if (advancedAPs.length > 0 && !skus.some(sku => sku.includes('ADV'))) {
    result.issues.push({
      type: 'MISSING_ADVANCED_LICENSES',
      description: 'High-end APs without advanced feature licenses',
      severity: 'low',
      suggestion: 'Consider adding advanced licenses to utilize all AP-500 features',
      impact: "Advanced AP features like location analytics will not be available",
      itemsAffected: advancedAPs
    });
    
    result.suggestedItems?.push({
      sku: 'LIC-AP-ADV-1YR',
      reason: 'Enables advanced features on high-end APs',
      details: "Unlocks location analytics, advanced guest portal, and more",
      compatibility: advancedAPs
    });
  }
}

function analyzeRedundancy(skus: string[], result: ValidationResult) {
  // Check for single points of failure
  const controllers = skus.filter(sku => sku.startsWith('CTRL-'));
  const routers = skus.filter(sku => sku.startsWith('RTR-'));
  const mainSwitches = skus.filter(sku => sku.startsWith('SW-') && sku.includes('48'));
  const aps = skus.filter(sku => sku.startsWith('AP-'));
  const switches = skus.filter(sku => sku.startsWith('SW-'));
  
  // Check controller redundancy
  if (controllers.length === 1 && aps.length > 10) {
    result.issues.push({
      type: 'REDUNDANCY_WARNING',
      description: 'Single controller managing a large AP deployment',
      severity: 'low',
      suggestion: 'Consider adding a backup controller for high availability',
      impact: "Network management will be disrupted if the controller fails",
      itemsAffected: [...controllers, ...aps]
    });
    
    result.suggestedItems?.push({
      sku: controllers[0],
      reason: 'Redundant controller for high availability',
      details: "Provides failover capability to maintain network management"
    });
  }
  
  // Check router redundancy
  if (routers.length === 1) {
    result.issues.push({
      type: 'REDUNDANCY_WARNING',
      description: 'Single router creates a potential point of failure',
      severity: 'low',
      suggestion: 'Consider adding a second router for redundancy',
      impact: "Internet connectivity will be lost if the router fails",
      itemsAffected: routers
    });
  }
  
  // Check core switch redundancy
  if (mainSwitches.length === 1 && skus.length > 10) {
    result.issues.push({
      type: 'REDUNDANCY_WARNING',
      description: 'Single core switch creates a potential point of failure',
      severity: 'low',
      suggestion: 'Consider adding a second core switch for redundancy',
      impact: "Network connectivity will be severely impacted if the core switch fails",
      itemsAffected: mainSwitches
    });
  }
}

function analyzePerformanceBottlenecks(skus: string[], result: ValidationResult) {
  // Check for potential bottlenecks in the network
  const aps = skus.filter(sku => sku.startsWith('AP-'));
  const apCount = aps.length;
  const highSpeedAPs = aps.filter(sku => sku.startsWith('AP-5'));
  const switches = skus.filter(sku => sku.startsWith('SW-'));
  
  // Check AP density to switch uplink capacity
  const standardUplinkCapacity = 1; // 1 Gbps
  const uplinkCapacityNeeded = (highSpeedAPs.length * 1.5) + ((apCount - highSpeedAPs.length) * 0.5);
  
  if (uplinkCapacityNeeded > switches.length * standardUplinkCapacity) {
    result.issues.push({
      type: 'PERFORMANCE_BOTTLENECK',
      description: `AP bandwidth may exceed uplink capacity (need ${uplinkCapacityNeeded.toFixed(1)} Gbps)`,
      severity: 'low',
      suggestion: 'Consider upgrading uplinks or adding additional switches',
      impact: "Potential network congestion during peak usage periods",
      itemsAffected: [...aps, ...switches]
    });
    
    result.suggestedItems?.push({
      sku: 'SFP-10G-SR',
      reason: 'Higher capacity uplinks for improved performance',
      details: "10 Gbps connections between switches prevent bottlenecks"
    });
  }
  
  // Check for mixed AP generations that might cause performance inconsistency
  const apGenerations = new Set(aps.map(ap => ap.match(/AP-(\d)/)?.[1]));
  if (apGenerations.size > 1) {
    result.issues.push({
      type: 'MIXED_AP_GENERATIONS',
      description: 'Mixed AP generations may cause inconsistent coverage and performance',
      severity: 'low',
      suggestion: 'Consider standardizing on the latest AP generation',
      impact: "Inconsistent wireless experience across different areas",
      itemsAffected: aps
    });
  }
}

function generateOptimizationSuggestions(skus: string[], result: ValidationResult) {
  result.optimizationSuggestions = [];
  
  const aps = skus.filter(sku => sku.startsWith('AP-'));
  const controllers = skus.filter(sku => sku.startsWith('CTRL-'));
  const switches = skus.filter(sku => sku.startsWith('SW-'));
  
  // Suggest cloud management for smaller deployments
  if (aps.length < 5 && controllers.length > 0) {
    result.optimizationSuggestions.push({
      type: 'CLOUD_MANAGEMENT',
      description: 'Replace physical controller with cloud management',
      benefit: 'Reduced capital expense and simplified management',
      implementationEffort: 'low'
    });
  }
  
  // Suggest controller consolidation for larger deployments
  if (controllers.length > 1) {
    result.optimizationSuggestions.push({
      type: 'CONTROLLER_CONSOLIDATION',
      description: 'Consolidate multiple controllers into a higher capacity model',
      benefit: 'Simplified management and reduced power consumption',
      implementationEffort: 'medium'
    });
  }
  
  // Suggest standardizing on AP models
  const apModels = new Set(aps.map(ap => ap.match(/AP-\d+/)?.[0]));
  if (apModels.size > 1) {
    result.optimizationSuggestions.push({
      type: 'STANDARDIZE_APS',
      description: 'Standardize on a single AP model',
      benefit: 'Simplified sparing, management, and consistent performance',
      implementationEffort: 'high'
    });
  }
  
  // Suggest multi-year licensing
  const oneYearLicenses = skus.filter(sku => sku.includes('1YR'));
  if (oneYearLicenses.length > 0) {
    result.optimizationSuggestions.push({
      type: 'MULTI_YEAR_LICENSING',
      description: 'Replace annual licenses with multi-year licenses',
      benefit: 'Reduced total cost and simplified renewal management',
      implementationEffort: 'low'
    });
  }
}

function generateTroubleshootingSteps(result: ValidationResult) {
  // Generate troubleshooting steps based on identified issues
  result.troubleshooting = [];
  
  const issueTypes = new Set(result.issues.map(issue => issue.type));
  
  if (issueTypes.has('POWER_BUDGET_EXCEEDED')) {
    result.troubleshooting.push({
      step: "Calculate PoE requirements",
      description: "Add up the maximum power draw (in watts) for all PoE devices",
      resolution: "Ensure total power requirements are within switch PoE budget or add PoE injectors"
    });
  }
  
  if (issueTypes.has('INCOMPATIBLE_COMPONENTS')) {
    result.troubleshooting.push({
      step: "Check compatibility matrix",
      description: "Verify component compatibility using the official documentation",
      resolution: "Replace incompatible components with compatible alternatives"
    });
  }
  
  if (issueTypes.has('MISSING_LICENSES')) {
    result.troubleshooting.push({
      step: "Audit license requirements",
      description: "List all devices requiring licenses and compare with purchased licenses",
      resolution: "Purchase additional licenses to match the device count"
    });
  }
  
  if (issueTypes.has('EOS_SKU')) {
    result.troubleshooting.push({
      step: "Identify all EOS products",
      description: "Check all SKUs against the current product lifecycle documentation",
      resolution: "Replace EOS products with current generation alternatives"
    });
  }
  
  if (issueTypes.has('INSUFFICIENT_PORTS')) {
    result.troubleshooting.push({
      step: "Document port requirements",
      description: "Map out all devices requiring network connectivity and their port type",
      resolution: "Add switches to accommodate all required ports plus growth margin"
    });
  }
}

function identifyFailurePatterns(result: ValidationResult) {
  // Identify common failure patterns from the issues
  const issueTypes = result.issues.map(issue => issue.type);
  
  if (issueTypes.includes('POWER_BUDGET_EXCEEDED')) {
    result.patterns.push(FAILURE_PATTERNS.POWER_BUDGET_EXCEEDED);
  }
  
  if (issueTypes.includes('MISSING_CONTROLLER')) {
    result.patterns.push(FAILURE_PATTERNS.MISSING_CONTROLLER);
  }
  
  if (issueTypes.includes('MISSING_LICENSES') || issueTypes.includes('INSUFFICIENT_LICENSES')) {
    result.patterns.push(FAILURE_PATTERNS.MISSING_LICENSES);
  }
  
  if (issueTypes.includes('INCOMPATIBLE_COMPONENTS')) {
    result.patterns.push(FAILURE_PATTERNS.INCOMPATIBLE_COMPONENTS);
  }
  
  if (issueTypes.includes('EOS_SKU')) {
    result.patterns.push(FAILURE_PATTERNS.EOS_PRODUCT);
  }
  
  if (issueTypes.includes('MISSING_POWER_SOURCE')) {
    result.patterns.push(FAILURE_PATTERNS.MISSING_POWER_SOURCE);
  }
  
  if (issueTypes.includes('INSUFFICIENT_PORTS')) {
    result.patterns.push(FAILURE_PATTERNS.INSUFFICIENT_PORTS);
  }
  
  // Check for pattern of incomplete configuration
  if (result.issues.length > 3) {
    result.patterns.push(FAILURE_PATTERNS.INCOMPLETE_CONFIGURATION);
  }
}

function calculateConfidence(issues: ValidationResult['issues']): number {
  // Enhance confidence calculation based on quantity and severity of issues
  let baseConfidence = 0.95;
  
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;
  const lowIssues = issues.filter(i => i.severity === 'low').length;
  
  // Higher penalty for critical issues
  baseConfidence -= (highIssues * 0.15);
  baseConfidence -= (mediumIssues * 0.05);
  baseConfidence -= (lowIssues * 0.02);
  
  // Adjust for quantity of issues (diminishing returns)
  const totalIssues = issues.length;
  if (totalIssues > 5) {
    baseConfidence -= Math.min(0.15, (totalIssues - 5) * 0.01);
  }
  
  return Math.max(0.5, Math.min(0.95, baseConfidence));
}

export function generateSyntheticResponse(message: string): {
  response: string;
  confidence: number;
  citations?: { id: string; text: string; source: string; url?: string }[];
  tags?: string[];
  troubleshooting?: { step: string; description: string; resolution?: string }[];
  optimizationSuggestions?: { type: string; description: string; benefit: string; implementationEffort: string }[];
} {
  // Enhanced response generation with more detailed information
  const patterns = [
    {
      regex: /validate|check|review|confirm|verify/i,
      responseType: 'validation',
    },
    {
      regex: /alternative|substitute|replacement|upgrade|instead of/i,
      responseType: 'alternative',
    },
    {
      regex: /compatibility|compatible|work with|integrate/i,
      responseType: 'compatibility',
    },
    {
      regex: /license|subscription|software|support/i,
      responseType: 'licensing',
    },
    {
      regex: /power|poe|wattage|voltage|electrical/i,
      responseType: 'power',
    },
    {
      regex: /price|cost|quote|budget|expensive|cheap/i,
      responseType: 'pricing',
    },
    {
      regex: /optimize|performance|bottleneck|slow/i,
      responseType: 'optimization',
    },
    {
      regex: /redundancy|availability|backup|failover/i,
      responseType: 'redundancy',
    },
    {
      regex: /troubleshoot|problem|issue|error|debug/i,
      responseType: 'troubleshooting',
    }
  ];

  // Determine the type of response based on the message content
  let responseType = 'general';
  for (const pattern of patterns) {
    if (pattern.regex.test(message)) {
      responseType = pattern.responseType;
      break;
    }
  }

  // Generate enhanced responses based on type
  switch (responseType) {
    case 'validation':
      return {
        response: "I've performed a comprehensive analysis of your quote and found several issues that require attention:\n\n1. **Missing PoE switch**: Your configuration includes 5 AP-300 access points but no power source. Each AP requires PoE+ power (12.95W per device).\n\n2. **Licensing gap**: You need 5 AP licenses but the quote only includes 3. This will result in limited functionality for 2 APs.\n\n3. **Cable requirements**: For a reliable installation, add 5 CAT6A patch cables for connecting the APs.\n\n4. **Future expansion constraints**: Your current switch selection provides limited headroom for adding devices in the future.\n\nWould you like me to suggest specific products to complete this configuration or provide a detailed analysis report?",
        confidence: 0.92,
        citations: [
          { id: "cit1", text: "AP-300 Power Requirements", source: "Product Documentation", url: "https://docs.example.com/ap300/power" },
          { id: "cit2", text: "Licensing Requirements", source: "Licensing Guide", url: "https://docs.example.com/licensing/ap" },
          { id: "cit3", text: "Installation Best Practices", source: "Deployment Guide", url: "https://docs.example.com/best-practices" }
        ],
        tags: ["missing_components", "licensing", "power_requirements", "expansion_planning"],
        troubleshooting: [
          {
            step: "Add PoE Power Source",
            description: "Calculate total power requirements: 5 APs × 12.95W = 64.75W minimum",
            resolution: "Add SW-24P switch with 380W power budget or individual POE-INJ2 injectors"
          },
          {
            step: "Resolve Licensing Gap",
            description: "Current: 3 licenses, Required: 5 licenses",
            resolution: "Add 2 additional LIC-AP-1YR or upgrade all to LIC-AP-3YR for better value"
          }
        ],
        optimizationSuggestions: [
          {
            type: "STANDARDIZE_LICENSING",
            description: "Use 3-year licenses instead of annual licenses",
            benefit: "22% cost savings over three years and reduced administrative overhead",
            implementationEffort: "low"
          },
          {
            type: "FUTURE_PROOFING",
            description: "Select switch with additional capacity",
            benefit: "Accommodate future growth without additional purchases",
            implementationEffort: "medium"
          }
        ]
      };
    
    case 'alternative':
      return {
        response: "I've identified that your quote includes the SW-1200-24 switch, which reached end-of-sale on May 15, 2023. Here's my detailed analysis:\n\n**End-of-Sale Product:**\n- SW-1200-24 (EOS date: May 15, 2023)\n\n**Recommended Replacement:**\n- SW-2400-24 (Current generation)\n\n**Comparative Analysis:**\n- ✅ 50% higher switching capacity (120Gbps vs 80Gbps)\n- ✅ Enhanced security features (802.1X, RADIUS, MACsec)\n- ✅ 15% better power efficiency\n- ✅ Improved PoE budget (380W vs 350W)\n- ✅ Same form factor and port density\n- ⚠️ 12% higher price ($3,225 vs $2,875)\n\nThe performance improvements and longer support lifecycle justify the additional investment. Would you like a detailed compatibility analysis with your other components?",
        confidence: 0.89,
        citations: [
          { id: "cit1", text: "SW-1200 EOS Notice", source: "Product Lifecycle", url: "https://docs.example.com/lifecycle/sw1200" },
          { id: "cit2", text: "SW-2400 Datasheet", source: "Product Specifications", url: "https://docs.example.com/specs/sw2400" },
          { id: "cit3", text: "Performance Comparison", source: "Product Testing Lab", url: "https://docs.example.com/comparison/sw" }
        ],
        tags: ["eos_product", "alternative", "switch", "performance_upgrade"],
        troubleshooting: [
          {
            step: "Verify EOS Status",
            description: "Confirm end-of-sale date and support timeline",
            resolution: "Replace with current generation SW-2400-24"
          },
          {
            step: "Migration Planning",
            description: "Ensure configuration compatibility between old and new switch",
            resolution: "Use configuration migration tool to transfer settings"
          }
        ],
        optimizationSuggestions: [
          {
            type: "STANDARDIZE_SWITCHING",
            description: "Standardize on SW-2400 series across the network",
            benefit: "Consistent management interface and feature set",
            implementationEffort: "medium"
          }
        ]
      };
    
    case 'optimization':
      return {
        response: "Based on your network configuration, I've identified several optimization opportunities:\n\n1. **Licensing Consolidation**\n   - Current: Multiple 1-year licenses\n   - Recommendation: Consolidate to 3-year licenses\n   - Benefit: 22% cost savings and reduced administrative overhead\n\n2. **Uplink Capacity**\n   - Current: 1Gbps uplinks between switches\n   - Recommendation: Upgrade to 10Gbps uplinks\n   - Benefit: 10x throughput and elimination of potential bottlenecks\n\n3. **Controller Redundancy**\n   - Current: Single controller architecture\n   - Recommendation: Implement controller high availability\n   - Benefit: Improved reliability with automatic failover\n\n4. **Power Optimization**\n   - Current: 78% PoE budget utilization\n   - Recommendation: Redistribute APs to balance power load\n   - Benefit: Improved power management and headroom for expansion\n\nWould you like a detailed implementation plan for any of these optimizations?",
        confidence: 0.87,
        citations: [
          { id: "cit1", text: "Licensing Cost Analysis", source: "Pricing Guide", url: "https://docs.example.com/licensing/cost" },
          { id: "cit2", text: "Network Optimization Best Practices", source: "Design Guide", url: "https://docs.example.com/design/optimization" }
        ],
        tags: ["optimization", "cost_efficiency", "performance_enhancement", "reliability"],
        optimizationSuggestions: [
          {
            type: "LICENSING_CONSOLIDATION",
            description: "Replace annual licenses with multi-year licenses",
            benefit: "22% cost savings over three years",
            implementationEffort: "low"
          },
          {
            type: "UPLINK_CAPACITY",
            description: "Upgrade inter-switch links to 10Gbps",
            benefit: "Eliminate performance bottlenecks during peak usage",
            implementationEffort: "medium"
          },
          {
            type: "HIGH_AVAILABILITY",
            description: "Implement controller redundancy",
            benefit: "99.99% management plane availability",
            implementationEffort: "high"
          },
          {
            type: "POWER_MANAGEMENT",
            description: "Redistribute PoE devices across switches",
            benefit: "Balanced power utilization and improved redundancy",
            implementationEffort: "medium"
          }
        ]
      };
    
    case 'troubleshooting':
      return {
        response: "I've analyzed your configuration and identified potential issues with recommended troubleshooting steps:\n\n**Issue 1: Intermittent AP connectivity**\n- Root cause: Insufficient PoE budget on switch SW-24P\n- Troubleshooting steps:\n  1. Check switch PoE allocation (run 'show power inline')\n  2. Verify actual AP power consumption\n  3. Monitor for power cycling events in logs\n- Resolution: Redistribute APs across multiple switches or add PoE injectors\n\n**Issue 2: Controller synchronization failures**\n- Root cause: Incompatible firmware versions\n- Troubleshooting steps:\n  1. Check current firmware on all devices\n  2. Verify compatibility matrix\n  3. Review synchronization error logs\n- Resolution: Upgrade all components to compatible firmware versions\n\nWould you like me to provide more detailed troubleshooting procedures for either issue?",
        confidence: 0.91,
        citations: [
          { id: "cit1", text: "AP Power Requirements", source: "Troubleshooting Guide", url: "https://docs.example.com/troubleshooting/power" },
          { id: "cit2", text: "Controller Synchronization", source: "Admin Guide", url: "https://docs.example.com/admin/synchronization" }
        ],
        tags: ["troubleshooting", "power_issues", "firmware_compatibility", "synchronization"],
        troubleshooting: [
          {
            step: "Check PoE Power Budget",
            description: "Verify switch power allocation using 'show power inline' command",
            resolution: "Ensure no more than 80% of available PoE budget is utilized"
          },
          {
            step: "Verify Firmware Compatibility",
            description: "Compare installed firmware versions against compatibility matrix",
            resolution: "Upgrade all components to recommended firmware version"
          },
          {
            step: "Monitor System Logs",
            description: "Check for power-related or synchronization error messages",
            resolution: "Address specific error conditions identified in logs"
          },
          {
            step: "Test Network Connectivity",
            description: "Verify basic connectivity between all components",
            resolution: "Resolve any network connectivity issues between devices"
          }
        ]
      };
    
    default:
      return {
        response: "I'd be happy to help with your network configuration. To provide the most accurate assistance, I need more details about your requirements. Please share information such as:\n\n1. **Environment type**: Office, warehouse, campus, etc.\n2. **Scale**: Number of users, devices, and locations\n3. **Specific requirements**: High-density areas, outdoor coverage, special applications\n4. **Existing equipment**: Any current devices that need integration\n5. **Budget constraints**: Price sensitivity or target investment level\n\nAlternatively, you can upload a quote document or list specific SKUs, and I'll provide a detailed validation analysis with recommendations.",
        confidence: 0.85,
        tags: ["information_request", "requirements", "configuration_assistance"],
        troubleshooting: [
          {
            step: "Gather Requirements",
            description: "Document environment details, user count, and special needs",
            resolution: "Provide this information for a tailored recommendation"
          }
        ],
        optimizationSuggestions: [
          {
            type: "REQUIREMENTS_DOCUMENTATION",
            description: "Create detailed requirements document",
            benefit: "Ensures solution addresses all needs and constraints",
            implementationEffort: "low"
          }
        ]
      };
  }
}