# Authentication Approaches in Popular Client Applications

A comparison of how major CLI tools and client applications handle authentication, credential storage, and ongoing API communication.

---

## 1. HMAC Request Signing

### How It Works

The client holds a permanent secret key locally. On every request, it constructs a canonical representation of the request (method, URL, headers, body, timestamp), computes an HMAC signature using the secret, and sends the signature along with a key ID. The server looks up the secret by key ID, performs the same computation, and compares. The secret never leaves the client machine.

### Who Uses This

**AWS CLI** — Uses Signature V4 signing. Credentials stored in `~/.aws/credentials` as an access key ID + secret access key pair. Every API call is signed individually. Temporary credentials (via STS) add a session token but still use the same signing mechanism.

**Stripe CLI** — API requests are signed using the secret key from `~/.config/stripe/config.toml`.

### Credential Storage

| Tool | Location | Protection |
|------|----------|------------|
| AWS CLI | `~/.aws/credentials` | File permissions only |
| AWS CLI (SSO) | `~/.aws/sso/cache/` | Cached temporary credentials, auto-refresh |

### Advantages

- **Secret never transmitted** — Even over TLS, the secret isn't in the request. An intercepted request yields a signature valid only for that exact request and timestamp.
- **Replay attack resistance** — The timestamp in the signature means captured requests can't be replayed outside a short window (AWS allows ±5 minutes).
- **No token to steal** — There's no bearer token sitting in a cache that grants broad access if exfiltrated.
- **Request integrity** — The signature covers the request body, so tampering with the payload invalidates the signature.

### Disadvantages

- **Complexity** — Implementing Signature V4 correctly is notoriously difficult. Canonical request formatting, multi-step HMAC chaining, and header ordering are all error-prone.
- **Permanent credentials are powerful** — If `~/.aws/credentials` is compromised, the attacker has long-lived access until the keys are rotated. No automatic expiry.
- **Clock sensitivity** — Client and server clocks must be reasonably in sync. Clock skew beyond the tolerance window causes auth failures.
- **Not standardized across providers** — Each service that uses HMAC signing implements its own variant. No interoperability.

### Tradeoffs

Best suited for server-to-server and CLI-to-API communication where the client environment is controlled and the additional complexity is justified by the security benefits. The permanent credential risk is typically mitigated by using IAM roles and temporary STS credentials rather than long-lived keys.

---

## 2. OAuth2 with Token Refresh

### How It Works

The client performs a one-time OAuth2 authorization (typically opening a browser for user consent), receives an access token and a refresh token, and caches both locally. The access token is sent as a bearer token on each request. When it expires, the client silently uses the refresh token to obtain a new access token without user interaction. When the refresh token itself expires, the user must re-authenticate.

### Who Uses This

**Google Cloud CLI (`gcloud`)** — On `gcloud auth login`, opens a browser for the OAuth2 authorization code flow. Tokens stored in `~/.config/gcloud/credentials.db` and `~/.config/gcloud/access_tokens.db`. Access tokens are short-lived (~1 hour), refresh tokens are long-lived.

**Azure CLI (`az`)** — Similar flow via `az login`. Opens browser, completes OAuth2/OIDC flow with Microsoft Entra ID. Tokens cached in `~/.azure/msal_token_cache.json`. Supports both interactive and device code flows.

**Kubernetes (`kubectl`) with OIDC** — Can be configured to use OIDC tokens with automatic refresh. The kubeconfig stores the refresh token and token endpoint, and kubectl refreshes transparently.

**Spotify CLI / various developer tools** — OAuth2 authorization code flow with PKCE for user-scoped access.

### Credential Storage

| Tool | Location | Protection |
|------|----------|------------|
| gcloud | `~/.config/gcloud/` | File permissions; supports OS keychain |
| Azure CLI | `~/.azure/msal_token_cache.json` | File permissions; optional encryption |
| kubectl (OIDC) | `~/.kube/config` | File permissions |

### Advantages

- **Short-lived access tokens** — If an access token is intercepted, it's valid for minutes to an hour, not indefinitely.
- **Refresh without user interaction** — Seamless UX; the user logs in once and the CLI handles renewals silently for days or weeks.
- **Revocable** — Refresh tokens can be revoked server-side, immediately cutting off access without needing to rotate secrets.
- **Scoped permissions** — Tokens carry specific scopes, so a CLI token might have narrower access than the user's full account.
- **Standardized** — OAuth2/OIDC is widely understood, well-documented, and supported by virtually every identity provider.

### Disadvantages

