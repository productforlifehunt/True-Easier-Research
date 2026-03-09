import React from 'react';
import { DollarSign, Gift, CreditCard, Banknote, Mail, Wallet } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import type { SurveyProject } from './SurveyBuilder';

interface Props {
  project: SurveyProject;
  onUpdateProject: (updates: SurveyProject) => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'KRW', 'CAD', 'AUD', 'CHF', 'INR', 'BRL'];

const IncentiveConfig: React.FC<Props> = ({ project, onUpdateProject }) => {
  const { t } = useI18n();
  const p = project as any;

  const incentiveEnabled = p.incentive_enabled ?? false;
  const incentiveType = p.incentive_type ?? 'fixed';
  const incentiveAmount = p.incentive_amount ?? 0;
  const incentiveCurrency = p.incentive_currency ?? 'USD';
  const incentiveDescription = p.incentive_description ?? '';
  const incentivePaymentMethod = p.incentive_payment_method ?? 'manual';
  const incentivePaymentInstructions = p.incentive_payment_instructions ?? '';

  const update = (key: string, value: any) => {
    onUpdateProject({ ...project, [key]: value } as any);
  };

  const Toggle = ({ enabled, onChange, label, desc }: { enabled: boolean; onChange: (v: boolean) => void; label: string; desc: string }) => (
    <div className="flex items-center justify-between py-3">
      <div><p className="text-[13px] font-medium text-stone-800">{label}</p><p className="text-[12px] text-stone-400 mt-0.5 font-light">{desc}</p></div>
      <button onClick={() => onChange(!enabled)} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-stone-200'}`}>
        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ left: enabled ? '22px' : '2px' }} />
      </button>
    </div>
  );

  const incentiveTypes = [
    { id: 'fixed', label: t('incentive.fixed'), desc: t('incentive.fixedDesc'), icon: DollarSign },
    { id: 'per_response', label: t('incentive.perResponse'), desc: t('incentive.perResponseDesc'), icon: Banknote },
    { id: 'lottery', label: t('incentive.lottery'), desc: t('incentive.lotteryDesc'), icon: Gift },
  ];

  const paymentMethods = [
    { id: 'manual', label: t('incentive.manualPayment'), desc: t('incentive.manualPaymentDesc'), icon: Mail },
    { id: 'stripe', label: 'Stripe', desc: 'Process payments via Stripe', icon: CreditCard },
    { id: 'gift_card', label: t('incentive.giftCard'), desc: t('incentive.giftCardDesc'), icon: Gift },
    { id: 'bank_transfer', label: t('incentive.bankTransfer'), desc: t('incentive.bankTransferDesc'), icon: CreditCard },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
          <DollarSign size={16} className="text-amber-600" />
        </div>
        <h3 className="text-[14px] font-semibold text-stone-800">{t('incentive.title')}</h3>
      </div>

      <Toggle
        enabled={incentiveEnabled}
        onChange={(v) => update('incentive_enabled', v)}
        label={t('incentive.enable')}
        desc={t('incentive.enableDesc')}
      />

      {incentiveEnabled && (
        <div className="mt-4 space-y-5 border-t border-stone-100 pt-4">
          {/* Incentive Type */}
          <div>
            <label className="block text-[12px] font-medium text-stone-500 mb-2 uppercase tracking-wider">{t('incentive.type')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {incentiveTypes.map(type => (
                <button key={type.id} onClick={() => update('incentive_type', type.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    incentiveType === type.id
                      ? 'border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200'
                      : 'border-stone-100 hover:border-stone-200'
                  }`}>
                  <type.icon size={16} className={incentiveType === type.id ? 'text-emerald-600 mb-1.5' : 'text-stone-400 mb-1.5'} />
                  <p className="text-[13px] font-medium text-stone-800">{type.label}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">{t('incentive.amount')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-stone-400">
                  {incentiveCurrency === 'USD' ? '$' : incentiveCurrency === 'EUR' ? '€' : incentiveCurrency === 'GBP' ? '£' : incentiveCurrency}
                </span>
                <input type="number" min={0} step={0.01} value={incentiveAmount}
                  onChange={(e) => update('incentive_amount', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-stone-500 mb-1.5">{t('incentive.currency')}</label>
              <select value={incentiveCurrency} onChange={(e) => update('incentive_currency', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[14px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-medium text-stone-500 mb-1.5">{t('incentive.description')}</label>
            <textarea value={incentiveDescription}
              onChange={(e) => update('incentive_description', e.target.value)}
              placeholder={t('incentive.descriptionPlaceholder')}
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white resize-none" />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[12px] font-medium text-stone-500 mb-2 uppercase tracking-wider">{t('incentive.paymentMethod')}</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map(pm => (
                <button key={pm.id} onClick={() => update('incentive_payment_method', pm.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    incentivePaymentMethod === pm.id
                      ? 'border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200'
                      : 'border-stone-100 hover:border-stone-200'
                  }`}>
                  <pm.icon size={14} className={incentivePaymentMethod === pm.id ? 'text-emerald-600 mb-1' : 'text-stone-400 mb-1'} />
                  <p className="text-[12px] font-medium text-stone-800">{pm.label}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{pm.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Instructions */}
          <div>
            <label className="block text-[12px] font-medium text-stone-500 mb-1.5">{t('incentive.paymentInstructions')}</label>
            <textarea value={incentivePaymentInstructions}
              onChange={(e) => update('incentive_payment_instructions', e.target.value)}
              placeholder={t('incentive.paymentInstructionsPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white resize-none" />
          </div>

          {/* Summary preview */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <p className="text-[12px] font-medium text-amber-700 mb-1">{t('incentive.participantWillSee')}</p>
            <p className="text-[13px] text-stone-700">
              {incentiveType === 'fixed' && `${incentiveCurrency} ${incentiveAmount} ${t('incentive.uponCompletion')}`}
              {incentiveType === 'per_response' && `${incentiveCurrency} ${incentiveAmount} ${t('incentive.perResponseSuffix')}`}
              {incentiveType === 'lottery' && `${t('incentive.lotteryPrefix')} ${incentiveCurrency} ${incentiveAmount}`}
            </p>
            {incentiveDescription && <p className="text-[12px] text-stone-500 mt-1">{incentiveDescription}</p>}
            <p className="text-[11px] text-stone-400 mt-2">{t('incentive.paidVia')}: {paymentMethods.find(m => m.id === incentivePaymentMethod)?.label || incentivePaymentMethod}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncentiveConfig;
