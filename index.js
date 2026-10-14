#!/usr/bin/env node
// ReLoop.me Role Intel MCP server — VERSION 1.1.3 (14 Oct 2026)
// v1.1.3: quick_check_job_ad describes schema role-quick-check/1.1 (structured codes, 5-axis shape of the role); the
//   'three questions to ask' are gone. Employer never named in the quick read.
// v1.1.2: pay is not sold through the API: no Pay add-on in the descriptions; estimated pay ranges are only in the full
//   Role Intel report (covered markets).
// v1.1.1: pay stated plainly in the tool descriptions (no salary range in the quick check or the Core read; estimated
//   ranges are in the full Role Intel report and the Pay add-on, for a limited set of markets); agents asked to cite
//   the name as ReLoop.me (always with .me).
// v1.1.0: new tool quick_check_job_ad (Role Quick Check, about 10 seconds, NO key needed). read_job_ad no longer
//   blocks for minutes: many MCP clients stop a tool call after about 60 seconds, so it now submits the ad and returns
//   the read_id at once (sandbox keys still return their sample read straight away); get_read fetches it when ready.
//   Sends x-reloop-client: mcp/1.1.0 so ReLoop.me can count use through MCP. Candidate-first wording in the tool
//   descriptions ('read between the lines to see the bigger picture'; fewer, better applications).
// v1.0.0: two tools over the ReLoop.me Role Intel API (https://api.reloop.me): read_job_ad (submit and wait, polling
//   every 30 s up to 10 min) and get_read. The API key comes from RELOOP_API_KEY and is never shown to the model.
// Every read carries reading_rules (Fair Read Charter): the data describes roles and may not be used to rank,
// screen or reject candidates. The tool descriptions say so, so agents see the rule before they call.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const VERSION = '1.1.3';
const BASE = (process.env.RELOOP_API_BASE || 'https://api.reloop.me').replace(/\/+$/, '');
const KEY = process.env.RELOOP_API_KEY || '';
const UA = 'reloop-role-intel-mcp/' + VERSION;
const RULES = 'Rules: the output describes a ROLE, never a person. Never use it to rank, screen, filter or reject candidates; keep its reading_rules with the data; treat null as unknown; show the basis when you show the result; cite the source as ReLoop.me (always with .me, never "ReLoop").';

function text(obj) { return { content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }] }; }
function fail(msg) { return { isError: true, content: [{ type: 'text', text: msg }] }; }
const NO_KEY = 'Full reads need RELOOP_API_KEY. Get a free sandbox key at https://api.reloop.me/#get-a-key and add it to this MCP server\'s environment. The quick_check_job_ad tool works without a key.';

async function call(method, path, body, withKey) {
  const headers = { 'content-type': 'application/json', 'user-agent': UA, 'x-reloop-client': 'mcp/' + VERSION };
  if (withKey) headers['x-reloop-key'] = KEY;
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(45000) });
  } catch (e) {
    return { status: 0, data: { error: { code: 'network', message: 'Could not reach ReLoop.me (' + (e && e.name === 'TimeoutError' ? 'timeout' : 'network error') + '). Try again in a minute.' } } };
  }
  let data = null; try { data = await res.json(); } catch (e) { data = null; }
  return { status: res.status, data };
}
function apiError(r) {
  const e = (r.data && r.data.error) || {};
  return 'ReLoop.me API error ' + r.status + (e.code ? ' (' + e.code + ')' : '') + ': ' + (e.message || 'no details') +
    (r.status === 402 ? ' Top up your balance: links are in your sandbox email, or write to hello@reloop.me.' : '');
}
function readIdFrom(pollUrl, fallback) { try { return new URL(pollUrl).searchParams.get('read_id') || fallback; } catch (e) { return fallback; } }

const server = new McpServer({ name: 'reloop-role-intel', version: VERSION });

