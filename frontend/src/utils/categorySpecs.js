// Category Technical Specification Definitions & Helper Utilities

export const CATEGORY_SPECS_CONFIG = {
  cpu: {
    key: 'cpu',
    name: 'Processors (CPU)',
    fields: [
      { key: 'Brand', label: 'Brand / Manufacturer', placeholder: 'e.g. Intel / AMD' },
      { key: 'Socket', label: 'CPU Socket', placeholder: 'e.g. LGA1700 / AM5 / AM4' },
      { key: 'Cores', label: 'Cores Count', placeholder: 'e.g. 6 Cores (6P + 0E)' },
      { key: 'Threads', label: 'Threads Count', placeholder: 'e.g. 12 Threads' },
      { key: 'Base Clock', label: 'Base Clock', placeholder: 'e.g. 2.5 GHz / 3.7 GHz' },
      { key: 'Boost Clock', label: 'Boost Clock', placeholder: 'e.g. 4.4 GHz / 4.6 GHz' },
      { key: 'Power Usage (TDP)', label: 'Power Usage (TDP)', placeholder: 'e.g. 65W / 125W', isPower: true },
      { key: 'Estimated Gaming FPS', label: 'Estimated Gaming FPS (1080p Ultra)', placeholder: 'e.g. 135 FPS', isFps: true },
    ]
  },
  gpu: {
    key: 'gpu',
    name: 'Graphics Cards (GPU)',
    fields: [
      { key: 'Brand', label: 'Brand / Manufacturer', placeholder: 'e.g. NVIDIA / AMD / ASUS / MSI / Gigabyte' },
      { key: 'VRAM', label: 'VRAM / Memory Size', placeholder: 'e.g. 8GB GDDR6 / 12GB GDDR6X / 24GB' },
      { key: 'Boost Clock', label: 'Boost Clock', placeholder: 'e.g. 1777 MHz / 2520 MHz' },
      { key: 'Memory Interface', label: 'Memory Bus Interface', placeholder: 'e.g. 128-bit / 192-bit / 256-bit' },
      { key: 'Recommended PSU', label: 'Recommended PSU Wattage', placeholder: 'e.g. 550W / 650W / 750W' },
      { key: 'Ray Tracing', label: 'Ray Tracing Support', placeholder: 'e.g. Supported / 3rd Gen RT' },
      { key: 'Power Usage (TDP)', label: 'Power Usage (TDP)', placeholder: 'e.g. 170W / 285W / 450W', isPower: true },
      { key: 'Estimated Gaming FPS', label: 'Estimated Gaming FPS (1080p Ultra)', placeholder: 'e.g. 95 FPS / 185 FPS', isFps: true },
    ]
  },
  ram: {
    key: 'ram',
    name: 'Memory (RAM)',
    fields: [
      { key: 'Brand', label: 'Brand / Manufacturer', placeholder: 'e.g. Corsair / Kingston / G.Skill / TeamGroup' },
      { key: 'Capacity', label: 'Memory Capacity', placeholder: 'e.g. 16GB (2x8GB) / 32GB (2x16GB)' },
      { key: 'Memory Type', label: 'Memory Type', placeholder: 'e.g. DDR4 / DDR5' },
      { key: 'Speed', label: 'Speed / Frequency', placeholder: 'e.g. 3200MHz / 3600MHz / 6000MHz' },
      { key: 'Latency (CAS)', label: 'CAS Latency', placeholder: 'e.g. CL16 / CL18 / CL30' },
      { key: 'Voltage', label: 'Operating Voltage', placeholder: 'e.g. 1.35V / 1.4V' },
      { key: 'Power Usage', label: 'Power Usage', placeholder: 'e.g. 3W - 5W', isPower: true },
    ]
  },
  storage: {
    key: 'storage',
    name: 'Storage (SSD/HDD)',
    fields: [
      { key: 'Brand', label: 'Brand / Manufacturer', placeholder: 'e.g. Samsung / Crucial / Kingston / Western Digital' },
      { key: 'Capacity', label: 'Storage Capacity', placeholder: 'e.g. 500GB / 1TB / 2TB / 4TB' },
      { key: 'Form Factor', label: 'Form Factor & Type', placeholder: 'e.g. M.2 2280 NVMe SSD / 2.5" SATA' },
      { key: 'Interface', label: 'Drive Interface', placeholder: 'e.g. PCIe 4.0 x4 / PCIe 3.0 / SATA III' },
      { key: 'Read Speed', label: 'Max Sequential Read', placeholder: 'e.g. 7000 MB/s / 3500 MB/s' },
      { key: 'Write Speed', label: 'Max Sequential Write', placeholder: 'e.g. 5000 MB/s / 3000 MB/s' },
      { key: 'Power Usage', label: 'Power Usage', placeholder: 'e.g. 5W Active / 0.5W Idle', isPower: true },
    ]
  },
  motherboard: {
    key: 'motherboard',
    name: 'Motherboards',
    fields: [
      { key: 'Brand', label: 'Brand / Manufacturer', placeholder: 'e.g. ASUS / MSI / Gigabyte / ASRock' },
      { key: 'Chipset', label: 'Motherboard Chipset', placeholder: 'e.g. Intel B660 / AMD B550 / Intel Z790' },
      { key: 'Socket', label: 'CPU Socket Support', placeholder: 'e.g. LGA1700 / AM5 / AM4' },
      { key: 'Form Factor', label: 'Form Factor', placeholder: 'e.g. ATX / Micro-ATX / Mini-ITX' },
      { key: 'Memory Slots', label: 'Memory Slots & Gen', placeholder: 'e.g. 4x DDR4 (Max 128GB) / 4x DDR5' },
      { key: 'PCIe Support', label: 'PCIe Generation', placeholder: 'e.g. 1x PCIe 5.0 x16 / PCIe 4.0' },
      { key: 'M.2 Slots', label: 'M.2 NVMe Slots', placeholder: 'e.g. 2x M.2 PCIe 4.0 Slots' },
    ]
  },
  psu: {
    key: 'psu',
    name: 'Power Supplies (PSU)',
    fields: [
      { key: 'Brand', label: 'Brand / Manufacturer', placeholder: 'e.g. Corsair / Seasonic / EVGA / Cooler Master' },
      { key: 'Wattage', label: 'Total Wattage Output', placeholder: 'e.g. 650W / 750W / 850W / 1000W', isPower: true },
      { key: 'Efficiency', label: '80 Plus Efficiency', placeholder: 'e.g. 80 Plus Gold / Bronze / Platinum' },
      { key: 'Modularity', label: 'Cable Modularity', placeholder: 'e.g. Fully Modular / Semi-Modular / Non-Modular' },
      { key: 'Form Factor', label: 'PSU Form Factor', placeholder: 'e.g. Standard ATX / SFX' },
      { key: 'Connectors', label: 'PCIe Connectors', placeholder: 'e.g. 4x 8-pin (6+2) / 1x 12VHPWR' },
    ]
  },
  cooling: {
    key: 'cooling',
    name: 'Cooling',
    fields: [
      { key: 'Brand', label: 'Brand / Manufacturer', placeholder: 'e.g. NZXT / Corsair / DeepCool / Noctua' },
      { key: 'Cooler Type', label: 'Cooler Type', placeholder: 'e.g. 240mm AIO Liquid / Dual Tower Air Cooler' },
      { key: 'TDP Cooling Capacity', label: 'Cooling Capacity (TDP)', placeholder: 'e.g. 250W TDP / 280W TDP', isPower: true },
      { key: 'Fan Speed', label: 'Fan Speed & Noise Level', placeholder: 'e.g. 800 - 2000 RPM (28 dBA)' },
      { key: 'Socket Support', label: 'Socket Compatibility', placeholder: 'e.g. LGA1700 / AM5 / AM4 / LGA1200' },
      { key: 'Power Usage', label: 'Power Usage', placeholder: 'e.g. 15W Pump & Fans', isPower: true },
    ]
  },
  cases: {
    key: 'cases',
    name: 'Cases',
    fields: [
      { key: 'Brand', label: 'Brand / Manufacturer', placeholder: 'e.g. NZXT / Lian Li / Corsair / Fractal Design' },
      { key: 'Form Factor Support', label: 'Supported Motherboards', placeholder: 'e.g. ATX / Micro-ATX / Mini-ITX' },
      { key: 'Max GPU Length', label: 'Max GPU Length', placeholder: 'e.g. 380mm / 400mm' },
      { key: 'Max CPU Cooler Height', label: 'Max CPU Cooler Height', placeholder: 'e.g. 165mm / 170mm' },
      { key: 'Max PSU Length', label: 'Max PSU Length', placeholder: 'e.g. 200mm' },
      { key: 'Included Fans', label: 'Included Cooling Fans', placeholder: 'e.g. 3x 120mm ARGB Fans' },
    ]
  }
};

