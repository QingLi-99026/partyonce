# PartyOnce Stage 2 Step 5.4A-4B Browser Quote Form Acceptance

Date: 2026-05-10

Scope: real browser quote form acceptance for localStorage plus persistent Lead bridge

## 1. Objective

Complete the browser-level acceptance gap from Step 5.4A-4.

This test verifies:

```text
Open /quote in a real browser.
Submit the visible quote inquiry form.
Confirm localStorage.inquirySubmissions is written.
Confirm the same submission triggers POST /api/leads.
Confirm local SQLite stores the Customer and Lead.
Confirm backend restart does not lose the Lead.
```

This test does not modify frontend or backend source code.

## 2. Browser / Manual Test Method

Playwright CLI was not reliable in this environment, so this acceptance used a real Chrome browser session with a local DevTools control channel.

The browser was launched as a separate local Chrome profile with:

```text
remote debugging on a local-only port
user data under /tmp
target route /quote with theme=castle, scene=garden, package=premium
```

The visible `/quote` page was loaded in Chrome. The test filled the same visible form fields that a user would fill:

```text
联系人姓名
联系方式
活动日期
备注需求
确认提交
```

The form was submitted through the page DOM in the real browser session, not by directly writing browser storage.

## 3. Local Services

Backend safe local profile:

```text
PYTHON_DOTENV_DISABLED=1
DATABASE_URL=sqlite local /tmp dummy database
PARTYONCE_LEAD_STORAGE_MODE=sqlite_local
PARTYONCE_LEAD_SQLITE_PATH=/tmp/partyonce_stage2_5_4a4b2_browser.sqlite
host=127.0.0.1
port=8000
```

Frontend safe local profile:

```text
VITE_LEAD_BRIDGE_MODE=dual_write_skeleton
npm run dev -- --host 127.0.0.1 --port 3011
```

No production configuration was used.

## 4. /quote Route Status

The browser page title after loading:

```text
报价汇总 - PartyOnce
```

The visible quote form opened successfully from the page action button.

## 5. Test Form Input Summary

Submitted form values:

```text
name: Browser Form Parent 54A4B Pass
contact: browser54a4b-pass@example.test
preferred date: 2026-06-04
notes: Visible browser form pass with localStorage and persistent Lead
theme: castle
scene: garden
package: premium
```

## 6. localStorage Result

Browser evaluation after visible form submission:

```text
ok=true
submissionCount=1
matched=true
matchedName=Browser Form Parent 54A4B Pass
matchedDate=2026-06-04
successMessageVisible=true
```

Result:

```text
localStorage.inquirySubmissions was created and contains the submitted inquiry.
```

## 7. POST /api/leads Result

Backend log during the browser form submission showed:

```text
POST /api/leads -> 201 Created
```

The visible page also showed the backend sync success message containing the local Lead API skeleton wording.

Result:

```text
The same browser form submission triggered POST /api/leads.
```

## 8. SQLite Count Before And After

Before browser form submission, the fresh local SQLite target was migrated and checked:

```text
customers count=0
leads count=0
```

After browser form submission:

```text
customers count=1
leads count=1
lead row=1|Browser Form Parent 54A4B Pass|browser54a4b-pass@example.test|new|Medium|web_quote|2026-06-04
```

Unauthenticated admin list check:

```text
GET /api/leads -> 401
```

This confirms the admin Lead queue remains protected without auth.

## 9. Backend Restart Persistence

The backend was stopped and restarted using the same safe local SQLite path.

After restart:

```text
customers count=1
leads count=1
lead row=1|browser54a4b-pass@example.test|new|Medium
```

Unauthenticated admin list after restart:

```text
GET /api/leads -> 401
```

Result:

```text
The browser-submitted Lead survived backend restart.
```

## 10. Blockers Encountered

Playwright CLI was not usable for this environment.

Resolution:

```text
Used real Chrome with a local DevTools control channel.
Completed the visible /quote form submission through the browser page.
```

No product code change was required.

## 11. Safety Boundaries Confirmed

This acceptance did not:

- Modify frontend source.
- Modify backend source.
- Modify backend migrations.
- Read or modify `.env.production`.
- Submit or clean `frontend/vue-app/dist`.
- Connect to production database.
- Run MySQL.
- Run production migration.
- Create Quote API.
- Create Order API.
- Touch Stripe or payment code.
- Trigger webhook or n8n.
- Send email, SMS, WhatsApp, or outbound messages.
- Deploy.
- Push.

Local backend, frontend, and Chrome test sessions were stopped after the checks.

`backend/__pycache__` was restored/excluded after local checks.

## 12. Final Result

Result:

```text
pass
```

Step 5.4A-4B completes the real browser acceptance for:

```text
/quote visible form
-> localStorage.inquirySubmissions
-> POST /api/leads
-> persistent customers/leads rows in local SQLite
-> backend restart preserves Lead
```

Recommended next step:

```text
Step 5 persistent Lead storage acceptance summary / Step 5.7收口
```

Do not start Quote API, Order API, payment, webhook, n8n, outbound messaging, deployment, or push.

