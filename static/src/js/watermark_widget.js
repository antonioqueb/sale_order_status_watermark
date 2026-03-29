/** @odoo-module **/
import { FormController } from "@web/views/form/form_controller";
import { patch } from "@web/core/utils/patch";
import { onMounted, onPatched } from "@odoo/owl";

const STATUS_CLASSES = [
    "o_sale_order_status_ready",
    "o_sale_order_cancelled_watermark",
    "o_sale_order_confirmed_watermark",
    "o_sale_order_draft_watermark",
    "o_sale_order_sent_watermark",
];

const STATUS_CONFIG = {
    sale: {
        sheetClass: "o_sale_order_confirmed_watermark",
        bannerClass: "is-confirmed",
        badgeClass: "is-confirmed",
        icon: "✓",
        eyebrow: "Estado comercial",
        title: "Orden confirmada",
        subtitle: "La orden ya fue validada y forma parte del flujo operativo.",
        badge: "Confirmada",
        side: "ACTIVA",
    },
    draft: {
        sheetClass: "o_sale_order_draft_watermark",
        bannerClass: "is-draft",
        badgeClass: "is-draft",
        icon: "✎",
        eyebrow: "Preparación comercial",
        title: "Cotización en borrador",
        subtitle: "Aún puedes editar cantidades, precios, condiciones y productos.",
        badge: "Borrador",
        side: "EDITABLE",
    },
    sent: {
        sheetClass: "o_sale_order_sent_watermark",
        bannerClass: "is-sent",
        badgeClass: "is-sent",
        icon: "↗",
        eyebrow: "Seguimiento comercial",
        title: "Cotización enviada",
        subtitle: "El documento fue enviado al cliente y está pendiente de respuesta.",
        badge: "Enviada",
        side: "PENDIENTE",
    },
    cancel: {
        sheetClass: "o_sale_order_cancelled_watermark",
        bannerClass: "is-cancelled",
        badgeClass: "is-cancelled",
        icon: "✕",
        eyebrow: "Estado documental",
        title: "Orden cancelada",
        subtitle: "Este registro fue cancelado y se conserva únicamente para trazabilidad.",
        badge: "Cancelada",
        side: "INACTIVA",
    },
};

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);
        const applyStatusSkin = () => {
            this._applySaleOrderStatusSkin();
        };
        onMounted(applyStatusSkin);
        onPatched(applyStatusSkin);
    },

    _applySaleOrderStatusSkin() {
        if (this.props.resModel !== "sale.order") {
            return;
        }

        const renderer = this.el || this.__owl__?.bdom?.el;
        if (!renderer) {
            return;
        }

        const formSheet = renderer.querySelector(".o_form_sheet");
        if (!formSheet) {
            return;
        }

        this._clearSaleOrderStatusSkin(formSheet);

        const state = this.model?.root?.data?.state;
        const config = STATUS_CONFIG[state];
        if (!config) {
            return;
        }

        formSheet.classList.add("o_sale_order_status_ready", config.sheetClass);
        formSheet.dataset.saleOrderState = state;

        const banner = document.createElement("div");
        banner.className = `o_sale_status_banner ${config.bannerClass}`;
        banner.setAttribute("aria-hidden", "true");
        banner.innerHTML = `
            <div class="o_sale_status_banner__icon_wrap">
                <span class="o_sale_status_banner__icon">${config.icon}</span>
            </div>
            <div class="o_sale_status_banner__body">
                <div class="o_sale_status_banner__eyebrow">${config.eyebrow}</div>
                <div class="o_sale_status_banner__title">${config.title}</div>
                <div class="o_sale_status_banner__subtitle">${config.subtitle}</div>
            </div>
            <div class="o_sale_status_banner__side">${config.side}</div>
        `;
        formSheet.insertBefore(banner, formSheet.firstChild);

        const badge = document.createElement("div");
        badge.className = `o_sale_status_badge ${config.badgeClass}`;
        badge.setAttribute("aria-hidden", "true");
        badge.innerHTML = `
            <span class="o_sale_status_badge__dot"></span>
            <span class="o_sale_status_badge__label">${config.badge}</span>
        `;
        formSheet.appendChild(badge);
    },

    _clearSaleOrderStatusSkin(formSheet) {
        formSheet.classList.remove(...STATUS_CLASSES);
        delete formSheet.dataset.saleOrderState;

        formSheet.querySelectorAll(".o_sale_status_banner, .o_sale_status_badge").forEach((el) => {
            el.remove();
        });
    },
});