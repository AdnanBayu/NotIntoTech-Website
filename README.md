# Not Into Tech – Website

> A digital platform for the **Not Into Tech** organization, used for branding, publishing insightful data-related articles, and deploying digital AI-driven products.

---

## 📌 Overview

Not Into Tech Website is a full-stack web application built with **Node.js + Express** and deployed on **Vercel**. It serves as an organizational hub featuring article publishing, data visualization pages, an AI chatbot (powered by N8N), and a feedback/request system.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Templating | EJS |
| Styling | Tailwind CSS |
| Database | MongoDB (Atlas) + Supabase (PostgreSQL) |
| Storage | Cloudflare R2 |
| AI Chatbot | N8N Webhook |
| Deployment | Vercel |

---

## 📁 Project Structure

```
NotIntoTech-Website/
├── api/
│   ├── index.js          # Vercel serverless entry point
│   └── handler.js        # Request handler
├── src/
│   ├── database/
│   │   └── db.js         # MongoDB connection
│   ├── middleware/       # Express middleware
│   ├── model/            # Mongoose data models
│   ├── public/           # Static assets (CSS, JS, images)
│   └── routes/           # Express routers
│       ├── router.js             # Main router aggregator
│       ├── homeRouter.js         # Home page
│       ├── insightsRouter.js     # Insights/articles page
│       ├── insightsApiRouter.js  # Articles REST API
│       ├── aiRouter.js           # AI page
│       ├── datasetRouter.js      # Dataset page
│       ├── profileRouter.js      # Profile page
│       ├── feedbackformRouter.js # Feedback form page
│       ├── requestRouter.js      # Request page
│       ├── requestformRouter.js  # Request form page
│       ├── comingsoonRouter.js   # Coming soon page
│       └── errorRouter.js        # Error page
├── views/
│   ├── index.ejs             # Home page
│   ├── page-insights.ejs     # Insights listing page
│   ├── insights-detail.ejs   # Single article page
│   ├── page-ai.ejs           # AI tools page
│   ├── page-data.ejs         # Dataset page
│   ├── page-profile.ejs      # Profile page
│   ├── coming-soon.ejs       # Coming soon page
│   ├── error.ejs             # Error page
│   ├── request-data.ejs      # Request data page
│   └── components/           # Reusable EJS partials
├── add-articles.js       # Script to seed articles
├── server-local.js       # Local development server
├── vercel.json           # Vercel deployment config
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v22.x or higher
- **npm**
- A **MongoDB** connection URI
- A **Supabase** project with the articles table set up
- An **N8N** webhook URL (for the AI chatbot feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdnanBayu/NotIntoTech-Website.git
   cd NotIntoTech-Website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

4. **Run the local development server**
   ```bash
   npm run dev
   ```
   This runs the Express server and Tailwind CSS watcher concurrently.

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run server + Tailwind CSS watcher concurrently |
| `npm run dev:server` | Run Express server only (with nodemon) |
| `npm run dev:css` | Run Tailwind CSS watcher only |
| `npm run build` | Build Tailwind CSS for production |
| `npm start` | Start server with nodemon |

---

## 🗄️ Database

The project uses **two databases**:

- **MongoDB** (via Mongoose) — used for user-related data and feedback forms.
- **Supabase (PostgreSQL)** — used for storing and querying articles/insights with support for Tableau data visualization links.

---

## 📦 Storage

The project uses **Cloudflare R2** for object storage:

- **Cloudflare R2** — used for storing dataset resources and other large files, providing high-performance and cost-effective storage.

---

## 🤖 AI Chatbot

The website includes an AI-powered chatbot. The Express server acts as a **proxy** between the client and an [N8N](https://n8n.io/) webhook, keeping the webhook URL private and managing session state. The proxy endpoint is available at `POST /api/chat`.

---

## 🌐 Deployment

This project is deployed on **Vercel** using a serverless Node.js setup.

- The entry point for production is `api/index.js`
- Static assets under `src/public/` are served via Vercel's static handler
- All routes are forwarded to `api/index.js` as configured in `vercel.json`

To deploy, simply push to your connected GitHub branch or run:
```bash
vercel --prod
```

---

## 🤝 Contributing

This is an internal organization project. If you are a team member and want to contribute:

1. Create a new branch from `main`
2. Make your changes
3. Open a Pull Request with a clear description of what you changed

---

## 📄 License

ISC © Not Into Tech