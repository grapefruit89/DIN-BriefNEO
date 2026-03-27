/**
 * DIN-SPEC-CHECKER (v1.1)
 * Precision Validator for DIN 5008:2020 & Modern Web Standards
 */

const RULES = {
    geometry: {
        addressZone: { width: '85mm', height: '45mm', top: '45mm', left: '20mm' },
        foldMarks: [ '105mm', '210mm' ],
        holeMark: '148.5mm'
    },
    // NO-BULLSHIT POLICY: Forbidden marketing fluff
    fluffRadar: [
        'Aviation', 'Platinum', 'Sovereign', 'Akinator', 'AviationMath', 
        'Isomorphic Master Registry', 'IMR', 'Grade', 'Sovereign'
    ],
    // ELEMENT WHITELIST: Strictly DIN or extension namespaced
    elements: {
        allowed: [
            'din-5008', 'din-page', 'din-briefkopf', 'din-recipient', 
            'din-sender-details', 'din-brieffuss', 'din-date', 'din-subject',
            'din-body', 'din-closing', 'din-signature', 'din-attachments',
            'din-ruecksendeangabe', 'din-zusatz-vermerkzone', 'din-informationsblock'
        ],
        extensionPrefix: 'din-ext-'
    },
    apis: {
        mandatory: ['setHTML', 'textContent', 'popover'],
        forbidden: ['innerHTML', 'document.write', 'var', 'EditContext']
    }
};

export function validate(content, fileName) {
    const errors = [];
    
    // 1. Fluff Check
    RULES.fluffRadar.forEach(word => {
        if (content.toLowerCase().includes(word.toLowerCase())) {
            errors.push(`[FLUFF] File \${fileName} contains marketing bullshit: "\${word}"`);
        }
    });

    // 2. API Check
    RULES.apis.forbidden.forEach(api => {
        if (content.includes(api)) {
            errors.push(`[LEGACY] Forbidden pattern found: \${api}`);
        }
    });

    // 3. Popover Check (for HTML files)
    if (fileName.endsWith('.html') && content.includes('<dialog') && !content.includes('popover')) {
        errors.push(`[A11Y] Dialog found without Popover API. Use CSS-first Popover approach.`);
    }

    // 4. Element Check (for HTML files)
    if (fileName.endsWith('.html')) {
        const customElements = content.match(/<din-[a-z0-9-]+/g) || [];
        customElements.forEach(tag => {
            const tagName = tag.substring(1);
            if (!RULES.elements.allowed.includes(tagName) && !tagName.startsWith(RULES.elements.extensionPrefix)) {
                errors.push(`[SPEC] Non-standard Custom Element found: \${tagName}. Use prefix 'din-ext-' for extensions.`);
            }
        });
    }

    return errors;
}

