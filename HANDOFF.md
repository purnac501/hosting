# HANDOFF - putting the blog online

This guide takes the finished project in this folder and puts it live on the
internet with you (piggii) able to write posts from your browser.

You do NOT need to understand how anything works. Follow the steps in order.
Every step says exactly what to click, what to type, and what success looks
like. Where you must replace a placeholder value, it is written in CAPS and
also listed here:

- `OWNER`          - your GitHub username (once you know it)
- `REPOSITORY`     - the name of the GitHub repository you will create
- `WORKER_URL`     - the address of the Cloudflare Worker (created in step 8)

Two files contain placeholders that must be updated near the end:
`_config.yml` and `admin/config.yml`.

---

## 1. What has already been done

- The old fake "osu! coaching" page is gone. This is now a real personal blog
  in the same visual style: same colors, borders, marquee, sidebar, music
  player, dancing GIFs, badges.
- The site is a Jekyll site. Posts are Markdown files in `_posts/`.
- Pages that exist: home (recent posts), individual post pages, archive,
  about, 404, RSS feed (`/feed.xml`).
- Sveltia CMS is installed at `/admin/` with GitHub OAuth login configured
  (production login is GitHub only - no tokens to paste).
- The OAuth helper (Sveltia CMS Authenticator) is prepared in `auth-worker/`.
- Three example posts exist in `_posts/` - delete or edit them later from the
  CMS.
- The sidebar tagline, "About this blog" text and links are editable in the
  CMS under "Site Settings"; the About page under "Pages".
- Everything has been built and tested locally (pages, links, music player,
  RSS, CMS loading, phone layout). What remains needs your accounts.

## 2. Accounts you need

1. A GitHub account (free) - https://github.com/signup
2. A Cloudflare account (free) - https://dash.cloudflare.com/sign-up

You will do short logins for both during the steps below. Nothing in this
project ever needs your passwords written into files.

## 3. Create the GitHub repository

1. Log in to GitHub.
2. Go to https://github.com/new
3. Repository name: pick one, e.g. `homepage` (this is `REPOSITORY`).
4. Visibility: **Public** (required for free GitHub Pages).
5. Do NOT tick "Add a README" - the project already has one.
6. Click **Create repository**.
7. Keep the next page open; you will need `OWNER` (your username) and
   `REPOSITORY`.

Success: GitHub shows a "Quick setup" page with a repository URL.

## 4. Push this directory to GitHub

In a terminal, inside this project folder:

```sh
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

(If you prefer SSH keys: `git@github.com:OWNER/REPOSITORY.git` instead.)

GitHub will ask you to authenticate in the browser the first time - accept it.

Success: refreshing https://github.com/OWNER/REPOSITORY shows all the files.

## 5. Configure GitHub Pages

1. On GitHub, open your repository → **Settings** tab.
2. Left sidebar → **Pages** (under "Code and automation").
3. Under "Build and deployment", set **Source** to **Deploy from a branch**.
4. Branch: `main`, folder: `/ (root)`. Click **Save**.

Important for project sites: if your site will live at
`https://OWNER.github.io/REPOSITORY/` (this is the normal case for a repo
named anything other than `OWNER.github.io`), you must tell Jekyll about the
path. Open `_config.yml`, find this block and set the value:

```yaml
baseurl: "/REPOSITORY"   # keep the leading slash, no trailing slash
```

Also set the public URL in the same file:

```yaml
url: "https://OWNER.github.io/REPOSITORY"
```

Commit and push that change:

```sh
git add _config.yml
git commit -m "chore: set baseurl and url for GitHub Pages"
git push
```

(If your repository IS named `OWNER.github.io`, or you will use a custom
domain, keep `baseurl: ""` instead - see step 20.)

Success: after a minute, the Pages settings page shows
"Your site is live at ...".

## 6. Confirm the public site works

1. Open `https://OWNER.github.io/REPOSITORY/`
2. You should see the beige retro blog with posts, sidebar, music player.
3. Click through: Archive, About, a post, RSS.

