// ============================================================
// PASTE YOUR football-data.org API KEY BELOW
// Get free key: https://www.football-data.org/client/register
// ============================================================
const API_KEY = "ff4756dbe81247e498d88d450d2d1772";

// ============================================================
// CORS PROXY — Required for GitHub Pages (browser can't call
// football-data.org directly due to CORS restrictions)
//
// OPTION A (easiest, no setup): corsproxy.io — already set below
// OPTION B (most reliable): Set up your own Cloudflare Worker
//   → See CLOUDFLARE_WORKER_SETUP.md in this repo
//   → After setup, replace PROXY_URL with your worker URL:
//     const PROXY_URL = "https://YOUR-WORKER.YOUR-NAME.workers.dev";
// ============================================================
const PROXY_URL = "https://corsproxy.io/?";

const BASE = "https://api.football-data.org/v4";
const LL   = 2014; // La Liga competition ID

// ── Cache (prevents hitting rate limits) ──────────────────
const _cache = new Map();
function cacheGet(k) {
  const e = _cache.get(k);
  return (e && Date.now() < e.exp) ? e.data : null;
}
function cacheSet(k, data, ttlSec) {
  _cache.set(k, { data, exp: Date.now() + ttlSec * 1000 });
}

// ── Core fetch via CORS proxy ──────────────────────────────
async function apiFetch(path, ttlSec = 60) {
  const cached = cacheGet(path);
  if (cached) return cached;

  const targetUrl = `${BASE}${path}`;
  const url = `${PROXY_URL}${encodeURIComponent(targetUrl)}`;

  const res = await fetch(url, {
    headers: {
      "X-Auth-Token": API_KEY,
      "X-Requested-With": "XMLHttpRequest"
    },
    signal: AbortSignal.timeout(15000)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Try to parse error from football-data
    try {
      const err = JSON.parse(text);
      throw new Error(err.message || `HTTP ${res.status}`);
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
  }

  const data = await res.json();
  if (data.errorCode) throw new Error(data.message || "API error");
  cacheSet(path, data, ttlSec);
  return data;
}

// ── Public API functions ───────────────────────────────────
export async function getStandings() {
  const d = await apiFetch(`/competitions/${LL}/standings`, 300);
  return d.standings[0].table;
}

export async function getMatches(status = null, dateFrom = null, dateTo = null) {
  let url = `/competitions/${LL}/matches?limit=50`;
  if (status)   url += `&status=${status}`;
  if (dateFrom) url += `&dateFrom=${dateFrom}`;
  if (dateTo)   url += `&dateTo=${dateTo}`;
  const d = await apiFetch(url, 60);
  return d.matches || [];
}

export async function getLiveMatches() {
  return getMatches("LIVE");
}

export async function getTopScorers() {
  const d = await apiFetch(`/competitions/${LL}/scorers?limit=20`, 3600);
  return d.scorers || [];
}

export async function getTeams() {
  const d = await apiFetch(`/competitions/${LL}/teams`, 86400);
  return d.teams || [];
}

export async function getTeam(id) {
  return apiFetch(`/teams/${id}`, 86400);
}

export async function getMatchesBySeason(season) {
  const d = await apiFetch(`/competitions/${LL}/matches?season=${season}`, 86400);
  return d.matches || [];
}

export async function getMatchday(matchday) {
  const d = await apiFetch(`/competitions/${LL}/matches?matchday=${matchday}`, 300);
  return d.matches || [];
}

// ── Helpers ───────────────────────────────────────────────
export function formatDate(str) {
  return new Date(str).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
}
export function formatTime(str) {
  return new Date(str).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit"
  });
}
export function startLiveRefresh(cb, ms = 60000) {
  cb();
  return setInterval(cb, ms);
}
