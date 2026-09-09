# Authenticator

A user authentication app with biometric sign-in, built with React Native (Android), a Node.js/Express API, and PostgreSQL.

```
Authenticator/
├── mobile/    React Native 0.87 app (TypeScript)
└── server/    Express + TypeScript REST API
```

## Features

- **Login screen** — email, password, biometric sign-in button, inline validation and error states
- **Register screen** — first name, last name, searchable country dropdown, phone number, email, password, confirm password
- **Biometric sign-in** — fingerprint/face unlock backed by the Android Keystore
- Session persistence with automatic token refresh and rotation

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| JDK | 17 |
| Android SDK | Platform 37, Build-Tools 37 |
| PostgreSQL | 16 |

An Android emulator or a device connected over USB.

## 1. Database setup

Create the role and database (run once, as a PostgreSQL superuser):

```bash
cd server
psql -d postgres -f db/setup.sql
```

`db/setup.sql` creates a login role `authenticator` and a database `authenticator_db` owned by it. **Edit the file first** and replace `CHANGE_ME` with a password of your choice, or run the statements manually:

```sql
CREATE ROLE authenticator WITH LOGIN PASSWORD 'your_password_here';
CREATE DATABASE authenticator_db OWNER authenticator;
```

## 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` — every variable is required and the server refuses to start if any is missing or malformed:

| Variable | Meaning | Example |
|---|---|---|
| `NODE_ENV` | environment | `development` |
| `PORT` | API port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://authenticator:your_password_here@localhost:5432/authenticator_db` |
| `JWT_ACCESS_SECRET` | signs access tokens (min 32 chars) | generate, see below |
| `JWT_REFRESH_SECRET` | peppers refresh-token hashes (min 32 chars) | generate, see below |
| `JWT_ACCESS_TTL` | access token lifetime | `15m` |
| `JWT_REFRESH_TTL_DAYS` | refresh token lifetime in days | `30` |
| `BCRYPT_ROUNDS` | bcrypt cost factor (10–15) | `12` |

Generate each secret separately:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Create the tables, then start the API:

```bash
npm run migrate
npm run dev
```

Check it is up: `curl http://localhost:4000/api/health` → `{"status":"ok","database":"connected",...}`

`.env` is intentionally not committed. `.env.example` is the template.

## 3. Mobile setup

```bash
cd mobile
npm install
```

Start the emulator, then:

```bash
npm start          # Metro, in one terminal
npm run android    # build and install, in another
```

**API address.** The app talks to `http://10.0.2.2:4000/api` on Android — `10.0.2.2` is how the emulator reaches `localhost` on the host machine. To run on a **physical device**, change `apiUrl` in `mobile/src/shared/config/env.ts` to your computer's LAN IP (for example `http://192.168.1.20:4000/api`) and make sure the phone is on the same network.

## Using the app

1. Launch the app — it opens on the Login screen
2. Tap **Sign Up**, fill in the form, tap **Create Account**
3. You are signed in; a prompt offers to enable biometric sign-in
4. Log out, then use the fingerprint button beside **Login** to sign back in

## API

Base URL `http://localhost:4000/api`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | — | service and database status |
| POST | `/auth/register` | — | create an account |
| POST | `/auth/login` | — | sign in with email and password |
| POST | `/auth/refresh` | — | exchange a refresh token for new tokens |
| POST | `/auth/logout` | — | revoke a refresh token |
| GET | `/auth/me` | Bearer | current user profile |

Errors always use one shape, so the app can map them onto the right field:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "email": "..." } } }
```

## Security notes

- Passwords hashed with **bcrypt** (cost 12); the hash never leaves the persistence layer
- Refresh tokens stored as **HMAC-SHA-256 hashes**, never in plaintext, so a database leak yields no usable sessions
- **Refresh rotation with reuse detection** — replaying a rotated token revokes every session for that user
- Access tokens are short-lived (15 min) and kept **in memory only**; only the refresh token reaches the Keychain
- Wrong password and unknown email return an **identical** 401, so responses never reveal which emails are registered
- Login rate-limited to 10 failed attempts per 15 minutes; form validation errors do not count toward it
- Database-level `CHECK` constraints back up request validation

## Project structure

Both halves are organised by feature.

```
server/src/
├── config/            environment validation
├── db/                migration runner
├── features/
│   ├── auth/          routes, controller, service, repository, tokens, schemas
│   ├── users/         user persistence and DTO mapping
│   └── health/
└── shared/            db pool, error types, middleware

mobile/src/
├── app/navigation/    stacks and navigation theme
├── features/auth/     screens, api, store, schemas
└── shared/            ui components, theme, api client, storage, country data
```

## Known limitations

- **Biometric sign-in is untested end to end.** The code path is complete and the fallback branches are verified (no hardware, not enrolled, cancelled), but Android's fingerprint enrolment screen is `FLAG_SECURE`, which blocked automated enrolment on the emulator. Verify on a physical device with a fingerprint enrolled.
- **Apple and Google buttons are non-functional by design.** They appear in the supplied design, while the brief states third-party login is not required, so they render exactly as designed and explain that they are out of scope when tapped.
- **Forgot password** is not implemented; the link is present to match the design.
- iOS is not configured — the brief targets Android.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot reach the server" in the app | Check the API is running and that the emulator uses `10.0.2.2`, not `localhost` |
| Server exits on start listing variables | A value in `.env` is missing or too short — see the table above |
| `npm run migrate` cannot connect | Confirm PostgreSQL is running and `DATABASE_URL` matches the role password |
| Build fails on missing SDK | Install Android SDK Platform 37 and Build-Tools 37 in the SDK Manager |
