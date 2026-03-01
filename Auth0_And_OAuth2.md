# Auth0 & OAuth2 Authentication — Q&A

## What does creating an API in Auth0 get you?

When you create an **API** in Auth0, you get an **API Identifier** (also called the **Audience**). This is typically a URL like `https://api.myapp.com` that you define yourself.

The API Identifier/Audience is the value you pass as the `audience` parameter when requesting an access token. This tells Auth0 "I want a token that's valid for *this* API." Without it, Auth0 issues an opaque token only good for calling the `/userinfo` endpoint. With it, you get a proper **JWT access token** that your backend can verify and use for authorization.

Behind the scenes, creating an API also sets up a few other things: it creates a corresponding **machine-to-machine (M2M) application** automatically (with its own client ID/secret for client credentials flow), it gives you a place to define **permissions/scopes** (like `read:users`, `write:posts`), and it lets you configure token settings like signing algorithm (RS256 vs HS256), token expiration, and RBAC settings.

In short: **Applications** represent the *consumers* of your API (frontends, CLIs, services) and get client ID + secret for authentication. **APIs** represent the *resource servers* being protected, and their key artifact is the **audience** identifier that shapes the access tokens your applications request.

---

## Does the backend pass the same audience parameter when verifying the JWT?

Yes. When your backend verifies the JWT, it checks that the `aud` (audience) claim in the token matches the API Identifier you configured. This ensures the token was actually intended for *your* API and not some other API in the same Auth0 tenant.

In practice, most Auth0 backend libraries have you configure both the **issuer** (your Auth0 domain) and the **audience** when setting up the middleware. For example in a Python FastAPI app:

```python
# The same audience value you defined when creating the API in Auth0
AUTH0_AUDIENCE = "https://api.myapp.com"
AUTH0_DOMAIN = "your-tenant.auth0.com"
```

The verification process checks several things:

- The token's signature is valid (using Auth0's public keys fetched from the JWKS endpoint)
- `iss` matches `https://your-tenant.auth0.com/`
- `aud` matches your API Identifier
- The token hasn't expired

If someone tried to use a token that was issued for a *different* API in your Auth0 tenant, the audience check would reject it — even though the signature and issuer are perfectly valid. That's the key protection the audience provides: **scoping tokens to specific APIs**.

---

## Client ID and Secret — How They Work

### Are they like a public/private key pair?

No, not really. A public/private key pair is mathematically linked — you can encrypt with one and decrypt with the other. A client ID and secret are more like a **username and password**. They're independently generated, typically just random strings, and have no cryptographic relationship to each other. The server simply stores both and checks that they match when you present them together.

### How are they generated?

Usually just cryptographically random strings. The client ID might be a UUID or random alphanumeric string (sometimes shorter, more readable). The secret is typically a longer, high-entropy random string. There's no algorithm tying them together — the provider just generates both, stores the mapping in a database, and hands them to you.

### Why have two? Why not just one long secret?

The client ID serves as a **lookup key**. When your app sends a request, the server uses the client ID to look up *which application* is calling, then checks the secret against what's stored. It's like how a login form needs both a username (to find your account) and a password (to prove you own it). With just one value, the server would have to search/compare against every secret in the system, which is both slow and less secure.

The client ID also has a **non-secret role** in many flows. In OAuth2's authorization code flow, the client ID is included in the browser redirect URL — it tells Auth0 "this login is for application X" so it can show the right app name, apply the right callback URLs, etc. No secret needed at that stage, and you wouldn't want one exposed in a URL.

### Why is it OK to expose the client ID?

Because knowing the client ID alone gets you nothing. It's like knowing someone's username — you still can't log in without the password. The client ID just identifies *which* application is talking. In fact, for SPAs and mobile apps (public clients), the client ID is openly embedded in frontend code with no secret at all, and security relies on other mechanisms like PKCE and redirect URI validation instead.

### How does the actual security protocol work?

For a confidential client (like a backend server), it typically goes like this:

1. Your server sends a request to the token endpoint with the client ID and secret — either as a POST body or as an HTTP Basic Auth header (`base64(client_id:client_secret)`)
2. The provider looks up the client ID, finds the stored (hashed) secret, and verifies it matches
3. If valid, it issues an access token scoped to whatever that application is authorized to do

The secret is sent over TLS, so it's encrypted in transit. The provider stores it hashed (like a password), so even a database breach doesn't directly expose it. And the token you get back is what you use going forward — you're not sending the secret on every API call, just on the initial authentication.