/**
 * Returns the matching category config key based on category name or category ID
 */
export const getCategoryKey = (catName = '') => {
  const lower = String(catName).toLowerCase();
  if (lower.includes('cpu') || lower.includes('process')) return 'cpu';
  if (lower.includes('gpu') || lower.includes('graphic') || lower.includes('card')) return 'gpu';
  if (lower.includes('storage') || lower.includes('ssd') || lower.includes('hard') || lower.includes('drive')) return 'storage';
  if (lower.includes('ram') || lower.includes('memory')) return 'ram';
  if (lower.includes('motherboard') || lower.includes('board')) return 'motherboard';
  if (lower.includes('psu') || lower.includes('power')) return 'psu';
  if (lower.includes('cool')) return 'cooling';
  if (lower.includes('case')) return 'cases';
  return null;
};

/**
 * Get category fields template list
 */
export const getCategoryFields = (catName = '') => {
  const key = getCategoryKey(catName);
  if (key && CATEGORY_SPECS_CONFIG[key]) {
    return CATEGORY_SPECS_CONFIG[key].fields;
  }
  // Generic fallback if unknown category
  return [
    { key: 'Brand', label: 'Brand / Manufacturer', placeholder: 'e.g. Corsair / Intel / NVIDIA' },
    { key: 'Specification', label: 'Key Specification', placeholder: 'e.g. Model, details...' },
    { key: 'Power Usage (TDP)', label: 'Power Usage (TDP)', placeholder: 'e.g. 100W', isPower: true },
    { key: 'Estimated Gaming FPS', label: 'Estimated Gaming FPS', placeholder: 'e.g. 90 FPS', isFps: true }
  ];
};
