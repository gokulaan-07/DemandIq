"""
DemandIQ Financial Accounting Engine in Python
"""
from typing import Dict, Any

def calculate_channel_profit(config: Dict[str, Any]) -> Dict[str, Any]:
    orders = config.get("order_count", 0)
    selling_price = config.get("selling_price_avg", 0.0)
    product_cost = config.get("product_cost_avg", 0.0)
    return_rate = config.get("return_rate_percent", 0.0) / 100.0
    commission_rate = config.get("commission_percent", 0.0) / 100.0
    payment_fee_rate = config.get("payment_fee_percent", 0.0) / 100.0
    refund_rate = config.get("refund_allowance_percent", 0.0) / 100.0

    gross_revenue = round(orders * selling_price)
    returned_orders = round(orders * return_rate)
    delivered_orders = max(0, orders - returned_orders)

    cogs_delivered = round(delivered_orders * product_cost)
    packaging_damage = round(returned_orders * (product_cost * 0.10))
    total_cogs = cogs_delivered + packaging_damage

    forward_shipping_cost = round(orders * config.get("forward_shipping", 80))
    reverse_shipping_cost = round(returned_orders * config.get("reverse_shipping", 100))
    total_logistics_cost = forward_shipping_cost + reverse_shipping_cost

    platform_fees = round(gross_revenue * commission_rate)
    payment_fees = round(gross_revenue * payment_fee_rate)
    refunds = round(gross_revenue * refund_rate)
    ad_spend = round(config.get("ad_spend", 0.0))

    contribution_profit = round(
        gross_revenue - total_cogs - total_logistics_cost - platform_fees - payment_fees - refunds - ad_spend
    )

    profit_per_order = round(contribution_profit / orders) if orders > 0 else 0
    net_margin_percent = round((contribution_profit / gross_revenue) * 100, 1) if gross_revenue > 0 else 0.0

    return {
        "channel": config.get("channel"),
        "orders": orders,
        "gross_revenue": gross_revenue,
        "delivered_orders": delivered_orders,
        "returned_orders": returned_orders,
        "forward_shipping_cost": forward_shipping_cost,
        "reverse_shipping_cost": reverse_shipping_cost,
        "total_logistics_cost": total_logistics_cost,
        "platform_fees": platform_fees,
        "payment_gateway_fees": payment_fees,
        "ad_spend": ad_spend,
        "contribution_profit": contribution_profit,
        "contribution_profit_per_order": profit_per_order,
        "net_margin_percent": net_margin_percent,
    }
