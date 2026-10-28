import React, { useState } from 'react';
import { Modal } from '../common/Modal.tsx';
import { api } from '../../lib/api.ts';
import { ChannelType, PaymentMethod, Order } from '../../types/index.ts';
import { RiskBadge } from '../common/RiskBadge.tsx';
import { ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (order: Order) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onOrderCreated }) => {
  const [customerRef, setCustomerRef] = useState<string>('Priya Venkatesh');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98402 11029');
  const [customerCity, setCustomerCity] = useState<string>('Bengaluru');
  const [customerPincode, setCustomerPincode] = useState<string>('560038');
  const [orderValue, setOrderValue] = useState<string>('2499');
  const [channel, setChannel] = useState<ChannelType>('Instagram');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [addressScore, setAddressScore] = useState<number>(75);
  const [prevOrders, setPrevOrders] = useState<number>(0);
  const [prevRto, setPrevRto] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [resultOrder, setResultOrder] = useState<Order | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createOrder({
        customerRef,
        customerPhone,
        customerCity,
        customerPincode,
        orderValue: parseFloat(orderValue) || 1500,
        channel,
        paymentMethod,
        addressScore,
        prevOrderCount: prevOrders,
        prevRtoCount: prevRto,
        orderDate: new Date().toISOString()
      });
      setResultOrder(res.order);
      if (onOrderCreated) onOrderCreated(res.order);
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResultOrder(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resultOrder ? `Risk Score: ${resultOrder.orderId}` : 'Evaluate Incoming Order Risk'}
      subtitle="Runs explainable multi-signal classification, duplicate detection, and SHAP factor attribution."
      maxWidth="max-w-2xl"
    >
      {resultOrder ? (
        <div className="space-y-5 text-xs">
          {/* Result Highlight Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Assessed Customer:</span>
                <span className="font-semibold text-slate-900 text-sm block mt-0.5">
                  {resultOrder.customerRef} · {resultOrder.customerCity}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {resultOrder.channel} · {resultOrder.paymentMethod} · ₹{resultOrder.orderValue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <RiskBadge score={resultOrder.riskScore} category={resultOrder.riskCategory} />
                <span className="text-[11px] font-mono text-slate-500 block mt-1">
                  Confidence: {resultOrder.modelConfidence}%
                </span>
              </div>
            </div>

            {resultOrder.missingDataWarning && (
              <div className="p-2.5 bg-amber-50 text-amber-800 rounded border border-amber-200 text-[11px]">
                {resultOrder.missingDataWarning}
              </div>
            )}
          </div>

          {/* Explainable Attribution */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Explainable SHAP-Style Attributions:
            </h4>
            <div className="space-y-1.5 border border-slate-200 rounded-lg p-3 bg-white">
              {resultOrder.riskFactors.map((rf, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    {rf.type === 'risk' ? (
                      <ArrowUpRight className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-teal-600 shrink-0" />
                    )}
                    <span className={rf.type === 'risk' ? 'text-slate-800' : 'text-teal-900 font-medium'}>
                      {rf.factor}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${rf.type === 'risk' ? 'text-rose-700' : 'text-teal-700'}`}>
                    {rf.impact > 0 ? `+${rf.impact}` : rf.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Evaluate Another Order
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
            >
              Done & View Orders
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Name / Handle:</label>
              <input
                type="text"
                required
                value={customerRef}
                onChange={(e) => setCustomerRef(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Phone:</label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">City:</label>
              <input
                type="text"
                required
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Postal Pincode:</label>
              <input
                type="text"
                required
                value={customerPincode}
                onChange={(e) => setCustomerPincode(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sales Channel:</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
              >
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Website">Website</option>
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Method:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs"
              >
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Order Basket Value (₹):</label>
              <input
                type="number"
                required
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Address Completeness:</span>
                <span className="font-mono text-teal-700">{addressScore}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={addressScore}
                onChange={(e) => setAddressScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
            >
              {loading ? 'Evaluating...' : 'Score Order & Commit'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