**The key mental model:** think of client ID and secret as application-level username and password. The "two values" pattern exists because identification and authentication are fundamentally different concerns — one is public-facing ("who are you?"), the other is private ("prove it").

---

## Browser vs Backend Authentication Flows

The core issue is **trust** — can the client keep a secret or not?

### Browser (Public Client) — Authorization Code Flow with PKCE

A browser app can't hide anything. Anyone can View Source, inspect network requests, or read JavaScript variables. So there's **no secret at all**. The flow works like this:

1. Your SPA generates a random `code_verifier` and derives a `code_challenge` from it (a SHA-256 hash)
2. It redirects the user to Auth0: `https://your-tenant.auth0.com/authorize?client_id=XXX&redirect_uri=...&code_challenge=ABC&code_challenge_method=S256`
3. The user logs in on Auth0's hosted page (your app never sees the password)
4. Auth0 redirects back to your app with a short-lived **authorization code**: `https://yourapp.com/callback?code=XYZ`
5. Your app sends that code **plus the original `code_verifier`** to Auth0's token endpoint
6. Auth0 hashes the verifier, confirms it matches the challenge from step 2, and issues the tokens

The security here relies on: the `code_verifier` being held in memory (never sent in the URL), redirect URI validation (Auth0 only sends the code to pre-registered URLs), and the fact that the authorization code is single-use and short-lived. No secret is needed because the PKCE exchange proves the same app that started the flow is the one finishing it.

### Backend (Confidential Client) — Client Credentials Flow

A backend server is a controlled environment — no one can inspect its memory or source code in production. So it *can* keep a secret. The flow is much simpler:

1. Your server sends a POST directly to Auth0's token endpoint with `client_id`, `client_secret`, `audience`, and `grant_type=client_credentials`
2. Auth0 validates the credentials and returns an access token
3. Done. No browser, no redirect, no user involved

This is a **machine-to-machine** flow. There's no user logging in — the application itself is the identity. Think of it as your backend saying "I am Service X, here's my proof, give me a token to call Service Y."

### Key differences

- **Who's authenticating?** Browser flow authenticates a *user*. Client credentials authenticates the *application itself*.
- **Is a secret involved?** Browser flow uses PKCE instead — no secret. Backend flow uses the secret directly.
- **Is there a user interaction?** Browser flow has a login page redirect. Backend flow is a single server-to-server API call.
- **Why the difference?** A browser is a hostile environment where secrets get exposed. A backend is a trusted environment where secrets stay safe.

### Hybrid Scenario (SPA with Backend)

If your SPA has a backend (like a Next.js app), the browser can do the authorization code flow to authenticate the user, but the *backend* exchanges the authorization code for tokens server-side, where it can also include a client secret for extra security. This gives you user authentication with the added security of a confidential client.

---

## Hybrid Scenario — Is it user-specific or machine-to-machine?

It's getting a token **for the specific user**. That's the key distinction.

The authorization code that the backend receives came from a user logging in on Auth0's page. So when the backend exchanges that code (along with the client secret) for tokens, Auth0 returns tokens that represent *that user* — including an ID token with their profile info and an access token with their user-specific scopes and permissions.

The client secret in this case isn't saying "I am a machine, give me machine access." It's saying "I am a **legitimate, trusted application** exchanging this code on behalf of the user who just logged in." It's an extra layer of proof that the code wasn't intercepted and being exchanged by an attacker.

### Comparing all three flows

**SPA-only (PKCE):** User logs in → browser exchanges code using PKCE → gets user's tokens. Application proves its legitimacy via PKCE.

**Hybrid (Authorization Code + secret):** User logs in → backend exchanges code using client secret → gets user's tokens. Application proves its legitimacy via the secret. More secure because the tokens never touch the browser.

**Client Credentials:** No user involved → backend sends credentials → gets an application-level token. The application *is* the identity.

The first two are both the **Authorization Code flow**, just with different methods of proving the application's identity. The tokens you get back are user-scoped either way. Client Credentials is the only one that's truly machine-to-machine.

---

## API Keys vs OAuth2 — What's the difference?

API keys (like GitHub personal access tokens) are simpler because the trust model is simpler. You're a developer, you logged into GitHub through their UI, you generated a token, and now you use it. GitHub doesn't need to verify *which application* is calling — it only cares about *which user* the token belongs to. The token itself is the identity and the proof rolled into one.

