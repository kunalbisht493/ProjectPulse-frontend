# Project Pulse - Frontend Client 🚀

Modern, responsive Single Page Application (SPA) for project management and team collaboration built with **React 19**, **Vite**, **Tailwind CSS**, and **Lucide Icons**.

---

## ✨ Features

- **Modern SaaS UI**: Clean, light-themed, high-contrast user interface with subtle micro-animations and typography (`Plus Jakarta Sans`).
- **Google OAuth 2.0 Integration**: One-click Google Sign-In and registration using the latest Google Identity Services (GSI) SDK.
- **Multi-Tab Synchronized Logout**: Real-time cross-tab session monitoring via browser `storage` events — logging out in one tab instantly logs out all active tabs.
- **Password Security & Toggle**: Strong password regex enforcement (8+ chars, uppercase, lowercase, numeric, special) with interactive show/hide eye toggle button.
- **Interactive Kanban Board**: Drag-and-drop task workflow management powered by `@dnd-kit`.
- **Live Analytics & Dashboard**: Visual project metrics, task completion rates, and status breakdowns powered by `Recharts`.
- **Real-Time Collaboration**: Instant socket notifications and comments powered by `Socket.io-client`.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler / Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Notifications**: [React-Toastify](https://fkhadra.github.io/react-toastify/)

---

## ⚙️ Environment Variables

Create a `.env` file in the `Client/` folder (or configure in your Vercel deployment settings):

```env
# Backend API & WebSocket Endpoint URL
VITE_API_URL=https://project-pulse-backend-cnrh.onrender.com

# Google OAuth 2.0 Client ID (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

---

## 🚀 Getting Started

### 1. Local Development (Node.js)

```bash
cd Client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

### 2. Build for Production

```bash
cd Client
npm run build
```

---

## 🐳 Docker Deployment

The frontend includes a multi-stage Dockerfile that compiles the React app using Node.js 20 Alpine and serves the static build using a tuned **Nginx Alpine** image with gzip compression and SPA routing fallback.

### Build the Docker Image
```bash
cd Client
docker build \
  --build-arg VITE_API_URL="https://project-pulse-backend-cnrh.onrender.com" \
  --build-arg VITE_GOOGLE_CLIENT_ID="your_google_client_id_here.apps.googleusercontent.com" \
  -t projectpulse-frontend .
```

### Run the Docker Container
```bash
docker run -d -p 5173:80 --name projectpulse-client projectpulse-frontend
```

Access the app in your browser at `http://localhost:5173`.
