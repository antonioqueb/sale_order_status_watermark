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
