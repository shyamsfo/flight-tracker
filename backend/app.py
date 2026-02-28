import os
import json
from functools import lru_cache, wraps

import jwt
import requests
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

AUTH0_DOMAIN = os.environ["AUTH0_DOMAIN"]
AUTH0_AUDIENCE = os.environ["AUTH0_AUDIENCE"]
ALGORITHMS = ["RS256"]


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

@lru_cache()
def get_jwks():
    url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_signing_key(token):
    jwks = get_jwks()
    unverified_header = jwt.get_unverified_header(token)
    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            return jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
    raise Exception("Unable to find matching signing key")


def decode_token(token):
    signing_key = get_signing_key(token)
    return jwt.decode(
        token,
        signing_key,
        algorithms=ALGORITHMS,
        audience=AUTH0_AUDIENCE,
        issuer=f"https://{AUTH0_DOMAIN}/",
    )


# ---------------------------------------------------------------------------
# @require_auth decorator
# ---------------------------------------------------------------------------

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split(" ", 1)[1]

        try:
            g.jwt_claims = decode_token(token)
            g.access_token = token
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidAudienceError:
            return jsonify({"error": "Invalid audience"}), 401
        except jwt.InvalidIssuerError:
            return jsonify({"error": "Invalid issuer"}), 401
        except Exception as e:
            return jsonify({"error": str(e)}), 401

        return f(*args, **kwargs)
    return decorated


# ---------------------------------------------------------------------------
# Mock flight data
# ---------------------------------------------------------------------------

MOCK_FLIGHTS = [
    {
        "id": 1,
        "flightNumber": "AA123",
        "airline": "American Airlines",
        "departureTime": "2025-11-19T08:00:00",
        "arrivalTime": "2025-11-19T11:30:00",
        "departureLocation": "New York (JFK)",
        "arrivalLocation": "Los Angeles (LAX)",
        "departureTimezone": "EST (UTC-5)",
        "arrivalTimezone": "PST (UTC-8)",
        "status": "On Time",
    },
    {
        "id": 2,
        "flightNumber": "UA456",
        "airline": "United Airlines",
        "departureTime": "2025-11-19T14:00:00",
        "arrivalTime": "2025-11-19T17:45:00",
        "departureLocation": "Chicago (ORD)",
        "arrivalLocation": "Miami (MIA)",
        "departureTimezone": "CST (UTC-6)",
        "arrivalTimezone": "EST (UTC-5)",
        "status": "Delayed",
    },
    {
        "id": 3,
        "flightNumber": "DL789",
        "airline": "Delta Airlines",
        "departureTime": "2025-11-19T09:30:00",
        "arrivalTime": "2025-11-19T12:15:00",
        "departureLocation": "Atlanta (ATL)",
        "arrivalLocation": "Seattle (SEA)",
        "departureTimezone": "EST (UTC-5)",
        "arrivalTimezone": "PST (UTC-8)",
        "status": "On Time",
    },
    {
        "id": 4,
        "flightNumber": "SW202",
        "airline": "Southwest Airlines",
        "departureTime": "2025-11-19T16:00:00",
        "arrivalTime": "2025-11-19T18:30:00",
        "departureLocation": "Dallas (DFW)",
        "arrivalLocation": "Denver (DEN)",
        "departureTimezone": "CST (UTC-6)",
        "arrivalTimezone": "MST (UTC-7)",
        "status": "On Time",
    },
    {
        "id": 5,
        "flightNumber": "BA101",
        "airline": "British Airways",
        "departureTime": "2025-11-19T20:00:00",
        "arrivalTime": "2025-11-20T08:30:00",
        "departureLocation": "London (LHR)",
        "arrivalLocation": "New York (JFK)",
        "departureTimezone": "GMT (UTC+0)",
        "arrivalTimezone": "EST (UTC-5)",
        "status": "On Time",
    },
]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/verify")
@require_auth
def verify():
    userinfo = {}
    try:
        userinfo_resp = requests.get(
            f"https://{AUTH0_DOMAIN}/userinfo",
            headers={"Authorization": f"Bearer {g.access_token}"},
            timeout=10,
        )
        if userinfo_resp.ok:
            userinfo = userinfo_resp.json()
    except Exception:
        pass

    return jsonify({"verified": True, "claims": g.jwt_claims, "user": userinfo})


@app.route("/flights")
@require_auth
def get_flights():
    return jsonify(MOCK_FLIGHTS)


@app.route("/flights/search")
@require_auth
def search_flights():
    q = request.args.get("q", "").strip().lower()
    if not q:
        return jsonify([])

    results = [
        f for f in MOCK_FLIGHTS
        if q in f["flightNumber"].lower()
    ]
    return jsonify(results)


def main():
    app.run(host="0.0.0.0", port=5004, debug=True)


if __name__ == "__main__":
    main()
