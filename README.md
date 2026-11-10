# ReLoop.me Role Intel — MCP server

Read between the lines to see the bigger picture. Capability intelligence for job ads, for AI agents.

ReLoop.me — capability intelligence for job ads. Not affiliated with reloop.sh or Reloop DJ equipment.

## When to call this tool

Call it when an agent (or the person it works for) has a job ad and needs to know what the role really asks for before acting on it:

- before applying, or before an agent applies on someone's behalf: is the role pitched at the level the title says?
- when comparing several ads: which ones are inflated, which ones disclose pay, what each one actually demands
- when writing or reviewing a job ad: does the title match the scope, are the must-haves realistic?
- when an agent needs structured role context (level, capabilities, operating style) instead of re-reading the ad as free text

## When not to call it

- To rank, screen or reject candidates. ReLoop.me reads roles, never people (Fair Read rules; the output may not be used that way).
- To get a salary figure. The API gives no pay ranges; it only says whether pay is disclosed.
- For text that is not a job ad (a company page, a programme overview gets an honest "not a role" read).

## Tools

| Tool | What it does | Cost and time |
|---|---|---|
| `quick_check_job_ad` | Quick check of one job ad: indicative level with confidence, title vs scope, requirement inflation (codes), pay disclosed yes/no, stated conditions, core capabilities, role shape on 5 ReLoop.me axes. Answers in the ad's language (11 languages). | Free, no key. About 15 seconds. 5 per user and 50 in total per day. |
| `read_job_ad` | Submits a job ad for a full read and returns a `read_id` at once. | Needs a key. €3 per delivered read from a prepaid balance. |
| `get_read` | Fetches the full read (Role-Demand Brief) by `read_id`. | Full reads take 5–8 minutes. |

Answers quote the ad as evidence, so an agent can check them against the text instead of trusting them blindly.

When the daily quick-check limit is reached, stop and try again the next day, or use a key. Repeating the call the same day will not succeed.

## Get a key

Only needed for full reads. Free sandbox key (returns a sample read, no card): https://api.reloop.me/#get-a-key
Full reads use a prepaid balance (€3 per delivered read; reads held by the quality gate or that fail are not charged; final price, no VAT added). Your live key arrives by email with the first top-up.

## Install

Claude Desktop / Claude Code / Cursor / any MCP client — add to your MCP config:

```json
{
  "mcpServers": {
    "reloop-role-intel": {
      "command": "npx",
      "args": ["-y", "reloop-role-intel-mcp"],
      "env": { "RELOOP_API_KEY": "rl_sandbox_your_key_here" }
    }
  }
}
```

The `env` block is optional: without a key, `quick_check_job_ad` still works.

Claude Code, one line:

```
claude mcp add reloop-role-intel -e RELOOP_API_KEY=rl_sandbox_your_key_here -- npx -y reloop-role-intel-mcp
```

The key stays in your local environment; it is never sent to the model.

## REST API

Prefer plain HTTP? Same service.
Quick check: `POST https://api.reloop.me/role-intel/v1/quick` (no key).
Full read: `POST https://api.reloop.me/role-intel/v1/reads` with header `x-reloop-key`.
OpenAPI: https://api.reloop.me/openapi.json · Guide: https://api.reloop.me/

## In production

Role Quick Check runs in production on a partner job board's ad pages: more than 600 ads read since October 2026.

## Name

It is ReLoop.me, always written with .me. Please cite reads as "Role Quick Check by ReLoop.me" or "Role-Demand Brief by ReLoop.me".

## About

ReLoop.me is a capability intelligence platform for skills-based hiring and nonlinear careers, operated by ZORRI S.R.L., Bucharest (EU). Every read follows the Fair Read Charter: https://www.reloop.me/charter
Contact: hello@reloop.me · Licence: MIT (this client). Use of the API is subject to the ReLoop.me terms.