OAuth2 client ID + secret exists because there's a third party in the picture. When your app uses Auth0, there are three parties: the user, your application, and the identity provider. Auth0 needs to know both *who the user is* and *which application is asking on their behalf*. The client ID/secret identifies the application, and the authorization code flow authenticates the user. With a GitHub personal access token, you cut out the middleman — you *are* the user and you're calling directly.

### Are API keys less secure?

A single API key is essentially a bearer token. Anyone who has it can use it. The security relies entirely on keeping that one string safe and on TLS protecting it in transit. That's actually fine for many use cases. The risk is that if it leaks, there's no second factor — the attacker has everything they need.

With client ID + secret, you technically have two values, but they're *also* both sent together in one request. So if an attacker intercepts that request, they have both. The real security advantage isn't about having two values — it's about the **flow architecture**. OAuth2 separates concerns: short-lived access tokens, refresh tokens, scoped permissions, token revocation, and the ability to grant access without sharing credentials. A GitHub personal access token doesn't expire by default (unless you set it to), and if it leaks, it has whatever scopes you gave it until you manually revoke it.

### The real spectrum

- **API key / personal access token** — Simple, direct, one value. Best for developer-to-API scenarios, server-side scripts, CI/CD. GitHub, Stripe, OpenAI all use this model. Security depends on keeping the key safe and scoping it tightly.
- **OAuth2 client credentials** — Client ID + secret, but still machine-to-machine. You get short-lived tokens in return, so the secret isn't sent on every request. Slightly better because a leaked access token expires, whereas a leaked API key lives forever.
- **OAuth2 authorization code** — The full flow with user authentication, redirects, PKCE or secrets. Necessary when a third-party app needs to act on behalf of a user without ever seeing their password.

GitHub's model isn't less secure — it's appropriately secure for its use case. You're a trusted developer making direct API calls. But if GitHub needed to let *third-party apps* access your repos on your behalf (which they also support via OAuth2 apps), then the simple API key model wouldn't be enough, because you wouldn't want to hand your personal token to a random app. That's where the full OAuth2 flow earns its complexity.

---

## Other Security Models

### Mutual TLS (mTLS)

In normal TLS, only the server presents a certificate to prove its identity. In mTLS, *both sides* present certificates. Your client has its own certificate signed by a trusted CA, and the server verifies it before accepting the connection. This is common in microservice architectures, banking APIs, and zero-trust networks. It's very secure because the identity is baked into the transport layer itself — you can't even establish a connection without valid credentials.

### HMAC-based Request Signing

Instead of sending a secret in the request, you use the secret to *sign* the request. AWS uses this model (Signature V4). You take the request method, URL, headers, body, and timestamp, hash them together using your secret key, and send the signature in the header. The server does the same computation and compares. The secret never travels over the wire — even if someone intercepts the request, they can't forge new ones. The timestamp also prevents replay attacks.

### JWT-based Authentication (Self-Issued)

Some APIs let you generate your own JWTs signed with a private key. Google Cloud uses this for service accounts — you get a JSON key file with a private key, your app creates and signs a JWT locally, then exchanges it for an access token. The server verifies the signature using your registered public key. The private key never leaves your machine.

### SAML

The older enterprise predecessor to OAuth2/OIDC, still widely used in corporate SSO. It uses XML-based assertions instead of JSON tokens. When you click "Sign in with SSO" at a big company, that's often SAML behind the scenes. The identity provider sends a signed XML document to the service provider proving who you are. It's verbose and complex compared to OAuth2 but deeply embedded in enterprise infrastructure.

### Kerberos

The backbone of Active Directory authentication. It uses a ticket-based system with a trusted third party (the Key Distribution Center). You authenticate once, get a ticket-granting ticket (TGT), and then use that to get service-specific tickets without re-entering credentials. It's designed for internal networks and is what makes Windows domain single sign-on work. Very different from anything web-based.

### WebAuthn / Passkeys (FIDO2)

The newer passwordless standard. Your device generates a public/private key pair for each site. The private key never leaves the device (stored in a secure enclave or TPM). To authenticate, the server sends a challenge, your device signs it with the private key, and the server verifies with the public key. This is what's behind "Sign in with passkey" on Google, Apple, etc. It's phishing-resistant by design because the key is bound to the specific domain.

### OAuth2 Device Authorization Grant

For devices with no browser or limited input (smart TVs, CLI tools, IoT devices). You've seen this: the device shows a code and a URL, you go to that URL on your phone, enter the code, and log in there. Meanwhile the device is polling the token endpoint waiting for you to complete the flow. This is how you sign into Netflix on a TV or authenticate the GitHub CLI.

