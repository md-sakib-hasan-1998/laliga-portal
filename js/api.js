// ============================================================
// STEP 2: PASTE YOUR FOOTBALL-DATA.ORG API KEY HERE
// Free key from: https://www.football-data.org/client/register
// ============================================================
const API_KEY = "ff4756dbe81247e498d88d450d2d1772";

const BASE     = "https://api.football-data.org/v4";
const LL       = 2014; // La Liga competition ID
const HEADERS  = { "X-Auth-Token": API_KEY };

// ── Simple in-memory cache ────────────────────────────────────
const _cache = new Map();
function cacheGet(k) {
  const e = _cache.get(k);
  return e && Date.now() < e.exp ? e.data : null;
}
function cacheSet(k, data, ttlSec) {
  _cache.set(k, { data, exp: Date.now() + ttlSec * 1000 });
}

async function apiFetch(path, ttlSec = 60) {
  const cached = cacheGet(path);
  if (cached) return cached;
  const res = await fetch(BASE + path, { headers: HEADERS });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  cacheSet(path, data, ttlSec);
  return data;
}

// ── Public API ────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────
export function formatDate(str) {
  return new Date(str).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
export function formatTime(str) {
  return new Date(str).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
export function startLiveRefresh(cb, ms = 60000) {
  cb();
  return setInterval(cb, ms);
}
