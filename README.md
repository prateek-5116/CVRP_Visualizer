# CVRP Metaheuristic Visualizer

web application to visualize and compare hybrid metaheuristic algorithms solving the Capacitated Vehicle Routing Problem (CVRP).

## 📋 Prerequisites & Versions

Ensure your environment meets the following requirements before running:

* **Node.js:** v18.17.0 (LTS) or higher
* **npm:** v9.6.0 or higher
* **Browser:** Modern Chrome, Firefox, or Edge (ES6+ support)

## 🛠️ Technology Stack

* **Core:** React v18.2.0 + Vite v5.0.0
* **Styling:** Tailwind CSS v3.4.0
* **Icons:** Lucide React v0.300.0
* **Rendering:** HTML5 Canvas API

## 🚀 How to Run Locally

1.  **Clone the repository**
    ```bash
    git clone https://github.com/prateek-5116/CVRP_Visualizer.git
    cd cvrp-visualizer
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Access the application**
    Open the URL shown in your terminal (typically `http://localhost:5173/`).

## ⚡ Implemented Algorithms

* **Hybrid Greedy:** Clustering + Nearest Neighbor TSP (Deterministic baseline).
* **Hybrid Genetic Algorithm (GA):** Evolutionary approach with warm-start population.
* **Hybrid Tabu Search (TS):** Local search with short-term memory constraints.
* **Hybrid Ant Colony Optimization (ACO):** Probabilistic construction with pheromone trails.