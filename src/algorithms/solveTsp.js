import { getDistance } from './geometry';

/**
 * Solves TSP for a cluster using Nearest Neighbor (Algorithm 1)
 * @param {Array} clusterNodes - Array of nodes including depot
 * @param {Object} depot - The depot node
 * @returns {Array} - The sorted route
 */
export const solveTspNearestNeighbor = (clusterNodes, depot) => {
  if (clusterNodes.length === 0) return [];
  if (clusterNodes.length === 1) return [depot, clusterNodes[0], depot];
  
  let unvisited = [...clusterNodes.filter(n => n.id !== depot.id)];
  let route = [depot];
  let currentNode = depot;

  while (unvisited.length > 0) {
    let nearestNeighbor = null;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const distance = getDistance(currentNode, unvisited[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestNeighbor = unvisited[i];
      }
    }

    if (nearestNeighbor) {
      route.push(nearestNeighbor);
      currentNode = nearestNeighbor;
      unvisited = unvisited.filter(n => n.id !== nearestNeighbor.id);
    } else {
      break;
    }
  }

  route.push(depot); // Return to depot
  return route;
};