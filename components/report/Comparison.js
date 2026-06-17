import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export default function Comparison({ data, lang }) {
  if (!data) {
    return (
      <div className="rounded-2xl p-8 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Minus className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.2)' }} />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {lang === 'EN'
            ? 'This is your first analysis. Upload next month\'s bill to see your progress.'
            : 'Ini analisis pertama anda. Muat naik bil bulan depan untuk lihat kemajuan anda.'}
        </p>
      </div>
    );
  }

  const {
    currentMonth, referenceMonth, currentKwh, referenceKwh,
    currentCajSemasa, referenceCajSemasa,
    kwhDiff, amountDiff, kwhChangePercent, improved,
    afaStory, thresholdCrossed
  } = data;

  const isAfaCaused = afaStory?.billUpButBehaviourOk;

  return (
    <div className="space-y-4">

      {/* AFA Story — The Moat */}
      {afaStory?.explanation && (
        <div className="rounded-2xl p-4"
          style={{
            background: isAfaCaused
              ? 'rgba(96,165,250,0.06)'
              : improved
                ? 'rgba(34,197,94,0.06)'
                : 'rgba(239,68,68,0.06)',
            border: `1px solid ${isAfaCaused ? 'rgba(96,165,250,0.2)' : improved ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
          }}>
          <div className="flex items-start gap-3">
            {isAfaCaused
              ? <span style={{ fontSize: '1.5rem' }}>🏛️</span>
              : improved
                ? <TrendingDown className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                : <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
            }
            <div>
              <p className="text-sm font-bold mb-1"
                style={{ color: isAfaCaused ? '#60a5fa' : improved ? '#22c55e' : '#ef4444' }}>
                {isAfaCaused
                  ? (lang === 'EN' ? 'Government fuel adjustment — not your fault' : 'Pelarasan bahan api kerajaan — bukan salah anda')
                  : improved
                    ? (lang === 'EN' ? '🎉 Bill improved!' : '🎉 Bil bertambah baik!')
                    : (lang === 'EN' ? 'Bill increased this month' : 'Bil meningkat bulan ini')
                }
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {afaStory.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side by side comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {referenceMonth} {lang === 'EN' ? '(Reference)' : '(Rujukan)'}
          </p>
          <p className="text-white font-bold text-xl">{referenceKwh} kWh</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            RM{referenceCajSemasa?.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl p-4"
          style={{
            background: improved ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
            border: `1px solid ${improved ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
          }}>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {currentMonth} {lang === 'EN' ? '(This month)' : '(Bulan ini)'}
          </p>
          <p className="font-bold text-xl" style={{ color: improved ? '#22c55e' : '#ef4444' }}>
            {currentKwh} kWh
          </p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            RM{currentCajSemasa?.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Change breakdown */}
      <div className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {lang === 'EN' ? 'CHANGE BREAKDOWN' : 'PECAHAN PERUBAHAN'}
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {lang === 'EN' ? 'kWh change' : 'Perubahan kWh'}
            </p>
            <p className="font-semibold text-sm" style={{ color: improved ? '#22c55e' : '#ef4444' }}>
              {kwhDiff > 0 ? '+' : ''}{kwhDiff} kWh ({kwhChangePercent > 0 ? '+' : ''}{kwhChangePercent}%)
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {lang === 'EN' ? 'Bill change (Caj Semasa)' : 'Perubahan bil (Caj Semasa)'}
            </p>
            <p className="font-semibold text-sm" style={{ color: amountDiff <= 0 ? '#22c55e' : '#ef4444' }}>
              {amountDiff > 0 ? '+' : ''}RM{Math.abs(amountDiff)?.toFixed(2)}
            </p>
          </div>

          {/* AFA vs Behaviour split */}
          {afaStory && (
            <>
              <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs mb-2 font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {lang === 'EN' ? 'WHAT CAUSED THE CHANGE?' : 'APA YANG MENYEBABKAN PERUBAHAN?'}
                </p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs" style={{ color: 'rgba(96,165,250,0.8)' }}>
                    🏛️ {lang === 'EN' ? 'AFA (government)' : 'AFA (kerajaan)'}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: afaStory.afaChange > 0 ? '#ef4444' : '#22c55e' }}>
                    {afaStory.afaChange > 0 ? '+' : ''}RM{Math.abs(afaStory.afaChange)?.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    👤 {lang === 'EN' ? 'Your behaviour' : 'Tabiat anda'}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: afaStory.behaviourChange <= 0 ? '#22c55e' : '#ef4444' }}>
                    {afaStory.behaviourChange > 0 ? '+' : ''}RM{Math.abs(afaStory.behaviourChange)?.toFixed(2)}
                    {afaStory.behaviourImproved && (
                      <span style={{ color: '#22c55e' }}> ✓</span>
                    )}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Threshold alerts */}
      {thresholdCrossed?.retailCharge && (
        <div className="rounded-2xl p-3"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-xs" style={{ color: '#ef4444' }}>
            ⚠️ {lang === 'EN'
              ? 'You crossed 600 kWh this month — RM10 Retail Charge + AFA + SST now applies'
              : 'Anda melebihi 600 kWh bulan ini — Caj Runcit RM10 + AFA + SST kini dikenakan'}
          </p>
        </div>
      )}

      {thresholdCrossed?.highTier && (
        <div className="rounded-2xl p-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="text-xs" style={{ color: '#ef4444' }}>
            🚨 {lang === 'EN'
              ? 'You crossed 1,500 kWh — highest tariff rate now applies on ALL your usage'
              : 'Anda melebihi 1,500 kWh — kadar tarif tertinggi kini dikenakan pada SEMUA penggunaan'}
          </p>
        </div>
      )}
    </div>
  );
}