### Basic Auth

The simplest possible model. You send `username:password` base64-encoded in every request header. It's not really "security" — base64 isn't encryption, so it relies entirely on TLS. Still used in internal tools, legacy systems, and sometimes as a quick-and-dirty option for server-to-server calls. Most APIs have moved away from it.

### Hawk / HTTP Signatures

Similar in spirit to HMAC signing but standardized for HTTP. The client signs specific parts of the request (method, URI, timestamp, nonce) and the server verifies. Prevents tampering and replay attacks without sending credentials. Less common than HMAC but you'll see it in some APIs.

### Magic Links / Email-based Auth

No password at all. You enter your email, get a link with a one-time token, click it, and you're in. Slack used to rely on this heavily. The security model shifts entirely to the security of your email inbox. Simple for users but introduces a dependency on email delivery and email account security.

### Mental Framework

Most of these fall into a few categories: something you *know* (passwords, API keys, secrets), something you *have* (certificates, private keys, devices, email access), something you *are* (biometrics via WebAuthn), or something a *trusted third party vouches for* (OAuth2, SAML, Kerberos). The more critical the system, the more you see these combined.

---

## Client-Side vs Backend-Side Auth Flow — Architectural Decision

When building a web app with a browser frontend and a Python/Java backend, you have two main options for how the login flow works.

### Option 1: Client-Side Flow (SPA handles auth directly)

The browser redirects to Auth0, handles the callback, gets the tokens, and stores them. Your backend is a stateless API that just validates tokens on each request.

**How it works:**

1. User clicks login → browser redirects to Auth0
2. Auth0 redirects back with an authorization code
3. Browser exchanges code for tokens using PKCE (no secret)
4. Browser stores the access token and sends it in the `Authorization` header on every API call
5. Backend validates the JWT on each request — no session, no state

**Pros:**

- Backend stays completely stateless — easier to scale horizontally since any server can handle any request
- Clean separation — your API is a pure resource server, works the same whether called from a browser, mobile app, or another service
- No session management on the server, no sticky sessions, no session store to maintain
- Works well for microservice architectures where multiple backends need to accept the same token

**Cons:**

- Tokens are exposed to JavaScript, making them vulnerable to XSS attacks. If an attacker injects script into your page, they can steal the token
- You can't use a client secret (browser can't keep secrets), so you rely entirely on PKCE
- Token refresh logic lives in the browser, adding complexity to your frontend
- You're trusting the browser environment, which is inherently hostile

### Option 2: Backend-Initiated Flow (server handles auth)

The browser never touches tokens. Your backend handles the entire OAuth2 exchange and maintains a session.

**How it works:**

1. User clicks login → browser calls your backend (`/api/login`)
2. Backend redirects user to Auth0 (including client secret in the exchange)
3. Auth0 redirects back to your backend's callback endpoint
4. Backend exchanges the code for tokens server-side (with client secret)
5. Backend stores tokens in a server-side session, sets a session cookie on the browser
6. Browser sends the cookie on every request — backend looks up the session and uses the stored access token to call downstream services if needed

**Pros:**

- Tokens never reach the browser — immune to XSS token theft
- You can use a client secret, which is an extra layer of proof
- Refresh tokens are handled server-side, much simpler and more secure
- Your backend has full control over the session lifecycle

**Cons:**

- Backend is now stateful — you need a session store (Redis, database, etc.)
- Horizontal scaling requires shared session storage or sticky sessions
- Tighter coupling between frontend and backend — a mobile app or third-party consumer would need a different flow
- More backend complexity

### Token Storage: Where Should It Live?

**localStorage** — Accessible to any JavaScript on the page. Persists across tabs and browser restarts. Convenient but the most vulnerable to XSS. If any script on your page is compromised (a malicious npm package, a bad CDN, an injected ad), it can read the token and exfiltrate it. Most security experts recommend against this for access tokens.

**sessionStorage** — Same as localStorage but scoped to a single tab and cleared when the tab closes. Slightly better because the window of exposure is shorter, but still fully accessible to JavaScript and still vulnerable to XSS.

**In-memory (JavaScript variable)** — Not persisted anywhere. Safest from a storage perspective because it disappears on page refresh. But that means the user has to re-authenticate on every page load, which is a terrible UX unless you use silent authentication (an iframe-based token refresh), which has its own complications and is increasingly broken by third-party cookie restrictions.

