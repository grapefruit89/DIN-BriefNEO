---
id: SPEC-045
title: Rich Metadata & vCard QR
tags: [specification, din-5008, platin]
status: cemented
weight: 75
criticality: MEDIUM
created: 2026-03-20
---
# Feature Specification: Rich Metadata & vCard QR


## ?? Brain-First Alignment *(mandatory)*
- **Traceability ID**: `[DIN-FEAT-RICHMETA]`
- **Requirement**: Erweiterung der Profildaten um rechtliche Pflichtangaben und digitale Kontaktwege.
- **Rationale**: Ein "Platinum" Brief-Generator muss auch die Anforderungen an Geschftsbriefe (§ 80 AktG, § 35a GmbHG) perfekt abbilden.

---

## ?? Requirements *(mandatory)*

### FR-001: The vCard QR-Generator
- **Was**: Ein optionaler QR-Code im Brief (z.B. im Infoblock oder Fu), der die Kontaktdaten des Absenders im vCard-Format (RFC 6350) enthlt.
- **Logik**: Das System MUST das JSON-Profil des Absenders automatisch in eine vCard-String wandeln und daraus ein SVG-QR-Code generieren.
- **Nutzen**: Der Empfnger scannt den Brief und hat sofort alle Kontaktdaten im Handy.

### FR-002: Legal Footer Grid (3-Column)
- **Was**: Ein hochgradig strukturiertes Raster fr den Fuzeilenbereich.
- **Zusammensetzung**: Das System MUST folgende Datenfelder im Fu untersttzen:
    - **Reihe 1**: Postanschrift | Steuer-Daten (St.-Nr., USt-IdNr.) | Register-Daten (Amtsgericht, HRB).
    - **Reihe 2**: Bankverbindungen | Geschftsfhrung / Vorstand | Sitz der Gesellschaft.
- **Styling**: Strikte Einhaltung der **Zero-Scroll Policy** durch Nutzung von Mikrotipografie (7pt - 8pt) im Fu.

### FR-003: Social & Digital Identifiers
- **Was**: Felder fr LinkedIn, GitHub, Website.
- **Visuals**: Optionale Nutzung von dezenten Icons (SPEC-002 SVG Spirit) zur Kennzeichnung dieser Felder im Infoblock.

## Success Criteria *(mandatory)*
- **SC-001**: **Legal Compliance**: Alle notwendigen Pflichtangaben fr eine GmbH oder AG knnen ohne Layout-Bruch im Fu untergebracht werden.
- **SC-002**: **QR-Scanability**: Der generierte QR-Code ist bei einer Druckgre von min. 15mm x 15mm mit Standard-Smartphones lesbar.

