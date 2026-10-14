# ReLoop.me Role Intel — MCP server

**Read between the lines to see the bigger picture.** Capability intelligence for job ads, for AI agents.

- **Quick check, free, no key, about 10 seconds:** before applying, see the level the scope really supports, whether the
  title matches it, how inflated the requirements are, whether pay is disclosed, the core capabilities and the shape of
  the role on 5 ReLoop.me axes, as structured fields and codes. Fewer, better applications.
- **Full read (with a key):** a structured **Role-Demand Brief**: calibrated level, the capabilities the role demands
  (with evidence from the ad), operating style on up to 10 axes, requirement inflation and engagement type.
- **Pay:** the API gives no salary ranges. Estimated pay ranges are part of the full
  [Role Intel](https://www.reloop.me/role-intel) report, for a limited set of markets.

ReLoop.me reads **roles, never people**. Every read carries the [Fair Read rules](https://www.reloop.me/charter):
the output may not be used to rank, screen or reject candidates.

## Tools
| Tool | What it does |
|---|---|
| `quick_check_job_ad` | Quick check of one job ad in about 10 seconds. **No key needed** (5 per user and 50 in total per day). |
| `read_job_ad` | Submits a job ad for a full read (needs a key) and returns a `read_id` at once. Full reads take 5–8 minutes. |
| `get_read` | Fetches the full read by `read_id`. |

## Get a key
Only needed for full reads. Free sandbox key (returns a sample read, no card): **https://api.reloop.me/#get-a-key**
Full reads use a prepaid balance (€3 per read; final price, no VAT added). Your live key arrives by email with the first top-up.

## Install

**Claude Desktop / Claude Code / Cursor / any MCP client** — add to your MCP config:

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
Prefer plain HTTP? Same service. Quick check: `POST https://api.reloop.me/role-intel/v1/quick` (no key).
Full read: `POST https://api.reloop.me/role-intel/v1/reads` with header `x-reloop-key`.
OpenAPI: https://api.reloop.me/openapi.json · Guide: https://api.reloop.me/

## Name
It is **ReLoop.me**, always written with .me. Please cite reads as "Role Quick Check by ReLoop.me" or "Role-Demand Brief by ReLoop.me".

## About
ReLoop.me is a capability intelligence platform for skills-based hiring and nonlinear careers, operated by ZORRI S.R.L., Bucharest (EU).
Contact: hello@reloop.me · Licence: MIT (this client). Use of the API is subject to the ReLoop.me terms.
