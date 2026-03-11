# SSL certificates

Place your TLS certificate and key here for HTTPS:

- `fullchain.pem` – certificate (and chain)
- `privkey.pem` – private key

Use Let's Encrypt, your CA, or self-signed for dev. Do not commit private keys.

Example (Let's Encrypt with certbot):
  certbot certonly --standalone -d mechnow.example.com
  # Copy fullchain.pem and privkey.pem into this directory.

Then enable `conf.d/https.conf` and restart nginx.
