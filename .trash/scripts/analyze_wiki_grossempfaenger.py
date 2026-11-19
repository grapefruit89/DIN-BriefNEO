import json
import re

wiki_table_raw = """
| 01303 || ZBI GmbH ||[[Dresden]] ||
| 04160 || [[Fressnapf|Fressnapf Tiernahrungs GmbH]] || [[Leipzig]] ||
| 09107 || [[Technische Universität Chemnitz]] || [[Chemnitz]] ||
| 10026 || [[N26 (Direktbank)|N26 GmbH]] || [[Berlin]] ||
| 10099 || [[Humboldt-Universität zu Berlin]] || [[Berlin]] ||
| 10105 || [[Bethmann Bank|Bethmann Bank AG]] || Berlin ||
| 10705 || ZBI Immobilienmanagement GmbH || Berlin ||
| 10884 || [[Sparda-Bank Berlin]] || Berlin ||
| 10871 || [[Stromnetz Berlin|Stromnetz Berlin GmbH]] || Berlin ||
| 10888 || [[Axel Springer SE]] || Berlin || Verlagsgruppe
| 10889 || [[Berliner Sparkasse]] || Berlin ||
| 10891 || [[Commerzbank|Commerzbank AG]] || Berlin ||
| 11010 || [[Bundespräsidialamt]] || Berlin || [[Informationsverbund Berlin-Bonn]]
| 11011 || [[Deutscher Bundestag]] || Berlin || Informationsverbund Berlin-Bonn
| 11012 || [[Bundeskanzleramt (Berlin)|Bundeskanzleramt]] || Berlin || Informationsverbund Berlin-Bonn
| 11013 || [[Auswärtiges Amt]] || Berlin || Informationsverbund Berlin-Bonn
| 11014 || [[Bundesministerium des Innern]] || Berlin || Informationsverbund Berlin-Bonn
| 11015 || [[Bundesministerium der Justiz]] || Berlin || Informationsverbund Berlin-Bonn
| 11016 || [[Bundesministerium der Finanzen]] || Berlin || Informationsverbund Berlin-Bonn
| 11017 || [[Bundesministerium für Arbeit und Soziales]] || Berlin || Informationsverbund Berlin-Bonn
| 11018 || [[Bundesministerium für Familie, Senioren, Frauen und Jugend]] || Berlin || Informationsverbund Berlin-Bonn
| 11019 || [[Bundesministerium für Wirtschaft und Klimaschutz]] || Berlin || Informationsverbund Berlin-Bonn
| 11055 || [[Bundesrat (Deutschland)|Bundesrat]]|| Berlin ||
| 11512 || [[Versorgungswerk der Presse|Versorgungswerk der Presse GmbH]] || Berlin ||
| 12040 || [[Rathaus Neukölln|Bezirksamt Neukölln von Berlin]] || Berlin|| im Rathaus Neukölln
| 13341 || [[Rathaus Wedding|Bezirksamt Mitte von Berlin]] || Berlin|| im Rathaus Wedding
| 13342 || [[Bayer AG]] || Berlin ||
| 13343 || [[Amtsgericht Wedding]] || Berlin ||
| 15227 || [[Bundesverwaltungsamt]] || [[Frankfurt (Oder)]] ||
| 20083 || Proxalto Service Management GmbH || [[Hamburg]] ||
| 20533 || Real Solution Inkasso GmbH & Co. KG || Hamburg ||
| 21172 || Medico-Lab GmbH || Hamburg ||
| 22603 || [[Reemtsma Cigarettenfabriken|Reemtsma Cigaretten Fabriken GmbH]] || Hamburg ||
| 22743 || [[AstraZeneca|AstraZeneca GmbH]] || Hamburg ||
| 22781 || [[Groupe Yves Rocher|Yves Rocher]] GmbH Finanzbuchhaltung || Hamburg ||
| 22782 ||[[Reemtsma Cigarettenfabriken|Reemtsma Cigaretten GmbH]] || Hamburg ||
| 22783 || [[Postbank|Deutsche Postbank AG]] Niederlassung Hamburg (Giro) || Hamburg ||
| 22792 || [[BAWAG]] || Hamburg || Kundenanschrift u. a. für Easybank
| 24932 || [[Kraftfahrt-Bundesamt]] || [[Flensburg]] ||
| 25742 || Nord-Ostsee Automobile SE & Co. KG || [[Heide (Holstein)|Heide]]
| 26114 || EWE Vertrieb GmbH || [[Oldenburg (Oldb)]] ||
| 28107 || Winit Germany GmbH || [[Bremen]] || Deutschlandlager chinesischer eBay-Verkäufer
| 28109 || [[DeutschlandCard|DeutschlandCard GmbH]] || [[Bremen]] ||
| 30132 || Berufsgenossenschaft Verkehrswirtschaft Post-Logistik, Telekommunikation || [[Hannover]] ||
| 30142 || [[AOK Niedersachsen]] || Hannover ||
| 30621 || Concordia Versicherungen || Hannover ||
| 31131 || Assima hoch2 GmbH || [[Hildesheim]] ||
| 31131 || G5 Getränkefachhandels-Kooperation GmbH & Co. KG || Hildesheim ||
| 31131 || GFT Gemeinschaft Fernmeldetechnik eG || Hildesheim ||
| 31131 || [[Expert SE]] || Hildesheim ||
| 31131 || [[idee+spiel]] Fördergemeinschaft Spielwaren GmbH & Co.KG || Hildesheim ||
| 31131 || [[RTL Group|RTL Group Financial Services GmbH]] || Hildesheim ||
| 31673 || [[Landgericht Bückeburg]] und [[Staatsanwaltschaft Bückeburg]] || [[Bückeburg]] ||
| 31735 || riha WeserGold Getränke GmbH & Co. KG || Rinteln ||
| 31774 || [[Postbank]] – eine Niederlassung der Deutsche Bank AG || [[Hameln]]||
| 32750 || [[Landesamt für Finanzen Nordrhein-Westfalen|Landesamt für Finanzen – Scanstelle]]|| [[Detmold]]||
| 33333 || [[Arvato]] ([[Bertelsmann]]) || [[Gütersloh]]||
| 36028 || Bundesagentur für Arbeit Bad Hersfeld-Fulda || [[Fulda]]||
| 36029 || [[Deutsche Post AG]] Finance & HR Operations Deutschland Personal Direkt || Fulda ||
| 37099 || [[Universitätsmedizin Göttingen]]|| [[Göttingen]]||
| 38436 || [[Volkswagen AG]]|| [[Wolfsburg]]||
| 39157 || [[Bundesagentur für Arbeit]] – Zentrale Kindergeld-Service (ZKGS) || [[Magdeburg]]||
| 40192 || [[Landesamt für Besoldung und Versorgung Nordrhein-Westfalen]]|| [[Düsseldorf]]||
| 40206 || 1N Telecom GmbH || Düsseldorf ||
| 40302 || [[Landesamt für Finanzen Nordrhein-Westfalen]]|| Düsseldorf ||
| 40340 || Landesamt für Besoldung und Versorgung Nordrhein-Westfalen || Düsseldorf ||
| 40463 || [[Deutsche Glasfaser Holding|Deutsche Glasfaser Holding GmbH]]|| Düsseldorf ||
| 42648 || [[Finanzamt Solingen]]|| [[Solingen]]||
| 44128 || [[Hochschulstart]]|| [[Dortmund]]||
| 45091 || [[Deutsche Rentenversicherung Knappschaft-Bahn-See]]|| [[Essen]]||
| 45102 || Deutsche Rentenversicherung Knappschaft-Bahn-See || Essen ||
| 46322 || [[IKK classic]]|| [[Borken]]||
| 48108 || [[Landwirtschaftskammer Nordrhein-Westfalen]] Institutszentrum || [[Münster]]||
| 50399 || Großannahmestelle BZ Köln West || [[Köln]]||
| 50427 || [[Zurich Gruppe Deutschland|Zurich Service GmbH]]|| Köln ||
| 50600 || [[Westdeutscher Rundfunk Köln]]|| Köln ||
| 50606 || [[Bezirksregierung Köln]]|| Köln ||
| 50656 || [[ARD ZDF Deutschlandradio Beitragsservice]]|| Köln ||
| 51777 || Christkind || [[Engelskirchen]] || Weihnachtspostamt
| 52097 || [[DocMorris|Apotheke Docmorris]] (medpex) || Aachen ||
| 53094 || [[Bundesamt für Justiz (Deutschland)|Bundesamt für Justiz]]|| [[Bonn]]||
| 55100 || [[Zweites Deutsches Fernsehen]] || [[Mainz]] ||
| 59495 || [[Kreis Soest]] || [[Soest]]
| 60054 || [[Campus Bockenheim]] der [[Johann Wolfgang Goethe-Universität Frankfurt am Main]] || [[Frankfurt am Main]] ||
| 60256 || [[Amtsgericht Frankfurt am Main]] || Frankfurt am Main ||
| 60306 || [[Opernturm]] || Frankfurt am Main ||
| 60308 || [[Messeturm (Frankfurt am Main)|Messeturm]] || Frankfurt am Main ||
| 60600 || [[The Squaire]] || Frankfurt am Main ||
| 60615 || DIP New Holding GmbH || Frankfurt am Main ||
| 60647 || [[DB Fernverkehr AG]] || Frankfurt am Main || Servicecenter Fahrgastrechte
| 63441 || [[Deutsche Bank|Deutsche Bank AG]] || [[Hanau]] ||
| 65217 || Ager Lebensversicherung AG || [[Wiesbaden]] ||
| 65473 || büroshop24 GmbH || [[Bischofsheim (Mainspitze)|Bischofsheim]] ||
| 65926 || [[Industriepark Höchst]] || Frankfurt am Main ||
| 66100 || [[Saarländischer Rundfunk]] || [[Saarbrücken]] ||
| 66950 || [[Finanzamt Pirmasens]] || [[Pirmasens]] ||
| 67056 || [[BASF]] || [[Ludwigshafen am Rhein]] ||
| 69178 || HEIDELBERG MATERIALS || Heidelberg ||
| 70464 || [[Robert Bosch GmbH]] || [[Stuttgart]] ||
| 70547 || S-Communication Service GmbH || Stuttgart ||
| 70644 || [[Postbeamtenkrankenkasse]] || Stuttgart ||
| 70732 || [[Statistisches Landesamt Baden-Württemberg]] || [[Fellbach]] ||
| 70801 || [[Wüstenrot & Württembergische|Wüstenrot & Württembergische AG]] || [[Kornwestheim]] ||
| 72781 || Verlag Das Beste GmbH Reader’s Digest Deutschland || [[Reutlingen]] ||
| 73314 || Färber-Baier Group GmbH || [[Geislingen an der Steige]] ||
| 74587 || eleven teamsports GmbH ||[[Crailsheim]] ||
| 74588 || eleven teamsports GmbH || [[Satteldorf]] ||
| 76150 || Stadt Karlsruhe – Tiefbauamt || [[Karlsruhe]] ||
| 77644 || DKNO GmbH || [[Offenburg]] ||
| 80248 || [[DeutschlandCard|DeutschlandCard GmbH]] || [[München]] ||
| 80313 || [[Stadtverwaltung München|Stadt München]] || München ||
| 80316 || [[Landgericht München I]] || München ||
| 80320 || [[Landgericht München II]] || München ||
| 80682 || [[Kantar Group|Kantar Deutschland GmbH]] || München ||
| 80788 || [[BMW]] || München ||
| 80791 || Kommunale Unfallversicherung Bayern || München ||
| 81355 || [[ADAC]] Service GmbH Assistance Regulierung || München ||
| 81356 || ADAC Versicherung AG Assistance Regulierung || München ||
| 81359 || ADAC e. V. Schadenregulierung || München ||
| 81363 || ADAC Autoversicherung AG || München ||
| 81655 || [[Serviceplan Group|Serviceplan Gruppe SE & Co. KG]] || München ||
| 82030 || Wealthcap Kapitalverwaltungsgesellschaft mbH || [[Grünwald]] ||
| 84018 || [[Agentur für Arbeit]] || [[Landshut]] ||
| 84024 || [[Deutsche Rentenversicherung Bayern Süd]] || [[Landshut]] ||
| 85350 || Stadt Freising || [[Freising]] ||
| 89516 || [[Voith (Unternehmen)|Voith]] || [[Heidenheim an der Brenz]] ||
| 90317 || [[BNP Paribas]] S.A. Niederlassung Deutschland || [[Nürnberg]] ||
| 90318 || [[Consorsbank]] || Nürnberg ||
| 90319 || [[GfK Aktiengesellschaft|GfK]] || Nürnberg ||
| 90332 || Nürnberger Bau-Gruppe Liegenschaften GmbH & Co KG || Nürnberg ||
| 90358 || [[Bundesagentur für Arbeit]] – Kindergeld-Service (ZKGS) || Nürnberg ||
| 91048 || ZBI GmbH || [[Erlangen]] ||
| 96035 || AMN Data Solutions GmbH || [[Bamberg]] ||
| 96435 || [[HUK-Coburg]] || [[Coburg]] ||
| 96444 || [[HUK-Coburg]] || [[Coburg]] ||
"""

