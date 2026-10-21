![MOTD studio](banner.svg)

# MOTD studio

Design your Minecraft server's description in the server list with colours and formats – with a preview like in the game.

An official [Hostwerk](https://github.com/Passimoritz/hostwerk-public) extension and an **example of an extension that changes Hostwerk itself** (SDK 2.2, today 2.9):

- **Own tab on every Minecraft server page** (`contributes.tabs`, `on: "minecraft"`) – Hostwerk passes the server as `Hostwerk.context`.
- **Action in the right-click menu and the quick search** (`contributes.actions`) – opens the editor for that server (`Hostwerk.on('action')`).
- **Changes a Hostwerk setting** (`Hostwerk.put('/mc/servers/<id>/properties', { motd })`) with the `change:minecraft` permission – Hostwerk asks before every change.
- **Tabs drawn by Hostwerk** (`page.tabs`) and Hostwerk's own design classes (`card`, `btn primary`, `select` …).

## Features

- Colour buttons (§0–§f, each with its name for screen readers) and formats (bold, italic, underline, strikethrough, obfuscated §k, reset) – wraps a selection
- Templates (welcome, survival, event, maintenance, creative) and “Center lines” – measured with the widths of Minecraft’s font
- Live preview like the Minecraft server list
- Server icon: pick a picture, zoom and move the crop, save as 64 × 64 PNG (`change:minecraft`, asks first)
- After saving on a running server: “Restart now” (`control:services`, asks first)
- The server list stays live (new servers, started/stopped) without losing what you typed
- Checks: more than 2 lines, lines that get cut off, unknown codes
- Table of all colour codes
- Error state with “Try again”; polling pauses while the page is hidden; sits under “Servers” next to Minecraft; other extensions may add tabs – for example a Bedrock MOTD tab from the Bedrock bridge

## Permissions

| Permission | Why |
|---|---|
| `read:minecraft` | Read the servers and their current description |
| `change:minecraft` | Save the description to `server.properties` and the server icon (asks first) |
| `control:services` | “Restart now” after saving (asks first) |

## Develop

Logic in `page/lib.js` (no DOM), polling and error state in `page/live.js`, tests: `node --test tests/*.test.js`. Check: `node check.js . --strict` (Hostwerk SDK). The release packs everything except the repository tooling.

License: MIT
