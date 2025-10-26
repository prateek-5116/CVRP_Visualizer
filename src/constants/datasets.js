/**
 * Utility to generate reproducible mock data based on CVRPLIB instance parameters.
 */
const generateCustomerData = (instanceName, depotX, depotY, numCustomers, capacity) => {
  const customers = [];
  const minDemand = 1; 
  const maxDemand = Math.floor(capacity / 5); 

  let seed = instanceName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const random = (s) => () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
  const seededRandom = random(seed);

  const totalDemand = capacity * 1.5; 
  let currentTotalDemand = 0;
  
  for (let i = 1; i <= numCustomers; i++) {
    const angle = seededRandom() * 2 * Math.PI;
    const distance = 45 * seededRandom(); 
    
    const x = Math.min(95, Math.max(5, depotX + Math.cos(angle) * distance));
    const y = Math.min(95, Math.max(5, depotY + Math.sin(angle) * distance));

    let demand = Math.floor(seededRandom() * (maxDemand - minDemand + 1)) + minDemand;
    
    if (numCustomers < 30) {
        demand = Math.min(demand, 15);
    } else {
        demand = Math.min(demand, 30);
    }
    
    demand = Math.max(1, demand); 
    currentTotalDemand += demand;

    customers.push({
      id: i + 1, 
      x: x,
      y: y,
      demand: demand,
    });
  }
  
  if (currentTotalDemand < totalDemand * 0.8) {
     const scaleFactor = totalDemand / currentTotalDemand;
     customers.forEach(c => c.demand = Math.min(maxDemand, Math.round(c.demand * scaleFactor)));
  }

  return customers;
};

// Definitions for all 10 CVRPLIB instances + 3 custom samples.
const INSTANCE_DEFINITIONS = [
    // --- Custom Samples (Hardcoded) ---
    { name: 'Small-n9-k3', capacity: 50, customers: 8, depotX: 50, depotY: 50, mock: false },
    { name: 'P-n16-k8', capacity: 35, customers: 15, depotX: 35, depotY: 35, mock: false },
    { name: 'A-n32-k5', capacity: 100, customers: 31, depotX: 37, depotY: 52, mock: false },
    
    // --- CVRPLIB Benchmarks (Generated Mock Data) ---
    { name: 'A-n33-k5', capacity: 100, vehicles: 5, customers: 32, mock: true, depotX: 50, depotY: 50 },
    { name: 'A-n64-k9', capacity: 100, vehicles: 9, customers: 63, mock: true, depotX: 50, depotY: 50 },
    { name: 'B-n41-k6', capacity: 100, vehicles: 6, customers: 40, mock: true, depotX: 50, depotY: 50 },
    { name: 'B-n78-k10', capacity: 100, vehicles: 10, customers: 77, mock: true, depotX: 50, depotY: 50 },
    { name: 'E-n23-k3', capacity: 4500, vehicles: 3, customers: 22, mock: true, depotX: 50, depotY: 50 },
    { name: 'F-n72-k4', capacity: 30000, vehicles: 4, customers: 71, mock: true, depotX: 50, depotY: 50 },
    { name: 'F-n135-k7', capacity: 2210, vehicles: 7, customers: 134, mock: true, depotX: 50, depotY: 50 },
    { name: 'M-n101-k10', capacity: 200, vehicles: 10, customers: 100, mock: true, depotX: 50, depotY: 50 },
    { name: 'P-n55-k7', capacity: 170, vehicles: 7, customers: 54, mock: true, depotX: 50, depotY: 50 },
    { name: 'P-n76-k5', capacity: 280, vehicles: 5, customers: 75, mock: true, depotX: 50, depotY: 50 },
];

/**
 * Creates the final sampleDatasets object, using hardcoded or generated data.
 */