**HttpOnly Secure Cookie** — The widely recommended approach. The cookie is set by the server with `HttpOnly` (JavaScript can't read it), `Secure` (only sent over HTTPS), and `SameSite=Strict` or `Lax` (mitigates CSRF). The browser automatically attaches it to every request. JavaScript literally cannot access it, so XSS can't steal it. The catch is that cookies are vulnerable to **CSRF** (cross-site request forgery) — a malicious site can trick the browser into sending a request to your API with the cookie attached. But CSRF is much easier to mitigate than XSS: SameSite cookie attribute handles most cases, and you can add a CSRF token for extra protection.

### The Recommended Approach

For most web apps with a backend, **Option 2 (backend-initiated flow) with HttpOnly cookies** is the strongest choice. The backend handles the full OAuth2 exchange with a client secret. Tokens are stored server-side in a session. The browser only gets an HttpOnly session cookie it can't read or tamper with. Your frontend makes API calls to your own backend, which proxies to downstream services using the stored access token if needed. This gives you the best of both worlds: the browser never sees a token, XSS can't steal credentials, and you get the stronger confidential client flow.

### When to Pick Option 1 Instead

If you're building a true SPA with no backend (or a very thin one), if your API needs to serve multiple client types (web, mobile, third-party) and you want a single stateless token-based approach, or if you're building something where the scaling simplicity of stateless JWT validation outweighs the security benefits of server-side sessions.

### The Backend for Frontend (BFF) Pattern

The hybrid middle ground that's become popular: a thin backend layer that exists solely to handle auth and proxy API calls, while your actual business logic APIs remain stateless and token-validated. This gives you server-side token security without making your core APIs stateful.

---

## Refresh Tokens in Non-Mobile Apps

Refresh tokens are absolutely used outside of mobile apps. The question is always: where can they be stored safely?

### Backend-Side Sessions (Most Common)

When your backend handles the OAuth2 flow, Auth0 returns both an access token and a refresh token to your server. Your server stores them in its session store (Redis, database, etc.) — not in the browser. When the access token expires, the backend uses the refresh token to get a new one, all server-side. The browser never knows this happened — it just keeps sending its session cookie. This is the most secure use of refresh tokens in web apps because they live in a trusted environment, same as a client secret.

### SPAs — The Tricky Case

For browser-only apps with no backend, there are a few approaches, none perfect:

**In-memory with silent auth (the old approach):** The SPA stores the access token in a JavaScript variable. When it expires or the page refreshes, the app makes a silent token renewal request in a hidden iframe — hitting Auth0's `/authorize` endpoint with `prompt=none`. If the user's Auth0 session cookie is still valid, Auth0 issues a new token without user interaction. No refresh token needed. The problem is that browsers have been aggressively blocking third-party cookies (Safari already does, Chrome is moving that direction), which breaks this iframe approach since Auth0's cookie is on a different domain than your app.

**Refresh token rotation in the browser (the newer approach):** Because silent auth is dying, Auth0 now supports issuing refresh tokens to SPAs — but with safeguards. The refresh token is stored in-memory (not localStorage), refresh token rotation is mandatory (each use issues a new one and invalidates the old), and token lifetimes are kept short (hours, not weeks). If the tab closes, the refresh token is gone and the user has to log in again. It's a compromise — you get seamless token renewal within a session, but you accept that page refreshes or new tabs may require re-authentication.

**The BFF pattern (the recommended approach for SPAs):** A thin backend handles auth, stores the refresh token server-side, and the browser only has a session cookie. You get the UX of a SPA with the security of server-side token management. This is increasingly what Auth0 and security experts recommend for SPAs that need refresh tokens.

### Desktop Apps (Electron, etc.)

Similar to mobile — they're native apps with filesystem access. They can store refresh tokens in OS-level credential stores (macOS Keychain, Windows Credential Manager, Linux Secret Service). Not quite as locked down as mobile sandboxing, but significantly better than a browser.

### CLI Tools

Tools like the GitHub CLI or AWS CLI store refresh tokens (or long-lived tokens) in config files on disk, often with restricted file permissions. It's the least secure option but acceptable because the threat model is different — if someone has access to your filesystem, you have bigger problems. Some CLIs use the OS keychain instead for better security.

### The Fundamental Rule

The refresh token always needs to live somewhere *trusted*. On mobile, that's the Keychain/Keystore. On a backend, that's your session store. On desktop, that's the OS credential manager. In a browser, there's *no truly trusted place*, which is why browser refresh tokens require extra safeguards (rotation, short lifetimes, in-memory only) or are avoided entirely in favor of the BFF pattern.

Refresh tokens are long-lived keys that can generate new access tokens, so they need to be stored with at least as much care as a password. Anywhere you wouldn't store a password, you shouldn't store a refresh token.

---

## Mobile App Authentication

Mobile apps live in a fundamentally different security environment than browsers, and that changes almost everything about how tokens are handled.

### The Core Difference: Public Client with Private Storage

A browser is a public client with *no* private storage — JavaScript can access everything, and any script on the page can too. A mobile app is also a public client (you can't embed a secret in a compiled app — it can be reverse-engineered), but it has something browsers don't: **OS-level secure storage** that's isolated per app.

### How Mobile Authentication Works

The initial login looks similar to a web app. The user opens the app, taps login, and the app opens a system browser or in-app browser tab (Auth0 recommends ASWebAuthenticationSession on iOS, Chrome Custom Tabs on Android) that goes to Auth0. The user logs in, Auth0 redirects back to the app via a custom URL scheme or universal link, and the app exchanges the authorization code for tokens using PKCE — same as a browser SPA.

The difference is what happens next.

### Token Storage — Keychain and Keystore

On iOS, tokens go into the **Keychain** — an encrypted, hardware-backed storage that's sandboxed per app. Other apps literally cannot access it. On Android, the equivalent is the **Keystore** backed by hardware security modules on modern devices. These are nothing like localStorage or cookies. They're OS-level encrypted stores protected by the device's lock screen, biometrics, and app sandboxing. Even if someone has physical access to the device, extracting data from the Keychain/Keystore is extremely difficult without the device passcode.

This secure storage is why mobile apps can safely hold **refresh tokens** — something you'd never want to do in a browser's localStorage.

### How the "Stay Logged In" Experience Works

The trick is the **refresh token**. After the initial login, Auth0 gives the app both a short-lived access token (say, 1 hour) and a long-lived refresh token (days, weeks, or even months). The app stores both in the Keychain/Keystore. On subsequent app opens:

1. App checks for a stored access token
2. If it's still valid, use it — no login needed
3. If it's expired, use the refresh token to silently get a new access token from Auth0
4. If the refresh token is also expired or revoked, *then* prompt the user to log in again

The user only sees a login screen when the refresh token itself expires or is revoked. Everything else happens silently in the background.

### Refresh Token Rotation on Mobile

Auth0 supports **refresh token rotation**, which is critical for mobile. Each time the app uses a refresh token, Auth0 issues a *new* refresh token and invalidates the old one. If an attacker somehow steals a refresh token and tries to use it after the legitimate app already has, Auth0 detects that the old token was reused, and **revokes the entire token family** — forcing a re-login. This provides replay attack protection that you don't get with a static long-lived token.

### How Mobile Differs from Web

**Storage security** — Browser localStorage/sessionStorage is accessible to any JavaScript on the page. Mobile Keychain/Keystore is hardware-encrypted and app-sandboxed. This is the biggest difference and it's why refresh tokens are safe on mobile but dangerous in browsers.

**Token lifetime expectations** — Web access tokens are typically short (minutes to an hour). Mobile refresh tokens can live for weeks or months because the storage is trusted. Banking apps might use shorter refresh tokens; social media apps might use very long ones.

**Session model** — Web apps with backend auth use server-side sessions with HttpOnly cookies. Mobile apps are inherently sessionless from the server's perspective — every request carries a JWT access token in the Authorization header, same as the stateless SPA model. There's no cookie equivalent because mobile HTTP clients don't automatically manage cookies the way browsers do.

**No CSRF concern** — CSRF exploits the browser's automatic cookie attachment. Mobile apps manually attach tokens to requests, so CSRF isn't a thing. XSS also isn't a concern because there's no shared JavaScript execution environment (unless you're using a WebView, which introduces its own set of issues).

**Biometric re-authentication** — Mobile apps can gate access to Keychain items behind Face ID or fingerprint, adding a layer that has no browser equivalent. Some apps require biometric verification before releasing the stored refresh token, giving you a "something you have + something you are" model.

### Serving Both Web and Mobile from the Same Backend

If your server needs to serve both web and mobile, the **stateless JWT validation approach** works cleanly for both. Mobile apps send the access token in the Authorization header. Your web app can do the same (SPA model) or use the BFF pattern where the backend proxies requests using stored tokens. Either way, your core API just validates JWTs — it doesn't care whether the caller is a browser or a phone.

The difference is really on the client side: *how* the token was obtained (PKCE for both, but mobile uses native browser delegates), *where* it's stored (Keychain vs cookie/memory), and *how long* the session lasts (refresh token lifetime vs session cookie lifetime).

### A Practical Architecture

Your Auth0 tenant has one API (audience) and two applications — a "Web App" (confidential client with a secret, using the BFF pattern) and a "Mobile App" (public client using PKCE with refresh token rotation). Both get access tokens for the same API. Your backend doesn't need to know or care which one is calling — it just validates the JWT.

---

## Backend User Identity Patterns — Assuming the Logged-In User's Identity

Once the backend has received and verified the JWT from the SPA, how does the rest of the request execution "know" who the user is? There are several patterns.

### Pattern 1: Request Context / Thread Local (Most Common)

After JWT validation, extract user info and make it accessible for the duration of the request.

**FastAPI/Python — Dependency Injection:**

```python
from fastapi import Depends, Request
from typing import Annotated

class CurrentUser:
    def __init__(self, user_id: str, email: str, permissions: list[str]):
        self.user_id = user_id
        self.email = email
        self.permissions = permissions

async def get_current_user(request: Request) -> CurrentUser:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    payload = verify_jwt(token)  # validates signature, audience, expiry
    return CurrentUser(
        user_id=payload["sub"],
        email=payload.get("email"),
        permissions=payload.get("permissions", [])
    )

@app.get("/orders")
async def get_orders(user: Annotated[CurrentUser, Depends(get_current_user)]):
    return await order_service.get_orders_for_user(user.user_id)
```

**Spring Boot/Java — SecurityContext (backed by ThreadLocal):**

```java
SecurityContext context = SecurityContextHolder.getContext();
Authentication auth = context.getAuthentication();
String userId = auth.getName(); // the "sub" claim

@GetMapping("/orders")
public List<Order> getOrders(@AuthenticationPrincipal JwtUser user) {
    return orderService.getOrdersForUser(user.getId());
}
```

This pattern works well for straightforward request-response flows. The user identity lives for exactly one request and gets cleaned up automatically.

### Pattern 2: Explicit Passing (The Purist Approach)

Pass the user explicitly through every layer instead of relying on ambient context:

```python
# Controller
async def get_orders(user: Annotated[CurrentUser, Depends(get_current_user)]):
    return await order_service.get_orders(user)

# Service
async def get_orders(self, user: CurrentUser):
    self.authorize(user, "read:orders")
    return await self.order_repo.find_by_user(user.user_id)

# Repository
async def find_by_user(self, user_id: str):
    return await db.query("SELECT * FROM orders WHERE user_id = $1", user_id)
```

More verbose but has real advantages: easy to test (just pass a mock user), no hidden state, and obvious at every layer who the current user is. Also works naturally with async code where thread locals can get tricky.

### Pattern 3: Database-Level Row Level Security (RLS)

Push identity all the way down to the database. PostgreSQL supports this natively:

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_orders ON orders
    USING (user_id = current_setting('app.current_user_id'));
```

```python
async def get_orders(user: Annotated[CurrentUser, Depends(get_current_user)]):
    await db.execute(f"SET LOCAL app.current_user_id = '{user.user_id}'")
    # ANY query on the orders table automatically filters by user
    return await db.query("SELECT * FROM orders")  # no WHERE clause needed
```

The database itself enforces that a user can only see their own data. Even if application code has a bug that forgets a WHERE clause, the database won't leak data. Supabase uses this pattern heavily. The downside is tight coupling of auth model to database, harder debugging, and potential query performance issues with complex RLS policies.

### Pattern 4: Middleware Enrichment

The JWT middleware validates the token and attaches the user to the request object. Downstream code reads from the request:

```python
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token:
        payload = verify_jwt(token)
        request.state.user = CurrentUser(
            user_id=payload["sub"],
            email=payload.get("email"),
            permissions=payload.get("permissions", [])
        )
    return await call_next(request)

# Any endpoint can access request.state.user
```

A variation of Pattern 1 but centralized. Express.js apps do this heavily with `req.user`.

### Pattern 5: Context Variables (Python Async-Safe)

Python's `contextvars` module is the modern replacement for thread locals that works correctly with async/await:

```python
import contextvars

current_user_var: contextvars.ContextVar[CurrentUser] = contextvars.ContextVar('current_user')

# Set in middleware
current_user_var.set(user)

# Access anywhere in the call chain without passing it
def some_deep_service_function():
    user = current_user_var.get()
    # use user.user_id for queries
```

This gives the convenience of "ambient" user identity without thread-safety issues of traditional thread locals in async Python. It's the closest Python equivalent to Java's `SecurityContextHolder`.

### What Most Production Apps Actually Do

In practice, most teams use a combination:

- JWT validation happens in middleware or a framework-specific interceptor
- The user is extracted into a typed object (not just raw claims)
- That object is either injected via DI (FastAPI `Depends`, Spring `@AuthenticationPrincipal`) or attached to the request context
- Service and repository layers receive the user ID explicitly for database queries
- Authorization checks (can this user do this action?) happen in a service layer or via decorators/annotations, not deep in the data layer

The key thing to avoid is scattering raw JWT parsing throughout your codebase. You want exactly one place that turns a token into a user object, and everything downstream works with that typed object.

---

## Auth0 Environment Strategy — Separate Tenants per Environment

The strong recommendation is **separate Auth0 tenants per environment**, not just separate applications within one tenant.

### The Ideal Setup: One Auth0 Tenant per Environment

Auth0 itself recommends this. You'd have `myapp-dev.auth0.com`, `myapp-staging.auth0.com`, and `myapp-prod.auth0.com`. Each tenant has its own application, API, users, rules, actions, and configuration. They're completely isolated.

### Why Not Just Separate Applications Within One Tenant?

A tenant shares a lot more than just applications and APIs. Things like Auth0 Actions/Rules (custom login logic), connections (Google login, SAML providers, database connections), rate limits, the user database itself, branding and email templates, and log streams are all tenant-level. If you're testing a new Action that adds custom claims to the token, you don't want a bug in that code to break production logins. If a developer accidentally creates thousands of test users, you don't want that polluting your production user base or hitting your production rate limits.

### Typical Setup

- **Dev tenant** — Developers work freely, test new auth flows, experiment with Actions, and create throwaway users
- **Staging/QA tenant** — Mirrors prod configuration for integration testing
- **Prod tenant** — Locked down with stricter access controls

Each tenant has its own application (with its own client ID) and API (with its own audience). Your app's environment config points to the right tenant:

```python
# .env.dev
AUTH0_DOMAIN=myapp-dev.auth0.com
AUTH0_CLIENT_ID=abc123dev
AUTH0_AUDIENCE=https://api.dev.myapp.com

# .env.prod
AUTH0_DOMAIN=myapp-prod.auth0.com
AUTH0_CLIENT_ID=xyz789prod
AUTH0_AUDIENCE=https://api.myapp.com
```

```javascript
// React SPA - reads from environment
const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  audience: process.env.REACT_APP_AUTH0_AUDIENCE,
  redirectUri: window.location.origin
};
```

### The Audience Question — Same or Different Across Environments?

Two schools of thought. Some teams use the **same audience string** across all tenants (e.g., `https://api.myapp.com` everywhere). The argument is that your backend JWT validation code doesn't need to change per environment — only the issuer (domain) changes. Others use **environment-specific audiences** (e.g., `https://api.dev.myapp.com`) for full isolation, ensuring a token from dev literally cannot validate against staging or prod even if someone misconfigures the issuer check.

Using environment-specific audiences is safer. The extra config is minimal and it gives you a hard guarantee that tokens can't cross environments.

### Cost Consideration

Auth0's free tier gives you one tenant. Paid plans typically allow multiple tenants. If you're on a free tier, you might start with one tenant and separate applications as a compromise — just know the risks. The most critical separation is between production and everything else. If budget is tight, at minimum have a **dev tenant** and a **prod tenant**.

### Managing Configuration Across Tenants

The annoying part of multiple tenants is keeping configuration in sync. Auth0 provides a few tools for this:

- The **Auth0 Deploy CLI** lets you export tenant configuration as code and deploy it across tenants
- The **Terraform Auth0 provider** lets you manage tenants as infrastructure-as-code
- The **Management API** lets you script configuration programmatically

Most mature teams treat Auth0 config the same as any other infrastructure — it lives in version control and gets deployed through a pipeline. You make changes in dev, test in staging, and promote to prod.

### Summary

Separate tenants per environment, environment-specific config injected at build/deploy time, and ideally infrastructure-as-code to keep them in sync. The small upfront effort saves you from a class of bugs and security issues that are painful to debug.
