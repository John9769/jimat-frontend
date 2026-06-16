import Card from '@/components/ui/Card';
import { Radio, TrendingDown, TrendingUp } from 'lucide-react';

export default function AfaWatch({ data, lang }) {
  if (!data) return null;

  const { currentMonth, currentAfaRateSen, nextMonth, nextAfaRateSen, nextAfaAvailable, impactOnBillMyr, userExempt } = data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-5 h-5 text-blue-400" />
          <p className="text-blue-400 font-semibold">
            {lang === 'EN' ? 'Automatic Fuel Adjustment (AFA)' : 'Pelarasan Bahan Api Automatik (AFA)'}
          </p>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          {lang === 'EN'
            ? 'AFA is declared monthly by the Energy Commission. It can be a rebate (saves you money) or surcharge (costs you more).'
            : 'AFA diisytiharkan setiap bulan oleh Suruhanjaya Tenaga. Ia boleh menjadi rebat (jimat wang) atau tambahan caj (kos lebih).'}
        </p>
      </Card>

      {/* Current Month */}
      <Card>
        <p className="text-gray-400 text-xs mb-2">{lang === 'EN' ? 'This Month' : 'Bulan Ini'} — {currentMonth}</p>
        <div className="flex items-center justify-between">
          <p className="text-white font-semibold">AFA Rate</p>
          <div className="flex items-center gap-2">
            {currentAfaRateSen > 0
              ? <TrendingUp className="w-4 h-4 text-red-400" />
              : currentAfaRateSen < 0
              ? <TrendingDown className="w-4 h-4 text-green-500" />
              : null
            }
            <p className={`font-bold text-lg ${
              currentAfaRateSen > 0 ? 'text-red-400' :
              currentAfaRateSen < 0 ? 'text-green-500' : 'text-gray-400'
            }`}>
              {currentAfaRateSen > 0 ? '+' : ''}{currentAfaRateSen} sen/kWh
            </p>
          </div>
        </div>

        {userExempt && (
          <div className="mt-2 bg-green-500/10 rounded-lg px-3 py-2">
            <p className="text-green-500 text-xs">
              ✅ {lang === 'EN' ? 'You are exempt from AFA (below 600 kWh)' : 'Anda dikecualikan dari AFA (bawah 600 kWh)'}
            </p>
          </div>
        )}

        {!userExempt && impactOnBillMyr !== null && (
          <div className={`mt-2 rounded-lg px-3 py-2 ${currentAfaRateSen > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
            <p className={`text-xs ${currentAfaRateSen > 0 ? 'text-red-400' : 'text-green-500'}`}>
              {currentAfaRateSen > 0
                ? `${lang === 'EN' ? 'AFA added' : 'AFA menambah'} RM${Math.abs(impactOnBillMyr)?.toFixed(2)} ${lang === 'EN' ? 'to your bill' : 'kepada bil anda'}`
                : `${lang === 'EN' ? 'AFA saved you' : 'AFA menjimatkan'} RM${Math.abs(impactOnBillMyr)?.toFixed(2)} ${lang === 'EN' ? 'this month' : 'bulan ini'}`
              }
            </p>
          </div>
        )}
      </Card>

      {/* Next Month */}
      <Card>
        <p className="text-gray-400 text-xs mb-2">{lang === 'EN' ? 'Next Month Forecast' : 'Ramalan Bulan Depan'} — {nextMonth}</p>
        {nextAfaAvailable ? (
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold">AFA Rate</p>
            <p className={`font-bold text-lg ${
              nextAfaRateSen > 0 ? 'text-red-400' :
              nextAfaRateSen < 0 ? 'text-green-500' : 'text-gray-400'
            }`}>
              {nextAfaRateSen > 0 ? '+' : ''}{nextAfaRateSen} sen/kWh
            </p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            {lang === 'EN'
              ? 'Next month AFA not yet declared. Check back after Energy Commission announcement.'
              : 'AFA bulan depan belum diisytiharkan. Semak semula selepas pengumuman Suruhanjaya Tenaga.'}
          </p>
        )}
      </Card>
    </div>
  );
}