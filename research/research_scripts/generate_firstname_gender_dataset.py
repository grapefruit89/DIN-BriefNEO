"""
Script to build and benchmark the German first-name gender dataset.
Creates research_results/de_vornamen_gender.json and .json.br
"""

import json
import brotli
from pathlib import Path

# Curated list of common German first names (Male & Female)
MALE_NAMES = [
    # Top historical & modern German male names
    "achim", "adalbert", "adam", "adolf", "adrian", "alban", "albert", "albrecht", "alex", "alexander", 
    "alfons", "alfred", "alois", "alwin", "amadeus", "andre", "andreas", "ansgar", "anton", "armin", 
    "arnd", "arndt", "arne", "arno", "arnold", "arnulf", "arthur", "artur", "axel", "balthasar", 
    "bastian", "ben", "benedikt", "benjamin", "benno", "bernd", "bernhard", "bert", "berthold", "bertram", 
    "bodo", "boris", "bruno", "burkhard", "carl", "carsten", "christian", "christof", "christoph", 
    "claus", "clemens", "constantin", "cord", "cornelius", "curt", "dagobert", "damian", "daniel", 
    "danny", "dario", "david", "denis", "dennis", "detlef", "detlev", "dietbold", "dieter", "diethelm", 
    "dietmar", "dietrich", "dirk", "dominic", "dominik", "eberhard", "eckard", "eckart", "eckhard", 
    "eckhardt", "edgar", "edmund", "eduard", "edwin", "egon", "elias", "elmar", "emil", "emilian", 
    "engelbert", "enrico", "eric", "erich", "erik", "ernst", "erwin", "eugen", "ewald", "fabian", 
    "falk", "falko", "felix", "ferdinand", "fiete", "finn", "florian", "frank", "franz", "frederic", 
    "frederik", "friedemann", "frieder", "friedhelm", "friedrich", "frithjof", "fritz", "gabriel", 
    "georg", "gerald", "gerd", "gerhard", "gerhold", "gernot", "gero", "gerolf", "gert", "gerwin", 
    "gilbert", "gino", "giselher", "gottfried", "gotthard", "gotthold", "gottlieb", "gregor", "guenter", 
    "guenther", "guido", "gundolf", "gunnar", "gunter", "gunther", "gustav", "hannes", "hanno", 
    "hans", "hans-dieter", "hans-georg", "hans-joachim", "hans-juergen", "hans-peter", "hansjuergen", 
    "hanspeter", "harald", "hardy", "harm", "hartmut", "hartwig", "hasso", "hauke", "heiko", "heimo", 
    "heiner", "heino", "heinrich", "heinz", "helge", "helmut", "helmuth", "hendrik", "henning", 
    "henrik", "henry", "herbert", "heribert", "hermann", "herwig", "hilmar", "hinrich", "holger", 
    "horst", "hubert", "hubertus", "hugo", "ingo", "ingolf", "jakob", "jan", "jannik", "jens", 
    "joachim", "jochen", "joel", "joerg", "joern", "johann", "johannes", "jonas", "jonathan", 
    "josef", "joseph", "julian", "julius", "juergen", "justus", "kai", "karl", "karl-heinz", 
    "karsten", "kaspar", "kay", "kevin", "kilian", "klaas", "klaus", "klaus-dieter", "klaus-peter", 
    "knut", "konrad", "konstantin", "korbinian", "kurt", "lars", "laurenz", "leander", "lennard", 
    "lennart", "leo", "leon", "leonard", "leonhard", "leopold", "linus", "lorenz", "lothar", 
    "louis", "lucas", "ludger", "ludwig", "luis", "luka", "lukas", "lutz", "maik", "malte", 
    "manfred", "manuel", "marc", "marcel", "marco", "marcus", "mario", "marius", "mark", "marko", 
    "markus", "martin", "marvin", "mathias", "mattes", "matthias", "maurice", "max", "maxim", 
    "maximilian", "meik", "meinolf", "michael", "michel", "milan", "milo", "mirco", "mirko", 
    "moritz", "niklas", "nico", "nicolai", "nicolas", "niels", "nikita", "niklas", "niklaus", 
    "niko", "nikolaus", "nils", "noah", "norbert", "olaf", "oliver", "oscar", "oskar", "oswald", 
    "otmar", "ottmar", "otto", "pascal", "patrick", "paul", "peer", "peter", "philip", "philipp", 
    "pierre", "quirin", "rafael", "raik", "raimund", "rainer", "ralf", "ralph", "ramon", "raphael", 
    "reginald", "reimar", "reimund", "reiner", "reinhard", "reinhold", "reno", "richard", "rico", 
    "robert", "robin", "roderich", "roger", "roland", "rolf", "roman", "ronald", "ronny", "rotger", 
    "rouven", "roy", "ruben", "ruediger", "rudolf", "rudolph", "rupert", "samuel", "sascha", 
    "sebastian", "severin", "siegbert", "siegfried", "siegmar", "siegmund", "silvio", "simon", 
    "soeren", "sonny", "stefan", "steffen", "stephan", "steve", "sven", "swen", "sylvio", "thaddaeus", 
    "thilo", "thomas", "thorsten", "tibor", "tilo", "tim", "timm", "timo", "timon", "timotheus", 
    "tino", "titus", "tobias", "tom", "toni", "tony", "torben", "torsten", "tristan", "udo", 
    "uli", "ulrich", "urban", "urs", "uwe", "valentin", "veit", "viktor", "vincent", "vinzenz", 
    "volker", "volkhard", "volkmar", "waldemar", "walter", "walther", "werner", "wieland", "wilfried", 
    "wilhelm", "willi", "willibald", "willie", "willy", "winfried", "wladimir", "wolf", "wolfgang", 
    "wolfram", "wulf", "yannic", "yannick", "yannik"
]

