import Card from '@/components/ui/Card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export default function Comparison({ data, lang }) {
  if (!data) {
    return (
      <Card className="text-center py-8">
        <Minus className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">
          {lang === 'EN'
            ? 'This is your first analysis. Complete a mission and come back next month!'
            : 'Ini analisis pertama anda. Selesaikan misi dan kembali bulan depan!'}
        </p>
      </Card>
    );
  }

  const { currentMonth, previousMonth, currentKwh, previousKwh, kwhDiff, amountDiff, kwhChangePercent, improved, thresholdCrossed } = data;

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <Card className={`${improved ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="flex items-center gap-3">
          {improved
            ? <TrendingDown className="w-6 h-6 text-green-500" />
            : <TrendingUp className="w-6 h-6 text-red-400" />
          }
          <div>
            <p className={`font-bold ${improved ? 'text-green-500' : 'text-red-400'}`}>
              {improved
                ? (lang === 'EN' ? '🎉 Great job! Bill improved!' : '🎉 Tahniah! Bil bertambah baik!')
                : (lang === 'EN' ? '📈 Bill increased this month' : '📈 Bil meningkat bulan ini')}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {currentMonth} vs {previousMonth}
            </p>
          </div>
        </div>
      </Card>

      {/* Side by side */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-gray-400 text-xs mb-1">{previousMonth}</p>
          <p className="text-white font-bold text-xl">{previousKwh} kWh</p>
          <p className="text-gray-500 text-xs">{lang === 'EN' ? 'Previous' : 'Sebelum'}</p>
        </Card>
        <Card>
          <p className="text-gray-400 text-xs mb-1">{currentMonth}</p>
          <p className={`font-bold text-xl ${improved ? 'text-green-500' : 'text-red-400'}`}>
            {currentKwh} kWh
          </p>
          <p className="text-gray-500 text-xs">{lang === 'EN' ? 'This month' : 'Bulan ini'}</p>
        </Card>
      </div>

      {/* Change metrics */}
      <Card>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">{lang === 'EN' ? 'kWh change' : 'Perubahan kWh'}</p>
            <p className={`font-semibold ${improved ? 'text-green-500' : 'text-red-400'}`}>
              {kwhDiff > 0 ? '+' : ''}{kwhDiff} kWh ({kwhChangePercent > 0 ? '+' : ''}{kwhChangePercent}%)
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">{lang === 'EN' ? 'Bill change' : 'Perubahan bil'}</p>
            <p className={`font-semibold ${improved ? 'text-green-500' : 'text-red-400'}`}>
              {amountDiff > 0 ? '+' : ''}RM{Math.abs(amountDiff)?.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Threshold alerts */}
      {thresholdCrossed?.retailCharge && (
        <Card className="bg-red-500/10 border-red-500/30">
          <p className="text-red-400 text-sm">
            ⚠️ {lang === 'EN'
              ? 'You crossed 600 kWh this month — RM10 Retail Charge + AFA now applies'
              : 'Anda melebihi 600 kWh bulan ini — Caj Runcit RM10 + AFA kini dikenakan'}
          </p>
        </Card>
      )}
    </div>
  );
}