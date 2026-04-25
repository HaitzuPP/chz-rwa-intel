# TokenFlow — RWA Intelligence Terminal

A Token Terminal-style dashboard for real-world asset (RWA) tokenization research, built for Pylon Partners.

## Pages

| Page | File | Description |
|------|------|-------------|
| RWA Market Overview | `index.html` | Market-level TVL, protocol comparison table, asset category breakdown |
| Protocol Analytics | `analytics.html` | Deep-dive metrics on Ondo, Plume, Maple, and Centrifuge |
| Sports Tokenization | `sports.html` | History of sports tokenization attempts + Chiliz 2026 setup |

## Coverage Universe

- **Ondo Finance** — Tokenized US Treasuries (OUSG, USDY) · $2.5B TVL
- **Maple Finance (SYRUP)** — Institutional on-chain credit · $4.0B AUM
- **Plume Network** — RWA-native L2 · $645M TVL · 280K+ holders
- **Centrifuge (CFG)** — Asset management infrastructure · $1.6B TVL
- **Chiliz (CHZ)** — Sports fan tokens · ~$800M market cap

## Data Sources

- [rwa.xyz](https://app.rwa.xyz) — tokenized asset analytics
- [DefiLlama](https://defillama.com) — TVL
- [Messari](https://messari.io) — protocol metrics
- [Sports PE Intel](https://haitzupp.github.io/sports-pe-intel/) — sports tokenization research

## Deploy to GitHub Pages

```bash
# After cloning the repo
git add .
git commit -m "Initial TokenFlow dashboard"
git push origin main

# In GitHub repo settings → Pages → Deploy from main branch root /
```

No build step required — pure HTML/CSS.
