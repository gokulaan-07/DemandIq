import { Enquiry, InventoryItem, MissedDemandGroup } from '../src/types/index.ts';

export interface ExtractedEnquiryData {
  intent: 'availability' | 'pricing' | 'bulk' | 'general';
  product?: string;
  color?: string;
  size?: string;
  quantity: number;
  languageDetected: string;
  isMatched: boolean;
  matchedSku?: string;
  isAvailable: boolean;
  missedDemandReason?: string;
}

const PRODUCT_KEYWORDS: Record<string, string[]> = {
  'Chanderi Cotton Kurti': ['kurti', 'kurtis', 'cotton kurti', 'chanderi', 'chanderi kurti', 'top'],
  'Banarasi Soft Silk Saree': ['saree', 'sari', 'silk saree', 'banarasi', 'banarasi saree', 'soft silk'],
  'Pure Linen Mandarin Shirt': ['shirt', 'linen shirt', 'mandarin shirt', 'pure linen', 'formal shirt'],
  'Handcrafted Heritage Lehenga': ['lehenga', 'choli', 'ghagra', 'bridal lehenga'],
  'Kutch Embroidered Denim Jacket': ['denim', 'jacket', 'denim jacket', 'kutch', 'embroidered jacket'],
  'Floral Anarkali Set with Dupatta': ['anarkali', 'anarkali suit', 'anarkali set', 'suit set', 'dupatta'],
  'Kanchipuram Pure Silk Bridal Saree': ['kanchipuram', 'bridal saree', 'kanchi silk'],
  'Chettinad Handloom Cotton Saree': ['chettinad', 'handloom saree', 'cotton saree']
};

const COLOR_KEYWORDS: Record<string, string[]> = {
  'Royal Blue': ['blue', 'royal blue', 'neelam', 'sky blue', 'navy'],
  'Maroon': ['maroon', 'dark red', 'wine', 'burgundy'],
  'Emerald Green': ['green', 'emerald', 'emerald green', 'dark green', 'pachai'],
  'Crimson Red': ['red', 'crimson', 'chilli red', 'lal', 'sivappu'],
  'Olive Green': ['olive', 'olive green', 'military green'],
  'Classic White': ['white', 'off white', 'ivory', 'vellai', 'safed'],
  'Plum & Gold': ['plum', 'purple', 'gold', 'golden'],
  'Mustard Yellow': ['yellow', 'mustard', 'haldi', 'manjal'],
  'Indigo Blue': ['indigo', 'indigo blue', 'denim blue'],
  'Peacock Blue': ['peacock', 'peacock blue', 'mayil kazhuthu']
};

const SIZE_KEYWORDS: Record<string, string[]> = {
  'XS': ['xs', 'extra small', 'size 34'],
  'S': ['size s', 'small', 'size 36', ' s '],
  'M': ['size m', 'medium', 'size 38', 'size 40', ' m '],
  'L': ['size l', 'large', 'size 42', ' l '],
  'XL': ['size xl', 'extra large', 'size 44', ' xl '],
  'XXL': ['size xxl', 'xxl', 'size 46', '2xl'],
  'Free Size': ['free size', 'freesize', 'standard size', 'all size']
};

