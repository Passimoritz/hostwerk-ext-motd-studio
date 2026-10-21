![MOTD-Studio](banner.svg)

# MOTD-Studio

Die Beschreibung deines Minecraft-Servers in der Serverliste mit Farben und Formaten gestalten – mit Vorschau wie im Spiel.

Eine offizielle [Hostwerk](https://github.com/Passimoritz/hostwerk-public)-Erweiterung und ein **Beispiel für eine Erweiterung, die Hostwerk selbst verändert** (SDK 2.2, heute 2.9):

- **Eigener Reiter auf jeder Minecraft-Seite** (`contributes.tabs`, `on: "minecraft"`) – Hostwerk übergibt den Server als `Hostwerk.context`.
- **Aktion im Rechtsklick-Menü und in der Schnellsuche** (`contributes.actions`) – öffnet den Editor für diesen Server (`Hostwerk.on('action')`).
- **Ändert eine Hostwerk-Einstellung** (`Hostwerk.put('/mc/servers/<id>/properties', { motd })`) mit dem Recht `change:minecraft` – Hostwerk fragt vor jeder Änderung.
- **Reiter zeichnet Hostwerk** (`page.tabs`), Hostwerks eigene Design-Klassen (`card`, `btn primary`, `select` …).

## Funktionen

- Farbknöpfe (§0–§f, jeder mit seinem Namen für Bildschirmleser) und Formate (fett, kursiv, unterstrichen, durchgestrichen, verschleiert §k, zurücksetzen) – fasst eine Auswahl ein
- Vorlagen (Willkommen, Survival, Event, Wartung, Kreativ) und „Zeilen zentrieren“ – gemessen mit den Zeichenbreiten der Minecraft-Schrift
- Live-Vorschau wie die Minecraft-Serverliste
- Server-Symbol: Bild wählen, Ausschnitt vergrößern und verschieben, als PNG mit 64 × 64 Pixeln speichern (`change:minecraft`, fragt vorher)
- Nach dem Speichern bei laufendem Server: „Jetzt neu starten“ (`control:services`, fragt vorher)
- Die Serverliste bleibt live (neue Server, gestartet/gestoppt), ohne dass Getipptes verloren geht
- Prüfung: mehr als 2 Zeilen, abgeschnittene Zeilen, unbekannte Codes
- Tabelle aller Farbcodes
- Fehlerzustand mit „Erneut versuchen“; Abfragen pausieren bei verstecktem Reiter; steht unter „Server“ bei Minecraft; andere Erweiterungen dürfen Reiter ergänzen – etwa einen Reiter für die Bedrock-MOTD aus der Bedrock-Brücke

## Rechte

| Recht | Wofür |
|---|---|
| `read:minecraft` | Server und ihre aktuelle Beschreibung lesen |
| `change:minecraft` | Beschreibung in `server.properties` und das Server-Symbol speichern (fragt vorher) |
| `control:services` | „Jetzt neu starten“ nach dem Speichern (fragt vorher) |

## Entwickeln

Logik in `page/lib.js` (ohne DOM), Abfragen und Fehlerzustand in `page/live.js`, Tests: `node --test tests/*.test.js`. Prüfung: `node check.js . --strict` (Hostwerk-SDK). Das Release packt alles außer dem Repo-Werkzeug.

Lizenz: MIT
