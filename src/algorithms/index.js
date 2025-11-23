import { getDistance, calculateRouteDistance } from './geometry';
import { solveTspNearestNeighbor } from './solveTsp';

// Internal constants for routing logic (kept same)
const ALGORITHM_TYPES = {
    GREEDY_HYBRID: 'Hybrid Greedy (Clustering + NN TSP)',
    GENETIC_ALGORITHM: 'Simplified Genetic Algorithm (GA)',
    TABU_SEARCH: 'Simplified Tabu Search (TS)',
    ANT_COLONY_OPTIMIZATION: 'Simplified Ant Colony Optimization (ACO)',
};


const createSeededRandom = (seed = 42) => {
    let s = seed >>> 0;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
};


const seededShuffle = (arr, random) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// -----------------------------
// Hybrid Nearest Neighbor generator
// -----------------------------
const generateNearestNeighborSolution = (state) => {
    const { customerNodes, allNodesMap, depot } = state;

    if (!Array.isArray(customerNodes) || customerNodes.length === 0) return [];

    let unvisited = customerNodes.map(c => c.id);
    const permutation = [];
    let current = depot;

    while (unvisited.length > 0) {
        let bestId = null;
        let bestDist = Infinity;
        for (const cid of unvisited) {
            const node = allNodesMap[cid];
            if (!node) continue;
            const d = getDistance(current, node);
            if (d < bestDist) {
                bestDist = d;
                bestId = cid;
            }
        }
        if (bestId === null) {
            // failsafe empty -> return empty (signals fallback)
            return [];
        }
        permutation.push(bestId);
        current = allNodesMap[bestId];
        unvisited = unvisited.filter(x => x !== bestId);
    }
    return permutation;
};

// -----------------------------
// splitRoutesByCapacity 
// -----------------------------
const splitRoutesByCapacity = (customerIds, allNodesMap, depot, capacity, color) => {
    const routes = [];
    if (!Array.isArray(customerIds)) customerIds = [];

    let currentRoute = [depot];
    let currentLoad = 0;
    let vehicleId = 1;

    for (const id of customerIds) {
        const customer = allNodesMap[id];
        if (!customer) {
            console.warn(`splitRoutesByCapacity: missing node for id ${id}. Skipping.`);
            continue;
        }

        if (currentLoad + customer.demand > capacity) {
            currentRoute.push(depot);
            routes.push({
                id: vehicleId,
                route: currentRoute,
                color: color,
                initialCapacity: capacity,
                capacityLeft: Math.max(0, capacity - currentLoad),
            });

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
            capacityLeft: Math.max(0, capacity - currentLoad),
        });
    }

    // Apply NN-TSP to each vehicle's customers (assuming solveTspNearestNeighbor returns a route beginning and ending with depot)
    const finalRoutes = routes.map(v => {
        const customers = v.route.filter(n => n && n.id !== depot.id);
        try {
            const optimized = solveTspNearestNeighbor(customers, depot);
            // Ensure depot at start and end
            let route = optimized;
            if (!Array.isArray(route) || route.length === 0) route = [depot, ...customers, depot];
            if (route[0].id !== depot.id) route = [depot, ...route];
            if (route[route.length - 1].id !== depot.id) route = [...route, depot];
            return { ...v, route };
        } catch (err) {
            console.warn('TSP solver failed, using fallback order', err);
            const route = [depot, ...customers, depot];
            return { ...v, route };
        }
    });

    return finalRoutes;
};

// -----------------------------
// HYBRID GREEDY STEP 
// -----------------------------
export const hybridGreedyStep = (state) => {
    const { currentVehicleId, vehicles, allNodesMap, unvisitedCustomerIds } = state;
    const currentVehicle = vehicles.find(v => v.id === currentVehicleId);

    // 1. IDLE -> Start a new vehicle
    if (state.algorithmState === 'idle') {
        if (!unvisitedCustomerIds || unvisitedCustomerIds.length === 0) {
            return { message: "All customers served. Solution complete.", nextState: 'done' };
        }
        const newVehicleId = currentVehicleId + 1;
        const startCustomerId = unvisitedCustomerIds[0];
        const startCustomer = allNodesMap[startCustomerId];

        if (!startCustomer) {
            return { message: `Error: Customer ID ${startCustomerId} not found.`, nextState: 'done' };
        }

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

    // 2. CLUSTERING
    if (state.algorithmState === 'clustering') {
        if (!currentVehicle) {
            return { message: "Error: No current vehicle in clustering state.", nextState: 'idle' };
        }

        const availableCustomerIds = (unvisitedCustomerIds || []).filter(id => allNodesMap[id].demand <= currentVehicle.capacityLeft);

        if (!availableCustomerIds || availableCustomerIds.length === 0) {
            return { message: `[V${currentVehicleId}] No more customers fit. Moving to TSP solve.`, nextState: 'solving_tsp' };
        }

        let bestCustomerId = -1;
        let minDistance = Infinity;
        const lastNode = currentVehicle.route[currentVehicle.route.length - 1];

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

    // 3. TSP SOLVING
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
                totalDistance: (state.totalDistance || 0) + routeDistance,
                algorithmState: 'idle',
            }
        };
    }

    return { message: "Error: Algorithm state mismatch.", nextState: 'done' };
};

