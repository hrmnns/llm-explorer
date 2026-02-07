# 🛰️ LLM Explorer - Phase Model v2.3

An interactive, visual deep-dive into the inner workings of Large Language Models. This simulator visualizes the entire Transformer pipeline—from raw tokenization to the final softmax decision—using a configurable, state-driven simulation engine.

![Version](https://img.shields.io/badge/version-2.3-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)

## 🏗️ The 6 Phases of Discovery

The application breaks down the complex inference process into six manageable, interactive phases:

1.  **Phase 0: Tokenization** – See how raw text is split into semantic tokens and mapped to an index.
2.  **Phase 1: Embedding & Position** – Visualize how tokens are converted into high-dimensional vectors and mixed with positional information.
3.  **Phase 2: Attention Mechanism** – Explore the core of the Transformer. Toggle between **Orbit** and **Matrix** views to see how tokens "attend" to each other across multiple heads.
4.  **Phase 3: FFN (Feed Forward Network)** – Watch the vector transformation and activation within the semantic MLP layer.
5.  **Phase 4: Decoding & Softmax** – Manipulate **Temperature**, **Top-K**, and **Min-P**. Experience the **Gumbel-Max Trick** where token rankings shift dynamically with higher temperature.
6.  **Phase 5: Final Analysis** – Review the semantic output and the "winning" token path.

## 🔥 Key Simulation Features

-   **Multi-View Attention**: Switch between a spatial Orbit view and a precise Grid Matrix view.
-   **Gumbel-Max Dynamic Decoding**: Realistic temperature scaling that doesn't just flatten probabilities but actually allows for creative "ranking shifts."
-   **Configurable Scenarios**: Entirely data-driven logic. Add new behaviors, tokens, and attention rules via `scenarios.json`.
-   **Persisted UI State**: Your view modes, selected heads, and active tokens are remembered during your session.
-   **Global Synchronized Reset**: Reset the entire mathematical state without losing your visual configuration.

## 🛠️ Tech Stack

-   **Core:** React 18, Vite
-   **Logic:** Custom `LLMEngine` class for pure mathematical simulation
-   **Styling:** Vanilla CSS with a centralized semantic variable system for high performance and clean aesthetics.
-   **State Management:** React Hooks & Context API for global scenario orchestration.

## 🚀 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
4.  **Open in browser**: `http://localhost:5173`

## 📊 Scenario Configuration

The simulator is powered by a JSON-based domain model located in `public/data/scenarios.json`. Developers can define:
-   `base_vector` coordinates for embeddings.
-   `attention_profiles` with specific token-to-token rules per head.
-   `top_k_tokens` with `base_logit` and `noise_sensitivity` values.

---

*Developed for educational exploration of Transformer architectures.*