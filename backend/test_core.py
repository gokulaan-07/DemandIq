import unittest
from financials import calculate_channel_profit
from ml_risk import compute_order_risk
from nlp_enquiry import parse_customer_enquiry
from privacy_hmac import normalize_identifier, generate_keyed_hmac

class TestDemandIQCore(unittest.TestCase):
    def test_financial_accounting(self):
        config = {
            "channel": "Instagram",
            "order_count": 100,
            "selling_price_avg": 2000,
            "product_cost_avg": 600,
            "return_rate_percent": 30,
            "forward_shipping": 80,
            "reverse_shipping": 100,
            "commission_percent": 0,
            "payment_fee_percent": 2,
            "ad_spend": 20000,
            "refund_allowance_percent": 0
        }
        res = calculate_channel_profit(config)
        self.assertEqual(res["gross_revenue"], 200000)
        self.assertEqual(res["delivered_orders"], 70)
        self.assertEqual(res["returned_orders"], 30)
        self.assertEqual(res["total_logistics_cost"], 11000)
        self.assertEqual(res["contribution_profit"], 121200)

    def test_ml_risk_scoring(self):
        high_risk_order = {
            "payment_method": "COD",
            "order_value": 7000,
            "prev_order_count": 0,
            "prev_rto_count": 2,
            "address_score": 30,
            "channel": "Instagram"
        }
        res = compute_order_risk(high_risk_order)
        self.assertGreaterEqual(res["risk_score"], 70)
        self.assertEqual(res["risk_category"], "HIGH")
        self.assertTrue(res["is_flagged"])

    def test_nlp_tanglish_extraction(self):
        tanglish = "Hi sis, blue kurti size M irukka? Ethana price?"
        res = parse_customer_enquiry(tanglish)
        self.assertEqual(res["product"], "Chanderi Cotton Kurti")
        self.assertEqual(res["color"], "Royal Blue")
        self.assertEqual(res["size"], "M")
        self.assertEqual(res["language_detected"], "Tamil-English (Tanglish)")

    def test_keyed_hmac_isolation(self):
        phone1 = "+91 98765-43210"
        phone2 = "09876543210"
        n1 = normalize_identifier(phone1)
        n2 = normalize_identifier(phone2)
        self.assertEqual(n1, n2)
        h1 = generate_keyed_hmac(n1)
        h2 = generate_keyed_hmac(n2)
        self.assertEqual(h1, h2)
        self.assertEqual(len(h1), 64)

if __name__ == "__main__":
    unittest.main()
