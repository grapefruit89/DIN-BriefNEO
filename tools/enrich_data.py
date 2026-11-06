import json
import sys

ENRICHMENT = {
    "Aquaman": {
        "buergerlicherName": "Arthur Curry",
        "alias": ["König von Atlantis", "Orin", "Meister der Meere"],
        "firma": "Königreich Atlantis / Justice League",
        "strasse": "Königspalast von Atlantis",
        "ort": "Atlantis",
        "franchise": "DC Comics",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Halb Mensch (Arthur Curry), halb Atlanter (Sohn von Königin Atlanna)."
    },
    "Arthur Dent": {
        "buergerlicherName": "Arthur Philip Dent",
        "alias": ["Der Erdenmensch"],
        "firma": "BBC Radio (ehemalig)",
        "strasse": "Country Lane",
        "ort": "Cottington, West Country (Erde / wechselnd)",
        "franchise": "Per Anhalter durch die Galaxis",
        "medium": "Buch",
        "rolle": "Protagonist",
        "hinweis": "Überlebender der zerstörten Erde im Bademantel."
    },
    "Arya Stark": {
        "strasse": "Große Burg von Winterfell",
        "ort": "Winterfell, Der Norden"
    },
    "Ash Ketchum": {
        "strasse": None,
        "ort": "Alabastia, Kanto",
        "geschlecht": "m",
    },
    "Asterix": {
        "buergerlicherName": "Asterix",
        "alias": ["Der kleine Krieger"],
        "firma": "Das gallische Dorf",
        "strasse": "Dorfplatz 1",
        "ort": "Unbeugsames gallisches Dorf (Aremorica)",
        "franchise": "Asterix",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Hüter des Zaubertranks an der Seite von Obelix."
    },
    "Batgirl": {
        "buergerlicherName": "Barbara Gordon",
        "alias": ["Oracle", "Babs"],
        "firma": "Gotham City Public Library / Birds of Prey",
        "strasse": "Clocktower Plaza 1",
        "ort": "Gotham City",
        "franchise": "DC Comics",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Tochter von Commissioner Jim Gordon, operiert als Batgirl und später als Oracle."
    },
    "Batman": {
        "strasse": "Wayne Manor",
        "ort": "Gotham City"
    },
    "Bienlein": {
        "buergerlicherName": "Tryphon Tournesol (Prof. Bienlein)",
        "alias": ["Professor Tournesol"],
        "firma": "Schloss Mühlenhof Laboratorium",
        "strasse": "Schloss Mühlenhof 1",
        "ort": "Moulinsart (Belgien)",
        "franchise": "Tim und Struppi",
        "medium": "Comic",
        "rolle": "Support",
        "hinweis": "Schwerhöriger, genialer Erfinder von Haifisch-U-Boot und Mondrakete."
    },
    "Bilbo Beutlin": {
        "buergerlicherName": "Bilbo Beutlin",
        "alias": ["Meisterdieb", "Finder des Rings"],
        "firma": "Freier Bürger des Auenlands",
        "strasse": "Beutelsend 1 (Bag End)",
        "ort": "Hobbingen, Auenland",
        "franchise": "Der Herr der Ringe",
        "medium": "Buch",
        "rolle": "Protagonist",
        "hinweis": "Onkel von Frodo Beutlin, Verfasser von 'Hin und zurück'."
    },
    "Black Widow": {
        "buergerlicherName": "Natasha Romanoff (Natalia Alianovna Romanova)",
        "alias": ["Schwarze Witwe", "Natalie Rushman"],
        "firma": "Avengers / S.H.I.E.L.D. (ehemalig KGB)",
        "strasse": "Avengers Compound",
        "ort": "Upstate New York",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Ehemalige sowjetische Spionin, Meisterin der Kampfkunst und Taktik."
    },
    "Charlie Bucket": {
        "geschlecht": "m"
    },
    "Captain America": {
        "buergerlicherName": "Steven Grant Rogers",
        "alias": ["Cap", "Der erste Rächer", "The Sentinel of Liberty"],
        "firma": "Avengers / US Army (Reservist)",
        "strasse": "569 Leaman Place",
        "ort": "Brooklyn, New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Supersoldat aus dem Zweiten Weltkrieg, Anführer der Avengers."
    },
    "Chewbacca": {
        "buergerlicherName": "Chewbacca",
        "alias": ["Chewie"],
        "firma": "Rebellenallianz / Millennium Falcon",
        "strasse": "Kashyyyk Baumstadt / Millennium Falcon",
        "ort": "Kashyyyk",
        "franchise": "Star Wars",
        "medium": "Film",
        "rolle": "Protagonist",
        "hinweis": "Wookiee-Krieger und loyaler Co-Pilot von Han Solo."
    },
    "Daenerys Targaryen": {
        "strasse": "Große Pyramide von Meereen / Drachenstein Festung",
        "ort": "Drachenstein"
    },
    "Dagobert Duck": {
        "buergerlicherName": "Scrooge McDuck (Dagobert Duck)",
        "alias": ["Reichste Ente der Welt", "Der Fantastilliardär"],
        "firma": "Duck Enterprises / Geldtransport AG",
        "strasse": "Killmotor Hill (Auf dem Geldspeicher)",
        "ort": "Entenhausen",
        "franchise": "Entenhausen (Disney)",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Schwimmt im Geld; Glückszehner ist sein größter Schatz."
    },
    "Daniel Düsentrieb": {
        "buergerlicherName": "Daniel Düsentrieb (Gyro Gearloose)",
        "alias": ["Der geniale Ingenieur"],
        "firma": "Erfinder-Werkstatt Düsentrieb",
        "strasse": "Erfinderweg 1",
        "ort": "Entenhausen",
        "franchise": "Entenhausen (Disney)",
        "medium": "Comic",
        "rolle": "Support",
        "hinweis": "Erfinder von Helferlein und Phantomias-Ausrüstung. Motto: 'Dem Ingeniör ist nichts zu schwör'."
    },
    "Daredevil": {
        "buergerlicherName": "Matthew Michael Murdock",
        "alias": ["Der Mann ohne Furcht", "Teufel von Hell's Kitchen"],
        "firma": "Nelson & Murdock (Kanzlei)",
        "strasse": "463 8th Avenue",
        "ort": "Hell's Kitchen, New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Erblindeter Anwalt mit geschärften Radarsinnen."
    },
    "Darth Vader": {
        "strasse": "Vader-Festung",
        "ort": "Mustafar"
    },
    "Doctor Strange": {
        "buergerlicherName": "Stephen Vincent Strange",
        "alias": ["Sorcerer Supreme", "Meister der mystischen Künste"],
        "firma": "Sanctum Sanctorum / Masters of the Mystic Arts",
        "strasse": "177A Bleecker Street",
        "ort": "Greenwich Village, New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Ehemaliger Neurochirurg, Oberster Zauberer der Erde."
    },
    "Emil Tischbein": {
        "geschlecht": "m"
    },
    "Eleven": {
        "strasse": "Byers Residenz / Hopper Hütte",
        "ort": "Hawkins, Indiana"
    },
    "Ellen Ripley": {
        "strasse": "USCSS Nostromo / Weyland-Yutani Dock",
        "ort": "Gateway Station"
    },
    "Frodo Beutlin": {
        "firma": "Die Gefährten des Rings",
        "strasse": "Beutelsend 1",
        "ort": "Hobbingen, Auenland"
    },
    "Gandalf": {
        "buergerlicherName": "Olórin",
        "strasse": "Wandernder Pfad",
        "ort": "Mittelerde (wandernd)"
    },
    "Geralt von Riva": {
        "buergerlicherName": "Geralt",
        "firma": "Hexerschule des Wolfes",
        "strasse": "Festung Kaer Morhen",
        "ort": "Kaer Morhen"
    },
    "Green Arrow": {
        "buergerlicherName": "Oliver Jonas Queen",
        "alias": ["Der Bogenschütze von Star City", "Ollie"],
        "firma": "Queen Industries / Team Arrow",
        "strasse": "Queen Manor",
        "ort": "Star City",
        "franchise": "DC Comics",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Milliardär und meisterhafter Bogenschütze mit Trickpfeilen.",
        "geschlecht": "m",
    },
    "Green Lantern": {
        "buergerlicherName": "Harold 'Hal' Jordan",
        "alias": ["Der Smaragdritter", "Emerald Knight", "Green Lantern Sektor 2814"],
        "firma": "Green Lantern Corps / Ferris Aircraft",
        "strasse": "Ferris Aircraft Hangar 3",
        "ort": "Coast City",
        "franchise": "DC Comics",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Testpilot, Träger des mächtigsten Rings im Universum (grüne Willenskraft)."
    },
    "Hank Schrader": {
        "geschlecht": "m"
    },
    "Handy Schlumpf": {
        "buergerlicherName": "Handy Schlumpf",
        "alias": ["Bastelschlumpf", "Erfinderschnitt"],
        "firma": "Schlumpfhausen Bau & Handwerk",
        "strasse": "Pilzhaus Nr. 7",
        "ort": "Schlumpfhausen (Verwunschenes Land)",
        "franchise": "Die Schlümpfe",
        "medium": "Comic",
        "rolle": "Support",
        "hinweis": "Trägt Latzhose und Bleistift hinterm Ohr; repariert das Dorf."
    },
    "Hannibal Lecter": {
        "firma": "Psychiatrische Privatpraxis Lecter",
        "strasse": "Chandler Street 12",
        "ort": "Baltimore, Maryland"
    },
    "Harry Potter": {
        "strasse": "Ligusterweg 4",
        "ort": "Little Whinging, Surrey",
        "geschlecht": "m",
    },
    "Hawkeye": {
        "buergerlicherName": "Clinton Francis Barton",
        "alias": ["Ronin", "Bester Schütze der Welt"],
        "firma": "Avengers / S.H.I.E.L.D.",
        "strasse": "Barton Farm",
        "ort": "Waverly, Iowa",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Meisterschütze ohne Superkräfte, loyalster Team-Rückhalt."
    },
    "Hermine Granger": {
        "strasse": "Granger Dentalpraxis & Residenz",
        "ort": "London, England"
    },
    "Homer Simpson": {
        "strasse": "742 Evergreen Terrace",
        "ort": "Springfield, OR 97477"
    },
    "Hulk": {
        "buergerlicherName": "Robert Bruce Banner",
        "alias": ["Der unglaubliche Hulk", "Der grüne Goliath", "Professor Hulk"],
        "firma": "Avengers / Culver University (ehem.)",
        "strasse": "Stark Tower Labor / wechselnd",
        "ort": "New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Genialer Nuklearphysiker mit Wut-induzierter Transformation."
    },
    "Human Torch": {
        "buergerlicherName": "Jonathan Lowell Spencer Storm",
        "alias": ["Die menschliche Fackel", "Johnny Storm"],
        "firma": "Fantastic Four / Baxter Foundation",
        "strasse": "Baxter Building, 42nd St & Madison Ave",
        "ort": "New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Ruft 'Flamme an!' (Flame on!). Bruder von Susan Storm."
    },
    "Invisible Woman": {
        "buergerlicherName": "Susan Storm Richards",
        "alias": ["Die Unsichtbare", "Sue Storm"],
        "firma": "Fantastic Four / Baxter Foundation",
        "strasse": "Baxter Building, 42nd St & Madison Ave",
        "ort": "New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Ehefrau von Reed Richards, beherrscht Kraftfelder und Unsichtbarkeit."
    },
    "Iron Fist": {
        "buergerlicherName": "Daniel Thomas Rand-K'ai",
        "alias": ["Die unsterbliche eiserne Faust", "Danny Rand"],
        "firma": "Rand Enterprises / Heroes for Hire",
        "strasse": "Rand Tower, 485 Lexington Avenue",
        "ort": "New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Gelehrt in der mystischen Stadt K'un-Lun; bündelt Chi in seinen Fäusten."
    },
    "Iron Man": {
        "buergerlicherName": "Anthony Edward Stark",
        "alias": ["Tony Stark", "Der gepanzerte Rächer"],
        "firma": "Stark Industries / Avengers",
        "strasse": "10880 Wilshire Boulevard / Stark Tower",
        "ort": "Malibu / New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Genie, Milliardär, Playboy, Philanthrop.",
        "geschlecht": "m",
    },
    "Jean-Luc Picard": {
        "strasse": "Château Picard",
        "ort": "La Barre, Frankreich"
    },
    "Jessica Jones": {
        "buergerlicherName": "Jessica Campbell Jones-Cage",
        "alias": ["Jewel (ehem.)"],
        "firma": "Alias Investigations",
        "strasse": "463 West 46th Street",
        "ort": "Hell's Kitchen, New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Privatdetektivin mit übermenschlicher Kraft und PTBS."
    },
    "Jon Schnee": {
        "strasse": "Schwarze Festung / Winterfell",
        "ort": "Die Mauer / Winterfell"
    },
    "Kapitän Haddock": {
        "buergerlicherName": "Archibald Haddock",
        "alias": ["Kapitän zur See"],
        "firma": "Handelsmarine / Schloss Mühlenhof",
        "strasse": "Schloss Mühlenhof 1",
        "ort": "Moulinsart (Belgien)",
        "franchise": "Tim und Struppi",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Berühmt für Flüche ('Hunderttausend heulende Höllenhunde!') und Loch-Lomond-Whisky."
    },
    "Katniss Everdeen": {
        "firma": "Distrikt 12 Aufstand",
        "strasse": "Dorf der Sieger",
        "ort": "Distrikt 12, Panem",
        "geschlecht": "w",
    },
    "Krachbumm-Ente (Gizmoduck)": {
        "buergerlicherName": "Fenton Crackshell-Cabrera",
        "alias": ["Gizmoduck", "Robo-Ente"],
        "firma": "Duck Enterprises (Buchhaltung)",
        "strasse": "Wohnwagensiedlung Entenhausen",
        "ort": "Entenhausen",
        "franchise": "Entenhausen (Disney)",
        "medium": "Cartoon",
        "rolle": "Protagonist",
        "hinweis": "Aktiviert den Exo-Anzug mit dem Codewort 'Zählappell!' (Blathering Blatherskite!)."
    },
    "Lara Croft": {
        "firma": "Croft Holdings / Archäologie",
        "strasse": "Croft Manor",
        "ort": "Abinger, Surrey, England"
    },
    "Legolas": {
        "strasse": "Palast des Waldland-Reichs",
        "ort": "Düsterwald (Eryn Lasgalen)"
    },
    "Link": {
        "buergerlicherName": "Link",
        "alias": ["Held der Zeit", "Held von Hyrule"],
        "firma": "Königliche Leibgarde von Schloss Hyrule",
        "strasse": "Hateno-Dorf",
        "ort": "Königreich Hyrule",
        "franchise": "The Legend of Zelda",
        "medium": "Videospiel",
        "rolle": "Protagonist",
        "hinweis": "Träger des Triforce des Mutes und des Master-Schwerts."
    },
    "Luke Cage": {
        "buergerlicherName": "Carl Lucas (Luke Cage)",
        "alias": ["Power Man"],
        "firma": "Heroes for Hire / Pop's Barber Shop",
        "strasse": "Pop's Barber Shop, 119th Street",
        "ort": "Harlem, New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Unzerstörbare Haut und übermenschliche Stärke."
    },
    "Luke Skywalker": {
        "strasse": "Lars Feuchtfarm (ehem.) / Neuer Jedi-Tempel",
        "ort": "Tatooine"
    },
    "Majestix": {
        "buergerlicherName": "Majestix",
        "alias": ["Häuptling des Dorfes"],
        "firma": "Gallischer Häuptlingssitz",
        "strasse": "Häuptlingshütte (auf dem Schild)",
        "ort": "Unbeugsames gallisches Dorf (Aremorica)",
        "franchise": "Asterix",
        "medium": "Comic",
        "rolle": "Support",
        "hinweis": "Hat nur eine Angst: Dass ihm der Himmel auf den Kopf fällt."
    },
    "Mario": {
        "strasse": "Mario Bros. Klempnerbetrieb / Schloss Peach",
        "ort": "Pilz-Königreich"
    },
    "Martian Manhunter": {
        "buergerlicherName": "J'onn J'onzz (John Jones)",
        "alias": ["Der Marsmensch", "Das Herz der Justice League"],
        "firma": "Justice League / Marsianische Garde",
        "strasse": "Justice League Watchtower",
        "ort": "Erdorbit / Metropolis",
        "franchise": "DC Comics",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Letzter Überlebender des Mars, beherrscht Gestaltwandlung und Telepathie. Schwäche: Feuer."
    },
    "Michael Corleone": {
        "alias": ["Der Pate", "Don Corleone"],
        "strasse": "Corleone Compound",
        "ort": "Long Beach, New York"
    },
    "Micky Maus": {
        "alias": ["Detective Micky", "Meisterdetektiv Micky"],
        "strasse": "Mausweg 1",
        "ort": "Entenhausen"
    },
    "Miraculix": {
        "buergerlicherName": "Miraculix",
        "alias": ["Der Druide"],
        "firma": "Gallischer Druidenorden",
        "strasse": "Druidenhütte am Eichenhain",
        "ort": "Unbeugsames gallisches Dorf (Aremorica)",
        "franchise": "Asterix",
        "medium": "Comic",
        "rolle": "Mentor",
        "hinweis": "Brauer des Zaubertranks mit der goldenen Sichel. Schneidet Misteln nur im Eichenhain."
    },
    "Mister Fantastic": {
        "buergerlicherName": "Dr. Reed Richards",
        "alias": ["Mr. Fantastic", "Der klügste Mann der Welt"],
        "firma": "Fantastic Four / Baxter Foundation",
        "strasse": "Baxter Building, 42nd St & Madison Ave",
        "ort": "New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Anführer der Fantastic Four, hyper-elastischer Körper."
    },
    "Monkey D. Ruffy": {
        "strasse": "Thousand Sunny (Flaggschiff)",
        "ort": "Windmühlendorf (Heimat) / Grandline"
    },
    "Naruto Uzumaki": {
        "strasse": "Hokage-Residenz",
        "ort": "Konohagakure (Dorf hinter den Blättern)"
    },
    "Neo": {
        "strasse": "Zion Dock / Nebuchadnezzar",
        "ort": "Zion"
    },
    "Obelix": {
        "buergerlicherName": "Obelix",
        "alias": ["Der Hinkelstein-Lieferant"],
        "firma": "Obelix Hinkelsteine & Wildschweinjagd",
        "strasse": "Steinbruchweg 1",
        "ort": "Unbeugsames gallisches Dorf (Aremorica)",
        "franchise": "Asterix",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Als kleines Kind in den Zaubertranktopf gefallen; hat Dauer-Superkraft. Begleitet von Idefix."
    },
    "Papa Schlumpf": {
        "buergerlicherName": "Papa Schlumpf",
        "alias": ["Der Dorfälteste"],
        "firma": "Schlumpfhausen Dorfleitung & Alchemie",
        "strasse": "Großes Pilzhaus im Zentrum",
        "ort": "Schlumpfhausen (Verwunschenes Land)",
        "franchise": "Die Schlümpfe",
        "medium": "Comic",
        "rolle": "Mentor",
        "hinweis": "Trägt als einziger rote Mütze und weiße Bartpracht; weiser Zauberer und Schutz vor Gargamel."
    },
    "Phantomias": {
        "buergerlicherName": "Donald Fauntleroy Duck",
        "alias": ["Der Rächer von Entenhausen", "Paperinik"],
        "firma": "O.M.A. (Organisation zum weltweiten Kampf gegen Monster)",
        "strasse": "313 Erpelweg (Geheimbunker unter Haus)",
        "ort": "Entenhausen",
        "franchise": "Entenhausen (Disney)",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Donalds nächtliches Superhelden-Alter-Ego mit dem Kennzeichen 313X."
    },
    "Pikachu": {
        "buergerlicherName": "Pikachu",
        "alias": ["Elektro-Maus", "Pokémon #025"],
        "firma": "Team Ash Ketchum / Pokémon-Liga",
        "strasse": "Reist auf Ashs Schulter",
        "ort": "Alabastia, Kanto"
    },
    "Rick Sanchez": {
        "firma": "Sanchez / Smith Garage Labor",
        "strasse": "Smith Residenz Garage",
        "ort": "Seattle, Washington (Dimension C-137)"
    },
    "Robin": {
        "buergerlicherName": "Richard John 'Dick' Grayson",
        "alias": ["Nightwing", "Boy Wonder"],
        "firma": "Teen Titans / Wayne Enterprises / Blüdhaven PD",
        "strasse": "Wayne Manor",
        "ort": "Gotham City / Blüdhaven",
        "franchise": "DC Comics",
        "medium": "Comic",
        "rolle": "Sidekick",
        "hinweis": "Erster Robin, wuchs bei Bruce Wayne auf und wurde später eigenständiger Held Nightwing."
    },
    "Sarah Connor": {
        "firma": "Menschlicher Widerstand gegen Cyberdyne Systems",
        "strasse": "Untergrund-Safehouse",
        "ort": "Los Angeles, Kalifornien"
    },
    "Schlumpfine": {
        "buergerlicherName": "Schlumpfine (Sassette)",
        "alias": ["Die Blonde Schlumpfine"],
        "firma": "Schlumpfhausen",
        "strasse": "Blumenpilz Nr. 3",
        "ort": "Schlumpfhausen (Verwunschenes Land)",
        "franchise": "Die Schlümpfe",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Einst von Gargamel geschaffen, durch Papa Schlumpfs Zauber erlöst."
    },
    "Schulze & Schultze": {
        "buergerlicherName": "Schulze und Schultze (Dupont et Dupond)",
        "alias": ["Die Zwillings-Detektive"],
        "firma": "Königliche Kriminalpolizei Brüssel",
        "strasse": "Polizeidirektion Brüssel",
        "ort": "Brüssel (Belgien)",
        "franchise": "Tim und Struppi",
        "medium": "Comic",
        "rolle": "Support",
        "hinweis": "Unterscheidbar nur am Schnurrbart: Schulze (Dupont) hat gezwirbelte Enden, Schultze gerade."
    },
    "Sherlock Holmes": {
        "buergerlicherName": "William Sherlock Scott Holmes",
        "alias": ["Meisterdetektiv"],
        "firma": "Beratender Detektiv (Privatkanzlei)",
        "strasse": "221B Baker Street",
        "ort": "NW1 6XE London",
        "franchise": "Sherlock Holmes",
        "medium": "Buch",
        "rolle": "Protagonist",
        "hinweis": "Wohnte mit Dr. John Watson bei Mrs. Hudson."
    },
    "Son-Goku": {
        "strasse": None,
        "ort": "Ost-Distrikt 439"
    },
    "Spider-Man": {
        "strasse": "20 Ingram Street (Forest Hills)",
        "ort": "Queens, New York City"
    },
    "Spock": {
        "strasse": "Sternenflotte Sternenbasis 1 / USS Enterprise NCC-1701",
        "ort": "ShiKahr, Vulkan"
    },
    "Superman": {
        "buergerlicherName": "Clark Joseph Kent (Kal-El)",
        "alias": ["Mann aus Stahl", "Man of Steel", "Der letzte Sohn von Krypton"],
        "firma": "Daily Planet (Metropolis)",
        "strasse": "Clinton Street 344",
        "ort": "Metropolis",
        "franchise": "DC Comics",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Geboren als Kal-El auf Krypton, aufgewachsen bei Jonathan und Martha Kent in Smallville.",
        "geschlecht": "m",
    },
    "The Flash (Barry Allen)": {
        "buergerlicherName": "Bartholomew Henry 'Barry' Allen",
        "alias": ["Der schnellste Mensch der Welt", "The Scarlet Speedster"],
        "firma": "Central City Police Department (Kriminaltechnik)",
        "strasse": "CCPD Forensics Lab, 4th Street",
        "ort": "Central City",
        "franchise": "DC Comics",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Verbindet sich mit der Speed Force nach Blitzschlag mit Chemikalien."
    },
    "The Joker": {
        "strasse": None
    },
    "The Thing": {
        "buergerlicherName": "Benjamin Jacob Grimm",
        "alias": ["Das Ding", "Der blaue Augenbrocken aus der Yancy Street"],
        "firma": "Fantastic Four / Baxter Foundation",
        "strasse": "Baxter Building, 42nd St & Madison Ave",
        "ort": "New York City",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Kampfruf: 'Jetzt geht's rund!' (It's clobberin' time!). Körper aus lebendem Stein."
    },
    "Thor": {
        "buergerlicherName": "Thor Odinson",
        "alias": ["Gott des Donners", "Herr von Mjölnir"],
        "firma": "Königreich Asgard / Avengers",
        "strasse": "Palast von Valaskjalf",
        "ort": "Asgard (Reich der Götter)",
        "franchise": "Marvel",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Sohn Odins, Hüter von Mjölnir und Herrscher über Blitze und Sturm."
    },
    "Tim": {
        "buergerlicherName": "Tim (Tintin)",
        "alias": ["Der junge Reporter"],
        "firma": "Zeitung 'Le Petit Vingtième' / Schloss Mühlenhof",
        "strasse": "Labradorstraße 26 (später Schloss Mühlenhof)",
        "ort": "Brüssel (Belgien)",
        "franchise": "Tim und Struppi",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Furchtloser investigativer Journalist, immer begleitet von Foxterrier Struppi."
    },
    "Tony Soprano": {
        "strasse": "14 Aspen Drive",
        "ort": "North Caldwell, NJ 07006"
    },
    "Troubadix": {
        "buergerlicherName": "Troubadix",
        "alias": ["Der Barde"],
        "firma": "Gallischer Bardensitz",
        "strasse": "Baumhütte am Dorfrand",
        "ort": "Unbeugsames gallisches Dorf (Aremorica)",
        "franchise": "Asterix",
        "medium": "Comic",
        "rolle": "Support",
        "hinweis": "Singt schrecklich und wird beim Festbankett traditionell gefesselt und geknebelt."
    },
    "Waylon Smithers": {
        "geschlecht": "m"
    },
    "Walter White": {
        "strasse": "308 Negra Arroyo Lane",
        "ort": "Albuquerque, NM 87104"
    },
    "Wonder Woman": {
        "buergerlicherName": "Diana Prince (Prinzessin Diana von Themyscira)",
        "alias": ["Prinzessin der Amazonen", "Göttin der Wahrheit"],
        "firma": "Themyscira / Louvre / Justice League",
        "strasse": "Amazonenpalast / Botschaft von Themyscira",
        "ort": "Themyscira / Washington D.C.",
        "franchise": "DC Comics",
        "medium": "Comic",
        "rolle": "Protagonist",
        "hinweis": "Tochter von Königin Hippolyta, bewaffnet mit dem Lasso der Wahrheit und unzerstörbaren Armreifen."
    },
    "Yoda": {
        "buergerlicherName": "Yoda",
        "alias": ["Großmeister des Jedi-Ordens"],
        "firma": "Hoher Rat der Jedi / Jedi-Orden",
        "strasse": "Jedi-Tempel (Coruscant) / Sumpfhütte (Dagobah)",
        "ort": "Coruscant / Dagobah",
        "franchise": "Star Wars",
        "medium": "Film",
        "rolle": "Mentor",
        "hinweis": "900 Jahre alter legendärer Jedi-Meister mit unverwechselbarer Satzstellung."
    }
}

