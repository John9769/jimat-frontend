import Card from '@/components/ui/Card';
import { Zap } from 'lucide-react';

export default function Bleeder({ data, lang }) {
  if (!data) {
    return (
      <div className="rounded-2xl p-8 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Zap className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.2)' }} />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {lang === 'EN' ? 'No appliance profile found. Update your profile first.' : 'Tiada profil peralatan. Kemaskini profil anda dahulu.'}
        </p>
      </div>
    );
  }

  const { allBleeders } = data;

  const applianceEmoji = {
    AIRCOND: '❄️',
    CENTRAL_AIRCOND: '🏭',
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
    FAN: '🌀',
    IRON: '👔',
    OTHER: '⚡'
  };

  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {lang === 'EN'
          ? 'These are your declared appliances and what they cost you monthly.'
          : 'Ini adalah peralatan yang anda isytiharkan dan kos bulanannya.'}
      </p>

      {allBleeders?.map((bleeder, i) => (
        <div key={bleeder.applianceId || i} className="rounded-2xl p-4"
          style={{
            background: i === 0 ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${i === 0 ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.06)'}`
          }}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{applianceEmoji[bleeder.applianceType] || '⚡'}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">{bleeder.roomName}</p>
                  {i === 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316' }}>
                      #1 Bleeder
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {bleeder.applianceType.replace('_', ' ')} · {bleeder.qty}x · {bleeder.avgHoursDaily}hrs/day
                  {bleeder.inverter !== undefined && bleeder.applianceType === 'AIRCOND' && ` · ${bleeder.inverter ? 'Inverter' : 'Non-inverter'}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">RM{bleeder.estimatedCostMyr?.toFixed(2)}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>/month</p>
            </div>
          </div>

          {/* Share of bill bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span>{lang === 'EN' ? 'Share of bill' : 'Bahagian bil'}</span>
              <span>{bleeder.shareOfBill}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full"
                style={{
                  width: `${bleeder.shareOfBill}%`,
                  background: i === 0 ? '#f97316' : '#3b82f6'
                }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}