- **Refresh token is a high-value target** — Stored on disk, it's essentially a long-lived credential. If stolen, an attacker can mint new access tokens until the refresh token is revoked.
- **Bearer token vulnerability** — Access tokens are sent as-is in the Authorization header. If intercepted (TLS stripping, compromised proxy), they're immediately usable.
- **Complexity of token lifecycle** — The client must handle expiry detection, refresh logic, race conditions (concurrent requests during refresh), and graceful degradation when refresh fails.
- **Browser dependency for initial auth** — Many flows require opening a browser, which can be awkward on headless servers or remote SSH sessions.

### Tradeoffs

The best general-purpose approach for CLIs that need user-scoped access. The initial browser-based login is a one-time cost, and the automatic refresh provides a smooth ongoing experience. The security model is well-understood and benefits from the broader OAuth2 ecosystem (token rotation, revocation, audit logs). Main risk is the cached refresh token, which should ideally be stored in the OS keychain rather than a plain file.

---

## 3. Long-Lived Bearer Tokens (Personal Access Tokens / API Keys)

### How It Works

The user generates a token through the provider's web UI (or CLI). The token is stored in a config file or environment variable. On every request, it's sent in the Authorization header as a bearer token. No refresh, no signing — the same token is used until it expires or is revoked.

### Who Uses This

**GitHub CLI (`gh`)** — On `gh auth login`, performs an OAuth2 Device Authorization flow to generate a token, then stores it for ongoing use. Alternatively, users can provide a pre-generated personal access token (PAT). Stored in `~/.config/gh/hosts.yml` or the OS keychain.

**Heroku CLI** — Stores an API key in `~/.netrc`. Same token on every request.

**Fly.io CLI (`flyctl`)** — Stores an auth token in `~/.fly/config.yml`.

**OpenAI API** — API key provided as an environment variable or config. Sent as a bearer token on every request.

**Stripe API** — Secret key sent in every request (though Stripe also supports HMAC for webhooks).

**npm CLI** — Auth tokens stored in `~/.npmrc`. Used for publishing and accessing private packages.

**Docker CLI** — Credentials stored in `~/.docker/config.json`. Supports credential helpers that use the OS keychain.

### Credential Storage

| Tool | Location | Protection |
|------|----------|------------|
| GitHub CLI | `~/.config/gh/hosts.yml` or OS keychain | Keychain preferred |
| Heroku CLI | `~/.netrc` | File permissions only |
| OpenAI API | Environment variable | Process-level isolation |
| npm | `~/.npmrc` | File permissions only |
| Docker | `~/.docker/config.json` | Credential helpers for keychain |

### Advantages

- **Dead simple** — No token lifecycle, no refresh logic, no signing computation. Set a header and go.
- **Easy to understand and debug** — The token is right there. If auth fails, you know exactly what to check.
- **Works everywhere** — No browser needed, no complex flows. Ideal for CI/CD pipelines, scripts, and automation.
- **Portable** — Copy the token to another machine and it works. No device-specific binding.

### Disadvantages

- **No expiry by default** — Many PATs live forever unless the user sets an expiration or manually revokes them. A leaked token is valid indefinitely.
- **Full credential in every request** — Unlike HMAC signing where only a derived signature is sent, the actual credential is in the wire on every call. TLS protects it, but if TLS is compromised, the token is immediately usable.
- **No request integrity** — A bearer token authenticates the caller but doesn't prove the request wasn't tampered with in transit (unlike HMAC which signs the request body).
- **Revocation is manual** — If compromised, someone has to notice and manually revoke. There's no automatic rotation or expiry-based protection.
- **Scope creep** — PATs often have broader permissions than needed because users grant wide scopes for convenience.

### Tradeoffs

The right choice when simplicity outweighs security sophistication — CI/CD pipelines, developer tooling, automation scripts, and any context where the operational simplicity of a single token matters more than the theoretical benefits of short-lived credentials. The key mitigation is scoping tokens tightly (minimal permissions), setting expiration dates where possible, and storing them in the OS keychain or a secrets manager rather than plain text files.

---

## 4. OAuth2 Device Authorization Flow

### How It Works

Designed for devices with limited input capabilities. The client requests a device code and a user code from the authorization server. It displays the user code and a URL to the user. The user visits the URL on another device (phone, laptop), enters the code, and authenticates. Meanwhile, the client polls the authorization server until the user completes the flow, then receives tokens.

### Who Uses This

**GitHub CLI (`gh`)** — Primary login method. Shows a code and opens `github.com/login/device`. The user enters the code in their browser and authorizes.

**Azure CLI (`az`)** — Supports device code flow via `az login --use-device-code`, useful for headless/SSH environments.

