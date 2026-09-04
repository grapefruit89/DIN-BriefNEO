// @ts-check
// @adr [[ADR-JS]] {SalutationEngine}
// 80/20 Pure B2B Salutation & Closing Engine for DIN-Brief Neo
// Focus: Clean B2B correspondence without exotic edge-case bloat.
// Principles:
// 1. 80/20 Rule: 3 crisp styles (Förmlich, Höflich, Locker) with matched salutation + closing pairs.
// 2. No Bloat: No "Hochachtungsvoll" or exotic edge cases.
// 3. ContentEditable-First: Any manual user edit locks the field (dirty flag).
// 4. In-flight Guard: Typing "herr " or "frau " never corrupts into "Hallo herr,".
// 5. Offline Zero-Click: 2.55 KB first-name database auto-detects gender when no prefix is typed.

import { StorageManager } from './52-storage.js';
import { Constants } from './51-constants.js';
import { showToast } from './32-toast.js';

/**
 * Top German male first names for zero-click offline gender classification.
 * @type {Set<string>}
 */
const MALE_NAMES = new Set([
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
  "moritz", "niklas", "nico", "nicolai", "nicolas", "niels", "nikita", "niklaus", "niko", 
  "nikolaus", "nils", "noah", "norbert", "olaf", "oliver", "oscar", "oskar", "oswald", "otmar", 
  "ottmar", "otto", "pascal", "patrick", "paul", "peer", "peter", "philip", "philipp", "pierre", 
  "quirin", "rafael", "raik", "raimund", "rainer", "ralf", "ralph", "ramon", "raphael", 
  "reginald", "reimar", "reimund", "reiner", "reinhard", "reinhold", "reno", "richard", "rico", 
  "robert", "robin", "roderich", "roger", "roland", "rolf", "roman", "ronald", "ronny", "rotger", 
  "rouven", "roy", "ruben", "ruediger", "rudolf", "rudolph", "rupert", "samuel", "sascha", 
  "sebastian", "severin", "siegbert", "siegfried", "siegmar", "siegmund", "silvio", "simon", 
  "soeren", "sonny", "stefan", "steffen", "stephan", "steve", "sven", "swen", "sylvio", 
  "thaddaeus", "thilo", "thomas", "thorsten", "tibor", "tilo", "tim", "timm", "timo", "timon", 
  "timotheus", "tino", "titus", "tobias", "tom", "toni", "tony", "torben", "torsten", "tristan", 
  "udo", "uli", "ulrich", "urban", "urs", "uwe", "valentin", "veit", "viktor", "vincent", 
  "vinzenz", "volker", "volkhard", "volkmar", "waldemar", "walter", "walther", "werner", 
  "wieland", "wilfried", "wilhelm", "willi", "willibald", "willie", "willy", "winfried", 
  "wladimir", "wolf", "wolfgang", "wolfram", "wulf", "yannic", "yannick", "yannik"
]);

/**
 * Top German female first names for zero-click offline gender classification.
 * @type {Set<string>}
 */
const FEMALE_NAMES = new Set([
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
]);

function normalizeFormality(f) {
  const map = {
    formal: "formal", förmlich: "formal", foermlich: "formal",
    polite: "polite", höflich: "polite", hoeflich: "polite",
    casual: "casual", modern: "casual", locker: "casual",
  };
  return map[(f || "").toLowerCase()] || "formal";
}

