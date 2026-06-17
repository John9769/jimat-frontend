'use client';
import { useState } from 'react';
import { TrendingDown, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const CHARGE_INFO = {
  EN: {
    generation: {
      label: 'Generation Charge (Tenaga)',
      explanation: 'The actual cost of generating electricity from TNB power plants. Flat rate 27.03 sen/kWh on all your usage. This is the biggest chunk of your bill — reduce it by using less electricity.'
    },
    capacity: {
      label: 'Capacity Charge (Kapasiti)',
      explanation: 'Fee for TNB to maintain standby power plants so supply never gets cut. 4.55 sen/kWh. You pay this regardless of how much you use — it\'s the cost of having electricity available 24/7.'
    },
    network: {
      label: 'Network Charge (Rangkaian)',
      explanation: 'Cost of maintaining power lines, cables and grid infrastructure that delivers electricity to your home. 12.85 sen/kWh. Another fixed cost you cannot avoid — but using less reduces the total.'
    },
    retail: {
      label: 'Retail Charge (Peruncitan)',
      explanation: 'Fixed RM10/month fee for TNB\'s cost of your meter, billing and customer service. WAIVED if your usage is 600 kWh or below. Target this threshold every month.'
    },
    afa: {
      label: 'AFA (Automatic Fuel Adjustment)',
      explanation: 'Monthly fuel cost adjustment declared by the Energy Commission. Rises when global fuel prices rise, falls when they drop. You have ZERO control over this — but staying below 600 kWh exempts you from AFA entirely.'
    },
    eei: {
      label: 'INS. CEKAP TENAGA (Energy Efficiency Incentive)',
      explanation: 'Government rebate to reward energy-efficient households. 7.5 sen/kWh rebate on ALL your usage. This is money back in your pocket — the government paying you to be efficient.'
    },
    kwtbb: {
      label: 'KWTBB (Renewable Energy Fund)',
      explanation: '1.6% surcharge collected by the government via TNB. Goes to SEDA Malaysia to fund solar and hydro energy development. TNB is just the collection agent. You are indirectly funding Malaysia\'s renewable energy future whether you like it or not.'
    },
    sst: {
      label: 'Service Tax (SST)',
      explanation: '8% Service Tax imposed ONLY on the taxable portion of your bill — excess kWh above 600. Best way to avoid SST: stay below 600 kWh per month.'
    },
    late: {
      label: 'Late Payment Surcharge',
      explanation: '1% monthly penalty for paying after the due date. 100% avoidable. Set auto-debit via myTNB or your bank.'
    }
  },
  BM: {
    generation: {
      label: 'Caj Tenaga (Penjanaan)',
      explanation: 'Kos sebenar penjanaan elektrik dari loji kuasa TNB. Kadar tetap 27.03 sen/kWh pada semua penggunaan anda. Bahagian terbesar bil anda — kurangkan penggunaan untuk kurangkan caj ini.'
    },
    capacity: {
      label: 'Caj Kapasiti',
      explanation: 'Yuran untuk TNB menyelenggara loji kuasa siap sedia supaya bekalan tidak terputus. 4.55 sen/kWh. Anda bayar ini walaupun guna elektrik sedikit.'
    },
    network: {
      label: 'Caj Rangkaian',
      explanation: 'Kos penyelenggaraan talian kuasa, kabel dan grid yang menyampaikan elektrik ke rumah anda. 12.85 sen/kWh. Kos tetap yang tidak boleh dielak.'
    },
    retail: {
      label: 'Caj Runcit (Peruncitan)',
      explanation: 'Yuran tetap RM10 sebulan untuk kos meter, bil dan khidmat pelanggan TNB. DIKECUALIKAN jika penggunaan 600 kWh atau kurang. Sasaran yang perlu anda capai setiap bulan.'
    },
    afa: {
      label: 'AFA (Pelarasan Bahan Api Automatik)',
      explanation: 'Pelarasan kos bahan api bulanan oleh Suruhanjaya Tenaga. Naik bila harga bahan api global naik. Anda TIADA kawalan — tetapi kekal bawah 600 kWh mengecualikan anda dari AFA sepenuhnya.'
    },
    eei: {
      label: 'INS. CEKAP TENAGA (Insentif Cekap Tenaga)',
      explanation: 'Rebat kerajaan untuk menggalakkan penggunaan tenaga cekap. Rebat 7.5 sen/kWh pada SEMUA penggunaan anda. Wang dikembalikan kepada anda.'
    },
    kwtbb: {
      label: 'KWTBB (Dana Tenaga Boleh Baharu)',
      explanation: 'Caj 1.6% dikutip oleh kerajaan melalui TNB. Disalurkan ke SEDA Malaysia untuk membangunkan tenaga solar dan hidro. TNB hanya ejen pengutip. Anda membiayai peralihan tenaga negara sama ada suka atau tidak.'
    },
    sst: {
      label: 'Cukai Perkhidmatan (SST)',
      explanation: 'Cukai Perkhidmatan 8% dikenakan HANYA pada lebihan kWh melebihi 600. Cara terbaik elak SST: kekal di bawah 600 kWh sebulan.'
    },
    late: {
      label: 'Surcaj Lewat Bayar',
      explanation: 'Penalti 1% sebulan kerana bayar selepas tarikh akhir. 100% boleh dielak. Tetapkan auto-debit melalui myTNB atau bank anda.'
    }
  }
};

function ChargeRow({ label, value, color, explanation }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2 flex-1">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
          {expanded
            ? <ChevronUp className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
            : <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
          }
        </div>
        <p className={`font-semibold text-sm ml-4 flex-shrink-0 ${color}`}>
          {value < 0 ? '-' : ''}RM{Math.abs(value)?.toFixed(2)}
        </p>
      </div>
      {expanded && (
        <div className="pb-3 px-1">
          <div className="rounded-xl p-3" style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.1)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              💡 {explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillAutopsy({ data, lang }) {
  const {
    billingMonth, totalKwh, cajSemasa, totalAmountMyr,
    tunggakan, breakdown, flags,
    billingPeriodStart, billingPeriodEnd, billingPeriodDays
  } = data;

  const info = CHARGE_INFO[lang] || CHARGE_INFO.EN;

  const charges = [
    { key: 'generation', value: breakdown.generationCharge, color: 'text-blue-400' },
    { key: 'capacity', value: breakdown.capacityCharge, color: 'text-purple-400' },
    { key: 'network', value: breakdown.networkCharge, color: 'text-yellow-400' },
    { key: 'retail', value: breakdown.retailCharge, color: breakdown.retailCharge > 0 ? 'text-red-400' : 'text-gray-500' },
    { key: 'afa', value: breakdown.afaCharge, color: breakdown.afaCharge > 0 ? 'text-orange-400' : 'text-green-400' },
    { key: 'eei', value: -Math.abs(breakdown.eeRebate), color: 'text-green-400' },
    { key: 'kwtbb', value: breakdown.kwtbbCharge, color: 'text-gray-400' },
    { key: 'sst', value: breakdown.sstCharge, color: breakdown.sstCharge > 0 ? 'text-red-400' : 'text-gray-500' },
    ...(breakdown.latePaymentCharge > 0 ? [{ key: 'late', value: breakdown.latePaymentCharge, color: 'text-red-500' }] : [])
  ];

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(250,204,21,0.15)' }}>
        <div className="mb-4">
          {/* Billing period — replaces effective rate */}
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {billingMonth}
            {billingPeriodStart && billingPeriodEnd
              ? ` · ${billingPeriodStart} → ${billingPeriodEnd} (${billingPeriodDays} ${lang === 'EN' ? 'days' : 'hari'})`
              : billingPeriodDays ? ` · ${billingPeriodDays} ${lang === 'EN' ? 'days' : 'hari'}` : ''
            }
          </p>
          <p className="text-3xl font-black text-white">RM{cajSemasa?.toFixed(2)}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {lang === 'EN' ? 'Current month charges (Caj Semasa)' : 'Caj bulan semasa (Caj Semasa)'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{totalKwh} kWh</p>
        </div>

        {/* Arrears warning */}
        {tunggakan > 0 && (
          <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-xs" style={{ color: '#ef4444' }}>
              ⚠️ {lang === 'EN'
                ? `This bill includes RM${tunggakan?.toFixed(2)} arrears from previous months. Total amount due: RM${totalAmountMyr?.toFixed(2)}`
                : `Bil ini termasuk tunggakan RM${tunggakan?.toFixed(2)} dari bulan sebelum. Jumlah perlu dibayar: RM${totalAmountMyr?.toFixed(2)}`}
            </p>
          </div>
        )}

        {/* Threshold flags */}
        <div className="space-y-2">
          {flags?.retailChargeWaived && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <TrendingDown className="w-3 h-3 flex-shrink-0" style={{ color: '#22c55e' }} />
              <p className="text-xs" style={{ color: '#22c55e' }}>
                {lang === 'EN' ? '✅ Retail Charge waived — usage 600 kWh or less' : '✅ Caj Runcit dikecualikan — penggunaan 600 kWh atau kurang'}
              </p>
            </div>
          )}
          {flags?.aboveThreshold && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <TrendingUp className="w-3 h-3 flex-shrink-0" style={{ color: '#ef4444' }} />
              <p className="text-xs" style={{ color: '#ef4444' }}>
                {lang === 'EN'
                  ? `⚠️ ${flags.excessKwh} kWh above 600 kWh — Retail Charge + AFA + SST applies`
                  : `⚠️ ${flags.excessKwh} kWh melebihi 600 kWh — Caj Runcit + AFA + SST dikenakan`}
              </p>
            </div>
          )}
          {flags?.eeiApplied && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <TrendingDown className="w-3 h-3 flex-shrink-0" style={{ color: '#22c55e' }} />
              <p className="text-xs" style={{ color: '#22c55e' }}>
                {lang === 'EN' ? '✅ Energy Efficiency Incentive applied — government rebate received' : '✅ Insentif Cekap Tenaga digunakan — rebat kerajaan diterima'}
              </p>
            </div>
          )}
          {flags?.nearRetailThreshold && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
              <p className="text-xs" style={{ color: '#FACC15' }}>
                {lang === 'EN'
                  ? '⚡ Close to 600 kWh threshold. Reduce usage to waive Retail Charge next month.'
                  : '⚡ Hampir had 600 kWh. Kurangkan penggunaan untuk tidak kena Caj Runcit bulan depan.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bill Breakdown */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-4 pt-4 pb-2">
          <p className="text-white font-bold text-sm">
            {lang === 'EN' ? '🔬 Bill Autopsy' : '🔬 Bedah Siasat Bil'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {lang === 'EN' ? 'Tap each charge to understand what you\'re paying for' : 'Ketik setiap caj untuk faham apa yang anda bayar'}
          </p>
        </div>
        <div className="px-4">
          {charges.map((charge, i) => (
            <ChargeRow
              key={i}
              label={info[charge.key]?.label || charge.key}
              value={charge.value}
              color={charge.color}
              explanation={info[charge.key]?.explanation || ''}
            />
          ))}
          <div className="flex items-center justify-between py-4"
            style={{ borderTop: '2px solid rgba(250,204,21,0.2)' }}>
            <p className="text-white font-black">
              {lang === 'EN' ? 'Current Month Total' : 'Jumlah Bulan Semasa'}
            </p>
            <p className="font-black text-lg" style={{ color: '#FACC15' }}>
              RM{cajSemasa?.toFixed(2)}
            </p>
          </div>
          {tunggakan > 0 && (
            <>
              <div className="flex items-center justify-between pb-3">
                <p className="text-sm" style={{ color: 'rgba(239,68,68,0.8)' }}>
                  {lang === 'EN' ? '+ Arrears (Tunggakan)' : '+ Tunggakan'}
                </p>
                <p className="font-semibold text-sm" style={{ color: '#ef4444' }}>
                  RM{tunggakan?.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between pb-4"
                style={{ borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: '12px' }}>
                <p className="text-white font-bold">
                  {lang === 'EN' ? 'Total Amount Due' : 'Jumlah Perlu Dibayar'}
                </p>
                <p className="font-black text-lg text-white">RM{totalAmountMyr?.toFixed(2)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* What you can control */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}>
        <p className="text-sm font-bold mb-3" style={{ color: '#FACC15' }}>
          ⚡ {lang === 'EN' ? 'What You Can Control' : 'Apa Yang Anda Boleh Kawal'}
        </p>
        <div className="space-y-2">
          {[
            {
              label: lang === 'EN' ? '✅ Reduce kWh usage' : '✅ Kurangkan penggunaan kWh',
              desc: lang === 'EN' ? 'Directly reduces Generation, Capacity, Network charges' : 'Mengurangkan caj Tenaga, Kapasiti, Rangkaian secara langsung'
            },
            {
              label: lang === 'EN' ? '✅ Stay below 600 kWh' : '✅ Kekal bawah 600 kWh',
              desc: lang === 'EN' ? 'Waives RM10 Retail Charge + AFA + SST automatically' : 'Mengecualikan Caj Runcit RM10 + AFA + SST secara automatik'
            },
            {
              label: lang === 'EN' ? '❌ Cannot control' : '❌ Tidak boleh kawal',
              desc: lang === 'EN' ? 'AFA rate, KWTBB 1.6%, SST 8% — set by government' : 'Kadar AFA, KWTBB 1.6%, SST 8% — ditetapkan kerajaan'
            }
          ].map((item, i) => (
            <div key={i}>
              <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}