# Not Into Tech

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://cloudflare.com/)

**[https://notintotech.web.id](https://notintotech.web.id)**

*A data-driven platform for people who are curious about tech, but not obsessed with it.*

</div>

## Overview

**Not Into Tech** is a curated, data-driven content platform designed for the tech-curious who prefer high-level, practical insights over obsessive technical minutiae. The platform serves as a modern digital hub, offering comprehensive articles enriched with interactive visualizations, open-access datasets, and experimental AI tools designed to stimulate curiosity and explore digital capabilities without overwhelming the user.

## Features

- **Data-Driven Articles with Tableau Visualizations:** Highly engaging and researched insights featuring interactive, embedded Tableau dashboards to make data exploration intuitive and visually appealing.
- **Open Access Datasets:** A free, public repository of clean datasets available for instant download to support self-guided analysis and academic or professional projects.
- **AI Experimental Products:** Hands-on sandbox tools and digital experiments for users looking to learn how AI works under the hood.
- **NITE Chatbot:** A fully embedded, context-aware AI assistant powered by **n8n** and **Google Gemini** that provides interactive assistance across the site.

## Tech Stack

The application leverages a robust and modern tech stack designed for modularity, high performance, and rapid deployment.

```
                    ┌─────────────────────────┐
                    │     Frontend & SSR      │
                    │   Node.js + Express.js  │
                    │    EJS & Tailwind CSS   │
                    └───────────┬─────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Databases    │    │  AI & Chatbot   │    │ Object Storage  │
│ Supabase (PG)   │    │ n8n Webhook     │    │  Cloudflare R2  │
│ MongoDB (Atlas) │    │ Google Gemini   │    │(Datasets/Assets)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend & Server
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/) for lightweight and flexible server-side routing
- **Templating Engine:** [EJS](https://ejs.co/) (Embedded JavaScript templates) for dynamic HTML rendering
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a sleek, modern, and utility-first responsive interface

### Database & ORM
- **Supabase (PostgreSQL):** Utilized via [Prisma ORM](https://www.prisma.io/) to model, migrate, and query transactional data (such as articles and visualizations).
- **MongoDB Atlas:** Connected via native MongoDB client connections for document-oriented and flexible metadata storage (such as system logs and session/user data).

### AI & Automation
- **NITE Chatbot:** An intelligent AI assistant built on [n8n](https://n8n.io/) workflow automation and backed by [Google Gemini](https://deepmind.google/technologies/gemini/).
- **Embedded Integration:** Served seamlessly on the platform through a backend proxy middleware to maintain API credential security and session privacy.

### Infrastructure & Storage
- **Cloudflare R2:** S3-compatible, high-performance object storage for delivering datasets, media, and static assets with zero egress fees.
- **Deployment:** Optimized for serverless platforms like [Vercel](https://vercel.com) or standard Node.js hosting environments.

## Project Structure

The project adheres to a clean and modular Model-View-Controller (MVC) structure optimized for Express.js development:

```
NotIntoTech-Website/
├── prisma/                # Prisma ORM schemas and database migration configurations
│   └── schema.prisma      # Supabase PostgreSQL schema definition
├── public/                # Compiled static client-side assets (CSS, JS, images)
│   ├── css/               # Output stylesheet built via Tailwind CSS CLI
│   └── js/                # Client-side scripts and Tableau embeddings
├── views/                 # EJS templates for page rendering
│   ├── components/        # Reusable UI partials (header, footer, chatbot)
│   └── *.ejs              # Page-level templates (home, articles, datasets, AI)
├── routes/                # Express router modules mapping endpoints to controllers
├── controllers/           # Application logic and request/response handlers
├── middlewares/           # Custom Express middlewares (authentication, proxies)
├── utils/                 # General utility scripts, helpers, and client configurations
├── app.js                 # Primary Express server initialization and app setup
├── package.json           # Node.js project manifests and dependencies
└── .env                   # Local configuration for environment variables (git-ignored)
```

## Environment Variables

Create a `.env` file in the root directory of your project. The following environment variables must be defined for the application to function correctly:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Databases
# Prisma-compatible connection string for Supabase PostgreSQL
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/postgres?pgbouncer=true"
# MongoDB Atlas client connection string
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"

# Cloudflare R2 Storage
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="your_r2_bucket_name"
R2_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"

# AI Chatbot Integration
# n8n webhook endpoint configured to receive chatbot requests
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/nite-chatbot"
```

## Getting Started

Follow these steps to set up and run a local development environment for the **Not Into Tech** platform.

### Prerequisites
- **Node.js** (v22.x or higher recommended)
- **npm** (comes packaged with Node.js)
- Access to running instances of **Supabase (PostgreSQL)** and **MongoDB**
- A **Cloudflare R2 Bucket** with access keys configured

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/AdnanBayu/NotIntoTech-Website.git
   cd NotIntoTech-Website
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Duplicate or create a `.env` file at the root level using the template in the [Environment Variables](#%EF%B8%8F-environment-variables) section.

4. **Sync Prisma Database Migrations:**
   Generate the Prisma Client and sync your database schema with Supabase:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start Development Server:**
   Run the local server and start compilation watch tasks for Tailwind CSS:
   ```bash
   npm run dev
   ```

   The platform should now be accessible locally at `http://localhost:3000`.

## API Reference

The backend exposes a clean and fully documented REST API for managing and querying platform resources (such as articles and datasets).

- **Complete Interactive API Documentation:** [https://notintotech.web.id/docs](https://notintotech.web.id/docs)
- **Endpoints Swagger/OpenAPI Spec:** Locally accessible at `/docs` when the development server is active.

Use the interactive endpoint documentation to explore parameters, request payloads, and testing tools.

## NITE Chatbot Integration

The platform features **NITE Chatbot**, a powerful, contextual virtual assistant.

### Architecture
- **Automation Engine:** Powered by [n8n](https://n8n.io/) workflows that handle session state, user history, and context injection.
- **AI Core:** Leveraging **Google Gemini** for high-quality, professional, and natural language understanding.
- **Client Security:** All chatbot interactions route through a backend endpoint (`/api/chat` or similar proxy middleware) on the Express server. This hides the `N8N_WEBHOOK_URL` from the browser, protecting infrastructure from external abuse and ensuring CORS compliance.

## Deployment Notes

### Server Hosting
- **Serverless Hosting (Vercel):** The codebase includes a `vercel.json` configuration to map server routes and serverless handlers.
- **Traditional Hosting (VPS/PaaS):** Can be deployed on conventional platforms (e.g., Render, Heroku, Railway, or AWS EC2) using standard startup commands:
  ```bash
  npm run build
  npm start
  ```

### Storage Best Practices
- **Media & Assets:** Use Cloudflare R2 for storing and serving bulky datasets and blog-post assets. Configure R2 with a custom domain to obtain cleaner download links and ensure high CDN deliverability.

## Contributors

| Name | Username |
| :--- | :--- |
| Adnan Bayu| [@AdnanBayu](https://github.com/AdnanBayu) |

## License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it in accordance with the license conditions. See the [LICENSE](LICENSE) file for more details.