STANDARD_ZIEL = '/home/moritz/repos/DIN-BriefNEO/website/addons/testbrief/charactere.json'
# Optionaler Zielpfad fuer Trockenlaeufe: python3 tools/enrich_data.py /tmp/kopie.json
file_path = sys.argv[1] if len(sys.argv) > 1 else STANDARD_ZIEL
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

count_updated = 0
for fig in data['figuren']:
    name = fig['name']
    if name in ENRICHMENT:
        patch = ENRICHMENT[name]
        for k, v in patch.items():
            if k == 'alias':
                # Alias ist eine Sammlung, kein Einzelwert: das Enrichment
                # ergaenzt, es ersetzt nicht. Sonst loescht ein Lauf alle
                # Aliasse, die aus anderen Quellen dazugekommen sind.
                vorhanden = fig.get('alias') or []
                for eintrag in v or []:
                    if eintrag not in vorhanden:
                        vorhanden.append(eintrag)
                fig['alias'] = vorhanden
            else:
                fig[k] = v
        count_updated += 1
    # Fehlende Strasse bleibt fehlend (null-Konvention der Pipeline).
    # Kein Platzhalter: eine erfundene Anschrift ist schlechter als keine.
    fig.setdefault('strasse', None)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Erfolgreich {count_updated} Figuren angereichert und in {file_path} gespeichert.")
