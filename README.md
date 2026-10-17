# Nilanka Roy Chowdhury: portfolio

Plain HTML, CSS and JavaScript. No build step, no dependencies.

```
index.html     page content
style.css      all styling
script.js      the hero belief-grid animation
favicon.svg    browser tab icon
.nojekyll      tells GitHub Pages to serve the files as they are
```

## Deploy on GitHub Pages

**Option A: your main address (recommended)**

1. On GitHub, create a **public** repository named exactly `Neilfal.github.io`.
2. Upload every file in this folder to the repository root (including `.nojekyll`).
3. Go to **Settings, Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to `main`, folder `/ (root)`, then Save.
4. After a minute or two the site is live at `https://neilfal.github.io`.

**Option B: a project site**

Use any repository name, for example `portfolio`, follow steps 2 and 3, and the site appears at `https://neilfal.github.io/portfolio/`.

## Command line version

```bash
git init
git add .
git commit -m "Add portfolio site"
git branch -M main
git remote add origin https://github.com/Neilfal/Neilfal.github.io.git
git push -u origin main
```

## Things to edit

- **Contact**: the footer links to LinkedIn, GitHub and Instagram. Add an email link there if you want one.
- **Colors**: change the variables at the top of `style.css`.
