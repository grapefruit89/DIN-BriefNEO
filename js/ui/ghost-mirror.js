/**
 * js/ui/ghost-mirror.js — Ghost-Mirror Implementation (SPEC-066)
 * [CMD-1] Structural Markdown via Sanitizer API & Mirror-Layer
 * [CMD-1] Syntax Coloring via CSS Custom Highlight API
 * ─────────────────────────────────────────────────────────
 */

import { PLATINUM_SANITIZER } from '../core/constants.js';

export class GhostMirror {
    constructor(elementId, mirrorId) {
        this.element = document.getElementById(elementId);
        this.mirror  = document.getElementById(mirrorId);
        if (!this.element || !this.mirror) return;

        // Highlights Registry (Syntax Coloring ONLY)
        this.markerRanges = [];
    }

    /**
     * Updates both the structural mirror and the syntax highlights.
     * [CMD-1] Weights (bold/italic) are rendered in the mirror.
     * [CMD-1] Markers (** / *) are highlighted in the input.
     */
    update(text) {
        this.updateMirror(text);
        this.updateSyntaxHighlights(text);
    }

    /**
     * [CMD-1] Structural Markdown (bold/italic) via Native Sanitizer
     * This layer provides the physical weight needed for LayoutNG calculations.
     */
    updateMirror(text) {
        if (!this.mirror) return;

        // Simple Markdown Parser (Strictly Structural)
        let html = (text || "")
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

        // [CMD-1] Secure Rehydration via Blink Native Sanitizer
        if (this.mirror.setHTML && PLATINUM_SANITIZER) {
            this.mirror.setHTML(html, { sanitizer: PLATINUM_SANITIZER });
        } else {
        if (this.mirror.setHTML && PLATINUM_SANITIZER) {
            this.mirror.setHTML(html, { sanitizer: PLATINUM_SANITIZER });
        } else {
            this.mirror.textContent = html;
        } 
        }
    }

    /**
     * [CMD-1] Syntax Coloring (Markers only)
     * We only highlight the ** and * markers. Weights are handled by the mirror.
     */
    updateSyntaxHighlights(text) {
        this.markerRanges = [];
        if (!text) {
            this.applyHighlights();
            return;
        }

        const markerRegex = /(\*\*|\*)/g;
        let match;
        while ((match = markerRegex.exec(text)) !== null) {
            this.addHighlightRange(match.index, match.index + match[0].length, 'marker');
        }

        this.applyHighlights();
    }

    addHighlightRange(start, end, type) {
        let currentOffset = 0;
        const walker = document.createTreeWalker(this.element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let startNode = null, startNodeOffset = 0;
        let endNode = null, endNodeOffset = 0;

        while (node = walker.nextNode()) {
            const nodeLength = node.textContent.length;
            if (!startNode && start >= currentOffset && start <= currentOffset + nodeLength) {
                startNode = node;
                startNodeOffset = start - currentOffset;
            }
            if (!endNode && end >= currentOffset && end <= currentOffset + nodeLength) {
                endNode = node;
                endNodeOffset = end - currentOffset;
            }
            currentOffset += nodeLength;
            if (startNode && endNode) break;
        }

        if (startNode && endNode) {
            try {
                const range = new StaticRange({
                    startContainer: startNode,
                    startOffset: startNodeOffset,
                    endContainer: endNode,
                    endOffset: endNodeOffset
                });
                if (type === 'marker') this.markerRanges.push(range);
            } catch (e) {}
        }
    }

    applyHighlights() {
        CSS.highlights.set('din-marker', new Highlight(...this.markerRanges));
    }
}
