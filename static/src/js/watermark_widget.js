/** @odoo-module **/

import { FormController } from "@web/views/form/form_controller";
import { patch } from "@web/core/utils/patch";
import { onMounted, onPatched } from "@odoo/owl";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);

        const applyWatermark = () => {
            this._applySaleOrderWatermark();
        };

        onMounted(applyWatermark);
        onPatched(applyWatermark);
    },

    _applySaleOrderWatermark() {
        if (this.props.resModel !== "sale.order") {
            return;
        }

        const renderer = this.el || this.__owl__?.bdom?.el;
        if (!renderer) return;

        const formSheet = renderer.querySelector?.(".o_form_sheet");
        if (!formSheet) return;

        // Clean previous watermark classes and elements
        formSheet.classList.remove(
            "o_sale_order_cancelled_watermark",
            "o_sale_order_confirmed_watermark"
        );
        formSheet.querySelectorAll(
            ".o_sale_confirmed_badge, .o_sale_cancelled_banner, .o_sale_confirmed_banner"
        ).forEach(el => el.remove());

        const record = this.model?.root;
        if (!record) return;

        const state = record.data?.state;

        if (state === "cancel") {
            formSheet.classList.add("o_sale_order_cancelled_watermark");

            // Add cancelled banner at top of sheet
            if (!formSheet.querySelector(".o_sale_cancelled_banner")) {
                const banner = document.createElement("div");
                banner.className = "o_sale_cancelled_banner";
                banner.innerHTML = `
                    <span class="o_cancelled_icon">✕</span>
                    <span>Este documento ha sido CANCELADO</span>
                `;
                formSheet.insertBefore(banner, formSheet.firstChild);
            }
        } else if (state === "sale") {
            formSheet.classList.add("o_sale_order_confirmed_watermark");

            // Add confirmed floating badge
            if (!formSheet.querySelector(".o_sale_confirmed_badge")) {
                const badge = document.createElement("div");
                badge.className = "o_sale_confirmed_badge";
                badge.innerHTML = `
                    <span class="o_confirmed_icon">✓</span>
                    <span>Confirmada</span>
                `;
                formSheet.appendChild(badge);
            }

            // Add confirmed banner at top of sheet
            if (!formSheet.querySelector(".o_sale_confirmed_banner")) {
                const banner = document.createElement("div");
                banner.className = "o_sale_confirmed_banner";
                banner.innerHTML = `
                    <span class="o_confirmed_banner_icon">✓</span>
                    <span>Orden de venta confirmada y validada</span>
                `;
                formSheet.insertBefore(banner, formSheet.firstChild);
            }
        }
    },
});
