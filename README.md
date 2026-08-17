# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1bd46c51-4fab-4d32-b6f6-3c6355879db5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1bd46c51-4fab-4d32-b6f6-3c6355879db5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1bd46c51-4fab-4d32-b6f6-3c6355879db5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## MCP (MT5 via MCP) integration

This repository now supports using an MCP (Model Connector Protocol) server to provide MT5 access. The app uses server-side functions (Supabase edge functions or your backend) to proxy requests to the MCP endpoint so secrets remain server-side.

Important environment variables (server-only)

- MCP_URL — e.g. `http://127.0.0.1:22346/mcp`
- MCP_API_KEY — Bearer token the MCP server shows in its Options -> MCP tab

Optional (for local frontend testing only; do NOT expose secrets in production client builds)

- VITE_MCP_URL (commented) — only for local dev when absolutely necessary
- VITE_MCP_API_KEY (commented) — do NOT use in production

Server-side behaviour

- Keep the MCP API key in server-side secrets (Supabase secret / environment variable). The frontend continues to call the existing server functions — those functions will proxy to MCP_URL with header `Authorization: Bearer <MCP_API_KEY>`.
- This preserves the existing mt5ApiService API in the frontend while keeping credentials off the client.

Quick server-side test examples (run on the machine that can reach the MCP server)

- Connect (replace values):

```bash
curl -X POST "$MCP_URL" \
  -H "Authorization: Bearer $MCP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"connect","payload":{"login":123456,"password":"pwd","server":"YourBroker"}}'
```

- Account:

```bash
curl -X POST "$MCP_URL" \
  -H "Authorization: Bearer $MCP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"account","payload":{"login":123456,"server":"YourBroker"}}'
```

- Trade:

```bash
curl -X POST "$MCP_URL" \
  -H "Authorization: Bearer $MCP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"trade","payload":{"symbol":"EURUSD","action":"BUY","volume":0.01}}'
```

Security notes

- DO NOT expose MCP_API_KEY in client bundles. Use the server proxy for production.
- If you expose MCP on a network, protect it with TLS and firewall rules.
- Store secrets using your platform's secret manager (Supabase secrets, environment variables, etc.).

If you want me to also update the edge functions in this repo to wire the server proxy helper into `mt5-account`, `mt5-positions`, `mt5-execute`, and `mt5-close`, tell me and I will patch those edge function files next.
