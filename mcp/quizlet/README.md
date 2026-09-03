# Quizlet MCP server

A small [MCP](https://modelcontextprotocol.io) server (stdio) for building flashcard sets
and moving them in and out of Quizlet.

Quizlet has no public API, so the server does not talk to quizlet.com. Instead it keeps
sets locally (`~/.quizlet-mcp/sets.json`, override with `QUIZLET_MCP_DIR`) and exports
text that pastes straight into **quizlet.com/create → Import** (term TAB definition, one
card per line). It can also parse text from Quizlet's **Export** dialog.

## Install

```sh
cd mcp/quizlet
npm install
npm test
```

## Register with Claude Code

```sh
claude mcp add quizlet -- node /absolute/path/to/mcp/quizlet/index.js
```

Or in `.mcp.json` / Claude Desktop config:

```json
{ "mcpServers": { "quizlet": { "command": "node", "args": ["/absolute/path/to/mcp/quizlet/index.js"] } } }
```

## Tools

| Tool | Purpose |
| --- | --- |
| `quizlet_list_sets` | List stored sets |
| `quizlet_get_set` | Get a set with its cards |
| `quizlet_create_set` | Create a set from `{term, definition}` cards |
| `quizlet_add_cards` / `quizlet_remove_cards` | Edit a set |
| `quizlet_delete_set` | Delete a set |
| `quizlet_export_import_text` | Text for Quizlet's Import box |
| `quizlet_import_text` | Create a set from Quizlet export text |
| `quizlet_quiz` | Multiple-choice quiz from a set |

Resource: `quizlet://sets`.
