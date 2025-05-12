export interface DeviceNode {
  id: string;
  name: string;
  type: "ap" | "switch" | "router" | "controller" | "client" | "server";
  model: string;
  ip?: string;
  status: "online" | "offline" | "warning";
  warnings?: string[];
  x: number;
  y: number;
}

export interface Connection {
  sourceId: string;
  targetId: string;
  type: "wired" | "wireless" | "logical";
  speed?: number;
  warning?: string;
}

export interface Network {
  devices: DeviceNode[];
  connections: Connection[];
  warnings: string[];
}