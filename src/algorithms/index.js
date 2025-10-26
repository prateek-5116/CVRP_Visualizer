import { getDistance, calculateRouteDistance } from './geometry';
import { solveTspNearestNeighbor } from './solveTsp';

// Internal constants for routing logic
const ALGORITHM_TYPES = {
    GREEDY_HYBRID: 'Hybrid Greedy (Clustering + NN TSP)',
    GENETIC_ALGORITHM: 'Simplified Genetic Algorithm (GA)',
    TABU_SEARCH: 'Simplified Tabu Search (TS)',
    ANT_COLONY_OPTIMIZATION: 'Simplified Ant Colony Optimization (ACO)',
};


// --- UTILITY FUNCTIONS ---

/**
 * Converts a customer permutation into feasible vehicle routes based on capacity.
 */
const splitRoutesByCapacity = (customerIds, allNodesMap, depot, capacity, color) => {
    const routes = [];
    let currentRoute = [depot];
    let currentLoad = 0;
    let vehicleId = 1;

    for (const id of customerIds) {
        const customer = allNodesMap[id];
        
        if (currentLoad + customer.demand > capacity) {
            currentRoute.push(depot); // End current route at depot
            routes.push({
                id: vehicleId,
                route: currentRoute,
                color: color, 
                initialCapacity: capacity,
                capacityLeft: capacity,
            });

            // Start new route with the current customer
            currentRoute = [depot, customer];
            currentLoad = customer.demand;
            vehicleId++;
        } else {
            currentRoute.push(customer);
            currentLoad += customer.demand;
        }
    }

    if (currentRoute.length > 1) {
        currentRoute.push(depot);
        routes.push({
            id: vehicleId,
            route: currentRoute,
            color: color,
            initialCapacity: capacity,
            capacityLeft: capacity,
        });
    }

    // Apply NN-TSP optimization to each final route
    const finalRoutes = routes.map(v => {
        const customerCluster = v.route.filter(n => n.id !== depot.id);
        const optimizedRoute = solveTspNearestNeighbor(customerCluster, depot);
        return { ...v, route: optimizedRoute };
    });

    return finalRoutes;
};

// --- HYBRID GREEDY IMPLEMENTATION (Step-by-step for visualization) ---