const swapMutation = (permutation, random) => {
    const i = Math.floor(random() * permutation.length);
    const j = Math.floor(random() * permutation.length);
    const newPermutation = [...permutation];
    [newPermutation[i], newPermutation[j]] = [newPermutation[j], newPermutation[i]];
    return newPermutation;
};
const geneticAlgorithm = (state, random) => {
    const { customerNodes, depot, capacity, allNodesMap, vehicleColors } = state;

    // --- GA Parameters ---
    const NUM_GENERATIONS = 150;
    const POPULATION_SIZE = 50;
    const TOURNAMENT_SIZE = 3;
    const MUTATION_RATE = 0.1;

    // 1. Fitness Function: Lower distance is better.
    // Converts a simple list of customers into actual truck routes to measure distance.
    const getFitness = (permutation) => {
        const routes = splitRoutesByCapacity(permutation, allNodesMap, depot, capacity, vehicleColors[1]);
        return routes.reduce((sum, v) => sum + calculateRouteDistance(v.route), 0);
    };

    // 2. Hybrid Initialization
    // Generate one "good" solution using the Nearest Neighbor Heuristic
    const seedSolution = generateNearestNeighborSolution(state, random);
    let population = [];

    if (seedSolution && seedSolution.length > 0) {
        // Add the good seed
        population.push(seedSolution); 
        // Add mutated versions of the seed (80% of population) to explore near the good solution
        for (let i = 0; i < POPULATION_SIZE * 0.8; i++) {
            population.push(swapMutation(seedSolution, random));
        }
        // Add some pure randomness (remaining 20%) to maintain diversity
        while (population.length < POPULATION_SIZE) {
            population.push([...seedSolution].sort(() => random() - 0.5));
        }
    } else {
        // Fallback if no customers exist
        for (let i = 0; i < POPULATION_SIZE; i++) {
            population.push([...customerNodes].map(c => c.id).sort(() => random() - 0.5));
        }
    }

    // Handle edge case where population might still be empty
    if (population.length === 0) {
        if (customerNodes.length === 0) return { message: "No customers.", newState: { vehicles: [], totalDistance: 0 }};
        population.push([...customerNodes].map(c => c.id).sort(() => random() - 0.5));
    }

    let bestPermutation = population[0];
    let bestDistance = getFitness(bestPermutation);

    // 3. Main Evolution Loop
    for (let gen = 0; gen < NUM_GENERATIONS; gen++) {
        let newPopulation = [bestPermutation]; // Keep the best one found so far

        while (newPopulation.length < POPULATION_SIZE) {
            // A. Tournament Selection
            const selectParent = () => {
                let bestP = population[Math.floor(random() * population.length)];
                let bestF = getFitness(bestP);
                for(let k=0; k<TOURNAMENT_SIZE-1; k++){
                    let p = population[Math.floor(random() * population.length)];
                    let f = getFitness(p);
                    if(f < bestF) { bestP = p; bestF = f; }
                }
                return bestP;
            };
            const parent1 = selectParent();
            const parent2 = selectParent();

            // B. Ordered Crossover (OX1)
            // This method preserves the relative order of customers to avoid duplicates
            const start = Math.floor(random() * parent1.length);
            const end = Math.floor(random() * parent1.length);
            const [sliceStart, sliceEnd] = [Math.min(start, end), Math.max(start, end)];

            let child = Array(parent1.length).fill(null);
            const parent1Slice = new Set();
            
            // Copy slice from Parent 1
            for (let i = sliceStart; i <= sliceEnd; i++) {
                child[i] = parent1[i];
                parent1Slice.add(parent1[i]);
            }

            // Fill remaining spots from Parent 2 (skipping those already in child)
            let parent2Index = 0;
            for (let i = 0; i < child.length; i++) {
                if (child[i] === null) {
                    while (parent2Index < parent2.length && parent1Slice.has(parent2[parent2Index])) {
                        parent2Index++;
                    }
                    if (parent2Index < parent2.length) {
                        child[i] = parent2[parent2Index];
                        parent2Index++;
                    } else {
                        // Failsafe for rare edge cases
                        for(const id of parent2) {
                            if(!child.includes(id)) { child[i] = id; break; }
                        }
                    }
                }
            }

            // C. Mutation (Swap)
            if (random() < MUTATION_RATE) {
                child = swapMutation(child, random);
            }

            newPopulation.push(child);
        }

        population = newPopulation;

        // Update best solution found in this generation
        for (const permutation of population) {
            const distance = getFitness(permutation);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestPermutation = permutation;
            }
        }
    }
    
    // 4. Decode final result into vehicle routes for visualization
    const finalVehicles = splitRoutesByCapacity(bestPermutation, allNodesMap, depot, capacity, vehicleColors[1]);
    
    return {
        message: `GA complete. Distance: ${bestDistance.toFixed(2)}.`,
        newState: {
            vehicles: finalVehicles.map((v, i) => ({ ...v, id: i + 1, color: state.vehicleColors[(i + 1) % state.vehicleColors.length] })),
            totalDistance: bestDistance,
        }
    };
};





