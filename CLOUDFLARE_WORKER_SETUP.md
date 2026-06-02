# Cloudflare Worker Setup (Free — Best Solution for CORS)

This is the most reliable way to fix the Football Data API CORS issue.
Cloudflare Workers are **completely free** (100,000 requests/day free tier).

---

## Why This Is Needed

football-data.org **blocks direct browser requests** from websites hosted on
GitHub Pages. This is a CORS (Cross-Origin Resource Sharing) restriction.
A Cloudflare Worker acts as a middleman — your site calls the Worker,
the Worker calls football-data.org, and returns the data safely.

---

## Step 1 — Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Enter your email and a password → Create Account
3. You don't need to add a domain — Workers work without one

---

## Step 2 — Create the Worker

1. In the Cloudflare dashboard, click **Workers & Pages** (left sidebar)
2. Click **Create application**
3. Click **Create Worker**
4. Give it a name like `laliga-proxy`
5. Click **Deploy** (ignore the default code for now)
6. Click **Edit code** button

---

## Step 3 — Paste This Worker Code

Delete everything in the editor and paste this exact code:

```javascript
const FOOTBALL_API_KEY = "PASTE_YOUR_FOOTBALL_DATA_API_KEY_HERE";
const API_BASE = "https://api.football-data.org/v4";

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname + url.search;

    // Only allow GET requests to football-data.org
    const apiUrl = `${API_BASE}${path}`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          "X-Auth-Token": FOOTBALL_API_KEY,
        },
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
```

**Important:** Replace `PASTE_YOUR_FOOTBALL_DATA_API_KEY_HERE` with your
actual football-data.org API key in the worker code.

---

## Step 4 — Save and Deploy

1. Click **Save and Deploy**
2. Your worker URL will be something like:
   `https://laliga-proxy.YOUR-NAME.workers.dev`
3. Copy this URL

---

## Step 5 — Update js/api.js

1. Go to your GitHub repo → `js/api.js` → ✏️ Edit
2. Find this line near the top:
   ```
   const PROXY_URL = "https://corsproxy.io/?";
   ```
3. Replace it with your Cloudflare Worker URL:
   ```
   const PROXY_URL = "https://laliga-proxy.YOUR-NAME.workers.dev";
   ```
   **Note:** Remove the `?` at the end — Cloudflare Worker uses path-based routing
4. Also change the fetch call — find this line:
   ```
   const url = `${PROXY_URL}${encodeURIComponent(targetUrl)}`;
   ```
   Replace with:
   ```
   const url = `${PROXY_URL}${path}`;
   ```
5. Commit the changes

---

## Step 6 — Test It

Visit your site's `setup.html` page and run the checks.
The Football Data API check should now show ✅ green.

---

## Troubleshooting

**Worker returns 403:**
→ Double-check your API key is pasted correctly in the Worker code

**Worker returns "Script not found":**
→ Make sure you clicked "Save and Deploy" not just "Save"

**Still getting CORS errors:**
→ Make sure the Worker URL in api.js doesn't have a trailing slash
→ Worker URL format: `https://laliga-proxy.yourname.workers.dev`
