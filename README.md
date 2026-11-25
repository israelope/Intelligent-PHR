# Intelligent Personal Health Record Management System

A working implementation of the system designed in Chapters 1–3 of the project report:
a web app where a patient can securely store structured health records and medical
documents, and use AI to query their health data in natural language, get documents
summarised and categorised automatically, and receive basic, non-diagnostic health
insights.

This README assumes no prior experience setting any of this up. Follow it top to bottom.

---

## 1. What you need before you start

| Tool | Why | Where to get it |
|---|---|---|
| Node.js 20.9 or newer | Runs the app | https://nodejs.org (LTS version) |
| A code editor | To open the project | VS Code: https://code.visualstudio.com |
| A free Supabase account | Database, auth, file storage | https://supabase.com |
| An Anthropic API key | Powers the AI features | https://console.anthropic.com |

Check Node is installed by opening a terminal and running:
```bash
node -v
```
You should see `v20.9.x` or higher.

---

## 2. Unzip and install

1. Unzip the project folder and open it in VS Code (`File -> Open Folder`).
2. Open a terminal inside VS Code (`Terminal -> New Terminal`) and run:
   ```bash
   npm install
   ```
   This downloads all the libraries the app depends on (Next.js, Supabase's client
   libraries, Tailwind CSS, etc.) into a `node_modules` folder. It can take a minute or two.

---

## 3. Create your free Supabase project (the database)

Supabase gives you a hosted PostgreSQL database, user authentication, and file storage,
all on a free tier that's enough for this project.

1. Go to **https://supabase.com** and sign up (you can use GitHub or Google to sign in
   faster).
2. Click **New project**.
3. Fill in:
   - **Name**: `intelligent-phr` (or anything you like)
   - **Database Password**: generate a strong one and **save it somewhere** — you won't
     need it for this app directly, but keep it safe.
   - **Region**: pick the one closest to you.
   - **Plan**: Free.
4. Click **Create new project** and wait a minute or two while it provisions.

### 3.1 Run the database schema

This creates all five tables from the ERD (Figure 3.3) — `profiles` (the "users" entity),
`health_records`, `documents`, `ai_queries`, `health_insights` — plus the Row-Level
Security policies described in Section 3.5.3.2, and the private storage bucket for
uploaded documents.

1. In your Supabase project, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this project in your editor, copy its *entire*
   contents, and paste it into the Supabase SQL editor.
4. Click **Run** (bottom right).
5. You should see "Success. No rows returned." If you get an error, read it carefully —
   the most common cause is accidentally pasting only part of the file.

### 3.2 Verify it worked

Click **Table Editor** in the sidebar. You should see five tables: `profiles`,
`health_records`, `documents`, `ai_queries`, `health_insights`. Click on one (e.g.
`health_records`) — in the top right it should say **RLS enabled**.

Click **Storage** in the sidebar — you should see a bucket called `documents`.

### 3.3 Get your API keys

1. Click the **Settings** (gear icon) in the sidebar, then **API**.
2. You'll need two values from this page:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

Keep this tab open — you'll paste these into `.env.local` in Step 5.

### 3.4 (Recommended for local testing) Turn off email confirmation

By default, Supabase sends a confirmation email before a new account can log in. For
quick local testing, you can turn this off:

1. Go to **Authentication -> Providers -> Email**.
2. Turn **off** "Confirm email".
3. Save.

