# DemandIQ — Run & Demonstration Guide

This guide provides step-by-step instructions to run, test, and demonstrate **DemandIQ** for hackathon judges and evaluators.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Python**: 3.10+ (for optional Python backend/tests)

---

## 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default contents include:
- `PORT=3000`
- `JWT_SECRET=demandiq_development_jwt_secret_key_exathon_2026_demo`
- `HMAC_SECRET_SALT=demandiq_privacy_hmac_secret_salt_2026_isolated_key`

---

## 3. Launching the Application

### Option A: Standard Full-Stack Web Application (Recommended)

This runs the unified full-stack server (Express backend + Vite React frontend) on port 3000:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open your browser at:  
👉 **`http://localhost:3000`**

---

## 4. Demo Login Credentials

The application includes two pre-seeded, isolated seller workspaces:

### Workspace 1: Aura Ethnic & Modern (Primary Demo Store)
- **Email:** `aura@demandiq.com`
- **Password:** `demopassword123`
- **Catalog Profile:** Contemporary ethnic wear, kurtis, linen shirts, Banarasi sarees.
- **Includes:** 50+ pre-seeded orders with various risk signals, 35+ enquiries in English/Tanglish/Hinglish, multi-channel profit configurations.

### Workspace 2: Kavitha Silks Chennai (Peer Store for Privacy Lab)
- **Email:** `kavitha@demandiq.com`
- **Password:** `demopassword123`
- **Catalog Profile:** Traditional Kanchipuram and Chettinad bridal handloom silks.

> **Tip:** You can also use the **One-Click Quick Login** buttons on the login screen, or switch workspaces anytime using the workspace switcher in the sidebar!

---

## 5. Running the Automated Test Suites

### TypeScript & Core Mathematics Tests
Validates channel profit accounting, logistics calculations, explainable risk attributions, Tanglish/Hinglish NLP extraction, and keyed HMAC:

```bash
npm test
# OR directly:
npx tsx test/test_core.ts
```

Expected Output:
```
--- Running DemandIQ Core Test Suite ---
Test 1: Channel Profit Financial Rigor
✓ Channel profit logistics and margin accounting verified.
Test 2: Order Risk Scoring & Attribution
✓ High-risk score calculated correctly: 89 pts with 4 SHAP factors.
✓ Low-risk score calculated correctly: 2 pts.
Test 3: Lost Demand Radar NLP & Inventory Matching
✓ Tanglish query parsed and mapped to unstocked catalog SKU correctly.
Test 4: Missed Demand Profit Formula
✓ Missed profit formula verified.
Test 5: Privacy Lab Keyed HMAC Cryptographic Hashing
✓ Cryptographic HMAC generation and normalization verified.
>>> ALL CORE TESTS PASSED SUCCESSFULLY! <<<
```

### Python Unit Tests (FastAPI / Intelligence Modules)
```bash
python3 backend/test_core.py
```

Expected Output:
```
....
Ran 4 tests in 0.001s
OK
```

---

## 6. How to Test Every Module (Step-by-Step)

### Step 1: Overview Dashboard
1. Log in as **Aura Ethnic Wear**.
2. Notice the top metrics: **Trustworthy Demand**, **Flagged Order Risk**, **Net Contribution Profit**, and **Missed Demand Opportunity**.
3. Toggle date ranges: `Last 7 Days`, `Last 30 Days`, `All-Time`. The charts and summaries update dynamically from the database.

### Step 2: DemandTruth (Order Risk Analysis)
1. Click **DemandTruth** in the sidebar.
2. Observe the orders table. Filter by **Channel** (e.g. *Instagram*), **Risk Level** (*High Risk*), or **Flagged Only**.
3. Click **Inspect** on order `ORD-2026-9041` (Rahul Verma, ₹4,497 COD):
   - Notice the **SHAP-Style Factor Attribution Waterfall**: see how high COD basket value (+28 pts), vague address (+22 pts), and zero prior order history (+14 pts) combine to produce an 84-point high risk rating.
4. Test seller feedback: Click **Confirm Fraud / Abusive RTO** or **Mark False Positive**.
5. Test simulated actions: Click **Send WhatsApp Confirmation** or **Offer 5% Prepaid Conversion Link**.
6. Click **New Order Check** in the top bar: Enter an order with ₹5,500 COD and 35% address completeness to see live scoring in action!