/* @adr [[ADR-JS]] {SalutationEngine} */
export const SalutationEngine = {
  /**
   * The 3 matched 80/20 B2B Closings.
   */
  CLOSINGS: Object.freeze({
    formal: "Mit freundlichen Grüßen",
    polite: "Freundliche Grüße",
    casual: "Beste Grüße"
  }),

  /**
   * Pure 80/20 B2B Salutation Derivation.
   * Produces crisp, standard German greetings without title acrobatics.
   * @param {{ rawName?: string, rawCompany?: string, formality?: string }} [opts]
   */
  derive({ rawName = "", rawCompany = "", formality = "formal" } = {}) {
    const style = normalizeFormality(formality);
    const text = (rawName || "").trim();
    const company = (rawCompany || "").trim();

    // 1. Company or empty input -> Standard formal fallback
    if (!text || (company && !text)) {
      return this.getFallback(style);
    }

    // 2. Explicit prefix check ("Herr", "Herrn", "Frau")
    let gender = "none";
    let nameWithoutPrefix = text;
    const prefixMatch = text.match(/^(herrn?|frau)\b\s*/i);
    if (prefixMatch) {
      gender = prefixMatch[1].toLowerCase().startsWith("herr") ? "male" : "female";
      nameWithoutPrefix = text.slice(prefixMatch[0].length).trim();

      // In-flight guard: User only typed "herr " or "frau " so far
      if (!nameWithoutPrefix) {
        if (style === "casual") return "Hallo,";
        if (style === "polite") return gender === "female" ? "Guten Tag Frau," : "Guten Tag Herr,";
        return gender === "female" ? "Sehr geehrte Frau," : "Sehr geehrter Herr,";
      }
    }

    // 3. Strip optional titles cleanly (user specified: ohne Titel im Standard)
    const cleanName = nameWithoutPrefix.replace(/(?:^|\s)(Prof\.\s*Dr\.|Prof\.|Dr\.)(?:\s+|$)/gi, ' ').trim();

    // 4. Split Name
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const lastName = parts.length > 1 ? parts.pop() || "" : parts[0] || "";
    const firstName = parts.join(" ");

    // 5. Zero-Click Gender Detection from 2.55 KB Set
    if (gender === "none") {
      const checkWord = (firstName || lastName).toLowerCase().split(/[\s-]+/)[0];
      if (MALE_NAMES.has(checkWord)) gender = "male";
      else if (FEMALE_NAMES.has(checkWord)) gender = "female";
    }

    // 6. Matched Output Pairs (80/20 B2B)
    if (style === "formal") {
      if (gender === "female") return `Sehr geehrte Frau ${lastName},`;
      if (gender === "male") return `Sehr geehrter Herr ${lastName},`;
      return "Sehr geehrte Damen und Herren,";
    }

    if (style === "polite") {
      if (gender === "female") return `Guten Tag Frau ${lastName},`;
      if (gender === "male") return `Guten Tag Herr ${lastName},`;
      return "Guten Tag,";
    }

    // Casual / Locker
    if (firstName) return `Hallo ${firstName},`;
    if (lastName) return `Hallo ${lastName},`;
    return "Hallo,";
  },

  getClosing(formality = "formal") {
    const style = normalizeFormality(formality);
    return this.CLOSINGS[style] || this.CLOSINGS.formal;
  },

  getFallback(formality = "formal") {
    const style = normalizeFormality(formality);
    if (style === "casual") return "Hallo,";
    if (style === "polite") return "Guten Tag,";
    return "Sehr geehrte Damen und Herren,";
  }
};

/* @adr [[ADR-JS]] {SalutationFeature} */
export class SalutationFeature {
  /**
   * @param {(() => void) | null} saveDraftDataCallback
   */
  constructor(saveDraftDataCallback) {
    this.saveDraftData = saveDraftDataCallback;
    this.settings = StorageManager.loadSettings();
    if (!this.settings.formality) this.settings.formality = 'formal';
  }

  init() {
    this.settings = StorageManager.loadSettings();
    this.isReady = false;
    this._wireFormality();
    this._wireRecipientName();
    this._wireManualEdits();
    this._applyUIState();
    this._regenerateSalutation({ onlyIfEmpty: true });
    this._regenerateClosing({ onlyIfEmpty: true });
    this.isReady = true;
  }

  _applyUIState() {
    const formalBtn = document.getElementById(`btn-style-${this.settings.formality}`);
    if (formalBtn) /** @type {HTMLInputElement} */ (formalBtn).checked = true;
  }

  _wireFormality() {
    const apply = (style) => {
      if (!this.isReady) return;
      this.settings.formality = style;
      StorageManager.saveSettings(this.settings);
      this._regenerateSalutation({ force: true });
      this._regenerateClosing({ force: true });
    };
    ['formal', 'polite', 'casual'].forEach(style => {
      const btn = document.getElementById(`btn-style-${style}`);
      if (btn) btn.addEventListener('change', () => apply(style));
    });
  }

