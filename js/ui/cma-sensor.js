/**
 * js/ui/cma-sensor.js â€” v4.0 CMA-Sensor (SPEC-031)
 * [MANDATE-v4.0] Overflow-Detection via IntersectionObserver
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 */

export class CMASensor {
    constructor(sm) {
        this.sm = sm;
        this.sensor = document.querySelector('din-cma-sensor');
        this.root = document.querySelector('din-page-wrapper');
        this.observer = null;
    }

    init() {
        if (!this.sensor || !this.root) {
            console.warn('âš ï¸ [CMA-Sensor] Required elements <din-cma-sensor> or <din-page-wrapper> not found.');
            return;
        }

        /**
         * The sensor is at the bottom of the content stream.
         * The root (din-page-wrapper) has a max-height (High-Integrity Threshold).
         * If the sensor is NOT intersecting at 100%, it means it's pushed into the overflow zone.
         */
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const isOverflow = !entry.isIntersecting || entry.intersectionRatio < 1;
                
                // Update DOM state for CSS hooks
                const paper = document.getElementById('paper');
                if (paper) {
                    paper.dataset.overflow = isOverflow ? 'true' : 'false';
                }

                // Update Application State
                this.sm.state.compliance = this.sm.state.compliance || {};
                this.sm.state.compliance.overflow = isOverflow;

                if (isOverflow) {
                    console.warn('âš ï¸ [CMA-Sensor] Layout Violation: Content exceeds page 1 threshold.');
                }
            });
        }, {
            root: this.root,
            threshold: 1.0 // Trigger as soon as the 1px sensor is not fully visible
        });

        this.observer.observe(this.sensor);
        console.info('ðŸ›¡ï¸ [CMA-Sensor] Active: Monitoring threshold at 280mm.');
    }
}