// -----------------------------
// HYBRID TABU SEARCH (deterministic)
// -----------------------------
const tabuSearch = (state, random) => {
    const { customerNodes, depot, capacity, allNodesMap, vehicleColors } = state;

    // Hybrid seed
    const hybridSeed = generateNearestNeighborSolution(state);

    let currentPermutation;
    if (hybridSeed && hybridSeed.length > 0) {
        currentPermutation = [...hybridSeed];
    } else {
        // fallback: seed by distance to depot (but deterministic randomness for tie-breaking)
        currentPermutation = [...customerNodes].map(c => c.id)
            .sort((a, b) => {
                const da = getDistance(allNodesMap[a], depot);
                const db = getDistance(allNodesMap[b], depot);
                if (da === db) {
                    // tie-breaker deterministic using random
                    return random() < 0.5 ? -1 : 1;
                }
                return da - db;
            });
    }

    let currentRoutes = splitRoutesByCapacity(currentPermutation, allNodesMap, depot, capacity, vehicleColors[1]);
    let currentDistance = currentRoutes.reduce((s, v) => s + calculateRouteDistance(v.route), 0);

    let bestPermutation = [...currentPermutation];
    let bestDistance = currentDistance;

    const tabuList = new Map(); // moveKey -> expiryIter
    const TABU_TENURE = 5;
    const MAX_ITER = 50;

    for (let iter = 0; iter < MAX_ITER; iter++) {
        let bestNeighbor = null;
        let bestNeighborDist = Infinity;
        let bestMove = null;

        for (let i = 0; i < currentPermutation.length; i++) {
            for (let j = i + 1; j < currentPermutation.length; j++) {
                const neighbor = [...currentPermutation];
                [neighbor[i], neighbor[j]] = [neighbor[j], neighbor[i]];
                const moveKey = `${i}-${j}-${currentPermutation[i]}-${currentPermutation[j]}`;

                const expiry = tabuList.get(moveKey) || -1;
                const isTabu = expiry > iter;

                const routes = splitRoutesByCapacity(neighbor, allNodesMap, depot, capacity, vehicleColors[1]);
                const dist = routes.reduce((s, v) => s + calculateRouteDistance(v.route), 0);

                const aspiration = dist < bestDistance;
                if ((!isTabu && dist < bestNeighborDist) || aspiration) {
                    bestNeighbor = neighbor;
                    bestNeighborDist = dist;
                    bestMove = moveKey;
                }
            }
        }

        if (!bestNeighbor) break;

        currentPermutation = bestNeighbor;
        currentDistance = bestNeighborDist;

        // add to tabu
        tabuList.set(bestMove, iter + TABU_TENURE);

        if (currentDistance < bestDistance) {
            bestDistance = currentDistance;
            bestPermutation = [...currentPermutation];
        }

        // prune tabu occasionally
        if (iter % 20 === 0) {
            for (const [k, v] of tabuList) if (v <= iter) tabuList.delete(k);
        }
    }

    const finalVehicles = splitRoutesByCapacity(bestPermutation, allNodesMap, depot, capacity, vehicleColors[1]);
    const finalTotalDistance = finalVehicles.reduce((s, v) => s + calculateRouteDistance(v.route), 0);

    return {
        message: `TS complete. Found ${finalVehicles.length} vehicles. Total distance: ${finalTotalDistance.toFixed(2)}.`,
        newState: {
            vehicles: finalVehicles.map((v, i) => ({ ...v, id: i + 1, color: state.vehicleColors[(i + 1) % state.vehicleColors.length] })),
            totalDistance: finalTotalDistance,
        }
    };
};