export function parseCustomerEnquiry(text: string, inventory: InventoryItem[]): ExtractedEnquiryData {
  const lower = ' ' + text.toLowerCase() + ' ';
  let language = 'English';

  // Language & Code-mixed detection
  const hasTamil = /(irukka|kedaikkuma|venum|pudichirukku|irundha|sollunga|ethana|panren|romba)/i.test(text);
  const hasHindi = /(chahiye|milega|hai kya|hoga|bhaiya|kitne ka|batao|lena hai|dikha raha)/i.test(text);

  if (hasTamil && hasHindi) {
    language = 'Mixed Regional (Tamil/Hindi/English)';
  } else if (hasTamil) {
    language = 'Tamil-English (Tanglish)';
  } else if (hasHindi) {
    language = 'Hindi-English (Hinglish)';
  }

  // 1. Detect Intent
  let intent: 'availability' | 'pricing' | 'bulk' | 'general' = 'availability';
  if (/(bulk|wholesale|dozen|10 pieces|reseller|reselling)/i.test(lower)) {
    intent = 'bulk';
  } else if (/(price|how much|cost|rate|kitne|ethana|pricing)/i.test(lower) && !/(available|irukka|kedaikkuma|stock|in stock)/i.test(lower)) {
    intent = 'pricing';
  } else if (/(available|in stock|irukka|kedaikkuma|chahiye|milega|have|got|size)/i.test(lower)) {
    intent = 'availability';
  } else {
    intent = 'general';
  }

  // 2. Extract Product
  let matchedProductName: string | undefined = undefined;
  for (const [prodName, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matchedProductName = prodName;
        break;
      }
    }
    if (matchedProductName) break;
  }

  // 3. Extract Color
  let matchedColor: string | undefined = undefined;
  for (const [colName, keywords] of Object.entries(COLOR_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(' ' + kw + ' ') || lower.includes(kw)) {
        matchedColor = colName;
        break;
      }
    }
    if (matchedColor) break;
  }

  // 4. Extract Size
  let matchedSize: string | undefined = undefined;
  // Specific size extraction for shirt numbers (40, 42, 38)
  const shirtNumMatch = lower.match(/\b(38|40|42|44|46)\b/);
  if (shirtNumMatch) {
    if (shirtNumMatch[1] === '40') matchedSize = '40 (M)';
    else if (shirtNumMatch[1] === '42') matchedSize = '42 (L)';
    else if (shirtNumMatch[1] === '38') matchedSize = '38 (S)';
    else matchedSize = shirtNumMatch[1];
  } else {
    for (const [szName, keywords] of Object.entries(SIZE_KEYWORDS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          matchedSize = szName;
          break;
        }
      }
      if (matchedSize) break;
    }
  }

  // Saree defaults to Free Size if not found
  if (matchedProductName?.includes('Saree') && !matchedSize) {
    matchedSize = 'Free Size';
  }

  // 5. Quantity
  let quantity = 1;
  const qtyMatch = lower.match(/(\d+)\s*(pcs|pieces|sets|items|nos)/i) || lower.match(/(order|want|need)\s*(\d+)/i);
  if (qtyMatch) {
    const parsed = parseInt(qtyMatch[1] || qtyMatch[2], 10);
    if (!isNaN(parsed) && parsed > 0 && parsed < 100) {
      quantity = parsed;
    }
  }

  // 6. Match against Inventory
  let isMatched = false;
  let matchedSku: string | undefined = undefined;
  let isAvailable = false;
  let missedDemandReason: string | undefined = undefined;

  if (matchedProductName) {
    // Try finding exact match with product, color and size
    let invItem = inventory.find(i => 
      i.productName === matchedProductName &&
      (!matchedColor || i.color.toLowerCase().includes(matchedColor.toLowerCase()) || matchedColor.toLowerCase().includes(i.color.toLowerCase())) &&
      (!matchedSize || i.size === matchedSize || (matchedSize === 'M' && i.size.includes('M')) || (matchedSize === 'L' && i.size.includes('L')))
    );

    // Fallback: match by product and size
    if (!invItem && matchedSize) {
      invItem = inventory.find(i => 
        i.productName === matchedProductName &&
        (i.size === matchedSize || i.size.includes(matchedSize))
      );
    }

    // Fallback: match by product only
    if (!invItem) {
      invItem = inventory.find(i => i.productName === matchedProductName);
    }

    if (invItem) {
      isMatched = true;
      matchedSku = invItem.sku;
      if (invItem.currentStock >= quantity) {
        isAvailable = true;
      } else {
        isAvailable = false;
        missedDemandReason = invItem.currentStock === 0 
          ? `Stock depleted (0 units remaining in inventory)`
          : `Insufficient stock (${invItem.currentStock} units available, requested ${quantity})`;
      }
    } else {
      isMatched = false;
      isAvailable = false;
      missedDemandReason = `Product catalog variant not currently carried (Custom/Unstocked SKU)`;
    }
  } else {
    missedDemandReason = 'Could not reliably map customer text to catalog SKU (Generic or unsupported query)';
  }

  return {
    intent,
    product: matchedProductName,
    color: matchedColor,
    size: matchedSize,
    quantity,
    languageDetected: language,
    isMatched,
    matchedSku,
    isAvailable,
    missedDemandReason
  };
}

