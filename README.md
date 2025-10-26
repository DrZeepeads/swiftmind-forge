# ⚙️ SwiftMind Forge
**An autonomous AI-powered task agent inspired by BabyAGI — built with React, Vite, TypeScript, Zustand, and Framer Motion.**  
SwiftMind Forge transforms your objectives into structured, executable subtasks, complete with progress analytics, persistence, and real AI reasoning.

---

## 🚀 Overview

SwiftMind Forge is a **Progressive Web App (PWA)** that simulates an intelligent agent capable of:
- Breaking down high-level goals into actionable subtasks.
- Executing and tracking progress autonomously.
- Learning from task history and providing AI-generated insights.

It blends **aesthetic design**, **stateful intelligence**, and **persistent data** for a smooth and futuristic workflow.

---

## ✨ Key Features

### 🧠 AI Task Generation
- Real-time AI task creation powered by **Gemini 2.5 Flash** (Lovable AI).
- Smart breakdowns by categories (Research, Planning, Execution, Testing, Documentation).
- Context-aware insights and time estimates.

### 📊 Analytics Dashboard
- Task completion metrics and success trends.
- Category distribution and activity tracking.
- Toggleable dashboard with Framer Motion animations.

### 💾 Persistence & Export
- Tasks persist across sessions using **Zustand + LocalStorage**.
- One-click export to JSON with timestamps for archival or reporting.

### 🎨 Modern UI & Motion
- Dark theme with **indigo → purple → pink** gradient accents.
- Smooth transitions and hover effects using **Framer Motion**.
- Glassmorphism cards with subtle depth and glow.

### ⚡ Autonomy Engine
- Autonomous execution mode: tasks complete sequentially with simulated AI reasoning.
- Pause, resume, and reset execution anytime.
- Realistic progress animations and feedback states.

---

## 🧩 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React + Vite + TypeScript |
| **State Management** | Zustand (with persist middleware) |
| **Animations** | Framer Motion |
| **Icons & UI** | Lucide React + TailwindCSS |
| **AI Integration** | Lovable AI / Gemini 2.5 Flash |
| **Storage** | LocalStorage / Supabase (optional) |
| **Deployment** | PWA-ready build with `vite-plugin-pwa` |

---

## 🛠️ Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/swiftmind-forge.git
cd swiftmind-forge

# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

Then open http://localhost:5173 in your browser.


---

🧠 Usage

1. Set a Goal: Type a high-level objective in the sidebar (e.g., “Launch a research assistant app”).


2. Generate Tasks: Click Generate with AI — SwiftMind Forge will create structured subtasks automatically.


3. Execute: Hit Play to begin autonomous execution. Tasks will progress and mark themselves as complete.


4. Analyze: Switch to the Analytics tab to view metrics and trends.


5. Export: Save your progress as a JSON file with one click.




---

🧪 Upcoming Phases

Phase 3: Intelligence Expansion

Reflective memory: learn from past objectives.

Recursive subtask generation (multi-layer planning).

Continuous loop mode for evolving objectives.

Knowledge base integration via Supabase vectors.


Phase 4: Collaboration & Productization

Chat-driven AI planning assistant.

Multi-agent roles (Planner, Researcher, Executor).

Team workspace and cloud sync.

Auth, Notion/Sheets export, and SaaS features.



---

🤝 Contributing

Contributions are welcome!
If you’d like to extend AI logic, enhance UI, or optimize the execution engine:

1. Fork the repo


2. Create your feature branch (git checkout -b feature/amazing-feature)


3. Commit your changes (git commit -m 'Add amazing feature')


4. Push to the branch (git push origin feature/amazing-feature)


5. Open a Pull Request 🚀




---

📜 License

MIT License © 2025 [Your Name / SwiftMind Labs]
Feel free to use, modify, and build upon this project.


---

💡 Inspiration

Inspired by BabyAGI and modern autonomous agents like Godmode, Devin, and Orion Research Agent.
SwiftMind Forge is designed to make autonomous reasoning and execution accessible and beautiful.


---

> “Forge your goals into reality — one intelligent task at a time.” 
