# piggii · Personal Blog

A fast, lightweight, and modern personal blog built on Jekyll and GitHub Pages with full Sveltia CMS support, built-in RSS, dark/light theme switching, and a mini background music player.

---

## Features

- **Clean Typography & Layout**: Fast, readable personal blog design with comfortable spacing and responsive mobile layout.
- **Dual Theme Support**: Light and Dark modes with automatic OS system preference detection and an instant, persistent toggle button.
- **Sveltia CMS Integration**: Full browser-based content management system at `/admin/` with GitHub OAuth login, markdown editing, tag management, and thumbnail uploads.
- **Valid RSS / Atom Feed**: Standards-compliant `/feed.xml` with styled in-browser XSLT preview (`/feed.xslt.xml`).
- **Subtle Music Player**: Persistent background music player in the footer with Lucide SVG playback controls and progress scrubber.
- **Zero Heavy Frameworks**: Pure HTML, CSS, and vanilla JavaScript. No tracker scripts, no cookies, no heavy framework dependencies.

---

## Architecture Overview

```text
Site Owner ──▶ /admin/ (Sveltia CMS in browser)
                 │
                 ▼ GitHub OAuth Code
   Cloudflare Worker (auth-worker/)
                 │
                 ▼ Exchanged GitHub Access Token
   GitHub Repository (commits markdown posts to _posts/ and images to assets/uploads/)
                 │
                 ▼ Push event to main branch
   GitHub Pages (Builds & deploys Jekyll site automatically)
                 │
                 ▼
   Live Blog (https://purnac501.github.io/hosting/)
```

---

## Project Structure

```text
├── _config.yml          # Jekyll configuration (site title, baseurl, url, permalinks)
├── _data/
│   └── settings.yml     # Editable site metadata (header tagline, links)
├── _includes/
│   └── emoticons.html   # Emoticon formatting helper
├── _layouts/
│   ├── default.html     # Base HTML wrapper, header nav, theme toggle, and footer player
│   └── post.html        # Single article reading layout with metadata, cover image, and pagination
├── _posts/              # Markdown blog posts (YYYY-MM-DD-title.md)
├── admin/
│   ├── index.html       # Sveltia CMS loader
│   └── config.yml       # CMS collection, field, and backend configuration
├── assets/
│   ├── tracks/          # MP3 audio tracks for background music player
│   ├── uploads/         # Uploaded images and post thumbnails
│   └── ...              # Icons, badges, and avatars
├── auth-worker/         # Cloudflare Worker for Sveltia GitHub OAuth authentication
├── archive.html         # Post archive grouped by publication year
├── about.md             # About page
├── index.html           # Home page feed with recent posts
├── feed.xml             # Atom / RSS feed source template
├── feed.xslt.xml        # XSLT stylesheet for beautiful in-browser RSS viewing
├── style.css            # Stylesheet with light/dark CSS custom properties
├── script.js            # Audio player controls, theme toggle, and service worker registration
├── manifest.webmanifest # PWA web application manifest
├── sw.js                # Service worker for offline caching
└── README.md            # Project documentation
```

---

## Local Development & Preview

### Option A: Using Jekyll (Ruby)

If you have Ruby and Bundler installed:

```bash
# Install dependencies
bundle install

# Run Jekyll server
bundle exec jekyll serve

# Open in your browser
http://localhost:4000/hosting/
```

### Option B: Using Python Static Server

If you are developing without a full Ruby environment, you can run the included Python preview builder:

```bash
# Generate preview files
python3 scratch/render_site.py

# Start static server
python3 -m http.server 4000 --directory _preview

# Open in browser
http://localhost:4000/hosting/
```

---

## Content & Publishing Workflow

### 1. Publishing via Sveltia CMS (Web Interface)

1. Navigate to `https://purnac501.github.io/hosting/admin/` (or `http://localhost:4000/hosting/admin/` locally).
2. Click **Login with GitHub** to authenticate via OAuth.
3. Click **New Post** to create a post, or click an existing post to edit.
4. Fill in:
   - **Title**: Post heading.
   - **Date**: Publication timestamp.
   - **Thumbnail**: Featured cover image (stored in `assets/uploads/`).
   - **Mood / Listening**: Optional status fields.
   - **Tags**: Categories / topic tags.
   - **Body**: Markdown content.
5. Click **Publish**. Sveltia CMS commits the markdown file directly to your GitHub repository, triggering a GitHub Pages deployment.

### 2. Publishing via Git & Markdown Files

You can create or edit markdown files directly in `_posts/`:

```markdown
---
layout: post
title: "My New Article"
date: 2026-08-31 12:00:00 -0700
author: piggii
thumbnail: /assets/uploads/photo.jpg
mood: "creative"
tags:
  - tech
  - life
published: true
---

Your content goes here in standard **Markdown**!
```

Commit and push to publish:

```bash
git add .
git commit -m "add new article"
git push
```

---

## Configuration & Environment Variables

### 1. Site Configuration (`_config.yml`)

- `title`: Site title displayed in browser tab and RSS.
- `description`: Site meta description.
- `baseurl`: `/hosting` for GitHub Pages project sites (`https://<user>.github.io/<repo>/`). Leave `""` for custom apex domains.
- `url`: Public base URL (e.g. `https://purnac501.github.io`).

### 2. Cloudflare OAuth Worker (`auth-worker/`)

The Cloudflare Worker authenticates GitHub OAuth logins for Sveltia CMS.

#### Required Worker Secrets:

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `GITHUB_CLIENT_ID` | OAuth App Client ID from GitHub Developer settings | `Ov23...` |
| `GITHUB_CLIENT_SECRET` | OAuth App Client Secret from GitHub Developer settings | `40-character hash` |
| `ALLOWED_DOMAINS` | Allowed origins that can request tokens | `purnac501.github.io,localhost` |

To deploy or update secrets:

```bash
cd auth-worker
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put ALLOWED_DOMAINS
npx wrangler deploy
```

---

## GitHub Pages Deployment

1. On GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / folder `/(root)`
3. Save. Every push to `main` builds and publishes the blog automatically.