const createSampleDatasets = () => {
    const datasets = {};
    INSTANCE_DEFINITIONS.forEach(def => {
        const depot = { id: 1, x: def.depotX, y: def.depotY, demand: 0 };
        let customers = [];

        if (def.mock) {
            customers = generateCustomerData(def.name, def.depotX, def.depotY, def.customers, def.capacity);
        } else if (def.name === 'Small-n9-k3') {
            customers = [
                { id: 2, x: 30, y: 40, demand: 15 }, { id: 3, x: 70, y: 60, demand: 10 },
                { id: 4, x: 80, y: 30, demand: 20 }, { id: 5, x: 20, y: 70, demand: 18 },
                { id: 6, x: 60, y: 80, demand: 12 }, { id: 7, x: 40, y: 20, demand: 25 },
                { id: 8, x: 90, y: 50, demand: 10 }, { id: 9, x: 10, y: 10, demand: 22 },
            ];
        } else if (def.name === 'P-n16-k8') {
             customers = [
                { id: 2, x: 41, y: 49, demand: 10 }, { id: 3, x: 35, y: 17, demand: 7 },
                { id: 4, x: 55, y: 45, demand: 13 }, { id: 5, x: 55, y: 20, demand: 19 },
                { id: 6, x: 15, y: 30, demand: 26 }, { id: 7, x: 25, y: 30, demand: 9 },
                { id: 8, x: 20, y: 50, demand: 16 }, { id: 9, x: 10, y: 43, demand: 6 },
                { id: 10, x: 55, y: 60, demand: 16 }, { id: 11, x: 30, y: 60, demand: 8 },
                { id: 12, x: 20, y: 65, demand: 14 }, { id: 13, x: 50, y: 70, demand: 7 },
                { id: 14, x: 60, y: 70, demand: 10 }, { id: 15, x: 45, y: 65, demand: 21 },
            ];
        } else if (def.name === 'A-n32-k5') {
             customers = [
                { id: 2, x: 49, y: 49, demand: 10 }, { id: 3, x: 52, y: 64, demand: 16 },
                { id: 4, x: 20, y: 26, demand: 9 }, { id: 5, x: 40, y: 30, demand: 21 },
                { id: 6, x: 21, y: 47, demand: 15 }, { id: 7, x: 17, y: 63, demand: 19 },
                { id: 8, x: 31, y: 62, demand: 23 }, { id: 9, x: 52, y: 33, demand: 11 },
                { id: 10, x: 51, y: 21, demand: 5 }, { id: 11, x: 42, y: 41, demand: 12 },
                { id: 12, x: 31, y: 32, demand: 29 }, { id: 13, x: 5, y: 25, demand: 14 },
                { id: 14, x: 12, y: 42, demand: 8 }, { id: 15, x: 36, y: 16, demand: 16 },
                { id: 16, x: 52, y: 41, demand: 24 }, { id: 17, x: 27, y: 23, demand: 7 },
                { id: 18, x: 17, y: 33, demand: 13 }, { id: 19, y: 13, demand: 19 },
                { id: 20, x: 57, y: 58, demand: 5 }, { id: 21, x: 62, y: 42, demand: 17 },
                { id: 22, x: 42, y: 57, demand: 11 }, { id: 23, x: 16, y: 57, demand: 8 },
                { id: 24, x: 8, y: 52, demand: 4 }, { id: 25, x: 7, y: 38, demand: 20 },
                { id: 26, x: 27, y: 68, demand: 15 }, { id: 27, x: 30, y: 48, demand: 6 },
                { id: 28, x: 43, y: 67, demand: 18 }, { id: 29, x: 58, y: 48, demand: 14 },
                { id: 30, x: 58, y: 27, demand: 9 }, { id: 31, x: 37, y: 69, demand: 12 },
                { id: 32, x: 38, y: 46, demand: 10 },
            ];
        }
        
        datasets[def.name] = {
            name: def.name,
            capacity: def.capacity,
            depot: depot,
            customers: customers,
        };
    });
    return datasets;
};

export const sampleDatasets = createSampleDatasets();