export const hybridGreedyStep = (state) => {
    const { currentVehicleId, vehicles, allNodesMap, unvisitedCustomerIds } = state;
    const currentVehicle = vehicles.find(v => v.id === currentVehicleId);
    
    // 1. START NEW VEHICLE (IDLE state)
    if (state.algorithmState === 'idle') {
        if (unvisitedCustomerIds.length === 0) {
             return { message: "All customers served. Solution complete.", nextState: 'done' };
        }
        
        const newVehicleId = currentVehicleId + 1;
        const startCustomerId = unvisitedCustomerIds[0];
        const startCustomer = allNodesMap[startCustomerId];

        if (startCustomer.demand > state.capacity) {
           return { message: `Error: Customer ${startCustomer.id} demand exceeds vehicle capacity. Stopping.`, nextState: 'done' };
        }

        const newVehicle = {
            id: newVehicleId,
            route: [state.depot, startCustomer],
            capacityLeft: state.capacity - startCustomer.demand,
            initialCapacity: state.capacity,
            color: state.vehicleColors[newVehicleId % state.vehicleColors.length],
        };

        const newUnvisitedIds = unvisitedCustomerIds.filter(id => id !== startCustomerId);

        return {
            message: `[V${newVehicleId}] Starting new route. Added first customer C${startCustomer.id}.`,
            newState: {
                vehicles: [...vehicles, newVehicle],
                currentVehicleId: newVehicleId,
                unvisitedCustomerIds: newUnvisitedIds,
                algorithmState: 'clustering',
            }
        };
    }

    // 2. CLUSTERING STEP
    if (state.algorithmState === 'clustering') {
        const availableCustomerIds = unvisitedCustomerIds.filter(
            id => allNodesMap[id].demand <= currentVehicle.capacityLeft
        );

        if (availableCustomerIds.length === 0) {
            return { message: `[V${currentVehicleId}] No more customers fit. Moving to TSP solve.`, nextState: 'solving_tsp' };
        }

        let bestCustomerId = -1;
        let minDistance = Infinity;
        let lastNode = currentVehicle.route[currentVehicle.route.length - 1];
        
        // Find nearest unvisited customer from the last added node
        for (const customerId of availableCustomerIds) {
            const customerNode = allNodesMap[customerId];
            const distance = getDistance(lastNode, customerNode);
            
            if (distance < minDistance) {
                minDistance = distance;
                bestCustomerId = customerId;
            }
        }
        
        if (bestCustomerId !== -1) {
            const bestCustomer = allNodesMap[bestCustomerId];
            
            const newRoute = [...currentVehicle.route, bestCustomer];
            const newCapacityLeft = currentVehicle.capacityLeft - bestCustomer.demand;
            const newUnvisitedIds = unvisitedCustomerIds.filter(id => id !== bestCustomerId);
            
            const newVehicles = vehicles.map(v => 
                v.id === currentVehicleId ? { ...v, route: newRoute, capacityLeft: newCapacityLeft } : v
            );

            return {
                message: `[V${currentVehicleId}] Added nearest C${bestCustomer.id}. Capacity left: ${newCapacityLeft.toFixed(1)}.`,
                newState: {
                    vehicles: newVehicles,
                    unvisitedCustomerIds: newUnvisitedIds,
                }
            };
        }
    }

    // 3. TSP SOLVING STEP
    if (state.algorithmState === 'solving_tsp') {
        const vehicleToSolve = state.vehicles.find(v => v.id === currentVehicleId);
        if (!vehicleToSolve) {
            return { message: `Error: Vehicle ${currentVehicleId} not found for TSP solve.`, nextState: 'idle' };
        }
        
        const customerCluster = vehicleToSolve.route.filter(n => n.id !== state.depot.id);
        const optimizedRoute = solveTspNearestNeighbor(customerCluster, state.depot);

        const routeDistance = calculateRouteDistance(optimizedRoute);

        const newVehicles = vehicles.map(v =>
            v.id === currentVehicleId ? { ...v, route: optimizedRoute } : v
        );
        
        return {
            message: `[V${currentVehicleId}] Optimized route (NN-TSP). Dist: ${routeDistance.toFixed(2)}.`,
            newState: {
                vehicles: newVehicles,
                totalDistance: state.totalDistance + routeDistance,
                algorithmState: 'idle', // Ready for next vehicle
            }
        };
    }
    
    return { message: "Error: Algorithm state mismatch.", nextState: 'done' };
};


// --- METAHEURISTIC IMPLEMENTATIONS (Simplified, full run) ---

const geneticAlgorithm = (state) => {
    const { customerNodes, depot, capacity, allNodesMap, vehicleColors } = state;
    const initialPermutation = [...customerNodes].map(c => c.id).sort(() => Math.random() - 0.5);
    let bestPermutation = [...initialPermutation];
    let bestDistance = Infinity;

    for (let gen = 0; gen < 50; gen++) { // Fixed 50 generations for quick simulation
        let newPermutation = [...bestPermutation];
        const i = Math.floor(Math.random() * newPermutation.length);
        const j = Math.floor(Math.random() * newPermutation.length);
        [newPermutation[i], newPermutation[j]] = [newPermutation[j], newPermutation[i]];
        
        const newRoutes = splitRoutesByCapacity(newPermutation, allNodesMap, depot, capacity, vehicleColors[1]);
        const newTotalDistance = newRoutes.reduce((sum, v) => sum + calculateRouteDistance(v.route), 0);
        
        if (newTotalDistance < bestDistance) {
            bestDistance = newTotalDistance;
            bestPermutation = newPermutation;
        }
    }
    const finalVehicles = splitRoutesByCapacity(bestPermutation, allNodesMap, depot, capacity, vehicleColors[1]);
    const finalTotalDistance = finalVehicles.reduce((sum, v) => sum + calculateRouteDistance(v.route), 0);
    
    return {
        message: `GA complete. Found ${finalVehicles.length} vehicles. Total distance: ${finalTotalDistance.toFixed(2)}.`,
        newState: {
            vehicles: finalVehicles.map((v, i) => ({ ...v, id: i + 1, color: state.vehicleColors[(i + 1) % state.vehicleColors.length] })),
            totalDistance: finalTotalDistance,
        }
    };
};

