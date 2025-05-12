"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  ZoomIn, ZoomOut, RotateCw, AlertTriangle, Info, Wifi, Server, 
  Network, MonitorSmartphone, Router, HardDrive, Download, Camera,
  Share2, Copy, Settings, Save, Layers, Pencil, Plus, Trash2, Eye,
  Smartphone, Printer, Database, PanelTop, EyeOff, Maximize, Minimize
} from "lucide-react";
import { generateNetworkTopology } from "@/lib/topology-data";
import { Network as NetworkType, DeviceNode, Connection } from "@/types/topology";

export function NetworkTopologyVisualizer() {
  const [network, setNetwork] = useState<NetworkType | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"logical" | "physical" | "heatmap">("logical");
  const [showLabels, setShowLabels] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [activeLayout, setActiveLayout] = useState<"circular" | "hierarchical" | "grid">("circular");
  const [highlightMode, setHighlightMode] = useState<"none" | "status" | "type" | "bandwidth">("none");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedTemplate, setSelectedTemplate] = useState("quote-b");
  const [showPerformanceLayer, setShowPerformanceLayer] = useState(false);
  const [showWirelessCoverage, setShowWirelessCoverage] = useState(false);
  const [showVirtualOverlay, setShowVirtualOverlay] = useState(false);
  const [filteredDeviceTypes, setFilteredDeviceTypes] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setNetwork(generateNetworkTopology());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);
  
  if (!network) {
    return <div className="flex items-center justify-center p-8">Loading network topology...</div>;
  }
  
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "ap":
        return <Wifi className="h-6 w-6" />;
      case "controller":
        return <Server className="h-6 w-6" />;
      case "switch":
        return <Network className="h-6 w-6" />;
      case "client":
        return <MonitorSmartphone className="h-6 w-6" />;
      case "router":
        return <Router className="h-6 w-6" />;
      case "server":
        return <HardDrive className="h-6 w-6" />;
      default:
        return <Server className="h-6 w-6" />;
    }
  };
  
  const handleDeviceClick = (deviceId: string) => {
    setSelectedDeviceId(deviceId !== selectedDeviceId ? deviceId : null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseDown = (deviceId: string, e: React.MouseEvent) => {
    if (editMode) {
      setDraggingDeviceId(deviceId);
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingDeviceId && editMode) {
      const dx = e.clientX - mousePosition.x;
      const dy = e.clientY - mousePosition.y;
      
      setNetwork(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          devices: prev.devices.map(device => {
            if (device.id === draggingDeviceId) {
              return {
                ...device,
                x: device.x + dx / zoom,
                y: device.y + dy / zoom
              };
            }
            return device;
          })
        };
      });
      
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggingDeviceId(null);
  };

  const toggleDeviceTypeFilter = (type: string) => {
    setFilteredDeviceTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const addNewDevice = (type: string) => {
    if (!editMode) return;
    
    const newDevice: DeviceNode = {
      id: `new-${type}-${Date.now()}`,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type as any,
      model: `Generic ${type.toUpperCase()}`,
      ip: "192.168.1.100",
      status: "online",
      x: 400, // Center of viewport
      y: 300, // Center of viewport
    };
    
    setNetwork(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        devices: [...prev.devices, newDevice]
      };
    });
    
    setSelectedDeviceId(newDevice.id);
  };

  const removeDevice = (deviceId: string) => {
    if (!editMode) return;
    
    setNetwork(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        devices: prev.devices.filter(d => d.id !== deviceId),
        connections: prev.connections.filter(c => 
          c.sourceId !== deviceId && c.targetId !== deviceId
        )
      };
    });
    
    if (selectedDeviceId === deviceId) {
      setSelectedDeviceId(null);
    }
  };

  const addConnection = (sourceId: string, targetId: string) => {
    if (!editMode || sourceId === targetId) return;
    
    const connectionExists = network.connections.some(
      c => (c.sourceId === sourceId && c.targetId === targetId) || 
           (c.sourceId === targetId && c.targetId === sourceId)
    );
    
    if (connectionExists) return;
    
    setNetwork(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        connections: [...prev.connections, {
          sourceId,
          targetId,
          type: "wired",
          speed: 1
        }]
      };
    });
  };

  const exportTopology = () => {
    if (!network) return;
    
    const dataStr = JSON.stringify(network, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'network-topology.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const captureScreenshot = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = "network-topology.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };
  
  const selectedDevice = selectedDeviceId 
    ? network.devices.find(d => d.id === selectedDeviceId) 
    : null;
  
  // Calculate viewport dimensions
  const svgWidth = 800;
  const svgHeight = 600;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  
  // Calculate device positions using different layouts
  const layoutDevices = () => {
    if (activeLayout === "circular") {
      // Position core devices in the center
      const coreDevices = network.devices.filter(d => 
        d.type === "controller" || d.type === "router" || d.type === "switch"
      );
      
      const coreRadius = Math.min(svgWidth, svgHeight) * 0.15;
      const corePositions = coreDevices.map((device, i) => {
        if (draggingDeviceId === device.id) return device; // Don't reposition while dragging
        
        const angle = (i / coreDevices.length) * Math.PI * 2;
        return {
          ...device,
          x: centerX + Math.cos(angle) * coreRadius,
          y: centerY + Math.sin(angle) * coreRadius
        };
      });
      
      // Position access points in the middle ring
      const apDevices = network.devices.filter(d => d.type === "ap");
      const apRadius = Math.min(svgWidth, svgHeight) * 0.3;
      const apPositions = apDevices.map((device, i) => {
        if (draggingDeviceId === device.id) return device; // Don't reposition while dragging
        
        const angle = (i / apDevices.length) * Math.PI * 2;
        return {
          ...device,
          x: centerX + Math.cos(angle) * apRadius,
          y: centerY + Math.sin(angle) * apRadius
        };
      });
      
      // Position client devices in the outer ring
      const clientDevices = network.devices.filter(d => 
        d.type !== "controller" && d.type !== "router" && d.type !== "switch" && d.type !== "ap"
      );
      const clientRadius = Math.min(svgWidth, svgHeight) * 0.45;
      const clientPositions = clientDevices.map((device, i) => {
        if (draggingDeviceId === device.id) return device; // Don't reposition while dragging
        
        const angle = (i / clientDevices.length) * Math.PI * 2;
        return {
          ...device,
          x: centerX + Math.cos(angle) * clientRadius,
          y: centerY + Math.sin(angle) * clientRadius
        };
      });
      
      // Combine all positioned devices
      return [...corePositions, ...apPositions, ...clientPositions];
    } 
    else if (activeLayout === "hierarchical") {
      // Create a hierarchical layout (top to bottom)
      const levels = [
        network.devices.filter(d => d.type === "router"), // Top level: Routers
        network.devices.filter(d => d.type === "controller" || d.type === "switch"), // Second level: Controllers and Switches
        network.devices.filter(d => d.type === "ap"), // Third level: APs
        network.devices.filter(d => d.type === "server"), // Fourth level: Servers
        network.devices.filter(d => d.type === "client") // Fifth level: Clients
      ];
      
      const verticalSpacing = svgHeight / (levels.length + 1);
      
      return levels.flatMap((devices, levelIndex) => {
        const y = verticalSpacing * (levelIndex + 1);
        
        return devices.map((device, deviceIndex) => {
          if (draggingDeviceId === device.id) return device; // Don't reposition while dragging
          
          const horizontalSpacing = svgWidth / (devices.length + 1);
          const x = horizontalSpacing * (deviceIndex + 1);
          
          return {
            ...device,
            x,
            y
          };
        });
      });
    } 
    else if (activeLayout === "grid") {
      // Create a grid layout
      const devicesPerRow = Math.ceil(Math.sqrt(network.devices.length));
      const cellWidth = svgWidth / (devicesPerRow + 1);
      const cellHeight = svgHeight / (devicesPerRow + 1);
      
      return network.devices.map((device, index) => {
        if (draggingDeviceId === device.id) return device; // Don't reposition while dragging
        
        const row = Math.floor(index / devicesPerRow);
        const col = index % devicesPerRow;
        
        return {
          ...device,
          x: cellWidth * (col + 1),
          y: cellHeight * (row + 1)
        };
      });
    }
    
    // Default: return devices with their current positions
    return network.devices;
  };
  
  let positionedDevices = layoutDevices();
  
  // Apply filters if any
  if (filteredDeviceTypes.length > 0) {
    positionedDevices = positionedDevices.filter(device => !filteredDeviceTypes.includes(device.type));
  }
  
  // Get device position by ID
  const getDeviceById = (id: string) => {
    return positionedDevices.find(d => d.id === id);
  };

  // Get device fill color based on highlight mode
  const getDeviceFillColor = (device: DeviceNode) => {
    if (highlightMode === "status") {
      return device.status === "online" 
        ? "hsl(var(--success))" 
        : device.status === "warning" 
          ? "hsl(var(--warning))" 
          : "hsl(var(--destructive))";
    } 
    else if (highlightMode === "type") {
      switch (device.type) {
        case "ap": return "hsl(var(--chart-1))";
        case "switch": return "hsl(var(--chart-2))";
        case "router": return "hsl(var(--chart-3))";
        case "controller": return "hsl(var(--chart-4))";
        case "client": return "hsl(var(--chart-5))";
        case "server": return "hsl(var(--primary))";
        default: return "hsl(var(--muted))";
      }
    }
    
    return selectedDeviceId === device.id
      ? "hsl(var(--primary)/0.2)"
      : device.warnings && device.warnings.length > 0 
        ? "hsl(var(--destructive)/0.1)"
        : "hsl(var(--muted))";
  };

  // Get connection stroke color based on highlight mode
  const getConnectionColor = (conn: Connection, isSelected: boolean) => {
    if (highlightMode === "bandwidth") {
      if (!conn.speed) return "hsl(var(--border))";
      
      if (conn.speed >= 10) return "hsl(var(--success))";
      if (conn.speed >= 1) return "hsl(var(--primary))";
      return "hsl(var(--muted-foreground))";
    }
    
    return isSelected 
      ? "hsl(var(--primary))" 
      : conn.warning ? "hsl(var(--destructive))" 
      : "hsl(var(--border))";
  };

  // Generate wireless coverage overlay
  const generateWirelessOverlay = () => {
    const apDevices = positionedDevices.filter(d => d.type === "ap");
    
    return apDevices.map(ap => {
      // Determine coverage radius based on AP model
      let coverageRadius = 100;
      if (ap.model.includes("500")) {
        coverageRadius = 150;
      } else if (ap.model.includes("300")) {
        coverageRadius = 120;
      }
      
      // Determine opacity based on status
      const opacity = ap.status === "online" ? 0.2 : 0.05;
      
      return (
        <circle
          key={`coverage-${ap.id}`}
          cx={ap.x}
          cy={ap.y}
          r={coverageRadius}
          fill="hsl(var(--chart-1))"
          opacity={opacity}
          stroke="hsl(var(--chart-1))"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
      );
    });
  };

  // Generate performance heatmap
  const generatePerformanceHeatmap = () => {
    // Simplified heatmap - in a real app this would use actual performance data
    const gridSize = 20;
    const heatmapCells = [];
    
    for (let x = 0; x < svgWidth; x += gridSize) {
      for (let y = 0; y < svgHeight; y += gridSize) {
        // Calculate distance to nearest AP
        const apDevices = positionedDevices.filter(d => d.type === "ap" && d.status === "online");
        if (apDevices.length === 0) continue;
        
        let minDistance = Infinity;
        for (const ap of apDevices) {
          const distance = Math.sqrt(Math.pow(x - ap.x, 2) + Math.pow(y - ap.y, 2));
          minDistance = Math.min(minDistance, distance);
        }
        
        // Convert distance to performance metric (closer = better)
        let performance = 1 - Math.min(minDistance / 200, 1);
        
        // Skip cells with very low performance
        if (performance < 0.1) continue;
        
        // Add some randomness to make it look more realistic
        performance *= (0.8 + Math.random() * 0.4);
        
        // Determine color based on performance
        let color;
        if (performance > 0.8) color = "rgba(0, 255, 0, 0.15)"; // Good - green
        else if (performance > 0.4) color = "rgba(255, 255, 0, 0.15)"; // Medium - yellow
        else color = "rgba(255, 0, 0, 0.15)"; // Poor - red
        
        heatmapCells.push(
          <rect
            key={`heatmap-${x}-${y}`}
            x={x}
            y={y}
            width={gridSize}
            height={gridSize}
            fill={color}
            stroke="none"
          />
        );
      }
    }
    
    return heatmapCells;
  };

  // Generate VLAN overlay
  const generateVLANOverlay = () => {
    // Simplified VLAN visualization - in a real app this would use actual VLAN data
    const vlans = [
      { id: 10, name: "Management", color: "rgba(52, 152, 219, 0.2)" },
      { id: 20, name: "User", color: "rgba(46, 204, 113, 0.2)" },
      { id: 30, name: "Guest", color: "rgba(241, 196, 15, 0.2)" },
    ];

    // Determine which devices are in which VLAN
    const vlanGroups: Record<number, DeviceNode[]> = {};
    
    vlans.forEach(vlan => {
      vlanGroups[vlan.id] = [];
      
      if (vlan.id === 10) {
        // Management VLAN includes network devices
        vlanGroups[vlan.id] = positionedDevices.filter(d => 
          d.type === "switch" || d.type === "router" || d.type === "controller"
        );
      } else if (vlan.id === 20) {
        // User VLAN includes servers and half the clients
        vlanGroups[vlan.id] = [
          ...positionedDevices.filter(d => d.type === "server"),
          ...positionedDevices.filter(d => d.type === "client").slice(0, Math.floor(positionedDevices.filter(d => d.type === "client").length / 2))
        ];
      } else if (vlan.id === 30) {
        // Guest VLAN includes the other half of clients
        vlanGroups[vlan.id] = positionedDevices.filter(d => d.type === "client").slice(Math.floor(positionedDevices.filter(d => d.type === "client").length / 2));
      }
    });
    
    // Create hull around each VLAN group
    return vlans.map(vlan => {
      const devices = vlanGroups[vlan.id];
      if (devices.length < 3) return null; // Need at least 3 points for a hull
      
      // Simple convex hull approximation (add padding)
      const padding = 40;
      const pointsWithPadding = devices.flatMap(device => [
        `${device.x-padding},${device.y-padding}`,
        `${device.x+padding},${device.y-padding}`,
        `${device.x-padding},${device.y+padding}`,
        `${device.x+padding},${device.y+padding}`,
      ]);
      
      return (
        <g key={`vlan-${vlan.id}`}>
          <polygon
            points={pointsWithPadding.join(' ')}
            fill={vlan.color}
            stroke={vlan.color.replace('0.2', '0.8')}
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text
            x={devices.reduce((sum, d) => sum + d.x, 0) / devices.length}
            y={(devices.reduce((sum, d) => sum + d.y, 0) / devices.length) - 30}
            fontSize="14"
            fontWeight="bold"
            fill={vlan.color.replace('0.2', '0.8')}
            textAnchor="middle"
          >
            VLAN {vlan.id} - {vlan.name}
          </text>
        </g>
      );
    });
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

  // Legend items based on highlight mode
  const getLegendItems = () => {
    if (highlightMode === "status") {
      return [
        { color: "hsl(var(--success))", label: "Online" },
        { color: "hsl(var(--warning))", label: "Warning" },
        { color: "hsl(var(--destructive))", label: "Offline" },
      ];
    } 
    else if (highlightMode === "type") {
      return [
        { color: "hsl(var(--chart-1))", label: "Access Point" },
        { color: "hsl(var(--chart-2))", label: "Switch" },
        { color: "hsl(var(--chart-3))", label: "Router" },
        { color: "hsl(var(--chart-4))", label: "Controller" },
        { color: "hsl(var(--chart-5))", label: "Client" },
        { color: "hsl(var(--primary))", label: "Server" },
      ];
    }
    else if (highlightMode === "bandwidth") {
      return [
        { color: "hsl(var(--success))", label: "10+ Gbps" },
        { color: "hsl(var(--primary))", label: "1-10 Gbps" },
        { color: "hsl(var(--muted-foreground))", label: "< 1 Gbps" },
      ];
    }
    
    return [
      { color: "hsl(var(--muted))", label: "Normal Device" },
      { color: "hsl(var(--destructive)/0.1)", label: "Device with Warning" },
      { color: "hsl(var(--primary)/0.2)", label: "Selected Device" },
    ];
  };

  return (
    <div style={containerStyle} ref={containerRef} className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Network Topology Visualizer</h2>
          <p className="text-muted-foreground">
            Interactive visualization of your network devices and connections
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <Select defaultValue={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select quote" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quote-a">Quote A</SelectItem>
                <SelectItem value="quote-b">Quote B (Recommended)</SelectItem>
                <SelectItem value="quote-c">Quote C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Share</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Share Network Topology</h4>
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={captureScreenshot}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Screenshot
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={exportTopology}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(network, null, 2));
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant={editMode ? "default" : "outline"} 
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            {editMode ? "Editing" : "Edit"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
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
      
      {network.warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Topology Issues</AlertTitle>
          <AlertDescription>
            {network.warnings[0]}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-3/4">
          <Card className="overflow-hidden">
            <div className="border-b flex items-center justify-between p-4">
              <div>
                <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                  <TabsList>
                    <TabsTrigger value="logical" className="flex items-center gap-1">
                      <Network className="h-4 w-4" />
                      <span>Logical</span>
                    </TabsTrigger>
                    <TabsTrigger value="physical" className="flex items-center gap-1">
                      <PanelTop className="h-4 w-4" />
                      <span>Physical</span>
                    </TabsTrigger>
                    <TabsTrigger value="heatmap" className="flex items-center gap-1">
                      <Layers className="h-4 w-4" />
                      <span>Heatmap</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                  <ZoomOut size={16} />
                </Button>
                <Slider
                  value={[zoom]}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onValueChange={(value) => setZoom(value[0])}
                  className="w-32"
                />
                <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                  <ZoomIn size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => setZoom(1)}>
                  <RotateCw size={16} />
                </Button>
              </div>
            </div>
            
            <div className="border-b px-4 py-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-x-4">
                  <span className="text-sm font-medium">Layout:</span>
                  <ToggleGroup type="single" value={activeLayout} onValueChange={(v) => v && setActiveLayout(v as any)}>
                    <ToggleGroupItem value="circular" size="sm">Circular</ToggleGroupItem>
                    <ToggleGroupItem value="hierarchical" size="sm">Hierarchical</ToggleGroupItem>
                    <ToggleGroupItem value="grid" size="sm">Grid</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <div className="space-x-4">
                  <span className="text-sm font-medium">Highlight:</span>
                  <ToggleGroup type="single" value={highlightMode} onValueChange={(v) => v && setHighlightMode(v as any)}>
                    <ToggleGroupItem value="none" size="sm">None</ToggleGroupItem>
                    <ToggleGroupItem value="status" size="sm">Status</ToggleGroupItem>
                    <ToggleGroupItem value="type" size="sm">Type</ToggleGroupItem>
                    <ToggleGroupItem value="bandwidth" size="sm">Bandwidth</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>
            
            <div className="border-b px-4 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                    <Label htmlFor="show-labels">Labels</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="show-connections" checked={showConnections} onCheckedChange={setShowConnections} />
                    <Label htmlFor="show-connections">Connections</Label>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="wireless-coverage" checked={showWirelessCoverage} onCheckedChange={setShowWirelessCoverage} />
                    <Label htmlFor="wireless-coverage">Coverage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="performance-layer" checked={showPerformanceLayer} onCheckedChange={setShowPerformanceLayer} />
                    <Label htmlFor="performance-layer">Performance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="virtual-overlay" checked={showVirtualOverlay} onCheckedChange={setShowVirtualOverlay} />
                    <Label htmlFor="virtual-overlay">VLANs</Label>
                  </div>
                </div>
              </div>
            </div>
            
            {editMode && (
              <div className="border-b px-4 py-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Add Device:</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={() => addNewDevice("ap")}
                    >
                      <Wifi className="h-3 w-3 mr-1" /> AP
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={() => addNewDevice("switch")}
                    >
                      <Network className="h-3 w-3 mr-1" /> Switch
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={() => addNewDevice("client")}
                    >
                      <Smartphone className="h-3 w-3 mr-1" /> Client
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={() => addNewDevice("server")}
                    >
                      <Database className="h-3 w-3 mr-1" /> Server
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={() => {
                        // Save the current layout
                        console.log('Layout saved');
                      }}
                    >
                      <Save className="h-3 w-3 mr-1" /> Save Layout
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-0">
              <div 
                className="overflow-auto relative bg-muted/20" 
                style={{ height: '600px' }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <svg 
                  ref={svgRef}
                  width={svgWidth} 
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.2s ease-out',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  {/* Performance heatmap layer */}
                  {showPerformanceLayer && viewMode === "heatmap" && (
                    <g>
                      {generatePerformanceHeatmap()}
                    </g>
                  )}
                  
                  {/* Wireless coverage overlay */}
                  {showWirelessCoverage && (
                    <g>
                      {generateWirelessOverlay()}
                    </g>
                  )}
                  
                  {/* VLAN overlay */}
                  {showVirtualOverlay && (
                    <g>
                      {generateVLANOverlay()}
                    </g>
                  )}
                  
                  {/* Draw connections */}
                  {showConnections && network.connections.map((conn, i) => {
                    const source = getDeviceById(conn.sourceId);
                    const target = getDeviceById(conn.targetId);
                    
                    if (!source || !target) return null;
                    
                    // Skip connections to filtered devices
                    if (filteredDeviceTypes.includes(source.type) || filteredDeviceTypes.includes(target.type)) {
                      return null;
                    }
                    
                    const isSelected = 
                      selectedDeviceId === source.id || 
                      selectedDeviceId === target.id;
                    
                    // Calculate path for the connection
                    // For logical view, use straight lines
                    // For physical view, use curved lines
                    let path;
                    if (viewMode === "logical" || viewMode === "heatmap") {
                      path = `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
                    } else {
                      // Curved path for physical view
                      const dx = target.x - source.x;
                      const dy = target.y - source.y;
                      const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
                      path = `M ${source.x} ${source.y} A ${dr} ${dr} 0 0 1 ${target.x} ${target.y}`;
                    }
                    
                    return (
                      <g key={`conn-${i}`}>
                        <path
                          d={path}
                          fill="none"
                          stroke={getConnectionColor(conn, isSelected)}
                          strokeWidth={isSelected ? 3 : 2}
                          strokeDasharray={conn.type === "wireless" ? "5,5" : ""}
                          opacity={isSelected ? 1 : 0.6}
                        />
                        
                        {/* Connection speed label */}
                        {highlightMode === "bandwidth" && conn.speed && (
                          <text
                            x={(source.x + target.x) / 2}
                            y={(source.y + target.y) / 2 - 5}
                            textAnchor="middle"
                            fontSize="10"
                            fill="hsl(var(--foreground))"
                            className="pointer-events-none"
                          >
                            {conn.speed} Gbps
                          </text>
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Draw devices */}
                  {positionedDevices.map((device) => {
                    const isSelected = selectedDeviceId === device.id;
                    const hasWarning = device.warnings && device.warnings.length > 0;
                    
                    return (
                      <g
                        key={device.id}
                        transform={`translate(${device.x}, ${device.y})`}
                        onMouseDown={(e) => handleMouseDown(device.id, e)}
                        style={{ cursor: editMode ? 'move' : 'pointer' }}
                        onClick={() => handleDeviceClick(device.id)}
                      >
                        {/* Device circle */}
                        <circle
                          r={isSelected ? 30 : 25}
                          fill={getDeviceFillColor(device)}
                          stroke={
                            isSelected
                              ? "hsl(var(--primary))"
                              : hasWarning
                                ? "hsl(var(--destructive))"
                                : "hsl(var(--border))"
                          }
                          strokeWidth={isSelected ? 3 : 1}
                          className="transition-all duration-200"
                        />
                        
                        {/* Device icon */}
                        <foreignObject
                          x="-12"
                          y="-12"
                          width="24"
                          height="24"
                          className="text-foreground overflow-visible"
                        >
                          <div className="flex items-center justify-center h-full">
                            {getDeviceIcon(device.type)}
                          </div>
                        </foreignObject>
                        
                        {/* Device label */}
                        {showLabels && (
                          <text
                            y="40"
                            textAnchor="middle"
                            className="text-xs fill-current text-foreground font-medium"
                          >
                            {device.name}
                          </text>
                        )}
                        
                        {/* IP address for selected device */}
                        {isSelected && device.ip && showLabels && (
                          <text
                            y="55"
                            textAnchor="middle"
                            className="text-xs fill-current text-muted-foreground"
                          >
                            {device.ip}
                          </text>
                        )}
                        
                        {/* Warning indicator */}
                        {hasWarning && (
                          <g transform="translate(18, -18)">
                            <circle r="8" fill="hsl(var(--destructive))" />
                            <text
                              textAnchor="middle"
                              alignmentBaseline="central"
                              className="fill-white text-[10px] font-bold"
                            >
                              !
                            </text>
                          </g>
                        )}
                        
                        {/* Edit mode: delete button */}
                        {editMode && isSelected && (
                          <g 
                            transform="translate(0, -40)" 
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDevice(device.id);
                            }}
                          >
                            <circle r="12" fill="hsl(var(--destructive))" />
                            <foreignObject
                              x="-6"
                              y="-6"
                              width="12"
                              height="12"
                              className="text-white overflow-visible"
                            >
                              <div className="flex items-center justify-center h-full">
                                <Trash2 className="h-3 w-3" />
                              </div>
                            </foreignObject>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="w-full md:w-1/4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                {selectedDevice ? `${selectedDevice.name} Information` : 'Select a device for details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDevice ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Device Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">
                          {selectedDevice.type.charAt(0).toUpperCase() + selectedDevice.type.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span>{selectedDevice.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IP Address:</span>
                        <span>{selectedDevice.ip || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedDevice.status === "online" ? "default" : "destructive"}>
                          {selectedDevice.status}
                        </Badge>
                      </div>
                      
                      {/* Edit mode: additional fields */}
                      {editMode && (
                        <div className="pt-2 mt-2 border-t space-y-2">
                          <div className="space-y-1">
                            <Label htmlFor="device-name">Device Name</Label>
                            <Input 
                              id="device-name" 
                              defaultValue={selectedDevice.name} 
                              className="h-8"
                              onChange={(e) => {
                                setNetwork(prev => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    devices: prev.devices.map(d => 
                                      d.id === selectedDevice.id 
                                        ? { ...d, name: e.target.value }
                                        : d
                                    )
                                  };
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="device-model">Model</Label>
                            <Input 
                              id="device-model" 
                              defaultValue={selectedDevice.model}
                              className="h-8"
                              onChange={(e) => {
                                setNetwork(prev => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    devices: prev.devices.map(d => 
                                      d.id === selectedDevice.id 
                                        ? { ...d, model: e.target.value }
                                        : d
                                    )
                                  };
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="device-ip">IP Address</Label>
                            <Input 
                              id="device-ip" 
                              defaultValue={selectedDevice.ip || ''}
                              className="h-8"
                              onChange={(e) => {
                                setNetwork(prev => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    devices: prev.devices.map(d => 
                                      d.id === selectedDevice.id 
                                        ? { ...d, ip: e.target.value }
                                        : d
                                    )
                                  };
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="device-status">Status</Label>
                            <Select 
                              defaultValue={selectedDevice.status}
                              onValueChange={(value) => {
                                setNetwork(prev => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    devices: prev.devices.map(d => 
                                      d.id === selectedDevice.id 
                                        ? { ...d, status: value as any }
                                        : d
                                    )
                                  };
                                });
                              }}
                            >
                              <SelectTrigger id="device-status" className="h-8">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="offline">Offline</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedDevice.warnings && selectedDevice.warnings.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm mb-1">Warnings</h3>
                      <ul className="space-y-2">
                        {selectedDevice.warnings.map((warning, i) => (
                          <li key={i} className="text-destructive flex items-start gap-2 text-sm">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-sm mb-1">Connections</h3>
                    <ul className="space-y-2">
                      {network.connections
                        .filter(conn => conn.sourceId === selectedDevice.id || conn.targetId === selectedDevice.id)
                        .map((conn, i) => {
                          const peerDevice = getDeviceById(
                            conn.sourceId === selectedDevice.id ? conn.targetId : conn.sourceId
                          );
                          
                          if (!peerDevice) return null;
                          
                          // Skip connections to filtered devices
                          if (filteredDeviceTypes.includes(peerDevice.type)) {
                            return null;
                          }
                          
                          return (
                            <li 
                              key={i} 
                              className="text-sm flex items-center justify-between gap-2"
                              onClick={() => handleDeviceClick(peerDevice.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <span className="text-muted-foreground flex items-center gap-1">
                                {getDeviceIcon(peerDevice.type)}
                                <span>{peerDevice.name}</span>
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant={conn.warning ? "destructive" : "outline"}>
                                      {conn.type}
                                      {conn.speed && ` (${conn.speed}G)`}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{conn.warning || `${conn.speed || "1"} Gbps connection`}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </li>
                          );
                        })}

                      {/* Edit mode: create connection to another device */}
                      {editMode && selectedDevice && (
                        <li className="pt-2 border-t mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Add connection to:</p>
                          <Select 
                            onValueChange={(value) => addConnection(selectedDevice.id, value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select device" />
                            </SelectTrigger>
                            <SelectContent>
                              {network.devices
                                .filter(d => d.id !== selectedDevice.id) // Don't connect to self
                                .filter(d => !network.connections.some( // Don't show already connected devices
                                  c => (c.sourceId === selectedDevice.id && c.targetId === d.id) ||
                                       (c.sourceId === d.id && c.targetId === selectedDevice.id)
                                ))
                                .map(device => (
                                  <SelectItem key={device.id} value={device.id}>
                                    {device.name} ({device.type})
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Traffic stats section */}
                  <div>
                    <h3 className="font-medium text-sm mb-1">Traffic Statistics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Throughput:</span>
                        <span>1.2 Gbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Packets:</span>
                        <span>1.5M/sec</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Clients:</span>
                        <span>{selectedDevice.type === "ap" ? "24 connected" : "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hardware details section */}
                  <div>
                    <h3 className="font-medium text-sm mb-1">Hardware</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Serial:</span>
                        <span>ABC{Math.floor(Math.random() * 1000000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Firmware:</span>
                        <span>v4.2.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span>12d 5h 32m</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Info size={32} className="mb-2" />
                  <p>Select a device on the diagram to view its details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader className="py-4">
          <div className="flex justify-between items-center">
            <CardTitle>Topology Legend</CardTitle>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1"
                onClick={() => setFilteredDeviceTypes([])}
              >
                <Eye className="h-4 w-4" />
                <span>Show All</span>
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Settings className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Filter Device Types</h4>
                    <div className="space-y-2">
                      {["ap", "switch", "router", "controller", "client", "server"].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`filter-${type}`} 
                            checked={!filteredDeviceTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilteredDeviceTypes(prev => prev.filter(t => t !== type));
                              } else {
                                setFilteredDeviceTypes(prev => [...prev, type]);
                              }
                            }}
                          />
                          <label 
                            htmlFor={`filter-${type}`}
                            className="text-sm font-medium flex items-center gap-1"
                          >
                            {getDeviceIcon(type)}
                            <span>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                variant={filteredDeviceTypes.length > 0 ? "default" : "ghost"}
                size="sm" 
                className="h-8 gap-1"
                onClick={() => setFilteredDeviceTypes(prev => 
                  prev.length > 0 ? [] : ["client"]
                )}
              >
                {filteredDeviceTypes.length > 0 ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span>{filteredDeviceTypes.length} Hidden</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-0">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-muted w-6 h-6 rounded-full flex items-center justify-center">
                <Wifi size={16} />
              </div>
              <span className="text-sm">Access Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-muted w-6 h-6 rounded-full flex items-center justify-center">
                <Network size={16} />
              </div>
              <span className="text-sm">Switch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-muted w-6 h-6 rounded-full flex items-center justify-center">
                <Router size={16} />
              </div>
              <span className="text-sm">Router</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-muted w-6 h-6 rounded-full flex items-center justify-center">
                <Server size={16} />
              </div>
              <span className="text-sm">Controller</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-muted w-6 h-6 rounded-full flex items-center justify-center">
                <MonitorSmartphone size={16} />
              </div>
              <span className="text-sm">Client</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-muted w-6 h-6 rounded-full flex items-center justify-center">
                <HardDrive size={16} />
              </div>
              <span className="text-sm">Server</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <svg width="40" height="6">
                <line x1="0" y1="3" x2="40" y2="3" stroke="hsl(var(--border))" strokeWidth="2" />
              </svg>
              <span className="text-sm">Wired Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="40" height="6">
                <line x1="0" y1="3" x2="40" y2="3" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
              <span className="text-sm">Wireless Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="40" height="6">
                <line x1="0" y1="3" x2="40" y2="3" stroke="hsl(var(--primary))" strokeWidth="2" />
              </svg>
              <span className="text-sm">Selected Connection</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getLegendItems().map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}