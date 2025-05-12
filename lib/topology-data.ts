import { Network, DeviceNode, Connection } from "@/types/topology";

export function generateNetworkTopology(): Network {
  const devices: DeviceNode[] = [
    {
      id: "sw1",
      name: "SW-2400-24",
      type: "switch",
      model: "SW-2400-24P",
      ip: "192.168.1.10",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "sw2",
      name: "SW-2400-48",
      type: "switch",
      model: "SW-2400-48P",
      ip: "192.168.1.11",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "ctrl1",
      name: "CTRL-V3",
      type: "controller",
      model: "CTRL-V3",
      ip: "192.168.1.5",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "rtr1",
      name: "RTR-5G-1",
      type: "router",
      model: "RTR-5G-1",
      ip: "192.168.1.1",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "ap1",
      name: "AP-500-1",
      type: "ap",
      model: "AP-500",
      ip: "192.168.1.21",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "ap2",
      name: "AP-500-2",
      type: "ap",
      model: "AP-500",
      ip: "192.168.1.22",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "ap3",
      name: "AP-500-3",
      type: "ap",
      model: "AP-500",
      ip: "192.168.1.23",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "ap4",
      name: "AP-300-4",
      type: "ap",
      model: "AP-300",
      ip: "192.168.1.24",
      status: "online",
      warnings: ["End-of-sale access point, recommended to upgrade to AP-500"],
      x: 0,
      y: 0
    },
    {
      id: "ap5",
      name: "AP-500-5",
      type: "ap",
      model: "AP-500",
      ip: "192.168.1.25",
      status: "offline",
      warnings: ["Access point is offline, check connection"],
      x: 0,
      y: 0
    },
    {
      id: "client1",
      name: "Laptop-1",
      type: "client",
      model: "Laptop",
      ip: "192.168.1.101",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "client2",
      name: "Workstation-1",
      type: "client",
      model: "Workstation",
      ip: "192.168.1.102",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "client3",
      name: "Phone-1",
      type: "client",
      model: "Phone",
      ip: "192.168.1.103",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "client4",
      name: "Laptop-2",
      type: "client",
      model: "Laptop",
      ip: "192.168.1.104",
      status: "online",
      x: 0,
      y: 0
    },
    {
      id: "srv1",
      name: "Server-1",
      type: "server",
      model: "Server",
      ip: "192.168.1.201",
      status: "online",
      x: 0,
      y: 0
    }
  ];

  const connections: Connection[] = [
    // Switch to controller
    { sourceId: "sw1", targetId: "ctrl1", type: "wired", speed: 10 },
    
    // Switch to router
    { sourceId: "sw1", targetId: "rtr1", type: "wired", speed: 10 },
    
    // Switch to switch
    { sourceId: "sw1", targetId: "sw2", type: "wired", speed: 10 },
    
    // Switch to APs
    { sourceId: "sw1", targetId: "ap1", type: "wired", speed: 1 },
    { sourceId: "sw1", targetId: "ap2", type: "wired", speed: 1 },
    { sourceId: "sw2", targetId: "ap3", type: "wired", speed: 1 },
    { sourceId: "sw2", targetId: "ap4", type: "wired", speed: 1, warning: "Connection to end-of-sale AP" },
    { sourceId: "sw2", targetId: "ap5", type: "wired", speed: 1, warning: "Connection appears down" },
    
    // Switch to server
    { sourceId: "sw1", targetId: "srv1", type: "wired", speed: 10 },
    
    // APs to clients (wireless)
    { sourceId: "ap1", targetId: "client1", type: "wireless" },
    { sourceId: "ap2", targetId: "client2", type: "wireless" },
    { sourceId: "ap3", targetId: "client3", type: "wireless" },
    { sourceId: "ap3", targetId: "client4", type: "wireless" },
    
    // Controller to APs (logical)
    { sourceId: "ctrl1", targetId: "ap1", type: "logical", speed: 0 },
    { sourceId: "ctrl1", targetId: "ap2", type: "logical", speed: 0 },
    { sourceId: "ctrl1", targetId: "ap3", type: "logical", speed: 0 },
    { sourceId: "ctrl1", targetId: "ap4", type: "logical", speed: 0 },
    { sourceId: "ctrl1", targetId: "ap5", type: "logical", speed: 0, warning: "Cannot reach AP" }
  ];

  // Calculate power budget warning
  const sw2ApCount = connections.filter(c => 
    c.sourceId === "sw2" && 
    c.targetId.startsWith("ap") && 
    c.type === "wired"
  ).length;
  
  // Estimate power consumption (PoE budget)
  const totalPowerNeeded = sw2ApCount * 25; // 25W per AP
  const maxPowerBudget = 380; // SW-2400-48P max power
  
  const warnings = [];
  if (totalPowerNeeded > maxPowerBudget * 0.8) {
    warnings.push(`Switch SW-2400-48 is nearing its PoE power budget (${totalPowerNeeded}W used out of ${maxPowerBudget}W available)`);
  }

  return {
    devices,
    connections,
    warnings
  };
}