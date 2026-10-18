# MOTD-Studio

Die Beschreibung deines Minecraft-Servers in der Serverliste mit Farben und Formaten gestalten – mit Vorschau wie im Spiel.

Eine offizielle [Hostwerk](https://github.com/Passimoritz/hostwerk-public)-Erweiterung und ein **Beispiel für eine Erweiterung, die Hostwerk selbst verändert** (SDK 2.2):

- **Eigener Reiter auf jeder Minecraft-Seite** (`contributes.tabs`, `on: "minecraft"`) – Hostwerk übergibt den Server als `Hostwerk.context`.
- **Aktion im Rechtsklick-Menü und in der Schnellsuche** (`contributes.actions`) – öffnet den Editor für diesen Server (`Hostwerk.on('action')`).
- **Ändert eine Hostwerk-Einstellung** (`Hostwerk.put('/mc/servers/<id>/properties', { motd })`) mit dem Recht `change:minecraft` – Hostwerk fragt vor jeder Änderung.
- **Reiter zeichnet Hostwerk** (`page.tabs`), Hostwerks eigene Design-Klassen (`card`, `btn primary`, `select` …).

## Funktionen

- Farbknöpfe (§0–§f) und Formate (fett, kursiv, unterstrichen, durchgestrichen, zurücksetzen) – fasst eine Auswahl ein
- Live-Vorschau wie die Minecraft-Serverliste
- Prüfung: mehr als 2 Zeilen, abgeschnittene Zeilen, unbekannte Codes
- Tabelle aller Farbcodes

## Rechte

| Recht | Wofür |
|---|---|
| `read:minecraft` | Server und ihre aktuelle Beschreibung lesen |
| `change:minecraft` | Beschreibung in `server.properties` speichern (fragt vorher) |

## Entwickeln

Logik in `page/lib.js` (ohne DOM), Tests: `node --test tests/*.test.js`. Prüfung: `node check.js . --strict` (Hostwerk-SDK).

Lizenz: MIT