FEMALE_NAMES = [
    # Top historical & modern German female names
    "adele", "adelheid", "adelina", "adelinde", "adolfine", "adriana", "adriane", "agatha", "agnes", 
    "alessandra", "alexa", "alexandra", "alica", "alice", "alicia", "alida", "alina", "almut", 
    "aloysia", "amalia", "amalie", "amanda", "amelie", "anastasia", "andrea", "aneta", "anette", 
    "angela", "angelica", "angelika", "angelina", "anika", "anita", "anja", "anka", "anke", 
    "ann", "ann-kathrin", "anna", "anna-lena", "anna-maria", "annabell", "annabella", "annabelle", 
    "anneli", "annelie", "anneliese", "annelore", "annemarie", "annette", "anni", "annika", "antje", 
    "antonia", "ariane", "astrid", "auguste", "babette", "baerbel", "barbara", "beata", "beate", 
    "beatrice", "beatrix", "belinda", "benita", "berit", "bernadette", "berthe", "bettina", "bianca", 
    "bianka", "birgid", "birgit", "birgitta", "birte", "bozena", "brigitta", "brigitte", "britta", 
    "brunhild", "brunhilde", "caren", "carina", "carla", "carlotta", "carmen", "carol", "carola", 
    "carolin", "carolina", "caroline", "caterina", "cathrin", "catrin", "cecilia", "celina", "celine", 
    "chanta", "chantal", "charlotte", "chiara", "christa", "christel", "christiana", "christiane", 
    "christin", "christina", "christine", "clara", "claudia", "cleo", "clivia", "constanze", 
    "cordula", "corinna", "cornelia", "cosima", "dagmar", "dana", "daniela", "danuta", "debora", 
    "deborah", "delia", "denise", "desiree", "diana", "dietlind", "dietlinde", "dina", "doerte", 
    "dora", "doris", "dorit", "dorothea", "dorothee", "edda", "edelgard", "edeltraud", "edeltraut", 
    "edith", "elena", "eleonore", "elfriede", "elisa", "elisabeth", "elise", "elke", "ella", 
    "ellen", "elli", "ellinor", "elly", "elsa", "elsbeth", "else", "elvira", "emanuela", "emilia", 
    "emilie", "emily", "emma", "emmy", "erika", "erna", "ernestine", "ester", "esther", "eugenia", 
    "eugenie", "eva", "eva-maria", "evelin", "eveline", "evelyn", "evelyne", "evi", "ewaldine", 
    "fabienne", "fatima", "fee", "felicitas", "fiona", "flora", "florentine", "franca", "franziska", 
    "frauke", "freya", "frida", "frieda", "friederike", "gabi", "gabriele", "gabriella", "gerda", 
    "gerhild", "gerlind", "gerlinde", "gertraud", "gertraude", "gertrud", "gertrude", "gesa", 
    "gesine", "giana", "gisela", "gitta", "gloria", "greta", "gretel", "grete", "gudrun", "gunda", 
    "gundula", "hanna", "hannah", "hannelore", "hatice", "hedwig", "hedi", "heidi", "heidrun", 
    "heike", "helen", "helena", "helene", "helga", "hella", "helma", "henriette", "herma", "hermine", 
    "herta", "hertha", "hilda", "hilde", "hildegard", "hiltrud", "ida", "ilka", "ilona", "ilse", 
    "ina", "ines", "inga", "inge", "ingeborg", "ingrid", "inka", "irena", "irene", "irina", 
    "iris", "irma", "irmgard", "irmhild", "irmtraud", "isabel", "isabell", "isabella", "isabelle", 
    "isolde", "ivonne", "jacqueline", "jana", "janet", "janette", "janin", "janina", "janine", 
    "janna", "jaqueline", "jasmin", "jasmina", "jeanette", "jeannette", "jelena", "jenifer", 
    "jennifer", "jenny", "jessica", "jessika", "joana", "joanna", "johanna", "jolanta", "josefa", 
    "josefina", "josefine", "judith", "julia", "juliana", "juliane", "julie", "jutta", "karen", 
    "karin", "karina", "karla", "karolin", "karolina", "karoline", "katarina", "katharina", 
    "kaethe", "kathleen", "kathrin", "kati", "katja", "katrin", "kerstin", "kirsten", "kirstin", 
    "klara", "klaudia", "konstanze", "kornelia", "kristin", "kristina", "kristine", "lara", 
    "larissa", "laura", "lea", "leah", "lena", "leni", "leonie", "leopoldine", "liane", "lieselotte", 
    "lili", "lilian", "liliana", "lilli", "lilly", "lina", "linda", "lisa", "liselotte", "liv", 
    "loredana", "lore", "lotta", "lotte", "louisa", "louise", "lucia", "lucie", "luisa", "luise", 
    "luna", "luzia", "lydia", "madeleine", "madlen", "magda", "magdalena", "magdalene", "maike", 
    "maja", "manja", "manuela", "mara", "marcelline", "mareen", "mareike", "maren", "marga", 
    "margarete", "margaretha", "margarethe", "margarita", "margit", "margitta", "margot", "margret", 
    "maria", "marianne", "marie", "marie-luise", "marika", "marina", "marion", "marita", "maritta", 
    "marlene", "marlies", "marliese", "marlis", "marta", "martha", "martina", "mary", "mathilde", 
    "maya", "meike", "melanie", "melina", "melissa", "merle", "mia", "michaela", "michelle", 
    "milena", "mira", "miriam", "mirjam", "mona", "monika", "monique", "nadia", "nadine", "nadja", 
    "nastasja", "natalia", "natalie", "natascha", "nathalie", "nele", "nicole", "nina", "nora", 
    "olga", "olivia", "ortrud", "ottilie", "pamela", "paola", "patricia", "patrizia", "paula", 
    "pauline", "peggy", "petra", "pia", "polina", "priska", "rahel", "ramona", "rebecca", "rebekka", 
    "regina", "regine", "renata", "renate", "ricarda", "rita", "roberta", "romana", "romy", 
    "rosa", "rosalie", "rose", "rosemarie", "roswitha", "ruth", "sabina", "sabine", "sabrina", 
    "sandra", "sandy", "sara", "sarah", "saskia", "selina", "selma", "sibylle", "sidonie", 
    "sieglinde", "siegried", "sigrid", "sigrun", "silke", "silva", "silvana", "silvia", "simona", 
    "simone", "sina", "sinah", "smaranda", "sofia", "sofie", "sonia", "sonja", "sophia", "sophie", 
    "stefanie", "steffi", "stella", "stephanie", "susan", "susana", "susann", "susanna", "susanne", 
    "susi", "svantje", "svea", "svenja", "swantje", "swetlana", "sybille", "sylke", "sylvia", 
    "tabea", "tamara", "tanja", "tatjana", "teresa", "theresa", "therese", "tina", "traude", 
    "traudel", "traute", "ute", "valeska", "vanessa", "vera", "verena", "veronika", "victoria", 
    "viktoria", "viola", "vivi", "vivian", "viviane", "vivien", "walburga", "waltraud", "waltraut", 
    "wanda", "wibke", "wiebke", "wilhelmine", "wilma", "yasmin", "yvonne", "zenzi"
]