**Streaming services (Netflix, Spotify on TV)** — The TV shows a code; you enter it on your phone.

**Smart home devices** — Devices with no keyboard authenticate through a companion app.

### Advantages

- **No browser needed on the device** — Critical for headless servers, SSH sessions, smart TVs, IoT devices, and CI runners.
- **Credential never enters the constrained device** — The user authenticates on a trusted device (their phone/laptop), so the constrained device never handles a password.
- **User-friendly for limited-input devices** — A short code is much easier to enter on a TV remote than a full login flow.
- **Supports full OAuth2 token lifecycle** — After the initial flow, you get access + refresh tokens with the same benefits as the standard OAuth2 flow.

### Disadvantages

- **Phishing risk** — An attacker could display a device code and trick a user into authorizing it on their behalf. The user sees a legitimate-looking authorization page and may not scrutinize which device they're authorizing.
- **Polling overhead** — The client must poll the token endpoint repeatedly until the user completes authentication. Adds latency and requires handling slow/abandoned flows gracefully.
- **Two-device dependency** — The user must have a second device available. If they only have the CLI machine and no browser, they're stuck (unless the CLI can open a browser locally, at which point the standard auth code flow is better).
- **Time-limited codes** — The user code expires (typically 15 minutes). If the user is slow, they have to restart.

### Tradeoffs

The right pattern for any client that can't reliably open a browser or accept complex input. The phishing concern is real but manageable through user education and short code expiry windows. For CLIs, it provides a nice fallback when the standard browser-redirect flow isn't available (e.g., SSH sessions), but shouldn't be the only option when a browser is available since the standard code flow with PKCE is more secure.

---

## 5. Client Certificate Authentication (mTLS)

### How It Works

The client has a TLS certificate (and corresponding private key) signed by a certificate authority the server trusts. During the TLS handshake, the server requests the client's certificate, verifies it against the trusted CA, and extracts the identity from the certificate's subject. Authentication happens at the transport layer before any HTTP request is processed.

### Who Uses This

**Kubernetes (`kubectl`)** — Client certificates are a first-class authentication method. The kubeconfig contains client certificate and key paths. The API server verifies the certificate and extracts the username and groups from the certificate subject.

**Docker daemon (remote)** — When Docker daemon is exposed over TCP, mTLS is used to authenticate both client and server. Certificates stored in `~/.docker/`.

**Enterprise VPNs and zero-trust networks** — Client certificates issued to devices or users, verified at the network edge.

**Banking and financial APIs** — Mutual TLS required for high-security API integrations (e.g., Open Banking).

### Credential Storage

| Tool | Location | Protection |
|------|----------|------------|
| kubectl | Paths in `~/.kube/config` | File permissions |
| Docker | `~/.docker/ca.pem`, `cert.pem`, `key.pem` | File permissions |
| Enterprise | OS certificate store or hardware tokens | Hardware-backed possible |

### Advantages

- **Authentication at the transport layer** — Identity is verified before any application code runs. The connection itself is authenticated.
- **No credentials in HTTP requests** — Nothing in headers, nothing in the body. The identity is in the TLS handshake, invisible to application-layer logging and proxies.
- **Strong cryptographic identity** — Based on public key cryptography with CA-signed certificates. Forging is computationally infeasible.
- **No shared secrets** — The server only needs the CA certificate to verify any client. Unlike API keys or passwords, there's no shared secret to leak from the server side.

### Disadvantages

- **Certificate management is hard** — Issuing, distributing, renewing, and revoking certificates is operationally complex. Requires running or integrating with a CA.
- **Expiry and renewal** — Certificates expire. If renewal isn't automated, clients suddenly lose access when their cert expires.
- **Revocation is difficult** — Certificate Revocation Lists (CRLs) and OCSP are cumbersome and often poorly implemented. Revoking a compromised certificate isn't as instant as revoking a token.
- **Not user-friendly** — Generating, installing, and troubleshooting certificates is beyond most end users. Best suited for machine-to-machine or managed device scenarios.
- **Proxy and load balancer complexity** — TLS termination at a reverse proxy means the proxy must forward client certificate info to the backend, which adds configuration complexity.

### Tradeoffs

The strongest authentication for machine-to-machine communication and controlled environments where certificate lifecycle can be automated (e.g., Kubernetes with cert-manager, service meshes like Istio). Not practical for end-user-facing CLIs due to the operational burden of certificate management. Often combined with other auth methods — mTLS authenticates the machine, then a token or API key authenticates the user or application.

---

## 6. SSH Key Authentication

### How It Works