If styles or images are missing, the `baseurl` in `_config.yml` almost
certainly doesn't match - recheck step 5, then push again.

## 7. Create the GitHub OAuth App

This lets the CMS log you in with GitHub. The callback URL needs the Worker
URL from step 8/10 - either do steps 8-10 first and come back here, or use a
placeholder now and edit it in step 10.

1. Go to https://github.com/settings/applications/new
2. Fill in:
   - **Application name**: `piggii cms` (anything you like)
   - **Homepage URL**: `https://OWNER.github.io/REPOSITORY` (your site URL)
   - **Authorization callback URL**: `WORKER_URL/callback`
     (format is exactly `<your worker url>/callback`, e.g.
     `https://sveltia-cms-auth.your-subdomain.workers.dev/callback`)
3. Click **Register application**.
4. You now see the **Client ID** - copy it.
5. Click **Generate a new client secret** - copy the **Client Secret**
   immediately and keep both values ready.

Success: the app page shows Client ID, and you have the secret in your
clipboard/notes. Never commit the secret anywhere.

## 8. Deploy the Cloudflare OAuth Worker

The Worker is prepared in `auth-worker/`. In a terminal:

```sh
cd auth-worker
npm install
npx wrangler login        # a browser opens: log in to Cloudflare, click Allow
npx wrangler deploy       # deploys the Worker
```

`wrangler deploy` prints the deployed URL, like:

```
https://sveltia-cms-auth.YOUR-SUBDOMAIN.workers.dev
```

That URL is `WORKER_URL` for the rest of this guide. Write it down.

(If you prefer clicking in a dashboard instead of commands: the official
"Deploy to Cloudflare" button at
https://github.com/sveltia/sveltia-cms-auth deploys the same Worker. The
result is identical; set the same secrets as below in the dashboard under
Settings → Variables.)

