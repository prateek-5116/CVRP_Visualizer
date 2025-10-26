/**
 * Calculates Euclidean distance between two nodes
 */
export const getDistance = (node1, node2) => {
  return Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
};

/**
 * Finds the total distance of a route (list of nodes)
 */
export const calculateRouteDistance = (route) => {
  let distance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    distance += getDistance(route[i], route[i + 1]);
  }
  return distance;
};
