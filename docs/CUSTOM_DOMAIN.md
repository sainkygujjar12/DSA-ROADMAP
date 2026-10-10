# Production domain: atsdsa.in

The existing Render service hosts the frontend and API together:

- Primary domain: `https://atsdsa.in`
- Alias: `https://www.atsdsa.in` (Render redirects this to the primary domain)
- Existing Render address: `https://dsa-roadmap-5n8k.onrender.com`
- Render service: `srv-db4kbf0m7kps73c5q4fg`

Adding a domain in Render does not configure GoDaddy DNS. Both DNS and Render verification must succeed before the new address works.

## GoDaddy DNS

Open Domain Portfolio → atsdsa.in → DNS → DNS Records.

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `216.24.57.1` |
| CNAME | `www` | `dsa-roadmap-5n8k.onrender.com` |

Edit existing records for these names rather than adding competing records. Use the default TTL. Remove conflicting parking/forwarding records and AAAA records for these web hostnames if present; keep unrelated mail and verification records. If using custom nameservers, make these changes at the authoritative DNS provider instead.

Then open Render → DSA-ROADMAP → Settings → Custom Domains and verify both names. Render provisions and renews HTTPS certificates automatically. DNS updates may take time to propagate.

## Application settings

Render's `CLIENT_URL` allowlist includes all three addresses during the transition:

```dotenv
CLIENT_URL=https://atsdsa.in,https://www.atsdsa.in,https://dsa-roadmap-5n8k.onrender.com
```

Redeploy to apply runtime environment changes. The frontend uses relative `/api` requests, so it does not need a separate backend domain or a `VITE_API_URL` change. Keep the Render subdomain enabled while verifying the custom domain.

Google sign-in configuration is separate from DNS. In the Google Cloud project's existing **Web application OAuth client**, add `https://atsdsa.in` and `https://www.atsdsa.in` to **Authorized JavaScript origins**. Retain the existing Render origin. Buying or connecting a domain does not configure email delivery.

## Verification

```sh
dig +short atsdsa.in A
dig +short www.atsdsa.in CNAME
curl -I https://atsdsa.in
curl https://atsdsa.in/api/health
curl -I https://www.atsdsa.in
```

The primary domain must load with a valid HTTPS certificate, its health endpoint must return success, and `www` must redirect to the primary address. Check a direct SPA route such as `/roadmap` and refresh it as well.

References: [Render DNS](https://render.com/docs/configure-other-dns), [Render custom domains](https://render.com/docs/custom-domains), [GoDaddy A records](https://www.godaddy.com/help/add-or-edit-an-a-record-42546).
