import Card from '@/components/ui/Card';
import { t } from '@/lib/i18n';
import { TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

export default function BillAutopsy({ data, lang }) {
  const { billingMonth, totalKwh, totalAmountMyr, breakdown, effectiveRateSen, flags } = data;

  const items = [
    { key: 'report.generation', value: breakdown.generationCharge, color: 'text-blue-400' },
    { key: 'report.capacity', value: breakdown.capacityCharge, color: 'text-purple-400' },
    { key: 'report.network', value: breakdown.networkCharge, color: 'text-yellow-400' },
    { key: 'report.retail', value: breakdown.retailCharge, color: breakdown.retailCharge > 0 ? 'text-red-400' : 'text-gray-500' },
    { key: 'report.afa_charge', value: breakdown.afaCharge, color: breakdown.afaCharge > 0 ? 'text-orange-400' : 'text-green-400' },
    { key: 'report.eei', value: -Math.abs(breakdown.eeRebate), color: 'text-green-400' },
    { key: 'report.kwtbb', value: breakdown.kwtbbCharge, color: 'text-gray-400' },
    { key: 'report.sst', value: breakdown.sstCharge, color: breakdown.sstCharge > 0 ? 'text-red-400' : 'text-gray-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs mb-1">{billingMonth}</p>
            <p className="text-3xl font-bold text-white">RM{totalAmountMyr?.toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-1">{totalKwh} kWh</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">{lang === 'EN' ? 'Effective Rate' : 'Kadar Efektif'}</p>
            <p className="text-green-500 font-bold text-lg">{effectiveRateSen?.toFixed(1)} sen</p>
            <p className="text-gray-500 text-xs">/kWh</p>
          </div>
        </div>

        {/* Threshold Flags */}
        <div className="space-y-2">
          {flags?.retailChargeWaived && (
            <div className="flex items-center gap-2 bg-green-500/10 rounded-lg px-3 py-2">
              <TrendingDown className="w-3 h-3 text-green-500" />
              <p className="text-green-500 text-xs">
                {lang === 'EN' ? '✅ Retail Charge waived (below 600 kWh)' : '✅ Caj Runcit dilepaskan (bawah 600 kWh)'}
              </p>
            </div>
          )}
          {!flags?.retailChargeWaived && (
            <div className="flex items-center gap-2 bg-red-500/10 rounded-lg px-3 py-2">
              <TrendingUp className="w-3 h-3 text-red-400" />
              <p className="text-red-400 text-xs">
                {lang === 'EN' ? '⚠️ Above 600 kWh — Retail Charge + AFA applies' : '⚠️ Melebihi 600 kWh — Caj Runcit + AFA dikenakan'}
              </p>
            </div>
          )}
          {flags?.aboveHighTier && (
            <div className="flex items-center gap-2 bg-red-500/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-3 h-3 text-red-400" />
              <p className="text-red-400 text-xs">
                {lang === 'EN' ? '🔴 Above 1,500 kWh — Highest tier rate applies' : '🔴 Melebihi 1,500 kWh — Kadar tertinggi dikenakan'}
              </p>
            </div>
          )}
          {flags?.eeiApplied && (
            <div className="flex items-center gap-2 bg-green-500/10 rounded-lg px-3 py-2">
              <TrendingDown className="w-3 h-3 text-green-500" />
              <p className="text-green-500 text-xs">
                {lang === 'EN' ? '✅ Energy Efficiency Incentive applied' : '✅ Insentif Cekap Tenaga digunakan'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Breakdown */}
      <Card>
        <p className="text-white font-semibold mb-4">{t('report.autopsy', lang)}</p>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">{t(item.key, lang)}</p>
              <p className={`font-semibold text-sm ${item.color}`}>
                {item.value < 0 ? '-' : ''}RM{Math.abs(item.value)?.toFixed(2)}
              </p>
            </div>
          ))}
          <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
            <p className="text-white font-bold">{t('report.total', lang)}</p>
            <p className="text-white font-bold text-lg">RM{totalAmountMyr?.toFixed(2)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}