// La Liga Data Service - uses football-data.org API (free tier)
// Sign up at https://www.football-data.org/ for a free API key
// Replace YOUR_API_KEY below with your actual key

const API_KEY = "ff4756dbe81247e498d88d450d2d1772";
const BASE_URL = "https://api.football-data.org/v4";
const LA_LIGA_ID = 2014; // La Liga competition ID

const headers = { "X-Auth-Token": API_KEY };

// Cache helper
const cache = {};
function setCache(key, data, ttlSeconds = 60) {
  cache[key] = { data, expires: Date.now() + ttlSeconds * 1000 };
}
function getCache(key) {
  const entry = cache[key];
  if (entry && Date.now() < entry.expires) return entry.data;
  return null;
}

async function apiFetch(endpoint, ttl = 60) {
  const cached = getCache(endpoint);
  if (cached) return cached;
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  const data = await res.json();
  setCache(endpoint, data, ttl);
  return data;
}

// Current season standings
export async function getStandings() {
  const data = await apiFetch(`/competitions/${LA_LIGA_ID}/standings`, 300);
  return data.standings[0].table;
}

// Recent + upcoming matches
export async function getMatches(status = null, dateFrom = null, dateTo = null) {
  let url = `/competitions/${LA_LIGA_ID}/matches?limit=50`;
  if (status) url += `&status=${status}`;
  if (dateFrom) url += `&dateFrom=${dateFrom}`;
  if (dateTo) url += `&dateTo=${dateTo}`;
  const data = await apiFetch(url, 60);
  return data.matches;
}

// Live matches
export async function getLiveMatches() {
  return getMatches("LIVE");
}

// Top scorers
export async function getTopScorers() {
  const data = await apiFetch(`/competitions/${LA_LIGA_ID}/scorers?limit=10`, 3600);
  return data.scorers;
}

// All teams
export async function getTeams() {
  const data = await apiFetch(`/competitions/${LA_LIGA_ID}/teams`, 86400);
  return data.teams;
}

// Single team info
export async function getTeam(teamId) {
  const data = await apiFetch(`/teams/${teamId}`, 86400);
  return data;
}

// Historical seasons - get matches by season year
export async function getMatchesBySeason(season) {
  const data = await apiFetch(`/competitions/${LA_LIGA_ID}/matches?season=${season}&limit=400`, 86400);
  return data.matches;
}

// Get competition info (includes available seasons)
export async function getCompetitionInfo() {
  const data = await apiFetch(`/competitions/${LA_LIGA_ID}`, 86400);
  return data;
}

// Get matches for a specific matchday
export async function getMatchday(matchday) {
  const data = await apiFetch(`/competitions/${LA_LIGA_ID}/matches?matchday=${matchday}`, 300);
  return data.matches;
}

// Club badge URL helper (uses football-data.org crest)
export function getClubBadge(crestUrl) {
  return crestUrl || "assets/logos/default.svg";
}

// Format date nicely
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

// Auto-refresh live scores every 60s
export function startLiveRefresh(callback, intervalMs = 60000) {
  callback();
  return setInterval(callback, intervalMs);
}
