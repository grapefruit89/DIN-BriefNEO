#!/usr/bin/env python3
"""
tools/agent_gateway.py — Lokales WebMCP-Gateway für DIN-BriefNEO.

Verbindet die lokale Bash / Antigravity / OpenCode direkt mit dem
geöffneten Browser-Tab (Helium/Chrome) auf ws://127.0.0.1:8333.
Keine Browser-Erweiterung und kein Debug-Port nötig.
"""

import asyncio
import json
import sys
import uuid
import websockets

CONNECTED_CLIENTS = set()

DEMO_BRIEF = {
    "betreff": "Kündigung des Abonnements via Antigravity WebMCP",
    "anrede": "Sehr geehrte Damen und Herren,",
    "text": (
        "hiermit kündige ich meinen bestehenden Vertrag fristgerecht zum nächstmöglichen Termin.\n\n"
        "Bitte senden Sie mir eine schriftliche Bestätigung über das Vertragsende sowie den "
        "Beendigungszeitpunkt zu.\n\n"
        "Mit freundlichen Grüßen,\n"
        "Antigravity Agent"
    ),
    "grussformel": "Mit freundlichen Grüßen",
    "unterschrift": "Moritz",
    "empfaenger": {
        "firma": "Musterfirma GmbH",
        "name": "Kundenservice",
        "strasse": "Hauptstraße 42",
        "ort": "53111 Bonn"
    },
    "absender": {
        "name": "Moritz",
        "strasse": "Musterweg 1",
        "ort": "53113 Bonn"
    }
}


async def send_letter(websocket, data=None):
    payload_data = data or DEMO_BRIEF
    payload = {
        "action": "execute_tool",
        "name": "fill_din_letter",
        "callId": str(uuid.uuid4()),
        "arguments": payload_data,
    }
    print("[Bash-Agent] -> Sende Briefdaten an das WebMCP-Tool im Browser...")
    await websocket.send(json.dumps(payload))


async def handler(websocket):
    CONNECTED_CLIENTS.add(websocket)
    remote = websocket.remote_address
    print(f"\n[Bash-Agent] *** Helium-Tab hat angedockt! ({remote}) ***")
    try:
        async for message in websocket:
            data = json.loads(message)

            if data.get("type") == "REGISTERED_TOOLS":
                print("\n--- Verfügbare WebMCP-Tools im Browser ---")
                for tool in data.get("tools", []):
                    name = tool.get("name", "unbekannt")
                    desc = tool.get("description", "")
                    print(f"  * Werkzeug: {name} — {desc}")
                print("------------------------------------------\n")

                # Automatische Befüllung beim ersten Andocken (Demo-Trigger)
                if "--no-auto" not in sys.argv:
                    await asyncio.sleep(0.5)
                    await send_letter(websocket)

            elif data.get("type") == "TOOL_RESULT":
                print(f"[Bash-Agent] <- Feedback vom Browser: {data.get('result')}")
                print("[Bash-Agent] *** Erfolg: DIN-BriefNEO wurde im Tab befüllt! ***\n")

    except websockets.ConnectionClosed:
        print(f"[Bash-Agent] Verbindung zum Browser-Tab beendet ({remote}).")
    finally:
        CONNECTED_CLIENTS.discard(websocket)


async def main():
    port = 8333
    host = "127.0.0.1"
    print(f"[Bash-Agent] Starte lokalen WebMCP-Server auf ws://{host}:{port} ...")
    print("[Bash-Agent] Warte auf geöffneten DIN-BriefNEO-Tab in Helium...\n")

    async with websockets.serve(handler, host, port):
        await asyncio.Future()  # läuft dauerhaft


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Bash-Agent] Gateway beendet.")
