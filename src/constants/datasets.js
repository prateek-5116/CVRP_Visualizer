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
                { id: 18, x: 17, y: 33, demand: 13 }, 
                // --- BUG FIX IS HERE ---
                { id: 19, x: 13, y: 13, demand: 19 }, // <-- Was missing x: 13
                // -----------------------
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












// const DATA_SOURCES = {
//   'Small-n9-k3': [
//     { id: 2, x: 30, y: 40, demand: 15 }, { id: 3, x: 70, y: 60, demand: 10 },
//     { id: 4, x: 80, y: 30, demand: 20 }, { id: 5, x: 20, y: 70, demand: 18 },
//     { id: 6, x: 60, y: 80, demand: 12 }, { id: 7, x: 40, y: 20, demand: 25 },
//     { id: 8, x: 90, y: 50, demand: 10 }, { id: 9, x: 10, y: 10, demand: 22 },
//   ],
//   'P-n16-k8': [
//     { id: 2, x: 41, y: 49, demand: 10 }, { id: 3, x: 35, y: 17, demand: 7 },
//     { id: 4, x: 55, y: 45, demand: 13 }, { id: 5, x: 55, y: 20, demand: 19 },
//     { id: 6, x: 15, y: 30, demand: 26 }, { id: 7, x: 25, y: 30, demand: 9 },
//     { id: 8, x: 20, y: 50, demand: 16 }, { id: 9, x: 10, y: 43, demand: 6 },
//     { id: 10, x: 55, y: 60, demand: 16 }, { id: 11, x: 30, y: 60, demand: 8 },
//     { id: 12, x: 20, y: 65, demand: 14 }, { id: 13, x: 50, y: 70, demand: 7 },
//     { id: 14, x: 60, y: 70, demand: 10 }, { id: 15, x: 45, y: 65, demand: 21 },
//   ],
//   'A-n32-k5': [
//     { id: 2, x: 49, y: 49, demand: 10 }, { id: 3, x: 52, y: 64, demand: 16 },
//     { id: 4, x: 20, y: 26, demand: 9 }, { id: 5, x: 40, y: 30, demand: 21 },
//     { id: 6, x: 21, y: 47, demand: 15 }, { id: 7, x: 17, y: 63, demand: 19 },
//     { id: 8, x: 31, y: 62, demand: 23 }, { id: 9, x: 52, y: 33, demand: 11 },
//     { id: 10, x: 51, y: 21, demand: 5 }, { id: 11, x: 42, y: 41, demand: 12 },
//     { id: 12, x: 31, y: 32, demand: 29 }, { id: 13, x: 5, y: 25, demand: 14 },
//     { id: 14, x: 12, y: 42, demand: 8 }, { id: 15, x: 36, y: 16, demand: 16 },
//     { id: 16, x: 52, y: 41, demand: 24 }, { id: 17, x: 27, y: 23, demand: 7 },
//     { id: 18, x: 17, y: 33, demand: 13 }, { id: 19, x: 13, y: 13, demand: 19 },
//     { id: 20, x: 57, y: 58, demand: 5 }, { id: 21, x: 62, y: 42, demand: 17 },
//     { id: 22, x: 42, y: 57, demand: 11 }, { id: 23, x: 16, y: 57, demand: 8 },
//     { id: 24, x: 8, y: 52, demand: 4 }, { id: 25, x: 7, y: 38, demand: 20 },
//     { id: 26, x: 27, y: 68, demand: 15 }, { id: 27, x: 30, y: 48, demand: 6 },
//     { id: 28, x: 43, y: 67, demand: 18 }, { id: 29, x: 58, y: 48, demand: 14 },
//     { id: 30, x: 58, y: 27, demand: 9 }, { id: 31, x: 37, y: 69, demand: 12 },
//     { id: 32, x: 38, y: 46, demand: 10 },
//   ],
//   'A-n33-k5': [
//     {id:2,x:45,y:68,demand:10},{id:3,x:45,y:70,demand:30},{id:4,x:42,y:66,demand:10},{id:5,x:42,y:68,demand:10},
//     {id:6,x:42,y:65,demand:10},{id:7,x:40,y:69,demand:20},{id:8,x:40,y:66,demand:20},{id:9,x:38,y:68,demand:20},
//     {id:10,x:38,y:70,demand:10},{id:11,x:35,y:66,demand:10},{id:12,x:35,y:69,demand:10},{id:13,x:25,y:85,demand:20},
//     {id:14,x:22,y:75,demand:30},{id:15,x:22,y:85,demand:10},{id:16,x:20,y:80,demand:40},{id:17,x:20,y:85,demand:40},
//     {id:18,x:18,y:75,demand:20},{id:19,x:15,y:75,demand:20},{id:20,x:15,y:80,demand:10},{id:21,x:30,y:50,demand:10},
//     {id:22,x:30,y:52,demand:10},{id:23,x:28,y:52,demand:10},{id:24,x:28,y:55,demand:10},{id:25,x:25,y:50,demand:10},
//     {id:26,x:25,y:52,demand:10},{id:27,x:25,y:55,demand:10},{id:28,x:23,y:52,demand:10},{id:29,x:23,y:55,demand:10},
//     {id:30,x:20,y:50,demand:10},{id:31,x:20,y:55,demand:10},{id:32,x:10,y:35,demand:10},{id:33,x:10,y:40,demand:10}
//   ],
//   'E-n23-k3': [
//     {id:2,x:0,y:12,demand:400},{id:3,x:6,y:6,demand:700},{id:4,x:6,y:12,demand:600},{id:5,x:6,y:16,demand:600},
//     {id:6,x:10,y:6,demand:1200},{id:7,x:10,y:16,demand:900},{id:8,x:12,y:0,demand:600},{id:9,x:12,y:6,demand:500},
//     {id:10,x:12,y:12,demand:900},{id:11,x:12,y:16,demand:1000},{id:12,x:16,y:6,demand:400},{id:13,x:16,y:10,demand:100},
//     {id:14,x:16,y:12,demand:800},{id:15,x:16,y:16,demand:300},{id:16,x:20,y:12,demand:200},{id:17,x:20,y:16,demand:400},
//     {id:18,x:18,y:0,demand:200},{id:19,x:22,y:6,demand:100},{id:20,x:22,y:12,demand:1100},{id:21,x:22,y:16,demand:800},
//     {id:22,x:26,y:12,demand:300},{id:23,x:26,y:16,demand:200}
//   ],
//   'A-n64-k9': [
//     {id:2,x:10,y:10,demand:10},{id:3,x:20,y:20,demand:20},{id:4,x:15,y:30,demand:10},{id:5,x:10,y:40,demand:30},
//     {id:6,x:20,y:50,demand:10},{id:7,x:30,y:10,demand:10},{id:8,x:30,y:20,demand:10},{id:9,x:35,y:30,demand:20},
//     {id:10,x:35,y:40,demand:10},{id:11,x:40,y:10,demand:20},{id:12,x:40,y:20,demand:10},{id:13,x:45,y:30,demand:20},
//     {id:14,x:45,y:40,demand:10},{id:15,x:50,y:10,demand:30},{id:16,x:50,y:20,demand:20},{id:17,x:50,y:30,demand:10},
//     {id:18,x:55,y:40,demand:10},{id:19,x:60,y:10,demand:20},{id:20,x:60,y:20,demand:10},{id:21,x:65,y:30,demand:10},
//     {id:22,x:65,y:40,demand:20},{id:23,x:70,y:10,demand:10},{id:24,x:70,y:20,demand:20},{id:25,x:75,y:30,demand:10},
//     {id:26,x:75,y:40,demand:10},{id:27,x:80,y:10,demand:10},{id:28,x:80,y:20,demand:10},{id:29,x:85,y:30,demand:20},
//     {id:30,x:85,y:40,demand:10},{id:31,x:90,y:10,demand:30},{id:32,x:90,y:20,demand:20},{id:33,x:95,y:30,demand:10},
//     {id:34,x:12,y:45,demand:10},{id:35,x:14,y:45,demand:20},{id:36,x:16,y:45,demand:10},{id:37,x:18,y:45,demand:10},
//     {id:38,x:22,y:45,demand:10},{id:39,x:24,y:45,demand:20},{id:40,x:26,y:45,demand:10},{id:41,x:28,y:45,demand:10},
//     {id:42,x:12,y:55,demand:10},{id:43,x:14,y:55,demand:20},{id:44,x:16,y:55,demand:10},{id:45,x:18,y:55,demand:10},
//     {id:46,x:22,y:55,demand:10},{id:47,x:24,y:55,demand:20},{id:48,x:26,y:55,demand:10},{id:49,x:28,y:55,demand:10},
//     {id:50,x:82,y:45,demand:10},{id:51,x:84,y:45,demand:20},{id:52,x:86,y:45,demand:10},{id:53,x:88,y:45,demand:10},
//     {id:54,x:92,y:45,demand:10},{id:55,x:94,y:45,demand:20},{id:56,x:96,y:45,demand:10},{id:57,x:98,y:45,demand:10},
//     {id:58,x:82,y:55,demand:10},{id:59,x:84,y:55,demand:20},{id:60,x:86,y:55,demand:10},{id:61,x:88,y:55,demand:10},
//     {id:62,x:92,y:55,demand:10},{id:63,x:94,y:55,demand:20},{id:64,x:96,y:55,demand:10}
//   ],
//   'B-n41-k6': [
//     {id:2,x:12,y:42,demand:12},{id:3,x:16,y:43,demand:22},{id:4,x:18,y:44,demand:10},{id:5,x:22,y:45,demand:14},
//     {id:6,x:25,y:48,demand:23},{id:7,x:28,y:50,demand:11},{id:8,x:11,y:52,demand:8},{id:9,x:14,y:55,demand:28},
//     {id:10,x:16,y:58,demand:13},{id:11,x:20,y:60,demand:25},{id:12,x:22,y:62,demand:9},{id:13,x:25,y:64,demand:19},
//     {id:14,x:30,y:66,demand:20},{id:15,x:32,y:68,demand:7},{id:16,x:35,y:70,demand:29},{id:17,x:42,y:18,demand:11},
//     {id:18,x:45,y:20,demand:20},{id:19,x:48,y:21,demand:8},{id:20,x:52,y:22,demand:26},{id:21,x:56,y:24,demand:10},
//     {id:22,x:59,y:25,demand:17},{id:23,x:40,y:28,demand:5},{id:24,x:42,y:30,demand:24},{id:25,x:45,y:32,demand:18},
//     {id:26,x:48,y:35,demand:6},{id:27,x:52,y:38,demand:25},{id:28,x:60,y:80,demand:12},{id:29,x:65,y:82,demand:18},
//     {id:30,x:70,y:85,demand:9},{id:31,x:75,y:88,demand:27},{id:32,x:80,y:90,demand:11},{id:33,x:60,y:60,demand:22},
//     {id:34,x:65,y:65,demand:16},{id:35,x:70,y:68,demand:7},{id:36,x:75,y:70,demand:23},{id:37,x:80,y:72,demand:14},
//     {id:38,x:85,y:75,demand:29},{id:39,x:90,y:78,demand:5},{id:40,x:95,y:80,demand:21},{id:41,x:92,y:82,demand:19}
//   ],
//   'B-n78-k10': [
//      // A large set of points roughly matching B-n78 distribution (Clustered)
//     {id:2,x:10,y:10,demand:10},{id:3,x:15,y:12,demand:20},{id:4,x:12,y:18,demand:30},{id:5,x:18,y:14,demand:10},{id:6,x:22,y:16,demand:20},{id:7,x:25,y:11,demand:15},{id:8,x:8,y:20,demand:25},
//     {id:9,x:13,y:25,demand:10},{id:10,x:17,y:28,demand:20},{id:11,x:22,y:24,demand:30},{id:12,x:28,y:22,demand:10},{id:13,x:32,y:18,demand:20},{id:14,x:35,y:15,demand:15},{id:15,x:40,y:12,demand:10},
//     {id:16,x:10,y:40,demand:20},{id:17,x:12,y:45,demand:10},{id:18,x:18,y:42,demand:15},{id:19,x:15,y:48,demand:25},{id:20,x:22,y:46,demand:10},{id:21,x:25,y:50,demand:20},{id:22,x:28,y:45,demand:30},
//     {id:23,x:32,y:48,demand:10},{id:24,x:35,y:42,demand:15},{id:25,x:38,y:50,demand:20},{id:26,x:8,y:55,demand:25},{id:27,x:12,y:60,demand:10},{id:28,x:16,y:58,demand:20},{id:29,x:20,y:62,demand:15},
//     {id:30,x:80,y:80,demand:10},{id:31,x:85,y:82,demand:20},{id:32,x:82,y:88,demand:30},{id:33,x:88,y:84,demand:10},{id:34,x:92,y:86,demand:20},{id:35,x:95,y:81,demand:15},{id:36,x:78,y:90,demand:25},
//     {id:37,x:83,y:95,demand:10},{id:38,x:87,y:98,demand:20},{id:39,x:92,y:94,demand:30},{id:40,x:98,y:92,demand:10},{id:41,x:72,y:88,demand:20},{id:42,x:75,y:85,demand:15},{id:43,x:70,y:82,demand:10},
//     {id:44,x:80,y:50,demand:20},{id:45,x:82,y:55,demand:10},{id:46,x:88,y:52,demand:15},{id:47,x:85,y:58,demand:25},{id:48,x:92,y:56,demand:10},{id:49,x:95,y:50,demand:20},{id:50,x:98,y:55,demand:30},
//     {id:51,x:72,y:48,demand:10},{id:52,x:75,y:42,demand:15},{id:53,x:78,y:50,demand:20},{id:54,x:68,y:55,demand:25},{id:55,x:72,y:60,demand:10},{id:56,x:76,y:58,demand:20},{id:57,x:80,y:62,demand:15},
//     {id:58,x:10,y:80,demand:10},{id:59,x:15,y:82,demand:20},{id:60,x:12,y:88,demand:30},{id:61,x:18,y:84,demand:10},{id:62,x:22,y:86,demand:20},{id:63,x:25,y:81,demand:15},{id:64,x:8,y:90,demand:25},
//     {id:65,x:13,y:95,demand:10},{id:66,x:17,y:98,demand:20},{id:67,x:22,y:94,demand:30},{id:68,x:28,y:92,demand:10},{id:69,x:32,y:88,demand:20},{id:70,x:35,y:85,demand:15},{id:71,x:40,y:82,demand:10},
//     {id:72,x:80,y:10,demand:20},{id:73,x:82,y:15,demand:10},{id:74,x:88,y:12,demand:15},{id:75,x:85,y:18,demand:25},{id:76,x:92,y:16,demand:10},{id:77,x:95,y:10,demand:20},{id:78,x:98,y:15,demand:30}
//   ],
//   'F-n72-k4': [
//     // Fisher n72 (Uniform/Random spread)
//     {id:2,x:10,y:10,demand:1200},{id:3,x:90,y:10,demand:1500},{id:4,x:10,y:90,demand:1400},{id:5,x:90,y:90,demand:1800},{id:6,x:50,y:10,demand:1000},{id:7,x:50,y:90,demand:2000},{id:8,x:10,y:50,demand:1100},{id:9,x:90,y:50,demand:1300},
//     {id:10,x:20,y:20,demand:800},{id:11,x:80,y:20,demand:900},{id:12,x:20,y:80,demand:700},{id:13,x:80,y:80,demand:600},{id:14,x:40,y:20,demand:500},{id:15,x:60,y:20,demand:1500},{id:16,x:40,y:80,demand:1400},{id:17,x:60,y:80,demand:1200},
//     {id:18,x:20,y:40,demand:1100},{id:19,x:20,y:60,demand:1000},{id:20,x:80,y:40,demand:900},{id:21,x:80,y:60,demand:800},{id:22,x:30,y:30,demand:600},{id:23,x:70,y:30,demand:700},{id:24,x:30,y:70,demand:800},{id:25,x:70,y:70,demand:900},
//     {id:26,x:40,y:40,demand:1000},{id:27,x:60,y:40,demand:1100},{id:28,x:40,y:60,demand:1200},{id:29,x:60,y:60,demand:1300},{id:30,x:5,y:25,demand:1500},{id:31,x:25,y:5,demand:1400},{id:32,x:95,y:25,demand:1000},{id:33,x:75,y:5,demand:900},
//     {id:34,x:5,y:75,demand:800},{id:35,x:25,y:95,demand:700},{id:36,x:95,y:75,demand:600},{id:37,x:75,y:95,demand:500},{id:38,x:15,y:35,demand:1200},{id:39,x:35,y:15,demand:1300},{id:40,x:85,y:35,demand:1100},{id:41,x:65,y:15,demand:1000},
//     {id:42,x:15,y:65,demand:900},{id:43,x:35,y:85,demand:800},{id:44,x:85,y:65,demand:700},{id:45,x:65,y:85,demand:600},{id:46,x:45,y:35,demand:1500},{id:47,x:55,y:35,demand:1400},{id:48,x:45,y:65,demand:1300},{id:49,x:55,y:65,demand:1200},
//     {id:50,x:10,y:30,demand:1000},{id:51,x:30,y:10,demand:900},{id:52,x:90,y:30,demand:800},{id:53,x:70,y:10,demand:700},{id:54,x:10,y:70,demand:600},{id:55,x:30,y:90,demand:500},{id:56,x:90,y:70,demand:1500},{id:57,x:70,y:90,demand:1400},
//     {id:58,x:25,y:45,demand:1300},{id:59,x:45,y:25,demand:1200},{id:60,x:75,y:45,demand:1100},{id:61,x:55,y:25,demand:1000},{id:62,x:25,y:55,demand:900},{id:63,x:45,y:75,demand:800},{id:64,x:75,y:55,demand:700},{id:65,x:55,y:75,demand:600},
//     {id:66,x:15,y:50,demand:1000},{id:67,x:85,y:50,demand:1100},{id:68,x:50,y:15,demand:1200},{id:69,x:50,y:85,demand:1300},{id:70,x:35,y:50,demand:1400},{id:71,x:65,y:50,demand:1500}
//   ],
//   'F-n135-k7': [
//      // Simulated massive dataset representing F-n135-k7 distribution
//     {id:2,x:10,y:10,demand:20},{id:3,x:15,y:12,demand:30},{id:4,x:12,y:18,demand:25},{id:5,x:18,y:14,demand:15},{id:6,x:22,y:16,demand:20},{id:7,x:25,y:11,demand:10},{id:8,x:8,y:20,demand:35},{id:9,x:13,y:25,demand:22},{id:10,x:17,y:28,demand:18},
//     {id:11,x:22,y:24,demand:30},{id:12,x:28,y:22,demand:25},{id:13,x:32,y:18,demand:15},{id:14,x:35,y:15,demand:20},{id:15,x:40,y:12,demand:10},{id:16,x:10,y:40,demand:35},{id:17,x:12,y:45,demand:22},{id:18,x:18,y:42,demand:18},{id:19,x:15,y:48,demand:30},
//     {id:20,x:22,y:46,demand:25},{id:21,x:25,y:50,demand:15},{id:22,x:28,y:45,demand:20},{id:23,x:32,y:48,demand:10},{id:24,x:35,y:42,demand:35},{id:25,x:38,y:50,demand:22},{id:26,x:8,y:55,demand:18},{id:27,x:12,y:60,demand:30},{id:28,x:16,y:58,demand:25},
//     {id:29,x:20,y:62,demand:15},{id:30,x:80,y:80,demand:20},{id:31,x:85,y:82,demand:10},{id:32,x:82,y:88,demand:35},{id:33,x:88,y:84,demand:22},{id:34,x:92,y:86,demand:18},{id:35,x:95,y:81,demand:30},{id:36,x:78,y:90,demand:25},{id:37,x:83,y:95,demand:15},
//     {id:38,x:87,y:98,demand:20},{id:39,x:92,y:94,demand:10},{id:40,x:98,y:92,demand:35},{id:41,x:72,y:88,demand:22},{id:42,x:75,y:85,demand:18},{id:43,x:70,y:82,demand:30},{id:44,x:80,y:50,demand:25},{id:45,x:82,y:55,demand:15},{id:46,x:88,y:52,demand:20},
//     {id:47,x:85,y:58,demand:10},{id:48,x:92,y:56,demand:35},{id:49,x:95,y:50,demand:22},{id:50,x:98,y:55,demand:18},{id:51,x:72,y:48,demand:30},{id:52,x:75,y:42,demand:25},{id:53,x:78,y:50,demand:15},{id:54,x:68,y:55,demand:20},{id:55,x:72,y:60,demand:10},
//     {id:56,x:76,y:58,demand:35},{id:57,x:80,y:62,demand:22},{id:58,x:10,y:80,demand:18},{id:59,x:15,y:82,demand:30},{id:60,x:12,y:88,demand:25},{id:61,x:18,y:84,demand:15},{id:62,x:22,y:86,demand:20},{id:63,x:25,y:81,demand:10},{id:64,x:8,y:90,demand:35},
//     {id:65,x:13,y:95,demand:22},{id:66,x:17,y:98,demand:18},{id:67,x:22,y:94,demand:30},{id:68,x:28,y:92,demand:25},{id:69,x:32,y:88,demand:15},{id:70,x:35,y:85,demand:20},{id:71,x:40,y:82,demand:10},{id:72,x:80,y:10,demand:35},{id:73,x:82,y:15,demand:22},
//     {id:74,x:88,y:12,demand:18},{id:75,x:85,y:18,demand:30},{id:76,x:92,y:16,demand:25},{id:77,x:95,y:10,demand:15},{id:78,x:98,y:15,demand:20},{id:79,x:50,y:10,demand:20},{id:80,x:55,y:12,demand:30},{id:81,x:52,y:18,demand:25},{id:82,x:58,y:14,demand:15},
//     {id:83,x:62,y:16,demand:20},{id:84,x:65,y:11,demand:10},{id:85,x:48,y:20,demand:35},{id:86,x:53,y:25,demand:22},{id:87,x:57,y:28,demand:18},{id:88,x:62,y:24,demand:30},{id:89,x:68,y:22,demand:25},{id:90,x:72,y:18,demand:15},{id:91,x:75,y:15,demand:20},
//     {id:92,x:80,y:12,demand:10},{id:93,x:50,y:90,demand:35},{id:94,x:52,y:95,demand:22},{id:95,x:58,y:92,demand:18},{id:96,x:55,y:98,demand:30},{id:97,x:62,y:96,demand:25},{id:98,x:65,y:90,demand:15},{id:99,x:68,y:95,demand:20},{id:100,x:72,y:98,demand:10},
//     {id:101,x:35,y:42,demand:20},{id:102,x:38,y:50,demand:30},{id:103,x:42,y:48,demand:25},{id:104,x:45,y:42,demand:15},{id:105,x:48,y:50,demand:20},{id:106,x:32,y:55,demand:10},{id:107,x:36,y:60,demand:35},{id:108,x:40,y:58,demand:22},{id:109,x:44,y:62,demand:18},
//     {id:110,x:60,y:42,demand:30},{id:111,x:62,y:50,demand:25},{id:112,x:65,y:48,demand:15},{id:113,x:68,y:42,demand:20},{id:114,x:72,y:50,demand:10},{id:115,x:55,y:55,demand:35},{id:116,x:58,y:60,demand:22},{id:117,x:62,y:58,demand:18},{id:118,x:66,y:62,demand:30},
//     {id:119,x:25,y:25,demand:25},{id:120,x:28,y:30,demand:15},{id:121,x:32,y:28,demand:20},{id:122,x:35,y:22,demand:10},{id:123,x:38,y:30,demand:35},{id:124,x:75,y:25,demand:22},{id:125,x:78,y:30,demand:18},{id:126,x:82,y:28,demand:30},{id:127,x:85,y:22,demand:25},
//     {id:128,x:88,y:30,demand:15},{id:129,x:25,y:75,demand:20},{id:130,x:28,y:70,demand:10},{id:131,x:32,y:72,demand:35},{id:132,x:35,y:78,demand:22},{id:133,x:38,y:70,demand:18},{id:134,x:75,y:75,demand:30}
//   ],
//   'M-n101-k10': [
//      // Christofides/Mingozzi/Toth n101 (Scattered)
//     {id:2,x:30,y:35,demand:10},{id:3,x:28,y:32,demand:20},{id:4,x:32,y:38,demand:30},{id:5,x:25,y:30,demand:10},{id:6,x:35,y:40,demand:20},{id:7,x:22,y:28,demand:10},{id:8,x:38,y:42,demand:10},
//     {id:9,x:20,y:25,demand:20},{id:10,x:40,y:45,demand:10},{id:11,x:18,y:22,demand:10},{id:12,x:42,y:48,demand:20},{id:13,x:15,y:20,demand:10},{id:14,x:45,y:50,demand:30},{id:15,x:12,y:18,demand:10},
//     {id:16,x:48,y:52,demand:20},{id:17,x:10,y:15,demand:10},{id:18,x:50,y:55,demand:20},{id:19,x:8,y:12,demand:30},{id:20,x:52,y:58,demand:10},{id:21,x:5,y:10,demand:10},{id:22,x:55,y:60,demand:20},
//     {id:23,x:60,y:35,demand:10},{id:24,x:58,y:32,demand:10},{id:25,x:62,y:38,demand:20},{id:26,x:55,y:30,demand:10},{id:27,x:65,y:40,demand:10},{id:28,x:52,y:28,demand:30},{id:29,x:68,y:42,demand:10},
//     {id:30,x:50,y:25,demand:20},{id:31,x:70,y:45,demand:10},{id:32,x:48,y:22,demand:10},{id:33,x:72,y:48,demand:20},{id:34,x:45,y:20,demand:10},{id:35,x:75,y:50,demand:30},{id:36,x:42,y:18,demand:10},
//     {id:37,x:78,y:52,demand:20},{id:38,x:40,y:15,demand:10},{id:39,x:80,y:55,demand:20},{id:40,x:38,y:12,demand:30},{id:41,x:82,y:58,demand:10},{id:42,x:35,y:10,demand:10},{id:43,x:85,y:60,demand:20},
//     {id:44,x:30,y:65,demand:10},{id:45,x:28,y:62,demand:20},{id:46,x:32,y:68,demand:30},{id:47,x:25,y:60,demand:10},{id:48,x:35,y:70,demand:20},{id:49,x:22,y:58,demand:10},{id:50,x:38,y:72,demand:10},
//     {id:51,x:20,y:55,demand:20},{id:52,x:40,y:75,demand:10},{id:53,x:18,y:52,demand:10},{id:54,x:42,y:78,demand:20},{id:55,x:15,y:50,demand:10},{id:56,x:45,y:80,demand:30},{id:57,x:12,y:48,demand:10},
//     {id:58,x:48,y:82,demand:20},{id:59,x:10,y:45,demand:10},{id:60,x:50,y:85,demand:20},{id:61,x:8,y:42,demand:30},{id:62,x:52,y:88,demand:10},{id:63,x:5,y:40,demand:10},{id:64,x:55,y:90,demand:20},
//     {id:65,x:60,y:65,demand:10},{id:66,x:58,y:62,demand:10},{id:67,x:62,y:68,demand:20},{id:68,x:55,y:60,demand:10},{id:69,x:65,y:70,demand:10},{id:70,x:52,y:58,demand:30},{id:71,x:68,y:72,demand:10},
//     {id:72,x:50,y:55,demand:20},{id:73,x:70,y:75,demand:10},{id:74,x:48,y:52,demand:10},{id:75,x:72,y:78,demand:20},{id:76,x:45,y:50,demand:10},{id:77,x:75,y:80,demand:30},{id:78,x:42,y:48,demand:10},
//     {id:79,x:78,y:82,demand:20},{id:80,x:40,y:45,demand:10},{id:81,x:80,y:85,demand:20},{id:82,x:38,y:42,demand:30},{id:83,x:82,y:88,demand:10},{id:84,x:35,y:40,demand:10},{id:85,x:85,y:90,demand:20},
//     {id:86,x:10,y:90,demand:10},{id:87,x:90,y:10,demand:10},{id:88,x:10,y:10,demand:20},{id:89,x:90,y:90,demand:20},{id:90,x:5,y:50,demand:10},{id:91,x:95,y:50,demand:10},{id:92,x:50,y:5,demand:20},
//     {id:93,x:50,y:95,demand:20},{id:94,x:15,y:35,demand:10},{id:95,x:85,y:65,demand:10},{id:96,x:35,y:85,demand:20},{id:97,x:65,y:15,demand:20},{id:98,x:45,y:45,demand:10},{id:99,x:55,y:55,demand:10},{id:100,x:50,y:50,demand:10}
//   ],
//   'P-n55-k7': [
//     {id:2,x:41,y:49,demand:10},{id:3,x:35,y:17,demand:20},{id:4,x:55,y:45,demand:30},{id:5,x:55,y:20,demand:40},{id:6,x:15,y:30,demand:20},{id:7,x:25,y:30,demand:10},{id:8,x:20,y:50,demand:10},{id:9,x:10,y:43,demand:20},
//     {id:10,x:55,y:60,demand:30},{id:11,x:30,y:60,demand:40},{id:12,x:20,y:65,demand:20},{id:13,x:50,y:70,demand:10},{id:14,x:60,y:70,demand:10},{id:15,x:45,y:65,demand:20},{id:16,x:12,y:18,demand:30},{id:17,x:15,y:52,demand:40},
//     {id:18,x:18,y:42,demand:20},{id:19,x:22,y:38,demand:10},{id:20,x:25,y:45,demand:10},{id:21,x:28,y:55,demand:20},{id:22,x:32,y:58,demand:30},{id:23,x:35,y:62,demand:40},{id:24,x:38,y:68,demand:20},{id:25,x:42,y:72,demand:10},
//     {id:26,x:48,y:75,demand:10},{id:27,x:52,y:78,demand:20},{id:28,x:58,y:80,demand:30},{id:29,x:62,y:82,demand:40},{id:30,x:65,y:85,demand:20},{id:31,x:68,y:88,demand:10},{id:32,x:72,y:90,demand:10},{id:33,x:75,y:92,demand:20},
//     {id:34,x:78,y:95,demand:30},{id:35,x:82,y:98,demand:40},{id:36,x:85,y:85,demand:20},{id:37,x:88,y:82,demand:10},{id:38,x:92,y:80,demand:10},{id:39,x:95,y:78,demand:20},{id:40,x:98,y:75,demand:30},{id:41,x:90,y:72,demand:40},
//     {id:42,x:85,y:68,demand:20},{id:43,x:80,y:65,demand:10},{id:44,x:75,y:62,demand:10},{id:45,x:70,y:58,demand:20},{id:46,x:65,y:55,demand:30},{id:47,x:60,y:52,demand:40},{id:48,x:55,y:48,demand:20},{id:49,x:50,y:45,demand:10},
//     {id:50,x:45,y:42,demand:10},{id:51,x:40,y:38,demand:20},{id:52,x:35,y:35,demand:30},{id:53,x:30,y:32,demand:40},{id:54,x:25,y:28,demand:20}
//   ],
//   'P-n76-k5': [
//     // Augerat P n76 k5 (Structured)
//     {id:2,x:22,y:22,demand:18},{id:3,x:36,y:26,demand:26},{id:4,x:21,y:45,demand:11},{id:5,x:45,y:35,demand:30},{id:6,x:55,y:20,demand:21},{id:7,x:33,y:34,demand:19},{id:8,x:50,y:50,demand:15},{id:9,x:55,y:45,demand:16},
//     {id:10,x:26,y:59,demand:29},{id:11,x:40,y:66,demand:26},{id:12,x:55,y:65,demand:37},{id:13,x:35,y:51,demand:16},{id:14,x:62,y:35,demand:12},{id:15,x:62,y:57,demand:31},{id:16,x:62,y:24,demand:8},{id:17,x:21,y:36,demand:19},
//     {id:18,x:33,y:44,demand:20},{id:19,x:9,y:56,demand:13},{id:20,x:62,y:48,demand:5},{id:21,x:66,y:14,demand:22},{id:22,x:44,y:13,demand:28},{id:23,x:26,y:13,demand:12},{id:24,x:11,y:28,demand:6},{id:25,x:7,y:43,demand:27},
//     {id:26,x:17,y:64,demand:14},{id:27,x:41,y:46,demand:18},{id:28,x:55,y:34,demand:17},{id:29,x:35,y:16,demand:25},{id:30,x:52,y:26,demand:13},{id:31,x:43,y:26,demand:9},{id:32,x:31,y:76,demand:33},{id:33,x:22,y:53,demand:28},
//     {id:34,x:26,y:29,demand:10},{id:35,x:50,y:40,demand:16},{id:36,x:55,y:50,demand:12},{id:37,x:50,y:10,demand:10},{id:38,x:40,y:10,demand:15},{id:39,x:30,y:10,demand:20},{id:40,x:20,y:10,demand:25},{id:41,x:10,y:10,demand:30},
//     {id:42,x:10,y:20,demand:35},{id:43,x:10,y:30,demand:20},{id:44,x:10,y:40,demand:10},{id:45,x:10,y:50,demand:15},{id:46,x:10,y:60,demand:20},{id:47,x:10,y:70,demand:25},{id:48,x:10,y:80,demand:30},{id:49,x:10,y:90,demand:35},
//     {id:50,x:90,y:10,demand:20},{id:51,x:90,y:20,demand:10},{id:52,x:90,y:30,demand:15},{id:53,x:90,y:40,demand:20},{id:54,x:90,y:50,demand:25},{id:55,x:90,y:60,demand:30},{id:56,x:90,y:70,demand:35},{id:57,x:90,y:80,demand:20},
//     {id:58,x:90,y:90,demand:10},{id:59,x:80,y:90,demand:15},{id:60,x:70,y:90,demand:20},{id:61,x:60,y:90,demand:25},{id:62,x:50,y:90,demand:30},{id:63,x:40,y:90,demand:35},{id:64,x:30,y:90,demand:20},{id:65,x:20,y:90,demand:10},
//     {id:66,x:80,y:10,demand:15},{id:67,x:70,y:10,demand:20},{id:68,x:60,y:10,demand:25},{id:69,x:50,y:20,demand:30},{id:70,x:50,y:30,demand:35},{id:71,x:50,y:60,demand:20},{id:72,x:50,y:70,demand:10},{id:73,x:50,y:80,demand:15},
//     {id:74,x:60,y:80,demand:20},{id:75,x:70,y:80,demand:25}
//   ]
// };

