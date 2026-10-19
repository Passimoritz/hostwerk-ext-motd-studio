![MOTD studio](banner.svg)

# MOTD studio

Design your Minecraft server's description in the server list with colours and formats – with a preview like in the game.

An official [Hostwerk](https://github.com/Passimoritz/hostwerk-public) extension and an **example of an extension that changes Hostwerk itself** (SDK 2.2):

- **Own tab on every Minecraft server page** (`contributes.tabs`, `on: "minecraft"`) – Hostwerk passes the server as `Hostwerk.context`.
- **Action in the right-click menu and the quick search** (`contributes.actions`) – opens the editor for that server (`Hostwerk.on('action')`).
- **Changes a Hostwerk setting** (`Hostwerk.put('/mc/servers/<id>/properties', { motd })`) with the `change:minecraft` permission – Hostwerk asks before every change.
- **Tabs drawn by Hostwerk** (`page.tabs`) and Hostwerk's own design classes (`card`, `btn primary`, `select` …).

## Features

- Colour buttons (§0–§f) and formats (bold, italic, underline, strikethrough, reset) – wraps a selection
- Live preview like the Minecraft server list
- Checks: more than 2 lines, lines that get cut off, unknown codes
- Table of all colour codes

## Permissions

| Permission | Why |
|---|---|
| `read:minecraft` | Read the servers and their current description |
| `change:minecraft` | Save the description to `server.properties` (asks first) |

## Develop

Logic in `page/lib.js` (no DOM), tests: `node --test tests/*.test.js`. Check: `node check.js . --strict` (Hostwerk SDK).

License: MIT
