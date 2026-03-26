/**
 * js/core/edit-context-controller.js — Pillar 2: EditContext Engine
 * [ADR-008] Decoupled Input & View Architecture
 * [CMD-3] Chrome 147 IME Composition Bug Mitigation
 * ─────────────────────────────────────────────────────────
 */

export class EditContextController {
    constructor(element, onUpdate) {
        this.el = element;
        this.onUpdate = onUpdate;
        this.ec = null;

        if (!globalThis.EditContext) {
            console.error('[EditContext] API not supported. Falling back to legacy input.');
            return;
        }

        this.init();
    }

    init() {
        // [CMD-2] Force Plaintext-Only Doctrine
        this.el.setAttribute('contenteditable', 'plaintext-only');

        this.ec = new EditContext({
            text: this.el.textContent,
            selectionStart: this.el.textContent.length,
            selectionEnd: this.el.textContent.length
        });

        this.el.editContext = this.ec;

        // [CMD-3] Sync Character Bounds for IME (German Umlauts Fix)
        const syncBounds = () => {
            // [CMD-2] Use native getBoundingClientRect to auto-compensate for scrolling wrapper
            const rect = this.el.getBoundingClientRect();
            
            // Sync Control and Selection bounds to established screen pixels
            this.ec.updateControlBounds(rect);
            this.ec.updateSelectionBounds(rect);
        };

        this.ec.addEventListener('textupdate', (e) => {
            // [CMD-1] Sync Character Bounds for IME (German Umlauts Fix)
            // Mandatory sync on text update to keep native OS window positioned correctly
            syncBounds();
            
            // [CMD-2] Extract full buffer state for the Pillar 5 sync
            this.onUpdate(this.ec.text);
        });

        this.ec.addEventListener('selectionchange', (e) => {
            // [CMD-3] Mandatory sync on selection change
            syncBounds();
        });

        // Initial Layout Anchor
        syncBounds();
    }
}