  _wireRecipientName() {
    const fields = ['empfaenger-name', 'empfaenger-firma'];
    fields.forEach(tag => {
      const el = document.getElementById(tag);
      if (el) el.addEventListener('input', () => this._regenerateSalutation());
    });
  }

  /**
   * ContentEditable-First: Locks fields when edited, auto-resets when cleared.
   */
  _wireManualEdits() {
    const anrede = document.getElementById('anrede');
    const gruss = document.getElementById('grussformel');

    if (anrede) {
      anrede.addEventListener('input', () => {
        const text = (anrede.textContent || "").trim();
        if (!text) {
          // AUTO-RESET: User cleared field -> Re-enable auto-generation
          delete anrede.dataset.dirty;
          this.settings.salutationDirty = false;
          StorageManager.saveSettings(this.settings);
          this._regenerateSalutation({ force: true });
        } else {
          // USER LOCK: Manual edit is sacred -> Hands off!
          anrede.dataset.dirty = "true";
          delete anrede.dataset.generated;
          this.settings.salutationDirty = true;
          StorageManager.saveSettings(this.settings);
        }
      });
      anrede.addEventListener('blur', () => this._validatePunctuation(anrede, 'anrede'));
    }

    if (gruss) {
      gruss.addEventListener('input', () => {
        const text = (gruss.textContent || "").trim();
        if (!text) {
          delete gruss.dataset.dirty;
          this.settings.closingDirty = false;
          StorageManager.saveSettings(this.settings);
          this._regenerateClosing({ force: true });
        } else {
          gruss.dataset.dirty = "true";
          delete gruss.dataset.generated;
          this.settings.closingDirty = true;
          StorageManager.saveSettings(this.settings);
        }
      });
      gruss.addEventListener('blur', () => this._validatePunctuation(gruss, 'grussformel'));
    }
  }

  /**
   * @param {HTMLElement} el
   * @param {'anrede'|'grussformel'} kind
   */
  _validatePunctuation(el, kind) {
    const dirty = kind === 'anrede' ? this.settings.salutationDirty : this.settings.closingDirty;
    if (!dirty) return;
    const text = (el.textContent || "").trim();
    if (!text) return;
    if (kind === 'anrede' && !text.endsWith(',')) {
      showToast(Constants.TOASTS.SALUTATION_PUNCTUATION, 'warning');
    } else if (kind === 'grussformel' && /[,.]$/.test(text)) {
      showToast(Constants.TOASTS.CLOSING_PUNCTUATION, 'warning');
    }
  }

  _regenerateSalutation({ force = false, onlyIfEmpty = false } = {}) {
    const el = document.getElementById('anrede');
    if (!el) return;

    // CONTENTEDITABLE MANDATE: Never overwrite manual user input unless forced
    if (!force && (this.settings.salutationDirty || el.dataset.dirty === "true")) {
      return;
    }

    const current = (el.textContent || "").trim();
    if (onlyIfEmpty && current) return;

    const rawName = document.getElementById('empfaenger-name')?.textContent || "";
    const rawCompany = document.getElementById('empfaenger-firma')?.textContent || "";

    const value = SalutationEngine.derive({
      rawName,
      rawCompany,
      formality: this.settings.formality
    });

    this._setField(el, value, { force });
  }

  _regenerateClosing({ force = false, onlyIfEmpty = false } = {}) {
    const el = document.getElementById('grussformel');
    if (!el) return;

    if (!force && (this.settings.closingDirty || el.dataset.dirty === "true")) {
      return;
    }

    const current = (el.textContent || "").trim();
    if (onlyIfEmpty && current) return;

    const value = SalutationEngine.getClosing(this.settings.formality);
    this._setField(el, value, { force });
  }

  /**
   * @param {HTMLElement} el
   * @param {string} value
   * @param {{ force?: boolean }} [opts]
   */
  _setField(el, value, opts = {}) {
    if (!opts.force && document.activeElement === el) return;
    el.textContent = value;
    el.dataset.generated = "true";
    if (this.saveDraftData) this.saveDraftData();
  }
}