def build():
    # Deduplicate and sort
    m_set = sorted(list(set(m.lower().strip() for m in MALE_NAMES)))
    f_set = sorted(list(set(f.lower().strip() for f in FEMALE_NAMES)))
    
    # Check for overlaps (unisex)
    unisex = set(m_set).intersection(set(f_set))
    for u in unisex:
        m_set.remove(u)
        f_set.remove(u)
        
    data = {
        "m": m_set,
        "f": f_set,
        "u": sorted(list(unisex))
    }
    
    out_dir = Path(r"C:\Users\morit\Documents\dinbrief-temp\research_results")
    out_dir.mkdir(parents=True, exist_ok=True)
    
    json_path = out_dir / "de_vornamen_gender.json"
    br_path = out_dir / "de_vornamen_gender.json.br"
    
    raw_json = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
    json_path.write_text(raw_json, encoding="utf-8")
    
    compressed = brotli.compress(raw_json.encode("utf-8"), quality=11)
    br_path.write_bytes(compressed)
    
    print(f"Total Names: Male={len(m_set)}, Female={len(f_set)}, Unisex={len(unisex)}")
    print(f"Raw JSON Size: {len(raw_json.encode('utf-8')) / 1024:.2f} KB")
    print(f"Brotli (Q11) Size: {len(compressed) / 1024:.2f} KB ({len(compressed)} Bytes)")

if __name__ == "__main__":
    build()