/**
 * Aggregates enquiries into Missed Demand Groups with mathematical profit estimation
 * Formula: Estimated Missed Profit = Enquiry Count * Conversion Rate (default 18%) * Profit Per Order
 */
export function aggregateMissedDemand(
  enquiries: Enquiry[],
  inventory: InventoryItem[],
  customConversionRate: number = 0.18
): MissedDemandGroup[] {
  // Only look at unavailable or out-of-stock enquiries
  const unfulfilled = enquiries.filter(e => !e.isAvailable && e.extractedProduct);

  const groupsMap = new Map<string, {
    productName: string;
    color: string;
    size: string;
    count: number;
    sampleTexts: string[];
    matchedSku?: string;
  }>();

  for (const enq of unfulfilled) {
    const prod = enq.extractedProduct || 'Unknown Product';
    const col = enq.extractedColor || 'Standard';
    const sz = enq.extractedSize || 'Standard';
    const key = `${prod}__${col}__${sz}`;

    const existing = groupsMap.get(key) || {
      productName: prod,
      color: col,
      size: sz,
      count: 0,
      sampleTexts: [],
      matchedSku: enq.matchedSku
    };

    existing.count += (enq.extractedQuantity || 1);
    if (existing.sampleTexts.length < 3) {
      existing.sampleTexts.push(enq.rawText);
    }
    if (!existing.matchedSku && enq.matchedSku) {
      existing.matchedSku = enq.matchedSku;
    }

    groupsMap.set(key, existing);
  }

  const result: MissedDemandGroup[] = [];

  for (const [key, item] of groupsMap.entries()) {
    // Find matching catalog pricing
    const inv = inventory.find(i => 
      (item.matchedSku && i.sku === item.matchedSku) || 
      (i.productName === item.productName && (!item.color || i.color === item.color))
    );

    const sellingPrice = inv ? inv.sellingPrice : 1800;
    const unitCost = inv ? inv.unitCost : 700;
    const profitPerOrder = Math.max(200, sellingPrice - unitCost);

    // Standard formula:
    // Estimated Missed Profit = Enquiry Count * Conversion Rate (18%) * Profit Per Order
    const estimatedMissedProfit = Math.round(item.count * customConversionRate * profitPerOrder);

    let priority: 'High' | 'Medium' | 'Low' = 'Low';
    if (item.count >= 4 || estimatedMissedProfit >= 10000) {
      priority = 'High';
    } else if (item.count >= 2 || estimatedMissedProfit >= 4000) {
      priority = 'Medium';
    }

    let confidence: 'High' | 'Medium' | 'Tentative' = 'Medium';
    if (item.count >= 4 && inv) {
      confidence = 'High';
    } else if (!inv) {
      confidence = 'Tentative';
    }

    result.push({
      id: `group_${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
      productName: item.productName,
      color: item.color,
      size: item.size,
      enquiryCount: item.count,
      sampleEnquiries: item.sampleTexts,
      estimatedConversionRate: customConversionRate,
      profitPerOrder,
      estimatedMissedProfit,
      dataConfidence: confidence,
      restockPriority: priority,
      stockStatus: inv ? `Stock: ${inv.currentStock} units (Threshold: ${inv.minThreshold})` : 'Uncataloged Variant'
    });
  }

  // Sort descending by estimated missed profit
  return result.sort((a, b) => b.estimatedMissedProfit - a.estimatedMissedProfit);
}
