// refresh.js — TokenFlow on-demand data refresh
// Fetches live TVL from DefiLlama only when the user clicks Refresh.
// Results cached in localStorage with a 24h TTL so repeat page loads cost zero API calls.

const CACHE_KEY = 'tokenflow_tvl_v2';
const CACHE_TTL  = 24 * 60 * 60 * 1000; // 24 hours in ms

const PROTOCOLS = {
  ondo:  { slug: 'ondo-finance',  label: 'Ondo Finance', metric: 'TVL' },
  maple: { slug: 'maple-finance', label: 'Maple Finance', metric: 'Active Loans' }, // DefiLlama returns deployed loans (~$2.4B), not committed AUM ($4.0B)
  plume: { slug: 'plume',         label: 'Plume Network', metric: 'TVL' },
  cfg:   { slug: 'centrifuge',    label: 'Centrifuge',    metric: 'TVL' }
};

function fmt(val) {
  if (val >= 1e9) return '$' + (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6) return '$' + (val / 1e6).toFixed(0) + 'M';
  return '$' + Math.round(val).toLocaleString();
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Expire after 24h
    if (Date.now() - parsed.ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch { return null; }
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

function applyData(data) {
  // Update all [data-tvl] text nodes
  for (const [key, val] of Object.entries(data)) {
    document.querySelectorAll('[data-tvl="' + key + '"]').forEach(el => {
      el.textContent = fmt(val);
    });
  }

  // Update bar chart fills and vals — recalculate widths relative to new max
  const vals = Object.values(data).filter(Boolean);
  if (!vals.length) return;
  const max = Math.max(...vals);

  for (const [key, val] of Object.entries(data)) {
    const pct = (val / max * 100).toFixed(1);
    document.querySelectorAll('[data-bar-fill="' + key + '"]').forEach(el => {
      el.style.width = pct + '%';
      el.textContent = fmt(val);
    });
    document.querySelectorAll('[data-bar-val="' + key + '"]').forEach(el => {
      el.textContent = fmt(val);
    });
  }

  // Update bar chart title if it references the max protocol
  const [topKey] = Object.entries(data).sort((a, b) => b[1] - a[1])[0];
  document.querySelectorAll('[data-bar-title]').forEach(el => {
    const label = PROTOCOLS[topKey] ? PROTOCOLS[topKey].label : topKey;
    el.textContent = 'Indexed to ' + label + ' (' + fmt(data[topKey]) + ' = 100%)';
  });
}

function setTimestamp(ts) {
  const d = new Date(ts);
  const str = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.querySelectorAll('[data-refresh-ts]').forEach(el => {
    el.textContent = 'TVL Live · ' + str;
  });
}

async function doRefresh(btn) {
  const label = btn ? btn.querySelector('.refresh-label') : null;
  const icon  = btn ? btn.querySelector('.refresh-icon')  : null;

  if (btn) btn.disabled = true;
  if (label) label.textContent = 'Fetching...';
  if (icon)  icon.style.animation = 'tf-spin 0.7s linear infinite';

  try {
    const results = {};
    await Promise.all(
      Object.entries(PROTOCOLS).map(async ([key, cfg]) => {
        const res = await fetch('https://api.llama.fi/tvl/' + cfg.slug);
        if (!res.ok) throw new Error(cfg.label + ' ' + res.status);
        results[key] = await res.json(); // DefiLlama returns a bare number
      })
    );

    // Note: Maple DefiLlama TVL reflects active deployed loans (~$2.4B), not committed AUM ($4.0B).
    // The $4.0B AUM figure shown in the table is the committed/total capital figure from protocol disclosures.
    // We display the live TVL (deployed loans) in the refresh-updated cells only.

    applyData(results);
    saveCache(results);
    setTimestamp(Date.now());

    if (btn)   btn.classList.add('tf-success');
    if (label) label.textContent = 'Updated';
    setTimeout(() => {
      if (btn)   btn.classList.remove('tf-success');
      if (label) label.textContent = 'Refresh';
    }, 2500);

  } catch (err) {
    console.warn('[TokenFlow] Refresh failed:', err.message);
    if (btn)   btn.classList.add('tf-error');
    if (label) label.textContent = 'Failed — retry';
    setTimeout(() => {
      if (btn)   btn.classList.remove('tf-error');
      if (label) label.textContent = 'Refresh';
    }, 3000);
  } finally {
    if (btn) btn.disabled = false;
    if (icon) icon.style.animation = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Restore cached data without any API call (if cache is still valid)
  const cache = loadCache();
  if (cache && cache.data) {
    applyData(cache.data);
    setTimestamp(cache.ts);
  }

  // Wire every refresh button on this page
  document.querySelectorAll('.refresh-btn').forEach(btn => {
    btn.addEventListener('click', () => doRefresh(btn));
  });
});