def clean_wiki(s):
    s = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', s)
    return s.strip()

parsed_wiki = {}
for line in wiki_table_raw.strip().splitlines():
    line = line.strip()
    if not line.startswith('|'):
        continue
    parts = [p.strip() for p in line.split('||')]
    if len(parts) >= 3:
        plz_raw = parts[0].lstrip('|').strip()
        name_raw = clean_wiki(parts[1])
        city_raw = clean_wiki(parts[2])
        notes = clean_wiki(parts[3]) if len(parts) > 3 else ""
        
        # Could be comma separated PLZ like "96435, 96444"
        for plz in plz_raw.split(','):
            plz = plz.strip()
            if re.match(r'^\d{5}$', plz):
                if plz not in parsed_wiki:
                    parsed_wiki[plz] = []
                parsed_wiki[plz].append({
                    'name': name_raw,
                    'city': city_raw,
                    'notes': notes
                })

print(f"Parsed {len(parsed_wiki)} distinct PLZs from Wikipedia.")

# Check how many are in existing de_grosskunden_plz.json
existing_path = r"C:\Users\morit\Documents\dinbrief-temp\research_results\de_grosskunden_plz.json"
with open(existing_path, "r", encoding="utf-8") as f:
    existing = json.load(f)

matched = 0
missing = 0
for plz, entries in parsed_wiki.items():
    if plz in existing:
        matched += 1
    else:
        missing += 1

print(f"Matched in existing: {matched} / {len(parsed_wiki)}")
print(f"Missing in existing: {missing} / {len(parsed_wiki)}")

# Grouped PLZs (1:n) in Wikipedia
grouped = {plz: entries for plz, entries in parsed_wiki.items() if len(entries) > 1}
print(f"Grouped PLZs with multiple companies in Wikipedia: {len(grouped)}")
for plz, entries in grouped.items():
    names = [e['name'] for e in entries]
    print(f"  PLZ {plz}: {', '.join(names)}")