const tabuSearch = (state) => {
    const { customerNodes, depot, capacity, allNodesMap, vehicleColors } = state;
    let currentPermutation = [...customerNodes].map(c => c.id).sort((a, b) => getDistance(allNodesMap[a], depot) - getDistance(allNodesMap[b], depot));
    let currentRoutes = splitRoutesByCapacity(currentPermutation, allNodesMap, depot, capacity, vehicleColors[1]);
    let currentDistance = currentRoutes.reduce((sum, v) => sum + calculateRouteDistance(v.route), 0);

    let bestPermutation = [...currentPermutation];
    let bestDistance = currentDistance;
    const tabuList = [];
    const tabuTenure = 5;

    for (let iter = 0; iter < 50; iter++) { // Fixed 50 iterations
        let bestMove = null;
        let bestNeighborDistance = Infinity;

        for (let i = 0; i < currentPermutation.length; i++) {
            for (let j = i + 1; j < currentPermutation.length; j++) {
                let neighborPermutation = [...currentPermutation];
                [neighborPermutation[i], neighborPermutation[j]] = [neighborPermutation[j], neighborPermutation[i]];
                const moveKey = `${i}-${j}`;
                
                const neighborRoutes = splitRoutesByCapacity(neighborPermutation, allNodesMap, depot, capacity, vehicleColors[1]);
                const neighborDistance = neighborRoutes.reduce((sum, v) => sum + calculateRouteDistance(v.route), 0);

                const isTabu = tabuList.some(t => t.move === moveKey && t.iteration >= iter);
                
                if (neighborDistance < bestNeighborDistance && (!isTabu || neighborDistance < bestDistance)) {
                    bestNeighborDistance = neighborDistance;
                    bestMove = { i, j, permutation: neighborPermutation };
                }
            }
        }

        if (!bestMove) break; 

        currentPermutation = bestMove.permutation;
        currentDistance = bestNeighborDistance;
        
        const moveKey = `${bestMove.i}-${bestMove.j}`;
        tabuList.push({ move: moveKey, iteration: iter + tabuTenure });

        if (currentDistance < bestDistance) {
            bestDistance = currentDistance;
            bestPermutation = currentPermutation;
        }
    }

    const finalVehicles = splitRoutesByCapacity(bestPermutation, allNodesMap, depot, capacity, vehicleColors[1]);
    const finalTotalDistance = finalVehicles.reduce((sum, v) => sum + calculateRouteDistance(v.route), 0);
    
    return {
        message: `TS complete. Found ${finalVehicles.length} vehicles. Total distance: ${finalTotalDistance.toFixed(2)}.`,
        newState: {
            vehicles: finalVehicles.map((v, i) => ({ ...v, id: i + 1, color: state.vehicleColors[(i + 1) % state.vehicleColors.length] })),
            totalDistance: finalTotalDistance,
        }
    };
};

