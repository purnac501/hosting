# piggii's home page

A personal blog with an early-2000s personal-homepage look: narrow centered
layout, beige/brown palette, marquee tagline, sidebar widgets, music player,
dancing GIFs. Under the hood it is a boring, reliable static site:

- **Jekyll** builds the site (versions pinned to what GitHub Pages runs)
- **GitHub Pages** hosts it for free
- **Sveltia CMS** gives the owner a graphical editor at `/admin/`
- **GitHub OAuth + a tiny Cloudflare Worker** authenticates the CMS
- Posts live in the repository as **Markdown files**

No frameworks, no build pipeline beyond Jekyll, no databases, no JavaScript
framework on the public site.

## Architecture

```
Owner ──▶ /admin/ (Sveltia CMS, a static SPA)
           │  GitHub OAuth
           ▼
     sveltia-cms-auth (Cloudflare Worker, vendored in auth-worker/)
           │  exchanges OAuth code for a GitHub token
           ▼
     GitHub repository (Markdown posts in _posts/, images in assets/uploads/)
           │  commits push to main
           ▼
     GitHub Pages rebuilds the Jekyll site
           ▼
     public blog updated
```

## Directory structure

```
├── _config.yml          # Jekyll settings (site name, baseurl, url)
├── _data/settings.yml   # editable site content (tagline, sidebar, links)
├── _layouts/            # default / post / page templates
├── _includes/emoticons.html  # forum-code → smilie replacement
├── _posts/              # blog posts (Markdown + YAML front matter)
├── _site/               # build output (not committed)
├── admin/
│   ├── index.html       # Sveltia CMS entry point
│   └── config.yml       # CMS config (repo, OAuth worker URL)
├── archive.html         # archive page (posts grouped by year/month)
├── about.md             # about page
├── index.html           # home page (recent posts)
├── 404.html
├── feed.xslt.xml        # stylesheet so /feed.xml is readable in browsers
├── style.css            # the entire visual identity
├── script.js            # clock, music player, visitor counter
├── assets/              # images, smilies, music; uploads land in assets/uploads/
├── auth-worker/         # vendored official Sveltia CMS Authenticator (Cloudflare Worker)
├── Gemfile              # local Jekyll versions matching GitHub Pages
├── HANDOFF.md           # non-technical setup checklist for the site owner
└── README.md
```

## Local development

Requires Ruby and Bundler (`gem install bundler`).

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000/.

The Gemfile pins Jekyll to the major/minor version GitHub Pages currently
builds with (see https://pages.github.com/versions/), so local output matches
the published site.

### Admin locally, without any accounts

Sveltia has a local workflow that edits the repository files directly in the
browser (no GitHub login, no server):

1. `bundle exec jekyll serve`
2. Open http://localhost:4000/admin/index.html in a Chromium browser
   (Chrome/Edge/Brave - it uses the File System Access API)
3. Click **Work with Local Repository** and select this project folder
4. Edit posts; changes are written to local files. Commit with git yourself.

The production config (`backend:` with GitHub OAuth) stays untouched.

## Blog post format

Posts are `_posts/YYYY-MM-DD-slug.md`:

```markdown
---
layout: post
title: "my post title"
date: 2026-08-28 14:30:00 +0200
author: piggii
mood: tired                      # optional
listening: "some song"           # optional
excerpt: "short teaser text"     # optional, shown on the home page
tags: [web, music]               # optional
published: true                  # set false to hide the post
---

Post body in **Markdown**. Raw HTML works too.
```

Jekyll turns the file name into the date-based URL
(`/2026/08/28/my-post-title/`). The CMS generates file names with the
`{{year}}-{{month}}-{{day}}-{{slug}}` pattern automatically.

### Emoticons

Post bodies (and the About page) convert classic forum codes into the site's
16x16 smilies automatically (`_includes/emoticons.html`):

```
:)  :(  :D  :P  ;)  B)  x_x  :s  :'(
:lol:  :mad:  :oops:  :rolleyes:  :idea:  :?:
```

Codes inside `` `code` `` spans are safe from longer codes; plain-text codes
anywhere else in the body are replaced, including inside code blocks, so avoid
 emoticon-looking strings in fenced code samples.

### Editable site content

The header tagline, the sidebar "About this blog" text, and the sidebar links
live in `_data/settings.yml` and are editable in the CMS under
**Site Settings**. The About page is editable under **Pages**. Posts render
full-width (no sidebar); home, archive and about keep the sidebar.

### Badges

The 88x31 badges (Under Construction, Built with Notepad, Linux powered,
Netscape Now!, "best viewed with", IE) are authentic period badges taken from
the 88x31 archive at http://cyber.dabamos.de/88x31/. Replace them with any
other badge from that archive or similar collections if desired.

## URL handling / baseurl

Everything in the templates uses Jekyll's `relative_url` filter, and the
JavaScript reads the base path from `<meta name="site-base">`. This lets the
same code run as:

- a **project site**: `https://OWNER.github.io/REPOSITORY/`
  - requires `baseurl: "/REPOSITORY"` in `_config.yml`
- a **user site**: `https://OWNER.github.io/`
- a **custom domain**: `https://example.com/`
  - both use `baseurl: ""`

Uploaded images get the same treatment: `admin/index.html` computes the
`public_folder` from the browser path at runtime, so Sveltia inserts image
paths that work in all cases.

## Sveltia CMS

Loaded from the UNPKG CDN (`https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js`),
initialized manually in `admin/index.html`. Collection config: `admin/config.yml`.
Docs: https://sveltiacms.app/en/docs/intro

- backend: `github`, production login is **OAuth only**
  (`auth_methods: [oauth]`) - GitHub does not support client-side PKCE, so the
  authorization code flow through the Worker is the right setup
- media: uploads go to `assets/uploads/`, inserted image paths respect the
  site base path
- commits made by Sveltia are signed and attributed to the logged-in user, so
  they trigger normal GitHub Pages branch builds (no `GITHUB_TOKEN` problem)

### Emergency fallback

If the OAuth Worker is ever down, a PAT still works: temporarily change
`auth_methods: [oauth]` to `auth_methods: [oauth, token]` in
`admin/config.yml`, push, and use **Sign In with Token** (a fine-grained PAT
with Contents read/write on the repo). Revert afterwards.

## OAuth Worker (auth-worker/)

`auth-worker/` vendors the official MIT-licensed
[sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) Cloudflare
Worker. It only handles the OAuth handshake; no content or media touches
Cloudflare. See `auth-worker/README.md` for the three-command deployment.

## GitHub Pages

The intended deployment is the simplest supported option:

- **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**
- Branch `main`, folder `/ (root)`
- No custom GitHub Actions workflow; Jekyll is built by Pages itself with the
  default, whitelisted plugins (`jekyll-feed` only here)

Since Sveltia commits as the authenticated GitHub user, every "save" in the
CMS is a normal push to `main`, which rebuilds the site.

## Testing the built site

```sh
bundle exec jekyll build
# _site/ contains the result; check it with any static server
python3 -m http.server 8000 --directory _site
```
