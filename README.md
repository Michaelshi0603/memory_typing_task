# Memory Typing Task (Web)
A browser-based memory typing experiment:

- 5 trials
- Each trial: show passage for 20s → full-screen black screen for 20s → type from memory
- Background music options: with lyrics / without lyrics / no music (loops during the experiment)
- Final summary shows total time, per-trial typing time, accuracy, and mean accuracy
- Download results as a CSV file (opens in Excel)

---

## Files in this repo

Required:
- `index.html`
- `with-lyrics.mp3`
- `no-lyrics.mp3`

> **Important:** Filenames are **case-sensitive** on GitHub Pages.  
> Use exactly: `with-lyrics.mp3` and `no-lyrics.mp3`.

---

## How to run locally

### Option A: Open the file directly
1. Download the repo as a ZIP, or clone it.
2. Open `index.html` in your browser.

### Option B (recommended): Run a local server
Some browsers handle audio more reliably when served over HTTP.

In the project folder, run:

**Mac / Linux**
```bash
python3 -m http.server 8000