Success: the URL above loads a page without errors (it may say it needs
configuration - that's fine until step 9).

## 9. Add the OAuth Client ID/Secret as Worker secrets

Still in `auth-worker/`:

```sh
npx wrangler secret put GITHUB_CLIENT_ID
# paste your Client ID from step 7, press Enter

npx wrangler secret put GITHUB_CLIENT_SECRET
# paste your Client Secret from step 7, press Enter
```

Recommended once your final site address is known (anti-abuse + security -
only your site may use the Worker):

```sh
npx wrangler secret put ALLOWED_DOMAINS
# e.g. OWNER.github.io  or, with a custom domain:  example.com
# (comma-separate multiple hostnames, no https://, no trailing slash)
```

Success: each command ends with something like
"Uploaded secret ... after deploy".

## 10. Finish the OAuth App callback (if you used a placeholder)

1. Go to https://github.com/settings/developers
2. Click your `piggii cms` app.
3. Set **Authorization callback URL** to `WORKER_URL/callback` exactly.
4. Click **Update application**.

## 11. Update the CMS config with the real values

Open `admin/config.yml` and replace the two placeholders:

```yaml
backend:
  name: github
  repo: OWNER/REPOSITORY                                  # ← your repo
  branch: main
  base_url: WORKER_URL                                    # ← your Worker URL
```

Also replace `site_url` at the bottom of the backend section:

```yaml
site_url: https://OWNER.github.io/REPOSITORY              # ← your site URL
```

Commit and push:

```sh
git add admin/config.yml
git commit -m "chore: configure Sveltia CMS backend"
git push
```

Success: `https://OWNER.github.io/REPOSITORY/admin/config.yml` shows your
real repo and Worker URL (no "OWNER" or "REPLACE" text left).

## 12. That's it for setup - summary of what got pushed

- `_config.yml` with `baseurl`/`url` (step 5)
- `admin/config.yml` with repo + Worker URL (step 11)
- (optional custom-domain changes - step 20)

## 13. Sharing access (optional)

Only you will write here. If someone else should post too: repository →
**Settings** → **Collaborators** → **Add people**. They then log into
`/admin/` with their own GitHub account. Their GitHub account needs write
access to the repository - that IS the permission.

## 14. Test the admin page

Open `https://OWNER.github.io/REPOSITORY/admin/`

Success: the Sveltia CMS welcome screen with a **Sign In with GitHub**
button.

## 15. Log in with GitHub

1. Click **Sign In with GitHub**.
2. A GitHub page opens asking to authorize the OAuth app → click
   **Authorize**.
3. You land back in the CMS, logged in.

Success: you see the "Posts" list with your existing posts.

## 16. Create a test blog post

1. Click **Posts** → **New Post**.
2. Title: `admin test` (you can delete it after).
3. Date: already filled in.
4. Write something short in the Body. Try `hello world :)`
5. Click **Save** (top right) → choose to publish directly if asked.

Success: a green "entry saved" style confirmation, no errors.

## 17. Verify the post created a Markdown commit

1. Go to https://github.com/OWNER/REPOSITORY/commits/main
2. The top commit should say something like `Create Posts "admin-test"`.
3. Open the changed file: it is `_posts/2026-MM-DD-admin-test.md` containing
   your title, date and text.

Success: the commit is marked **Verified** (Sveltia signs commits).

## 18. Verify GitHub Pages rebuilds

1. Repository → **Actions** tab.
2. You should see a "pages build and deployment" workflow run for your new
   commit (or check Settings → Pages for a new "deployed" timestamp).

This is automatic - Sveltia commits as your user, and every push to `main`
rebuilds the site. Nothing to click.

## 19. Verify the post appears publicly

1. Wait 1-2 minutes after step 17.
2. Open `https://OWNER.github.io/REPOSITORY/` and refresh.
3. Your test post is at the top, links work, the RSS feed now contains it
   too.

Delete the test post in the CMS (Posts → select → delete), and it disappears
from the repository and the site on the next rebuild.

## 20. Optional: custom domain

1. Buy/own a domain anywhere.
2. At your domain provider, add a DNS record:
   - Type `CNAME`, name `www` (or the apex per provider's instructions),
     value `OWNER.github.io`.
3. Repository → **Settings** → **Pages** → **Custom domain**: enter
   `www.example.com` → **Save**. Wait for the DNS check.
4. Tick **Enforce HTTPS** once it is offered.
5. Update `_config.yml`: `url: "https://www.example.com"` and
   `baseurl: ""` (custom domains have no path prefix). Push.
6. Update `site_url` in `admin/config.yml` the same way. Push.
7. Update the Worker: `npx wrangler secret put ALLOWED_DOMAINS`
   → `example.com, www.example.com` (no https://).

Success: the blog loads on your domain, styles and music work, `/admin/`
login still works.

## 21. Troubleshooting

| Problem | Likely cause / fix |
| --- | --- |
| Site 404s at `OWNER.github.io/REPOSITORY` | Pages source not set (step 5), or the push failed. Check Settings → Pages. |
| Page loads but no styles/images/music | `baseurl` in `_config.yml` doesn't match the URL path. Project site → `/REPOSITORY`; custom domain → empty. Push after fixing. |
| `/admin/` shows "configuration could not be parsed" | Placeholders not replaced properly in `admin/config.yml`, or broken YAML indentation. Compare against the README example. |
| "Sign In with GitHub" errors or loops back | Callback URL in the GitHub OAuth app must be exactly `WORKER_URL/callback`; secrets must be set on the Worker (steps 7-10). Worker secrets changes need no redeploy, but a wrong `ALLOWED_DOMAINS` (must include your site hostname, no `https://`) blocks login on purpose. |
| Saved post doesn't appear on the site | Wait 1-2 minutes; check Actions tab for a failed "pages build" run; check the post file name in `_posts/` starts with `YYYY-MM-DD-`. |
| Commit exists but Pages didn't rebuild | Confirm the commit landed on `main` and Pages source is "Deploy from a branch". |
| Music doesn't start | Browsers block autoplay until you interact; click anywhere or press the play button. |
| Emergency login without the Worker | Temporarily change `auth_methods: [oauth]` to `auth_methods: [oauth, token]` in `admin/config.yml`, push, then use **Sign In with Token** in `/admin/` with a GitHub fine-grained PAT that has read/write Contents on this repository. Revert after. |
| Worker reports errors | `cd auth-worker && npx wrangler tail` shows live logs. |

---

## Prompt for a setup agent

The section below is for a coding agent. If you are that agent: this prompt
is self-contained. The site owner will paste it to you after receiving this
directory.

---

You are helping the owner of a finished personal blog put it online. The
implementation is COMPLETE - do not redesign, rewrite, or "improve" the site.
Your job is account wiring and verification only.

Start by reading `HANDOFF.md` fully and inspecting `_config.yml`,
`admin/config.yml`, `admin/index.html`, `auth-worker/`, and `README.md` so
you understand the setup. The stack:

- Jekyll + GitHub Pages, Sveltia CMS at `/admin/`, GitHub OAuth via the
  official Sveltia CMS Authenticator Cloudflare Worker (vendored in
  `auth-worker/`).
- PWA: `manifest.webmanifest` (site), `admin/manifest.webmanifest` (admin,
  installable as a phone writing app), `sw.js` (offline reads + install),
  icons in `assets/icons/`. All paths are relative, so they work unchanged
  on a project Pages subdirectory and on custom domains.
- A "click to enter" splash (`#enter-gate` in `_layouts/default.html`)
  unlocks the music player. The player remembers track + position across
  pages via localStorage. Default volume 15%. Do not touch any of this.

Help the owner through these steps, in order:

1. Create/connect the GitHub repository and push this directory (branch
   `main`). Suggested excludes if making a zip transfer: `_site/`.
2. Configure GitHub Pages: Settings → Pages → Source "Deploy from a branch",
   branch `main`, folder `/ (root)`. Set `baseurl`/`url` in `_config.yml`
   correctly for the final URL (project site → `baseurl: "/REPO"`, custom
   domain or user site → empty) and push.
3. After the baseurl change, verify the built pages: the manifest link,
   `sw.js` registration (`navigator.serviceWorker.register('sw.js')` uses a
   relative path on purpose), icon paths, and the music player's
   `meta[name="site-base"]` must all resolve under `/REPO/`. Build locally
   with `bundle exec jekyll build` and check `_site/` output.
4. Register a GitHub OAuth App (https://github.com/settings/applications/new)
   with callback `WORKER_URL/callback`.
5. Deploy the prepared Worker: `cd auth-worker && npm install && npx wrangler
   login && npx wrangler deploy`, then `npx wrangler secret put
   GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `ALLOWED_DOMAINS`.
6. Replace the placeholders in `admin/config.yml` (`repo`, `base_url`,
   `site_url`) and push.
7. Verify the public site, then `/admin/` login with GitHub, then create a
   test post, confirm it commits `_posts/YYYY-MM-DD-*.md` to the repo,
   confirm the Pages rebuild runs, and confirm the post appears publicly.
   Also verify on a phone (or DevTools mobile view): `/admin/` should offer
   "Add to Home Screen" and the enter-gate/music should work.
8. Optionally help with custom-domain DNS and the matching
   `_config.yml` / `ALLOWED_DOMAINS` updates.

Hard rules:

- NEVER ask the owner for passwords, OAuth client secrets, tokens, or any
  account credentials in chat. When an account action is needed, stop and
  tell the owner exactly what to do in which browser window/tab, then wait.
- If you have GitHub or Cloudflare integrations/tools available, use them
  only after the owner explicitly authorizes that specific access in the
  conversation.
- Never write secrets into any file in this repository. Secrets live only in
  Worker secrets (`wrangler secret put`) or the GitHub/Cloudflare dashboards.
- Do not modify site design, layouts, CSS, or content beyond the two config
  files named above (`_config.yml` and `admin/config.yml`), unless the owner
  explicitly asks.
- Placeholders to replace: `OWNER/REPOSITORY`,
  `https://REPLACE-WITH-AUTH-WORKER.workers.dev`, and the matching
  `baseurl`/`url`/`site_url` values.
