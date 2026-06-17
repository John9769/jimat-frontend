import { Radio, TrendingDown, TrendingUp } from 'lucide-react';

export default function AfaWatch({ data, lang }) {
  if (!data) return null;

  const {
    currentMonth, currentAfaRateSen, currentAfaComponents,
    nextMonth, nextAfaRateSen, nextAfaAvailable,
    impactOnBillMyr, userExempt
  } = data;

  return (
    <div className="space-y-4">

      {/* Header explanation */}
      <div className="rounded-2xl p-4"
        style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-4 h-4" style={{ color: 'rgba(96,165,250,0.8)' }} />
          <p className="font-semibold text-sm" style={{ color: 'rgba(96,165,250,0.9)' }}>
            {lang === 'EN' ? 'Automatic Fuel Adjustment (AFA)' : 'Pelarasan Bahan Api Automatik (AFA)'}
          </p>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {lang === 'EN'
            ? 'AFA is declared monthly by the Energy Commission based on global fuel prices. It can be a rebate (saves you money) or a surcharge (costs you more). You have zero control over AFA — but staying below 600 kWh exempts you entirely.'
            : 'AFA diisytiharkan setiap bulan oleh Suruhanjaya Tenaga berdasarkan harga bahan api global. Ia boleh jadi rebat atau tambahan caj. Anda tiada kawalan — tetapi kekal bawah 600 kWh mengecualikan anda sepenuhnya.'}
        </p>
      </div>

      {/* Current Month AFA */}
      <div className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {lang === 'EN' ? 'This Month' : 'Bulan Ini'} — {currentMonth}
        </p>

        {/* Show AFA components separately if multiple */}
        {currentAfaComponents && currentAfaComponents.length > 1 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">
              {lang === 'EN' ? 'AFA Components' : 'Komponen AFA'}
            </p>
            {currentAfaComponents.map((comp, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div>
                  <p className="text-xs font-medium text-white">{comp.description || `AFA ${i + 1}`}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {comp.kwh} kWh
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm"
                    style={{ color: comp.rateSen > 0 ? '#ef4444' : '#22c55e' }}>
                    {comp.rateSen > 0 ? '+' : ''}{comp.rateSen} sen/kWh
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    RM{Math.abs(comp.amountMyr)?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {/* Net total */}
            <div className="flex items-center justify-between pt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm text-white font-semibold">
                {lang === 'EN' ? 'Net AFA' : 'AFA Bersih'}
              </p>
              <div className="flex items-center gap-2">
                {currentAfaRateSen > 0
                  ? <TrendingUp className="w-4 h-4" style={{ color: '#ef4444' }} />
                  : <TrendingDown className="w-4 h-4" style={{ color: '#22c55e' }} />
                }
                <p className="font-bold text-base"
                  style={{ color: currentAfaRateSen > 0 ? '#ef4444' : '#22c55e' }}>
                  {currentAfaRateSen > 0 ? '+' : ''}{currentAfaRateSen} sen/kWh
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Single AFA component
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold">AFA Rate</p>
            <div className="flex items-center gap-2">
              {currentAfaRateSen > 0
                ? <TrendingUp className="w-4 h-4" style={{ color: '#ef4444' }} />
                : currentAfaRateSen < 0
                  ? <TrendingDown className="w-4 h-4" style={{ color: '#22c55e' }} />
                  : null}
              <p className="font-bold text-lg"
                style={{ color: currentAfaRateSen > 0 ? '#ef4444' : currentAfaRateSen < 0 ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
                {currentAfaRateSen > 0 ? '+' : ''}{currentAfaRateSen} sen/kWh
              </p>
            </div>
          </div>
        )}

        {/* Exempt notice */}
        {userExempt && (
          <div className="mt-3 rounded-lg px-3 py-2"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p className="text-xs" style={{ color: '#22c55e' }}>
              ✅ {lang === 'EN' ? 'You are exempt from AFA (usage below 600 kWh)' : 'Anda dikecualikan dari AFA (penggunaan bawah 600 kWh)'}
            </p>
          </div>
        )}

        {/* Impact */}
        {!userExempt && impactOnBillMyr !== null && (
          <div className="mt-3 rounded-lg px-3 py-2"
            style={{
              background: currentAfaRateSen > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
              border: `1px solid ${currentAfaRateSen > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`
            }}>
            <p className="text-xs" style={{ color: currentAfaRateSen > 0 ? '#ef4444' : '#22c55e' }}>
              {currentAfaRateSen > 0
                ? `${lang === 'EN' ? 'AFA added' : 'AFA menambah'} RM${Math.abs(impactOnBillMyr)?.toFixed(2)} ${lang === 'EN' ? 'to your bill this month' : 'kepada bil anda bulan ini'}`
                : `${lang === 'EN' ? 'AFA saved you' : 'AFA menjimatkan'} RM${Math.abs(impactOnBillMyr)?.toFixed(2)} ${lang === 'EN' ? 'this month' : 'bulan ini'}`}
            </p>
          </div>
        )}
      </div>

      {/* Next Month */}
      <div className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {lang === 'EN' ? 'Next Month Forecast' : 'Ramalan Bulan Depan'} — {nextMonth}
        </p>
        {nextAfaAvailable ? (
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold">AFA Rate</p>
            <p className="font-bold text-lg"
              style={{ color: nextAfaRateSen > 0 ? '#ef4444' : nextAfaRateSen < 0 ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
              {nextAfaRateSen > 0 ? '+' : ''}{nextAfaRateSen} sen/kWh
            </p>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {lang === 'EN'
              ? 'Not yet declared. Check back after Energy Commission announcement.'
              : 'Belum diisytiharkan. Semak semula selepas pengumuman Suruhanjaya Tenaga.'}
          </p>
        )}
      </div>
    </div>
  );
}