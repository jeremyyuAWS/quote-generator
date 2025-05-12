"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Sample conversation templates organized by topic
export const sampleConversations = {
  'validation': [
    {
      role: "user",
      content: "Can you validate this quote for me? It includes 5 AP-300 access points and 1 SW-24P switch."
    },
    {
      role: "assistant",
      content: "I've analyzed your quote with 5 AP-300 access points and 1 SW-24P switch. Here's what I found:\n\n✅ **Power requirements**: The SW-24P provides sufficient PoE+ power for all 5 APs.\n\n⚠️ **Licensing gap**: I don't see any access point licenses in your quote. You'll need 5 AP licenses (one per device).\n\n⚠️ **Missing controller**: These APs require either a hardware controller or cloud licenses for management.\n\n✅ **Port capacity**: The 24-port switch provides enough ports for your current needs with room for expansion.\n\nWould you like me to suggest specific license options and a controller to complete your configuration?",
      confidence: 0.92,
      tags: ["missing_components", "licensing", "power_requirements"]
    }
  ],
  'compatibility': [
    {
      role: "user",
      content: "Are the AP-500 access points compatible with our CTRL-V2 controller?"
    },
    {
      role: "assistant",
      content: "After checking the compatibility matrix, I've found that the AP-500 access points are **not fully compatible** with the CTRL-V2 controller. Here's what you need to know:\n\n❌ **Controller limitation**: The AP-500 requires CTRL-V3 or newer controllers.\n\n❌ **Feature support**: The CTRL-V2 cannot enable all AP-500 features like multi-gigabit and WiFi 6E.\n\n❌ **Firmware requirements**: Even with limited functionality, this would require the latest CTRL-V2 firmware.\n\n✅ **Recommended solution**: Upgrade to CTRL-V3 controller for full compatibility and feature support.\n\nWould you like me to provide details on the CTRL-V3 controller upgrade options?",
      confidence: 0.95,
      tags: ["compatibility", "controller", "upgrade_required"]
    }
  ],
  'eos_products': [
    {
      role: "user",
      content: "I'm considering buying SW-1200-24 switches. Are they still supported?"
    },
    {
      role: "assistant",
      content: "I need to inform you that the SW-1200-24 switch reached **end-of-sale (EOS) status on May 15, 2023**. Here's what this means for your purchase decision:\n\n❌ **No longer available**: The product can't be ordered from official channels.\n\n⚠️ **Limited support**: Technical support will continue until May 2026, but no new features or non-critical bug fixes.\n\n⚠️ **Spare parts**: Replacement parts will become increasingly difficult to source.\n\n✅ **Recommended alternative**: The SW-2400-24 is the current replacement model with better performance (50% higher switching capacity), enhanced security features, and improved power efficiency.\n\nWould you like me to provide a detailed comparison between the SW-1200-24 and the recommended SW-2400-24?",
      confidence: 0.93,
      tags: ["eos_product", "switch", "replacement_needed"]
    }
  ],
  'licensing': [
    {
      role: "user",
      content: "What licenses do I need for my 10 AP-500 access points?"
    },
    {
      role: "assistant",
      content: "For your 10 AP-500 access points, you'll need the following licenses:\n\n**Required licenses**:\n- 10× AP management licenses (one per access point)\n\n**License options**:\n1. **LIC-AP-1YR**: 1-year standard AP license ($175/AP)\n2. **LIC-AP-3YR**: 3-year standard AP license ($420/AP) - 20% savings over annual renewal\n3. **LIC-AP-ADV-1YR**: 1-year advanced AP license with analytics ($250/AP)\n\n**My recommendation**:\n- LIC-AP-3YR offers the best value for standard deployments\n- LIC-AP-ADV-1YR worth considering if you need advanced analytics, guest portal, or location services\n\nWould you like a detailed explanation of the feature differences between standard and advanced licenses?",
      confidence: 0.97,
      tags: ["licensing", "access_point", "subscription"]
    }
  ],
  'power_budget': [
    {
      role: "user",
      content: "Can I run 20 AP-500 access points on a single SW-48P switch?"
    },
    {
      role: "assistant",
      content: "I've analyzed the power requirements for your scenario, and running 20 AP-500 access points on a single SW-48P switch will exceed its power budget. Here's my analysis:\n\n**Power requirements**:\n- Each AP-500 requires PoE++ (802.3bt) with peak consumption of 26.8W\n- 20 AP-500s × 26.8W = 536W total required\n- SW-48P has a maximum PoE budget of 720W\n\n**Although 536W is below the maximum 720W budget, I still don't recommend this configuration because**:\n\n⚠️ **Safety margin**: Best practice is to maintain 20-30% headroom (max 576W usage)\n⚠️ **Startup power**: APs can draw higher power during boot sequences\n⚠️ **Redundancy**: No power redundancy if some ports need more power\n\n**Recommendation**: Either reduce to 15 AP-500s per switch or deploy two SW-24P switches instead of one SW-48P for better power distribution.\n\nWould you like me to suggest a specific multi-switch design for your 20 APs?",
      confidence: 0.91,
      tags: ["power_budget", "poe", "switch_capacity"]
    }
  ],
  'troubleshooting': [
    {
      role: "user",
      content: "Some of our AP-300 access points keep disconnecting. How can I troubleshoot this?"
    },
    {
      role: "assistant",
      content: "I'll help you troubleshoot your AP-300 disconnection issues. Here's a systematic approach:\n\n**1. Check power issues first**:\n- Verify switch PoE budget isn't exceeded (run 'show power inline')\n- Look for power cycling in switch logs\n- Test with external power adapter to bypass PoE\n\n**2. Check network connectivity**:\n- Verify switch port configuration (run 'show interface')\n- Check for link errors or duplex mismatches\n- Test direct connection to controller\n\n**3. Firmware compatibility**:\n- Ensure all APs run the same firmware version\n- Verify controller firmware is compatible\n- Check for known bugs in current firmware\n\n**4. Controller issues**:\n- Check controller CPU and memory usage\n- Verify license status for each AP\n- Test basic connectivity between controller and APs\n\nThe most common causes are power budget issues and firmware mismatches. Would you like detailed commands for any specific troubleshooting step?",
      confidence: 0.89,
      tags: ["troubleshooting", "connectivity", "power_issues", "firmware"]
    }
  ],
  'design': [
    {
      role: "user",
      content: "I need to design a network for a small office with 50 employees."
    },
    {
      role: "assistant",
      content: "For a small office with 50 employees, here's a recommended network design:\n\n**Core Equipment**:\n- 1× SW-48P switch (48-port PoE+) as the core switch\n- 1× RTR-5G-1 router with firewall capabilities\n- 1× CTRL-V3 controller for wireless management\n\n**Wireless Coverage**:\n- 5× AP-300 access points for standard office areas\n- 1× AP-500 access point for high-density areas (conference rooms)\n- 6× LIC-AP-3YR licenses (one per AP, 3-year term)\n\n**Additional Components**:\n- 1× UPS-1500 uninterruptible power supply\n- 1× SFP-10G-SR for future expansion uplink\n- CAT6A cabling throughout\n\n**Estimated Budget**: $15,200 - $17,800\n\nThis setup provides full redundancy for critical components, sufficient PoE budget, and appropriate wireless coverage for a 50-person office (assuming standard office layout).\n\nWould you like me to adjust this design for any specific requirements like VoIP phones, video conferencing, or unusual floor plans?",
      confidence: 0.94,
      tags: ["network_design", "small_business", "wireless", "switching"]
    }
  ],
  'comparison': [
    {
      role: "user",
      content: "What's the difference between AP-300 and AP-500 access points?"
    },
    {
      role: "assistant",
      content: "Here's a detailed comparison between the AP-300 and AP-500 access points:\n\n**Wireless Standards**:\n- AP-300: WiFi 6 (802.11ax), dual-band (2.4/5GHz)\n- AP-500: WiFi 6E (802.11ax), tri-band (2.4/5/6GHz)\n\n**Performance**:\n- AP-300: 2×2 MIMO, up to 1.8 Gbps total\n- AP-500: 4×4 MIMO, up to 5.4 Gbps total\n\n**Power Requirements**:\n- AP-300: PoE+ (802.3at), 12.95W\n- AP-500: PoE++ (802.3bt), 26.8W\n\n**Client Capacity**:\n- AP-300: Up to 100 clients\n- AP-500: Up to 500 clients\n\n**Controller Compatibility**:\n- AP-300: Works with CTRL-V2, CTRL-V3, Cloud\n- AP-500: Works with CTRL-V3, Cloud only\n\n**Price Point**:\n- AP-300: $450-550 per unit\n- AP-500: $750-850 per unit\n\n**Best Use Cases**:\n- AP-300: Standard office environments, smaller spaces\n- AP-500: High-density areas, conference centers, venues requiring 6GHz\n\nWould you like more information on specific capabilities or deployment recommendations?",
      confidence: 0.96,
      tags: ["product_comparison", "wireless", "access_point"]
    }
  ],
  'roi_calculator': [
    {
      role: "user",
      content: "Can you help me calculate the ROI for upgrading from AP-300 to AP-500 access points?"
    },
    {
      role: "assistant",
      content: "I'd be happy to help calculate the ROI for upgrading from AP-300 to AP-500 access points. Let me break this down:\n\n**Investment Cost**:\n- AP-300 current price: $450-550 per unit\n- AP-500 current price: $750-850 per unit\n- Price difference: ~$300 per AP (plus potential additional PoE++ switch costs)\n\n**Benefits & Returns**:\n1. **Capacity increase**: 5× more concurrent clients (100 → 500)\n   - Value: Reduced congestion, better user experience, fewer help desk calls\n\n2. **Performance improvement**: 3× throughput (1.8 Gbps → 5.4 Gbps)\n   - Value: Faster applications, support for bandwidth-intensive workloads\n\n3. **New frequency band**: 6 GHz support\n   - Value: Less interference, cleaner RF environment\n\n4. **Future-proofing**: Extended product lifecycle\n   - Value: Delayed replacement costs (typically 2+ years)\n\n**Typical ROI timeline**: 18-24 months for high-density environments\n\nTo provide a precise calculation, I'd need to know:\n- Number of APs to upgrade\n- Your current pain points (capacity, speed, interference)\n- Specific applications and user density\n\nWould you like to provide these details for a more personalized ROI analysis?",
      confidence: 0.89,
      tags: ["roi", "upgrade", "cost_benefit"]
    }
  ]
};

interface TopicTagsProps {
  onTopicSelect: (topic: string) => void;
}

export function TopicTags({ onTopicSelect }: TopicTagsProps) {
  const topics = Object.keys(sampleConversations);
  
  return (
    <div className="flex flex-wrap gap-2 my-2">
      <TooltipProvider>
        {topics.map((topic) => (
          <Tooltip key={topic}>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => onTopicSelect(topic)}
              >
                {topic.replace(/_/g, ' ')}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs max-w-[200px]">
                {getTopicDescription(topic)}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}

function getTopicDescription(topic: string): string {
  switch(topic) {
    case 'validation':
      return "Validate your hardware and software quotes for completeness";
    case 'compatibility':
      return "Check if components work together properly";
    case 'eos_products':
      return "Identify end-of-sale products and find alternatives";
    case 'licensing':
      return "Understand licensing requirements for your products";
    case 'power_budget':
      return "Analyze power requirements and PoE budgets";
    case 'troubleshooting':
      return "Diagnose and fix network issues";
    case 'design':
      return "Get recommendations for network design";
    case 'comparison':
      return "Compare different products and solutions";
    case 'roi_calculator':
      return "Calculate return on investment for upgrades";
    default:
      return "Click to see an example conversation";
  }
}