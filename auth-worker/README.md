# Sveltia CMS Authenticator (vendored)

This directory contains the **official** [Sveltia CMS Authenticator]
(https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker (MIT licensed,
see `LICENSE.txt`), vendored so the site owner can deploy it directly.

The Worker only handles GitHub OAuth for the CMS login at `/admin/`. It does
not host the website or any content.

## Deploy it

```sh
cd auth-worker
npm install
npx wrangler login      # opens a browser, log in to Cloudflare
npx wrangler deploy     # prints the deployed URL, e.g.
                        # https://sveltia-cms-auth.<SUBDOMAIN>.workers.dev
npx wrangler secret put GITHUB_CLIENT_ID      # paste the OAuth App Client ID
npx wrangler secret put GITHUB_CLIENT_SECRET  # paste the OAuth App Client Secret
# optional but recommended once the final domain is known:
npx wrangler secret put ALLOWED_DOMAINS       # e.g. "example.com" or "OWNER.github.io"
```

No dashboard clicking required. If you prefer the dashboard, follow the
steps in `HANDOFF.md` or the official README at
https://github.com/sveltia/sveltia-cms-auth instead - the result is identical.

## Update it

The vendored `src/index.js` is upstream code. To pick up upstream updates:

```sh
curl -o src/index.js https://raw.githubusercontent.com/sveltia/sveltia-cms-auth/main/src/index.js
npx wrangler deploy
```
