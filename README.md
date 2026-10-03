# Dad's To-Do App ("My To-Do Lists")

A simple, printable, nested to-do list app. Lists are grouped into categories, and every item can have sub-items to any depth. Built with React 19 and Vite.

## Where everything lives

| What | Where |
|---|---|
| **Source code (the real project)** | `C:\Users\TedJackson\dad-todo-app` |
| **GitHub repo** | https://github.com/tedjackson123/dad-todo-app (branch `main`, 1 commit: "Initial commit") |
| **This folder** | `C:\dev\2026-todo` - project notes only (no code yet) |
| **Netlify** | **Not deployed on the company Netlify.** Searched all projects on 2026-10-03; the only one is `managed-home`. |
| **Built output** | `C:\Users\TedJackson\dad-todo-app\dist` (built 2026-02-26) |
| **Empty leftover folder** | `C:\Users\TedJackson\dad-todo` - safe to delete |

No other copies were found on this computer. If it is hosted somewhere, it is not on the company Netlify account; check a personal Netlify, Vercel, or GitHub Pages account (the GitHub account is `tedjackson123`).

## How it works

- Single-page app; nearly all code is in `src/App.jsx` (~618 lines).
- **Data is saved in the browser's `localStorage`** under the key `retired-todo-lists`. No backend, no database, no login.
  - Consequence: lists exist only in the one browser on the one device where they were entered. Clearing browser data erases them, and a different computer or phone shows a blank/default list.
- Features: nested items, check off, double-click to rename, delete (with descendant count), add category, progress counts, print button (`window.print()`).
- Fonts (Caveat, Lora) load from Google Fonts.

## Run it locally

```bash
cd C:\Users\TedJackson\dad-todo-app
npm install
npm run dev      # dev server (Vite)
npm run build    # production build into dist/
npm run preview  # preview the build
```

## Status / history

- Created 2026-02-26 from the Vite React template. README in the repo is still the default template text.
- Only one commit. Working tree was clean when checked.

## Ideas / next steps

- [ ] Decide on a home: copy or clone the repo into `C:\dev\2026-todo` (following the `2026-family-tree` / `2026-home-manager` pattern).
- [ ] Deploy (e.g., Netlify) so Dad can open it from any device via a link.
- [ ] Sync data across devices (localStorage is per-browser). Options: a small database or a cloud-backed store.
- [ ] Add a backup/export of the lists.
- [ ] Replace the default README in the repo with this one.
