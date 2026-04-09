# Equipment Checkout App

A browser-based equipment checkout/check-in app for security teams.

## What it does

- Officers scan their badge to open a shift session
- Officers scan equipment QR codes to check items out
- Officers scan the same equipment again to check items back in
- Supervisors can review the live activity feed, inventory status, session history, and export CSV reports

## Important note

This version stores data in the browser using local storage.
That means:
- it works well as a prototype
- each browser/computer has its own separate data
- to make it multi-user for your site, the next upgrade is a shared cloud database such as Supabase or Firebase

## Upload to GitHub without installing anything locally

1. Create a new repository on GitHub
2. Click **Add file** → **Upload files**
3. Upload all files from this project folder
4. Commit the files to the `main` branch

## Run it in GitHub Codespaces

1. Open the repository on GitHub
2. Click **Code**
3. Open the **Codespaces** tab
4. Click **Create codespace on main**
5. In the Codespaces terminal, run:

```bash
npm install
npm run dev
```

6. Open the forwarded port when GitHub shows it

## Deploy it as a web app with Vercel

1. Sign in to Vercel with GitHub
2. Import this repository
3. Click deploy

Vercel should detect Next.js automatically.

## Project structure

- `app/page.tsx` → main app
- `app/layout.tsx` → page wrapper
- `app/globals.css` → styles
- `package.json` → dependencies and scripts

## Next recommended upgrade

For real work use across multiple officers and devices, add:
- login/authentication
- a shared database
- supervisor roles
- lost/damaged equipment workflow
- mobile camera scanning
