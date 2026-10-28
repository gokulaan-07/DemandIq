# DemandIQ — Intelligent Demand & Profit Analytics Platform

> Built for **ExaThon India 2026** · Category: AI & E-Commerce Financial Intelligence  
> Core Philosophy: **CLEAN → COMPLETE → CONVERT**

DemandIQ empowers small and medium-sized Indian D2C and social commerce merchants selling across **Instagram DMs, WhatsApp, direct websites (Shopify/WooCommerce), and marketplaces (Amazon, Flipkart)**.

---

## 1. The Three Critical Problems DemandIQ Solves

1. **Unreliable Demand Distortion (High RTO COD Orders):**  
   Social commerce merchants in India experience 30%–45% Cash on Delivery (COD) Return-to-Origin (RTO) refusals. Fake orders, impulsive late-night submissions, and duplicate records distort demand forecasting and drain working capital via non-recoverable reverse courier penalties.
2. **Missed Demand Leakage (Lost Demand Radar):**  
   Shoppers constantly enquire via Instagram DMs and WhatsApp in English, Tamil-English (*"blue kurti size M irukka?"*), or Hinglish (*"red silk saree available hai kya?"*). When variants are out of stock or messages go unanswered, sellers lose thousands of rupees in uncaptured margin without ever knowing the true lost volume.
3. **Misleading Channel Profitability (False Volume Traps):**  
   The channel with the highest order volume (e.g., Instagram or Flipkart) is often the **least profitable** once marketplace take-rates, forward courier fees (₹85), reverse RTO penalties (₹110), and Meta ad acquisition spend are factored into net contribution margin.

---

## 2. Core Architecture & Workflow: Clean → Complete → Convert

```
                ┌────────────────────────────────────────────────────────┐
                │                       DEMANDIQ                         │
                └──────────────────────────┬─────────────────────────────┘
                                           │
         ┌─────────────────────────────────┼────────────────────────────────┐
         ▼                                 ▼                                ▼
   [ 1. CLEAN ]                     [ 2. COMPLETE ]                  [ 3. CONVERT ]
   Module A: DemandTruth            Module B: Lost Demand Radar       Module C: Profit Optimizer
   • Multi-signal COD risk score    • Regional Tanglish/Hinglish NLP  • True logistics accounting
   • SHAP-style explainability      • Live inventory SKU matching     • Reverse courier penalties
   • Duplicate detection            • Missing profit = N×18%×Margin   • What-If margin simulator
   • Trustworthy demand filter      • Ranked restock prioritization   • Channel budget rebalancer
```

---

## 3. Platform Modules

### Module A: DemandTruth (Order-Risk Analysis)
- **Explainable Scoring Engine:** Calculates risk from 0 to 100 based on payment method, basket value thresholds, customer fulfillment history, and destination address consistency.
- **SHAP-Style Factor Attribution:** Every order inspection provides a transparent waterfall showing positive risk drivers (e.g. `+28 pts COD basket >₹4,000`, `+22 pts vague address`) and protective trust factors (`-18 pts prepaid UPI`, `-22 pts repeat 4-order buyer`).
- **Duplicate-Candidate Detection:** Identifies rapid-fire orders placed within 30 minutes from identical phone numbers or carts.
- **Trustworthy Demand Calculation:** Converts gross bookings into actual deliverable orders.
- **Merchant Feedback Loop:** Allows sellers to mark false positives or confirm fraud to audit model predictions.

### Module B: Lost Demand Radar (Enquiry Analysis & Missed Demand)
- **Indian Regional NLP Parser:** Recognizes intent, product type, color, and size across English, Tamil-English (*Tanglish*), and Hindi-English (*Hinglish*).
- **Inventory Matching:** Compares queries against real-time catalog stock.
- **Rigorous Financial Missed Profit Formula:**
  $$\text{Estimated Missed Profit} = \text{Enquiry Count} \times \text{Assumed Conversion Rate (18\%)} \times \text{Profit Margin Per Unit}$$
- **Ranked Restock Suggestions:** Prioritizes procurement orders based on uncaptured INR margin.
- **Notify-When-Available:** Tracks customer waitlists for restocked items.

### Module C: Channel Profit Optimizer
- **True Ledger Contribution Accounting:** Separates Gross Revenue, Delivered COGS, Forward Logistics, Reverse RTO Courier Fees, Platform Commissions, Payment Gateway Fees, and Ad Spend.
- **Multi-Channel Comparison:** Evaluates Instagram vs. Website vs. WhatsApp vs. Amazon vs. Flipkart.
- **Interactive What-If Scenario Simulator:** Allows merchants to adjust COD return rates or ad budgets and observe real-time contribution margin recovery.

### Module D: Recommendations & Impact Tracking
- Actionable business directives with explicit mathematical explanations, data signals, and assumptions.
- Post-implementation auditing: Merchants enter subsequent actual results to verify predicted vs. measured margin recovery.

### Module E: Privacy Lab (Two-Seller Keyed HMAC Prototype)
- Controlled demonstration of privacy-preserving cooperative risk sharing between two independent seller workspaces (**Aura Ethnic Wear** and **Kavitha Silks**).
- Implements cryptographically secure `HMAC-SHA256` keyed with an isolated server-side salt.
- Allows peers to check if an incoming contact has an abusive RTO history without exposing raw customer phone numbers, addresses, or competitor identities.
- Transparent disclaimer: Keyed HMAC is an advisory signal, not automated proof of fraud or multi-party Private Set Intersection (PSI).

---

## 4. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Recharts, Lucide Icons.
- **Backend (Full-Stack Mode):** Node.js / Express running Vite middlewares, real JWT authentication, bcrypt password hashing, persistent JSON transactional database.
- **Backend (Python Microservice Mirror):** Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy, scikit-learn baseline, HMAC cryptography.
- **Testing:** Automated TypeScript test runner (`test/test_core.ts`) and Python `unittest` suite (`backend/test_core.py`).

---

## 5. Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run core mathematical test suite
npm test

# 3. Start full-stack application (frontend + backend on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser. Demo login options are available with 1-click access!

---

## 6. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
