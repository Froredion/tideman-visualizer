# tideman-visualizer

**A powerful interactive visualization tool for understanding the Tideman (Ranked Pairs) voting algorithm.**

This React + TypeScript component provides a **step-by-step visual walkthrough** of the Tideman voting method, making it easy to understand how ranked-choice voting works. Perfect for learning, teaching, or debugging Tideman implementations.

## ✨ Visualization Features

- 📊 **Interactive Ballot Input** - Enter candidates and ranked ballots with a simple interface
- 🔢 **Pairwise Preference Matrix** - See head-to-head matchup results visualized clearly
- 🔄 **Step-by-Step Pair Locking** - Watch as pairs are sorted by strength and locked one by one
- 🚫 **Cycle Detection Visualization** - See exactly when and why cycles are detected and prevented
- 🎯 **Graph Visualization** - View the locked pairs as a directed acyclic graph (DAG)
- 🏆 **Winner Identification** - Follow the algorithm to find the Condorcet winner

This tool transforms the abstract Tideman algorithm into an intuitive, visual learning experience.

## Why Use This Tool?

- **Educational** - Perfect for CS50 students or anyone learning about ranked-choice voting systems
- **Debugging** - Visualize your own Tideman implementation to catch logic errors
- **Teaching** - Demonstrate how the Tideman algorithm works with real-time visual feedback
- **Understanding** - Finally grasp the complexity of cycle detection in ranked voting

## 🚀 Use the Tool

**[Launch Tideman Visualizer →](https://froredion.github.io/tideman-visualizer/)**

No installation required! Just open the link and start visualizing the Tideman algorithm.

### How to Use:

1. Enter your candidates (comma-separated)
2. Add ballots in ranked order (e.g., `Alice>Bob>Charlie`)
3. Click through each step to see the algorithm in action
4. Watch as pairs are compared, locked, or rejected due to cycles
5. See the final winner determined!

### Ballot Format:

Each line is a full ranking, highest preference first:

```
Alice>Bob>Charlie
Bob>Charlie>Alice
Charlie>Alice>Bob
```

Note: Ties aren't supported (following CS50 specification).

## 🛠️ Development

Want to run locally or contribute?

```bash
npm install
npm run dev
```

Then open your browser to the local development URL.

To build for production:

```bash
npm run build
```

Built with React, TypeScript, and Vite.

Note: If you guys want me to make more visualizer like this, star this repository and suggest a few by adding issues in this GitHub repo