### Step 3: Lost Demand Radar (Missed Demand & NLP)
1. Click **Lost Demand Radar** in the sidebar.
2. Review the **Ranked Restock Opportunities** table:
   - Notice the top uncaptured opportunity: *Chanderi Cotton Kurti (Royal Blue, Size M)* with **18 unmet customer queries** and **₹34,164 in estimated missed profit**.
3. Adjust the **Assumed Conversion Rate** slider (from 5% to 40%): Watch the missed profit figures recalculate live according to the formula.
4. Scroll down to the **Customer Enquiry Log**:
   - Inspect query #2: *"Hi sis, blue kurti size M irukka? Price ethana?"* — notice how the NLP parser detected **Tamil-English (Tanglish)** and mapped it to the out-of-stock SKU.
5. Click **Log Customer Enquiry**: Type *"Do you have the linen shirt in olive green size 40?"* to test instant extraction and catalog matching.

### Step 4: Channel Profit Optimizer
1. Click **Channel Profit** in the sidebar.
2. Look at the **Gross Revenue vs Net Contribution Profit** chart:
   - Notice that while Instagram has the highest gross order volume (160 orders), its net margin is only **11.2%** due to **32% COD RTO return rates** and **₹42,000 ad spend**.
   - Compare with **Website** (mostly prepaid, 9.5% return rate, **37.8% net margin**)!
3. Test the **What-If Margin Simulator**:
   - Select *Instagram*.
   - Drag the *Return & RTO Rate* slider down from **32%** to **14%** (simulating the effect of mandatory prepaid deposits).
   - Click **Apply Parameters**: Observe how net contribution profit instantly surges!

### Step 5: Recommendations & Impact Tracking
1. Click **Recommendations** in the sidebar.
2. Review the proposals with supporting data signals, mechanisms, and explicit assumptions.
3. On recommendation #2 (*Restock Royal Blue Kurti*), click **Enter Post-Implementation Results**:
   - Enter ₹36,200 as actual measured profit.
   - The system records and audits predicted vs. measured outcomes.

### Step 6: Privacy Lab (Two-Seller Demonstration)
1. Click **Privacy Lab** in the sidebar.
2. In the **Peer Check** box, type `+91 98765 43210` (or click the demo chip) and click **Run HMAC Check**:
   - The system evaluates `HMAC-SHA256` on the server and detects that **Kavitha Silks** reported this buyer for repeat doorstep refusals!
3. Notice that raw customer phone numbers, addresses, and competitor identities were **never exposed**.
4. Test reporting a new risk signal from your store and then retracting it.

### Step 7: Reports & Settings
1. Click **Reports**: View the formal executive audit ledger. Click **Print / Save as PDF** to generate a clean printable document.
2. Click **Settings**: Adjust scoring thresholds or click **Reset Demo Database to Initial State** at any time.

---

## 7. 3-Minute Hackathon Presentation Script

- **[0:00 - 0:30] Problem Hook:**  
  *"Judges, Indian social commerce sellers on Instagram and WhatsApp lose up to 40% of their profits to three silent killers: fake COD returns, uncaptured DM queries for out-of-stock items, and misleading sales channels. This is DemandIQ, built around the workflow: CLEAN → COMPLETE → CONVERT."*
- **[0:30 - 1:15] Module A (Clean Demand):**  
  *"First, CLEAN. In DemandTruth, we don't just assign an arbitrary score. We provide transparent SHAP-style explanations: see how this ₹4,497 COD order with a vague Delhi address pulls risk up by +28 and +22 points. We separate gross vanity volume from actual trustworthy demand."*
- **[1:15 - 2:00] Module B (Complete Demand):**  
  *"Second, COMPLETE. In Lost Demand Radar, our NLP engine parses multi-lingual chats like 'blue kurti size M irukka?'. It matches this against our live inventory, flags zero stock, and calculates uncaptured profit using a rigorous mathematical formula: Enquiry Count × 18% Conversion × Margin. It immediately tells the seller to restock 40 units before Diwali."*
- **[2:00 - 2:40] Module C & Privacy Lab (Convert & Collaborate):**  
  *"Third, CONVERT. In Channel Profit Optimizer, we prove why Instagram's 160 orders are actually less profitable than direct Website sales after courier return penalties. Finally, in Privacy Lab, we show two independent sellers collaborating using server-side Keyed HMAC to detect serial COD scammers without exposing any customer PII."*
- **[2:40 - 3:00] Conclusion:**  
  *"DemandIQ is full-stack, tested, mathematically grounded, and production-ready. Thank you!"*