const antColonyOptimization = (state) => {
    const { customerNodes, depot, capacity, allNodesMap } = state;
    const customers = customerNodes.map(c => c.id);
    const numCustomers = customers.length;
    const numAnts = 10;
    const numIterations = 50; 

    const alpha = 1; 
    const beta = 2; 
    const evaporationRate = 0.5;
    const initialPheromone = 1;

    const allNodesIds = [depot.id, ...customers];
    const pheromone = new Map();
    const getPheromoneKey = (id1, id2) => Math.min(id1, id2) + '-' + Math.max(id1, id2);

    for (let i = 0; i < allNodesIds.length; i++) {
        for (let j = i + 1; j < allNodesIds.length; j++) {
            pheromone.set(getPheromoneKey(allNodesIds[i], allNodesIds[j]), initialPheromone);
        }
    }

    let bestPermutation = [];
    let bestDistance = Infinity;

    for (let iter = 0; iter < numIterations; iter++) {
        const solutions = [];

        for (let ant = 0; ant < numAnts; ant++) {
            let visited = new Set();
            let currentPermutation = [];
            let currentNode = depot.id; 

            while (visited.size < numCustomers) {
                const unvisited = customers.filter(id => !visited.has(id));
                let totalTractiveness = 0;
                const tractiveness = new Map();

                for (const nextId of unvisited) {
                    const dist = getDistance(allNodesMap[currentNode], allNodesMap[nextId]);
                    const tau = pheromone.get(getPheromoneKey(currentNode, nextId)) || initialPheromone;
                    const eta = 1 / (dist + 1e-6); 

                    const value = Math.pow(tau, alpha) * Math.pow(eta, beta);
                    tractiveness.set(nextId, value);
                    totalTractiveness += value;
                }
                
                if (totalTractiveness === 0) break;

                let r = Math.random() * totalTractiveness;
                let nextNode = -1;
                for (const [id, value] of tractiveness) {
                    r -= value;
                    if (r <= 0) {
                        nextNode = id;
                        break;
                    }
                }
                
                if (nextNode !== -1) {
                    currentPermutation.push(nextNode);
                    visited.add(nextNode);
                    currentNode = nextNode;
                } else {
                    break;
                }
            }

            const routes = splitRoutesByCapacity(currentPermutation, allNodesMap, depot, capacity, state.vehicleColors[1]);
            const totalDistance = routes.reduce((sum, v) => sum + calculateRouteDistance(v.route), 0);
            solutions.push({ permutation: currentPermutation, distance: totalDistance, routes: routes });

            if (totalDistance < bestDistance) {
                bestDistance = totalDistance;
                bestPermutation = currentPermutation;
            }
        }
        
        for (const [key, value] of pheromone) {
            pheromone.set(key, value * (1 - evaporationRate));
        }

        const iterationBest = solutions.reduce((best, current) => current.distance < best.distance ? current : best, solutions[0]);

        if (iterationBest) {
            const Q = 1000; 
            const deposit = Q / iterationBest.distance;

            let path = [depot.id, ...iterationBest.permutation];

            for (let k = 0; k < path.length - 1; k++) {
                const key = getPheromoneKey(path[k], path[k+1]);
                pheromone.set(key, (pheromone.get(key) || initialPheromone) + deposit);
            }
        }
    }

    const finalVehicles = splitRoutesByCapacity(bestPermutation, allNodesMap, depot, capacity, state.vehicleColors[1]);
    const finalTotalDistance = finalVehicles.reduce((sum, v) => sum + calculateRouteDistance(v.route), 0);
    
    return {
        message: `ACO complete. Found ${finalVehicles.length} vehicles. Total distance: ${finalTotalDistance.toFixed(2)}.`,
        newState: {
            vehicles: finalVehicles.map((v, i) => ({ ...v, id: i + 1, color: state.vehicleColors[(i + 1) % state.vehicleColors.length] })),
            totalDistance: finalTotalDistance,
        }
    };
};

// --- ALGORITHM DISPATCHERS ---

/**
 * Master function to dispatch the correct algorithm logic step (for step mode).
 */
export const runAlgorithmStep = (algorithmType, state) => {
    switch (algorithmType) {
        case ALGORITHM_TYPES.GREEDY_HYBRID:
            return hybridGreedyStep(state);
        default:
            throw new Error(`Invalid algorithm type: ${algorithmType}`);
    }
};

/**
 * Runs a metaheuristic algorithm (GA, TS, ACO) to completion in a single call (for full run and comparison).
 */
export const runMetaheuristic = (algorithmType, state) => {
    let result;
    switch (algorithmType) {
        case ALGORITHM_TYPES.GENETIC_ALGORITHM:
            result = geneticAlgorithm(state);
            break;
        case ALGORITHM_TYPES.TABU_SEARCH:
            result = tabuSearch(state);
            break;
        case ALGORITHM_TYPES.ANT_COLONY_OPTIMIZATION:
            result = antColonyOptimization(state);
            break;
        default:
            throw new Error(`Algorithm type ${algorithmType} not supported for full run.`);
    }
    
    return {
        ...result,
        newState: {
            ...result.newState,
            algorithmState: 'done',
        }
    };
}

