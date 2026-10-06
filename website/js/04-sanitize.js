// @ts-check
// @adr [[ADR-JS]] {RichTextSanitizer}
// @guide [[din-5008-css-architektur]]

/**
 * Einzige Sicherheitsgrenze für Rich-Text: DOMParser + exakte Element-Allowlist.
 * Wird von 01-draft-manager (Draft-Restore) genutzt.
 * Extra-Tags (z. B. UL/LI für Listenfelder wie anlagen-text) ergänzen die
 * Basis-Allowlist (ohne Attribute).
 * @param {string} htmlString
 * @param {{ extraTags?: string[] }} [options]
 * @returns {DocumentFragment}
 */
export function sanitizeRichText(htmlString, options = {}) {
  const allowedTags = ['B', 'STRONG', 'U', 'S', 'BLOCKQUOTE', 'BR', 'DIV', 'P', ...(options.extraTags || [])];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  /**
   * @param {Node} node
   * @returns {Node}
   */
  const sanitizeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createTextNode('');
    }
    const element = /** @type {Element} */ (node);
    let newNode;
    if (allowedTags.includes(element.nodeName)) {
      newNode = document.createElement(element.nodeName.toLowerCase());
    } else if (element.nodeName === 'SPAN' && element.classList.contains('brief-kommentar')) {
      newNode = document.createElement('span');
      newNode.className = 'brief-kommentar';
    } else {
      const frag = document.createDocumentFragment();
      element.childNodes.forEach((child) => {
        frag.appendChild(sanitizeNode(child));
      });
      return frag;
    }
    element.childNodes.forEach((child) => {
      newNode.appendChild(sanitizeNode(child));
    });
    return newNode;
  };

  const frag = document.createDocumentFragment();
  doc.body.childNodes.forEach((child) => {
    frag.appendChild(sanitizeNode(child));
  });
  return frag;
}
