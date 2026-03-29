## ./__init__.py
```py
# -*- coding: utf-8 -*-
```

## ./__manifest__.py
```py
{
    'name': 'Sale Order Status Watermark',
    'version': '19.0.1.0.0',
    'category': 'Sales',
    'summary': 'Visual watermarks for cancelled and confirmed sale orders',
    'description': """
        Adds visual indicators to sale order forms:
        - CANCELADO: Large semi-transparent red watermark across the form
        - Confirmed: Elegant green visual indicator showing the order is fully validated
    """,
    'author': 'Alphaqueb Consulting',
    'website': 'https://www.alphaqueb.com',
    'license': 'LGPL-3',
    'depends': ['sale'],
    'assets': {
        'web.assets_backend': [
            'sale_order_status_watermark/static/src/scss/watermark.scss',
            'sale_order_status_watermark/static/src/xml/watermark_templates.xml',
            'sale_order_status_watermark/static/src/js/watermark_widget.js',
        ],
    },
    'installable': True,
    'auto_install': False,
    'application': False,
}
```

## ./static/src/js/watermark_widget.js
```js
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
```

## ./static/src/scss/watermark.scss
```scss
/* Sale Order Status Watermark Styles */

/* ===== CANCELLED WATERMARK ===== */
.o_sale_order_cancelled_watermark {
    position: relative;
}

.o_sale_order_cancelled_watermark::before {
    content: "CANCELADO";
    position: absolute;
    top: 140px;
    left: 50%;
    transform: translateX(-50%) rotate(-30deg);
    font-size: 105px;
    font-weight: 900;
    color: rgba(220, 53, 69, 0.10);
    letter-spacing: 14px;
    text-transform: uppercase;
    pointer-events: none;
    z-index: 1;
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
    text-shadow:
        1px 1px 0 rgba(220, 53, 69, 0.04),
        -1px -1px 0 rgba(220, 53, 69, 0.03);
}

.o_sale_order_cancelled_watermark::after {
    content: "";
    position: absolute;
    top: 8%;
    left: 4%;
    right: 4%;
    bottom: 8%;
    border: 3px solid rgba(220, 53, 69, 0.07);
    border-radius: 10px;
    pointer-events: none;
    z-index: 1;
}

/* ===== CONFIRMED / SALE ORDER STATUS ===== */
.o_sale_order_confirmed_watermark {
    position: relative;
}

.o_sale_order_confirmed_watermark::before {
    content: "";
    position: absolute;
    top: 0;
    left: 12px;
    right: 12px;
    height: 4px;
    background: linear-gradient(
        90deg,
        rgba(40, 167, 69, 0.00) 0%,
        rgba(40, 167, 69, 0.45) 18%,
        rgba(40, 167, 69, 0.90) 50%,
        rgba(40, 167, 69, 0.45) 82%,
        rgba(40, 167, 69, 0.00) 100%
    );
    pointer-events: none;
    z-index: 2;
    border-radius: 0 0 4px 4px;
}

/* Confirmed badge floating */
.o_sale_confirmed_badge {
    position: absolute;
    top: 14px;
    right: 16px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #28a745 0%, #1f8f5f 100%);
    color: #fff;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    box-shadow:
        0 3px 10px rgba(40, 167, 69, 0.25),
        0 1px 2px rgba(0, 0, 0, 0.08);
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    animation: confirmedPulse 2.8s ease-in-out infinite;
}

.o_sale_confirmed_badge .o_confirmed_icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.20);
    border-radius: 50%;
    font-size: 12px;
    line-height: 1;
}

@keyframes confirmedPulse {
    0%, 100% {
        box-shadow:
            0 3px 10px rgba(40, 167, 69, 0.25),
            0 1px 2px rgba(0, 0, 0, 0.08);
    }
    50% {
        box-shadow:
            0 4px 14px rgba(40, 167, 69, 0.35),
            0 2px 4px rgba(0, 0, 0, 0.12);
    }
}

/* Confirmed left green accent */
.o_sale_order_confirmed_watermark .o_form_sheet {
    border-left: 4px solid rgba(40, 167, 69, 0.55) !important;
}

/* Cancelled left red accent */
.o_sale_order_cancelled_watermark .o_form_sheet {
    border-left: 4px solid rgba(220, 53, 69, 0.38) !important;
}

/* ===== Cancelled banner bar ===== */
.o_sale_cancelled_banner {
    background: linear-gradient(
        90deg,
        rgba(220, 53, 69, 0.05) 0%,
        rgba(220, 53, 69, 0.10) 50%,
        rgba(220, 53, 69, 0.05) 100%
    );
    border: 1px solid rgba(220, 53, 69, 0.16);
    border-left: 4px solid rgba(220, 53, 69, 0.55);
    border-radius: 8px;
    padding: 10px 16px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: #721c24;
    font-size: 14px;
}

.o_sale_cancelled_banner .o_cancelled_icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: rgba(220, 53, 69, 0.12);
    border-radius: 50%;
    color: #dc3545;
    font-size: 14px;
}

/* ===== Confirmed banner bar ===== */
.o_sale_confirmed_banner {
    background: linear-gradient(
        90deg,
        rgba(40, 167, 69, 0.04) 0%,
        rgba(40, 167, 69, 0.09) 50%,
        rgba(40, 167, 69, 0.04) 100%
    );
    border: 1px solid rgba(40, 167, 69, 0.16);
    border-left: 4px solid rgba(40, 167, 69, 0.55);
    border-radius: 8px;
    padding: 10px 16px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: #155724;
    font-size: 14px;
}

.o_sale_confirmed_banner .o_confirmed_banner_icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: rgba(40, 167, 69, 0.12);
    border-radius: 50%;
    color: #28a745;
    font-size: 14px;
}```

## ./static/src/xml/watermark_templates.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <!-- Templates placeholder - watermark is applied via JS DOM manipulation -->
</templates>
```