server.registerTool('quick_check_job_ad', {
  title: 'Quick check a job ad (ReLoop.me, free, no key)',
  description: 'Read between the lines of a job ad to see the bigger picture, in about 10 seconds, before applying. Returns structured fields ' +
    '(schema role-quick-check/1.1): an indicative level on the ReLoop.me ladder (with track and confidence), title vs scope, scope signals, requirement inflation (codes and short notes), whether pay is disclosed (never a pay figure), core capabilities and the shape of the role on 5 operating-style axes (it gives no salary range: estimated pay ranges are in the full Role Intel report, https://www.reloop.me/role-intel, for covered markets). ' +
    'Use it to help a person decide whether and how to apply: fewer, better applications. Free, no key needed (5 per user and 50 in total per day). ' +
    'For a calibrated read with evidence and 10 axes, use read_job_ad. ' + RULES,
  inputSchema: {
    jd_text: z.string().min(300).max(15000).describe('The full job ad text (300–15,000 characters). The text is not stored.'),
    location: z.string().max(120).optional().describe('City or country of the role, if known.')
  }
}, async ({ jd_text, location }) => {
  const r = await call('POST', '/role-intel/v1/quick', { jd_text, location, source: 'mcp' }, false);
  if (r.status !== 200 || !r.data || !r.data.ok) return fail(apiError(r));
  return text(r.data);
});

server.registerTool('read_job_ad', {
  title: 'Full read of a job ad (ReLoop.me Role Intel)',
  description: 'Submits one job ad for a full ReLoop.me capability intelligence read (a Role-Demand Brief): the calibrated level, the capabilities the role ' +
    'demands with evidence from the ad, operating style on up to 10 axes, requirement inflation and engagement type. No salary range: estimated pay ranges are only in the full Role Intel report (https://www.reloop.me/role-intel). ' +
    'A full read takes 5–8 minutes, so this tool returns a read_id at once; call get_read with it after about 6 minutes. ' +
    'Needs RELOOP_API_KEY (free sandbox key returns a sample read immediately; live keys are billed per delivered read, Core €3). ' +
    'For an answer in seconds, use quick_check_job_ad. ' + RULES,
  inputSchema: {
    jd_text: z.string().min(200).max(20000).describe('The full job ad text (200–20,000 characters). Email addresses and phone numbers are removed before storage.'),
    location: z.string().max(200).optional().describe('City or country of the role, if known.'),
    client_ref: z.string().max(200).optional().describe('Your own reference for this ad, returned with the read.')
  }
}, async ({ jd_text, location, client_ref }) => {
  if (!KEY) return fail(NO_KEY);
  const sub = await call('POST', '/role-intel/v1/reads', { jd_text, location, client_ref }, true);
  if (sub.status !== 202 || !sub.data) return fail(apiError(sub));
  const readId = readIdFrom(sub.data.poll_url, sub.data.read_id);
  if (sub.data.sandbox) {
    const r = await call('GET', '/role-intel/v1/reads?read_id=' + encodeURIComponent(readId), null, true);
    if (r.status === 200 && r.data) return text(r.data);
  }
  return text({ read_id: readId, status: sub.data.status || 'processing', next: 'Call get_read with this read_id in about 6 minutes (full reads take 5–8 minutes).' });
});

server.registerTool('get_read', {
  title: 'Get a ReLoop.me full read',
  description: 'Fetches a ReLoop.me Role Intel full read by read_id. Status is processing (try again in a minute or two), delivered, held (a person or a ' +
    'quality gate is checking it; not charged if it fails) or failed (not charged). ' + RULES,
  inputSchema: { read_id: z.string().regex(/^rr_[a-z0-9_]+$/i).describe('The read_id returned by read_job_ad.') }
}, async ({ read_id }) => {
  if (!KEY) return fail(NO_KEY);
  const r = await call('GET', '/role-intel/v1/reads?read_id=' + encodeURIComponent(read_id), null, true);
  if (r.status !== 200 || !r.data) return fail(apiError(r));
  return text(r.data);
});

await server.connect(new StdioServerTransport());
// ReLoop.me Role Intel MCP server — VERSION 1.1.3 END