The client holds a private key locally. The server has the corresponding public key registered (e.g., in `~/.ssh/authorized_keys` or a service like GitHub). During connection, the server sends a challenge, the client signs it with the private key, and the server verifies the signature with the public key. The private key never leaves the client.

### Who Uses This

**Git (SSH transport)** — `git push` and `git pull` over SSH use the key pair in `~/.ssh/`. GitHub, GitLab, and Bitbucket all support SSH keys.

**SSH / SCP / rsync** — The foundational use case. Direct server access authenticated by key pair.

**Ansible, Terraform (for provisioning)** — Use SSH keys to authenticate against remote machines.

### Credential Storage

| Tool | Location | Protection |
|------|----------|------------|
| SSH | `~/.ssh/id_rsa` or `id_ed25519` | File permissions + optional passphrase |
| Git (SSH) | Same SSH keys | SSH agent for session caching |

### Advantages

- **Private key never transmitted** — Like HMAC signing, the secret stays local. Only the signature of a challenge is sent.
- **Passphrase protection** — The private key can be encrypted with a passphrase, adding a "something you know" layer.
- **SSH agent** — Keys can be loaded into an agent, unlocked once per session, and used across multiple connections without re-entering the passphrase.
- **Well-understood and battle-tested** — Decades of use and scrutiny.

### Disadvantages

- **Key distribution** — Public keys must be registered on every server or service. For large organizations, this becomes a management problem without centralized tooling.
- **No built-in expiry** — SSH keys don't expire by default. A forgotten key on a server is a permanent backdoor. (SSH certificates, a newer extension, do support expiry.)
- **No fine-grained permissions** — A standard SSH key grants whatever access the associated user account has. No scoping to specific operations.
- **Single device binding** — The key is on one machine. Moving between machines requires copying keys or using a centralized agent.

### Tradeoffs

Ideal for developer tooling and server administration where the simplicity and security of public key cryptography outweigh the management burden. For organizations, SSH certificates (with expiry and role embedding) or centralized key management solutions address the scalability issues. Being replaced by OAuth2-based methods for API access (GitHub now supports fine-grained PATs that SSH keys can't match for permission granularity).

---

## Comparison Matrix

| Approach | Secret on the Wire | Token Expiry | Refresh Mechanism | Request Integrity | Setup Complexity | Best For |
|----------|-------------------|--------------|-------------------|-------------------|-----------------|----------|
| HMAC Signing | Never | N/A (permanent keys) | Via STS for temp creds | Yes (signed body) | High | AWS-style cloud APIs |
| OAuth2 + Refresh | Bearer token | Short-lived | Automatic via refresh token | No | Medium | User-scoped CLI access |
| Long-Lived Token | Bearer token | Often none | Manual regeneration | No | Low | CI/CD, scripts, automation |
| Device Auth Flow | Bearer token (after flow) | Short-lived | Automatic via refresh token | No | Medium | Headless/limited-input devices |
| Client Certificates | Never (TLS layer) | Certificate expiry | Certificate renewal | Yes (TLS integrity) | High | Machine-to-machine, zero-trust |
| SSH Keys | Never (challenge-response) | None by default | Manual key rotation | N/A (transport-level) | Low-Medium | Server access, Git operations |

---

## Decision Guide

**Choose HMAC Signing when:** You need the highest request-level security, request integrity verification matters, and you control the client implementation. Accept the implementation complexity.

**Choose OAuth2 + Refresh when:** You need user-scoped access with reasonable security, want a standardized approach, and the initial browser-based login is acceptable.

**Choose Long-Lived Tokens when:** Simplicity is paramount — CI/CD, automation, quick integrations. Mitigate with tight scoping, expiry dates, and secrets management.

**Choose Device Auth Flow when:** The client can't open a browser — headless servers, SSH sessions, TVs, IoT. Fall back to standard OAuth2 when a browser is available.

**Choose Client Certificates when:** You need transport-level authentication in controlled environments, are already managing a PKI, and the use case is machine-to-machine.

**Choose SSH Keys when:** You need server access or Git operations and prefer the simplicity of key-based auth. Consider SSH certificates for organizational scale.

**Combining approaches** is common and often recommended. AWS uses HMAC signing for API calls but OAuth2 (via SSO) for generating the temporary credentials that do the signing. Kubernetes accepts client certificates, OIDC tokens, and service account tokens simultaneously. GitHub supports SSH keys for Git transport but OAuth2/PATs for their REST and GraphQL APIs. The strongest architectures use short-lived credentials derived from a stronger initial authentication, regardless of which specific mechanism is involved.