(For a real deployment you'd leave this on — see Section 7.)

---

## 4. Get an Anthropic API key (the AI layer)

1. Go to **https://console.anthropic.com** and sign up.
2. Go to **Settings -> API Keys -> Create Key**.
3. Copy the key (starts with `sk-ant-...`). You won't be able to see it again, so
   paste it somewhere safe for now.
4. New accounts usually come with a small amount of free trial credit, which is enough
   to build and test this project. If you run out, you'll need to add a payment method
   to top up — the per-request cost for a project like this is a few cents at most.

> **Using OpenAI instead?** The whole AI layer lives in one file: `lib/ai.js`. You can
> swap the `callClaude()` function to call `https://api.openai.com/v1/chat/completions`
> with your OpenAI key instead — nothing else in the app needs to change.

---

## 5. Configure your environment variables

1. In the project root, copy `.env.local.example` to a new file named `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   (On Windows, just duplicate the file in File Explorer and rename it.)
2. Open `.env.local` and fill in the three values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Save the file. **Never commit `.env.local` to GitHub** — it's already listed in
   `.gitignore` so this should happen automatically.

---

## 6. Run it locally

```bash
npm run dev
```

Open **http://localhost:3000** in your browser. You should land on the login page.

1. Click **Register**, create an account with your name, email and a password.
2. If you turned off email confirmation (Step 3.4), you'll go straight to the dashboard.
   Otherwise, check your email for a confirmation link first.
3. Try the app:
   - **Records**: add a structured health record (e.g. a medication).
   - **Upload**: upload a PDF, image, or text file and watch the AI summarise and
     categorise it.
   - **Ask AI**: ask a question like "What medications am I taking?" and see it answer
     using only your own stored data.
   - **Dashboard**: click "Refresh insights" to generate AI health tips from your data.

If something doesn't work, check the terminal running `npm run dev` for error messages —
the most common issues are a missing/incorrect value in `.env.local`, or the SQL schema
not having been run yet.

---

## 7. Deploying so others can use it (optional)

The easiest option is **Vercel** (made by the creators of Next.js, also has a free tier):

1. Push this project to a GitHub repository.
2. Go to **https://vercel.com**, sign up, and click **New Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add the same three variables from your `.env.local`.
5. Click **Deploy**.
6. Once deployed, go back to Supabase: **Authentication -> URL Configuration**, and add
   your new Vercel URL (e.g. `https://your-app.vercel.app`) to **Site URL** and
   **Redirect URLs** (add `https://your-app.vercel.app/auth/callback` specifically) so
   that email confirmation links work in production.
7. If you turned off "Confirm email" earlier for local testing, consider turning it back
   on for a real deployment.

---

## 8. How the code maps to the project report

| Report section | Where it lives in the code |
|---|---|
| Figure 3.2 — System Architecture | `app/` (Frontend), `app/api/` (Backend/API layer), `lib/ai.js` (AI layer) |
| Figure 3.3 — ERD | `supabase/schema.sql` |
| Section 3.5.3.2 / Figure 3.4 — Row-Level Security | `supabase/schema.sql` (the `create policy ...` statements) |
| Table 3.1 — Functional Requirements (FR1–FR9) | FR1/FR9: `lib/supabase/*`, RLS policies · FR2: `app/api/records/` · FR3: `app/api/documents/upload/` · FR4: `app/api/ai/query/` · FR5/FR6: `lib/ai.js` `summariseAndCategorise()` · FR7: `app/api/ai/insights/` · FR8: `app/dashboard/page.jsx` |
| Figure 3.6 — Upload/Summarise sequence | `app/api/documents/upload/route.js` |
| NL Query sequence | `app/api/ai/query/route.js` |
| Table 3.7 — Technology Stack | `package.json` (React/Next.js, Tailwind, Supabase) |

---

## 9. Project structure

```
app/
  layout.jsx                   Root layout (imports globals.css)
  page.jsx                     Landing page (redirects to /login or /dashboard)
  login/, register/            Authentication pages (.jsx)
  auth/callback/route.js       Handles email-confirmation redirect
  dashboard/
    layout.jsx                 Protects all /dashboard pages, shows the Navbar
    page.jsx                   Main dashboard (FR8)
    records/page.jsx           Health records CRUD UI (FR2)
    upload/page.jsx            Document upload UI (FR3, FR5, FR6)
    query/page.jsx             AI chat UI (FR4)
  api/
    records/                   Health records API (GET/POST/PUT/DELETE)
    documents/                 Document list + upload API
    ai/query/                  Natural-language query API (FR4)
    ai/insights/               Health insights API (FR7)
components/                    Reusable UI pieces (Navbar.jsx, InsightsPanel.jsx)
lib/
  ai.js                        All AI-layer logic (summarise, query, insights)
  supabase/                    Supabase client setup (browser, server, proxy helpers)
supabase/
  schema.sql                   Full database schema + RLS policies + storage bucket
proxy.js                       Keeps auth sessions fresh; protects /dashboard and /api
```

---

## 10. What's included vs. left for you to extend

**Included and working:** registration/login, CRUD for health records, document upload
with AI summarisation/categorisation, natural-language querying grounded in the user's
own data, AI-generated health insights, a dashboard, and full data isolation via
PostgreSQL Row-Level Security.

**Good next steps for your implementation/testing chapter (Chapter 4):**
- An "edit record" UI (the API route `PUT /api/records/[id]` already exists and works —
  only the edit button/form in `app/dashboard/records/page.jsx` is missing).
- Pagination for users with many records or documents.
- A loading skeleton instead of plain "Loading..." text.
- Automated tests (unit tests for `lib/ai.js`'s JSON parsing, integration tests for the
  API routes) to feed into your Chapter 4 test results tables.
- Linking a specific document to a specific health record from the Upload page (the
  database column `documents.record_id` already supports this).

---

## 11. Troubleshooting

- **"ANTHROPIC_API_KEY is not set"** — you haven't created `.env.local`, or the dev
  server was started before you saved it. Stop it (Ctrl+C) and run `npm run dev` again.
- **"Not authenticated" on every page** — the database schema probably hasn't been run
  yet (Step 3.1), so the `profiles` row was never created for your account. Try
  registering a new account after re-running `supabase/schema.sql`.
- **Upload fails immediately** — check the file is under 10 MB and is a PDF, PNG, JPEG,
  WEBP or TXT file.
- **AI responses are empty or error out** — double check your Anthropic key is correct
  and has available credit at https://console.anthropic.com.
