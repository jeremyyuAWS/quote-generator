import { Chat, Message, Citation } from "@/types/chat";
import { UploadedFile } from "@/types/file";
import { AnalyticsData } from "@/types/analytics";

export function createInitialChats(): Chat[] {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  const chat1: Chat = {
    id: "1",
    title: "AP Configuration Validation",
    createdAt: yesterday.toISOString(),
    messages: [
      {
        id: "msg1",
        role: "user",
        content: "Can you validate this wireless AP configuration quote?",
        createdAt: yesterday.toISOString(),
      },
      {
        id: "msg2",
        role: "assistant",
        content: "I'd be happy to help validate your wireless AP configuration quote. Could you upload the quote document or provide details about the specific access points, controllers, and other components included?",
        createdAt: yesterday.toISOString(),
      },
      {
        id: "msg3",
        role: "user", 
        content: "I need 5 AP-300 units for a small office.",
        createdAt: yesterday.toISOString(),
      },
      {
        id: "msg4",
        role: "assistant",
        content: "I've analyzed your request for 5 AP-300 units for a small office. There are some important components missing from your configuration:\n\n1. **Power Source**: AP-300 requires PoE+ power. You'll need a compatible PoE+ switch (SW-24P) or individual PoE+ injectors (POE-INJ2).\n\n2. **Licensing**: Each AP requires a cloud management license (LIC-AP-1YR or LIC-AP-3YR).\n\n3. **Controller**: For 5 APs, you could use either cloud management or a physical controller (CTRL-V3).\n\nWould you like me to suggest a complete configuration with these additions?",
        createdAt: yesterday.toISOString(),
        confidence: 0.92,
        citations: [
          {
            id: "cit1",
            text: "AP-300 Power Requirements",
            source: "Product Documentation",
            url: "https://docs.example.com/ap300/requirements"
          },
          {
            id: "cit2",
            text: "Licensing Guidelines",
            source: "Licensing Portal",
            url: "https://docs.example.com/licensing"
          }
        ],
        tags: ["missing_components", "power_requirements", "licensing"]
      },
    ],
    files: [],
  };

  const chat2: Chat = {
    id: "2",
    title: "Switch Compatibility Check",
    createdAt: now.toISOString(),
    messages: [
      {
        id: "msg5",
        role: "user",
        content: "Is the SW-4800 switch compatible with our existing network?",
        createdAt: now.toISOString(),
      },
      {
        id: "msg6",
        role: "assistant",
        content: "To determine if the SW-4800 switch is compatible with your existing network, I'll need some information about your current infrastructure. Could you please provide details about:\n\n1. Your existing switches (models, firmware versions)\n2. Network topology and requirements\n3. Any specific features you're utilizing\n\nThis will help me give you an accurate compatibility assessment.",
        createdAt: now.toISOString(),
        confidence: 0.85,
        tags: ["compatibility", "infrastructure", "information_request"]
      },
    ],
    files: [],
  };

  return [chat1, chat2];
}

export function generateSyntheticAnalytics(): AnalyticsData {
  return {
    totalQueries: 257,
    totalUploads: 43,
    avgConfidence: 0.89,
    topErrors: [
      { type: "Missing Component", count: 26 },
      { type: "EOS Product", count: 18 },
      { type: "Incompatible Items", count: 14 },
      { type: "Power Budget Exceeded", count: 9 },
      { type: "License Mismatch", count: 7 },
    ],
    usageByDate: Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date: date.toISOString().split('T')[0],
        queries: Math.floor(Math.random() * 25) + 5,
      };
    }),
    productTypes: [
      { type: "Access Points", count: 98 },
      { type: "Switches", count: 76 },
      { type: "Controllers", count: 45 },
      { type: "Routers", count: 23 },
      { type: "Licenses", count: 15 },
    ],
    responseTime: Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date: date.toISOString().split('T')[0],
        time: Math.floor(Math.random() * 1500) + 500,
      };
    }),
  };
}

export const sampleEosSKUs = [
  { sku: "SW-1200-24", eosDate: "2023-05-15", replacement: "SW-2400-24" },
  { sku: "AP-100", eosDate: "2022-11-30", replacement: "AP-300" },
  { sku: "CTRL-V1", eosDate: "2023-02-28", replacement: "CTRL-V3" },
  { sku: "RTR-4G-1", eosDate: "2023-07-01", replacement: "RTR-5G-1" },
  { sku: "POE-INJ1", eosDate: "2022-09-15", replacement: "POE-INJ2" },
];

export const compatibilityRules = {
  "AP-300": {
    requiresPower: "PoE+",
    requiresLicense: true,
    compatibleControllers: ["CTRL-V2", "CTRL-V3", "CLOUD-CTRL"],
    powerConsumption: 18.5, // Watts
  },
  "AP-500": {
    requiresPower: "PoE++",
    requiresLicense: true,
    compatibleControllers: ["CTRL-V3", "CLOUD-CTRL"],
    powerConsumption: 26.8, // Watts
  },
  "SW-24P": {
    powerBudget: 380, // Watts
    ports: 24,
    poeStandard: "PoE+",
  },
  "SW-48P": {
    powerBudget: 720, // Watts
    ports: 48,
    poeStandard: "PoE++",
  },
  "CTRL-V3": {
    maxAPs: 100,
    requiresLicense: true,
    mountingOptions: ["rack", "desktop"],
  }
};

export const licensingRules = {
  "LIC-AP-1YR": {
    duration: 365, // days
    type: "AP License",
    features: ["cloud management", "basic analytics"],
  },
  "LIC-AP-3YR": {
    duration: 1095, // days
    type: "AP License",
    features: ["cloud management", "basic analytics"],
  },
  "LIC-AP-ADV-1YR": {
    duration: 365, // days
    type: "Advanced AP License",
    features: ["cloud management", "advanced analytics", "guest portal", "location tracking"],
  },
  "LIC-CTRL-100": {
    apCapacity: 100,
    type: "Controller License",
    features: ["on-premises management"],
  }
};