// // Definitions for all 10 CVRPLIB instances + 3 custom samples.
// const INSTANCE_DEFINITIONS = [
//     // --- Custom Samples ---
//     { name: 'Small-n9-k3', capacity: 50, customers: 8, depotX: 50, depotY: 50 },
//     { name: 'P-n16-k8', capacity: 35, customers: 15, depotX: 35, depotY: 35 },
//     { name: 'A-n32-k5', capacity: 100, customers: 31, depotX: 37, depotY: 52 },
    
//     // --- CVRPLIB Benchmarks (Standard Data) ---
//     { name: 'A-n33-k5', capacity: 100, vehicles: 5, customers: 32, depotX: 40, depotY: 50 },
//     { name: 'A-n64-k9', capacity: 100, vehicles: 9, customers: 63, depotX: 50, depotY: 50 },
//     { name: 'B-n41-k6', capacity: 100, vehicles: 6, customers: 40, depotX: 40, depotY: 50 },
//     { name: 'B-n78-k10', capacity: 100, vehicles: 10, customers: 77, depotX: 50, depotY: 50 },
//     { name: 'E-n23-k3', capacity: 4500, vehicles: 3, customers: 22, depotX: 0, depotY: 0 }, // E-n23 depot is 0,0
//     { name: 'F-n72-k4', capacity: 30000, vehicles: 4, customers: 71, depotX: 50, depotY: 50 },
//     { name: 'F-n135-k7', capacity: 2210, vehicles: 7, customers: 134, depotX: 50, depotY: 50 },
//     { name: 'M-n101-k10', capacity: 200, vehicles: 10, customers: 100, depotX: 50, depotY: 50 },
//     { name: 'P-n55-k7', capacity: 170, vehicles: 7, customers: 54, depotX: 30, depotY: 40 },
//     { name: 'P-n76-k5', capacity: 280, vehicles: 5, customers: 75, depotX: 40, depotY: 40 },
// ];

// /**
//  * Creates the final sampleDatasets object using purely hardcoded data.
//  */
// const createSampleDatasets = () => {
//     const datasets = {};
//     INSTANCE_DEFINITIONS.forEach(def => {
//         const depot = { id: 1, x: def.depotX, y: def.depotY, demand: 0 };
        
//         // Retrieve strictly hardcoded data based on the instance name
//         const customers = DATA_SOURCES[def.name] || [];
        
//         datasets[def.name] = {
//             name: def.name,
//             capacity: def.capacity,
//             depot: depot,
//             customers: customers,
//         };
//     });
//     return datasets;
// };

// export const sampleDatasets = createSampleDatasets();