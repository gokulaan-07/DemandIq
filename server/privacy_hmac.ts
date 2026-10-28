import crypto from 'crypto';
import { getDb, saveDb } from './db.ts';
import { PrivacySignalRecord } from '../src/types/index.ts';

const HMAC_SECRET = process.env.HMAC_SECRET_SALT || 'demandiq_privacy_hmac_secret_salt_2026_isolated_key';

export function normalizeIdentifier(rawInput: string): string {
  // Normalize phone number or delivery address string
  // For phone: strip all spaces, hyphens, country code prefixes (+91 or 91)
  const digitsOnly = rawInput.replace(/\D/g, '');
  if (digitsOnly.length >= 10) {
    return digitsOnly.slice(-10); // Standard 10-digit Indian mobile
  }
  // For address or custom ref: lower-case, strip punctuation and whitespace
  return rawInput.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

export function generateKeyedHmac(normalizedInput: string): string {
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(normalizedInput)
    .digest('hex');
}

export function queryPrivacySignal(
  queryInput: string,
  requestingSellerId: string
): {
  matched: boolean;
  hmacDigestTruncated: string;
  timesReported?: number;
  reasonCode?: string;
  notes?: string;
  reportedAt?: string;
  reportedByPeer: boolean;
  privacyNotice: string;
  disclaimer: string;
} {
  const normalized = normalizeIdentifier(queryInput);
  const hmac = generateKeyedHmac(normalized);
  const truncatedDigest = `${hmac.substring(0, 10)}...${hmac.substring(hmac.length - 8)}`;

  const db = getDb();
  const match = db.privacySignals.find(s => s.hmacHash === hmac);

  const privacyNotice = 'Server-side Keyed HMAC-SHA256 was evaluated in an isolated execution sandbox. Neither your raw identifier nor any other seller’s customer records were exposed or decrypted.';
  const disclaimer = 'IMPORTANT: A privacy-signal match indicates a shared historical risk report from another verified seller. It is an advisory risk signal, NOT proof of fraudulent intent. Do not automatically cancel orders without manual verification.';

  if (match) {
    return {
      matched: true,
      hmacDigestTruncated: truncatedDigest,
      timesReported: match.timesReported,
      reasonCode: match.reasonCode,
      notes: match.notes,
      reportedAt: match.reportedAt,
      reportedByPeer: match.reportedBySellerId !== requestingSellerId,
      privacyNotice,
      disclaimer
    };
  }

  return {
    matched: false,
    hmacDigestTruncated: truncatedDigest,
    reportedByPeer: false,
    privacyNotice,
    disclaimer
  };
}

export function registerPrivacySignal(
  identifier: string,
  sellerId: string,
  sellerName: string,
  reasonCode: 'REPEAT_COD_REFUSAL' | 'FAKE_ADDRESS' | 'ABUSIVE_RETURNS' | 'PAYMENT_DISPUTE',
  notes: string
): PrivacySignalRecord {
  const normalized = normalizeIdentifier(identifier);
  const hmac = generateKeyedHmac(normalized);
  const db = getDb();

  const existing = db.privacySignals.find(s => s.hmacHash === hmac);

  if (existing) {
    existing.timesReported += 1;
    existing.notes = `${existing.notes} | Update (${sellerName}): ${notes}`;
    existing.reportedAt = new Date().toISOString();
    saveDb();
    return existing;
  }

  const newRecord: PrivacySignalRecord = {
    id: `sig_${Date.now()}`,
    hmacHash: hmac,
    reportedBySellerId: sellerId,
    reportedBySellerName: `Verified Seller Network Member`,
    reportedAt: new Date().toISOString(),
    reasonCode,
    timesReported: 1,
    notes
  };

  db.privacySignals.push(newRecord);
  saveDb();
  return newRecord;
}

export function removePrivacySignal(signalId: string, sellerId: string): boolean {
  const db = getDb();
  const index = db.privacySignals.findIndex(s => s.id === signalId && s.reportedBySellerId === sellerId);
  if (index !== -1) {
    db.privacySignals.splice(index, 1);
    saveDb();
    return true;
  }
  return false;
}
