import Card from '@/components/ui/Card';
import { Flame, Zap } from 'lucide-react';

export default function Bleeder({ data, lang }) {
  if (!data) {
    return (
      <Card className="text-center py-8">
        <Zap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">
          {lang === 'EN' ? 'No appliance profile found. Update your profile first.' : 'Tiada profil peralatan. Kemaskini profil anda dahulu.'}
        </p>
      </Card>
    );
  }

  const { topBleeder, allBleeders, totalPotentialSavingMyr, coveragePercent } = data;

  const applianceEmoji = {
    AIRCOND: '❄️',
    WATER_HEATER: '🚿',
    REFRIGERATOR: '🧊',
    WASHING_MACHINE: '👕',
    TV: '📺',
    LIGHTS: '💡',
    WATER_PUMP: '💧',
    RICE_COOKER: '🍚',
    MICROWAVE: '📡',
    OVEN: '🔥',
    COMPUTER: '💻',
    OTHER: '⚡'
  };

  return (
    <div className="space-y-4">
      {/* Total Saving */}
      <Card className="bg-gradient-to-br from-green-500/10 to-gray-900 border-green-500/30">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <p className="text-white font-semibold">
            {lang === 'EN' ? 'Total Potential Saving' : 'Jumlah Penjimatan Berpotensi'}
          </p>
        </div>
        <p className="text-4xl font-bold text-green-500">RM{totalPotentialSavingMyr?.toFixed(2)}</p>
        <p className="text-gray-400 text-xs mt-1">
          {lang === 'EN' ? `Based on ${coveragePercent}% of your declared appliances` : `Berdasarkan ${coveragePercent}% peralatan yang anda isytihar`}
        </p>
      </Card>

      {/* All Bleeders */}
      <div className="space-y-3">
        {allBleeders?.map((bleeder, i) => (
          <Card key={bleeder.applianceId || i} className={i === 0 ? 'border-orange-500/30' : ''}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{applianceEmoji[bleeder.applianceType] || '⚡'}</span>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {bleeder.roomName}
                    {i === 0 && <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">#1 Bleeder</span>}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {bleeder.applianceType.replace('_', ' ')} · {bleeder.qty}x · {bleeder.avgHoursDaily}hrs/day
                    {bleeder.inverter !== undefined && ` · ${bleeder.inverter ? 'Inverter' : 'Non-inverter'}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">RM{bleeder.estimatedCostMyr?.toFixed(2)}</p>
                <p className="text-gray-500 text-xs">/month</p>
              </div>
            </div>

            {/* Share of bill bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{lang === 'EN' ? 'Share of bill' : 'Bahagian bil'}</span>
                <span>{bleeder.shareOfBill}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${i === 0 ? 'bg-orange-500' : 'bg-blue-500'}`}
                  style={{ width: `${bleeder.shareOfBill}%` }}
                />
              </div>
            </div>

            {/* Saving tip */}
            <div className="bg-green-500/10 rounded-xl px-3 py-2">
              <p className="text-green-400 text-xs">💡 {bleeder.savingTip}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}