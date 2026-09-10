// @ts-check
// @adr [[ADR-JS]] {RichTextSanitizer}
// @guide [[chrome-modern-css]]

/**
 * Einzige Sicherheitsgrenze für Rich-Text: DOMParser + exakte Element-Allowlist.
 * Wird von 01-draft-manager (Draft-Restore) und 31-format-toolbar (Paste/Drop)
 * genutzt — bewusst ein Modul statt zwei Kopien (Audit 2026-09-10).
 * setHTML() mit eigener Allowlist verwirft in Chrome 151 alle Attribute
 * (inkl. class für din-comment) — daher bewusst nicht als Sanitizer genutzt.
 * @param {string} htmlString
 * @returns {DocumentFragment}
 */
export function sanitizeRichText(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const allowedTags = ['B', 'STRONG', 'U', 'S', 'BLOCKQUOTE'];

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
    } else if (element.nodeName === 'SPAN' && element.classList.contains('din-comment')) {
      newNode = document.createElement('span');
      newNode.className = 'din-comment';
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
