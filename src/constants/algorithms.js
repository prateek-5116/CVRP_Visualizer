export const ALGORITHM_TYPES = {
  GREEDY_HYBRID: 'Hybrid Greedy (Clustering + NN TSP)',
  GENETIC_ALGORITHM: 'Simplified Genetic Algorithm (GA)',
  TABU_SEARCH: 'Simplified Tabu Search (TS)',
  ANT_COLONY_OPTIMIZATION: 'Simplified Ant Colony Optimization (ACO)',
};

export const COMPARISON_COLORS = {
  [ALGORITHM_TYPES.GREEDY_HYBRID]: '#10b981', // green
  [ALGORITHM_TYPES.GENETIC_ALGORITHM]: '#3b82f6', // blue
  [ALGORITHM_TYPES.TABU_SEARCH]: '#ef4444', // red
  [ALGORITHM_TYPES.ANT_COLONY_OPTIMIZATION]: '#f97316', // orange
};