// -----------------------------
// HYBRID ANT COLONY OPTIMIZATION (deterministic)
// -----------------------------
const antColonyOptimization = (state, random) => {
    const { customerNodes, depot, capacity, allNodesMap, vehicleColors } = state;
    const customers = customerNodes.map(c => c.id);

    if (!customers || customers.length === 0) {
        return {
            message: 'ACO aborted: no customers.',
            newState: { ...state, algorithmState: 'done', totalDistance: 0 }
        };
    }

    const hybridSeed = generateNearestNeighborSolution(state);
    const useHybrid = hybridSeed && hybridSeed.length > 0;

    const numAnts = Math.min(10, Math.max(2, customers.length));
    const numIter = 50;
    const alpha = 1;
    const beta = 2;
    const evap = 0.5;
    const initPhero = 1;

    const allIds = [depot.id, ...customers];
    const pheromone = new Map();
    const pkey = (a, b) => `${a}-${b}`; // directional

    for (const i of allIds) for (const j of allIds) if (i !== j) pheromone.set(pkey(i, j), initPhero);

    let bestPermutation = [];
    let bestDistance = Infinity;

    for (let it = 0; it < numIter; it++) {
        const solutions = [];

        for (let ant = 0; ant < numAnts; ant++) {
            let perm = [];
            let visited = new Set();

            // Hybrid: first ant seeded with NN path
            if (ant === 0 && useHybrid) {
                perm = [...hybridSeed];
                visited = new Set(perm);
            }

            let current = depot.id;

            while (visited.size < customers.length) {
                const remaining = customers.filter(c => !visited.has(c));
                if (remaining.length === 0) break;

                // compute attractiveness
                let total = 0;
                const attractiveness = [];
                for (const r of remaining) {
                    const dist = getDistance(allNodesMap[current], allNodesMap[r]);
                    const tau = pheromone.get(pkey(current, r)) || initPhero;
                    const eta = 1 / (dist + 1e-6);
                    const val = Math.pow(tau, alpha) * Math.pow(eta, beta);
                    attractiveness.push([r, val]);
                    total += val;
                }

                if (total === 0) {
                    // deterministic fallback: pick first remaining by seeded random index
                    const idx = Math.floor(random() * remaining.length);
                    const pick = remaining[idx];
                    perm.push(pick);
                    visited.add(pick);
                    current = pick;
                    continue;
                }

                let r = random() * total;
                let next = remaining[0];
                for (const [id, val] of attractiveness) {
                    r -= val;
                    if (r <= 0) { next = id; break; }
                }

                perm.push(next);
                visited.add(next);
                current = next;
            }

            const routes = splitRoutesByCapacity(perm, allNodesMap, depot, capacity, vehicleColors[1]);
            const totalDist = routes.reduce((s, v) => s + calculateRouteDistance(v.route), 0);
            solutions.push({ permutation: perm, distance: totalDist });

            if (totalDist < bestDistance) {
                bestDistance = totalDist;
                bestPermutation = perm;
            }
        }

        // evaporate pheromone
        for (const k of pheromone.keys()) pheromone.set(k, pheromone.get(k) * (1 - evap));

        // deposit from best iteration
        const iterBest = solutions.reduce((a, b) => (a.distance < b.distance ? a : b));
        if (iterBest && iterBest.distance > 0) {
            const Q = 1000;
            const deposit = Q / iterBest.distance;
            const path = [depot.id, ...iterBest.permutation];
            for (let p = 0; p < path.length - 1; p++) {
                const key = pkey(path[p], path[p + 1]);
                pheromone.set(key, (pheromone.get(key) || initPhero) + deposit);
            }
        }
    }

    const finalVehicles = splitRoutesByCapacity(bestPermutation, allNodesMap, depot, capacity, vehicleColors[1]);
    const finalTotalDistance = finalVehicles.reduce((s, v) => s + calculateRouteDistance(v.route), 0);

    return {
        message: `ACO complete. Found ${finalVehicles.length} vehicles. Total distance: ${finalTotalDistance.toFixed(2)}.`,
        newState: {
            vehicles: finalVehicles.map((v, i) => ({ ...v, id: i + 1, color: state.vehicleColors[(i + 1) % state.vehicleColors.length] })),
            totalDistance: finalTotalDistance,
        }
    };
};

export const runAlgorithmStep = (algorithmType, state) => {
    switch (algorithmType) {
        case ALGORITHM_TYPES.GREEDY_HYBRID:
            return hybridGreedyStep(state);
        default:
            throw new Error(`Invalid algorithm type: ${algorithmType}`);
    }
};

export const runMetaheuristic = (algorithmType, state) => {
    // deterministic seeded RNG for all algorithms 
    const random = createSeededRandom(42);

    let result;
    switch (algorithmType) {
        case ALGORITHM_TYPES.GENETIC_ALGORITHM:
            result = geneticAlgorithm(state, random);
            break;
        case ALGORITHM_TYPES.TABU_SEARCH:
            result = tabuSearch(state, random);
            break;
        case ALGORITHM_TYPES.ANT_COLONY_OPTIMIZATION:
            result = antColonyOptimization(state, random);
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
};
