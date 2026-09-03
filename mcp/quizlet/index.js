#!/usr/bin/env node
// Quizlet MCP server (stdio). Manages flashcard sets locally and exports them in
// the format Quizlet's "Import" box accepts. Quizlet has no public API, so
// nothing here talks to quizlet.com directly.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as S from "./store.js";

const server = new McpServer({ name: "quizlet-mcp", version: "0.1.0" });
const text = (s) => ({ content: [{ type: "text", text: typeof s === "string" ? s : JSON.stringify(s, null, 2) }] });
const wrap = (fn) => async (args) => {
  try { return text(await fn(args)); }
  catch (e) { return { isError: true, content: [{ type: "text", text: e.message }] }; }
};

const card = z.object({ term: z.string(), definition: z.string() });

server.registerTool("quizlet_list_sets",
  { description: "List all locally stored flashcard sets.", inputSchema: {} },
  wrap(() => S.listSets()));

server.registerTool("quizlet_get_set",
  { description: "Get a set with all its cards.", inputSchema: { id: z.string() } },
  wrap(({ id }) => S.getSet(id)));

server.registerTool("quizlet_create_set",
  { description: "Create a new flashcard set (e.g. vocabulary for a lesson).",
    inputSchema: { title: z.string(), description: z.string().optional(), cards: z.array(card).default([]) } },
  wrap((a) => S.createSet(a)));

server.registerTool("quizlet_add_cards",
  { description: "Add cards to a set. Terms already present (case-insensitive) are skipped.",
    inputSchema: { id: z.string(), cards: z.array(card).min(1) } },
  wrap(async ({ id, cards }) => { const r = await S.addCards(id, cards); return { added: r.added, cardCount: r.set.cards.length }; }));

server.registerTool("quizlet_remove_cards",
  { description: "Remove cards from a set by term.", inputSchema: { id: z.string(), terms: z.array(z.string()).min(1) } },
  wrap(async ({ id, terms }) => { const r = await S.removeCards(id, terms); return { removed: r.removed, cardCount: r.set.cards.length }; }));

server.registerTool("quizlet_delete_set",
  { description: "Delete a set permanently.", inputSchema: { id: z.string() } },
  wrap(async ({ id }) => { await S.deleteSet(id); return `Deleted ${id}`; }));

server.registerTool("quizlet_export_import_text",
  { description: "Export a set as text for Quizlet's Import box (quizlet.com/create → Import). Default: tab between term and definition, newline between cards.",
    inputSchema: { id: z.string(), termSep: z.string().default("\t"), cardSep: z.string().default("\n") } },
  wrap(async ({ id, termSep, cardSep }) => S.toQuizletImport((await S.getSet(id)).cards, { termSep, cardSep })));

server.registerTool("quizlet_import_text",
  { description: "Create a set from text exported by Quizlet (or any 'term<TAB>definition' / 'term - definition' lines).",
    inputSchema: { title: z.string(), text: z.string(), description: z.string().optional(), termSep: z.string().default("\t"), cardSep: z.string().default("\n") } },
  wrap(({ title, text: t, description, termSep, cardSep }) =>
    S.createSet({ title, description, cards: S.fromQuizletExport(t, { termSep, cardSep }) })));

server.registerTool("quizlet_quiz",
  { description: "Generate a multiple-choice quiz from a set.",
    inputSchema: { id: z.string(), count: z.number().int().min(1).max(50).default(10),
      mode: z.enum(["term-to-definition", "definition-to-term"]).default("term-to-definition"), seed: z.number().int().optional() } },
  wrap(async ({ id, ...opts }) => S.makeQuiz(await S.getSet(id), opts)));

server.registerResource("sets", "quizlet://sets", { description: "All flashcard sets as JSON" },
  async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(await S.listSets(), null, 2) }] }));

await server.connect(new StdioServerTransport());
