import React from 'react';
import { DevisData, CURRENCY_LABELS, CURRENCY_RATES } from '@/types/devis';
import { calcLineTotal, calcTotals, formatAmount } from '@/lib/devis-utils';
import { X, Printer, Download, Ship, Plane, Target } from 'lucide-react';
import { exportToPDF } from '@/lib/pdf-export';

interface DevisPreviewProps {
  devis: DevisData;
  logoImage: string | null;
  isDark: boolean;
  onClose: () => void;
}

const ModeIcon = ({ mode }: { mode: string }) => {
  if (mode === 'BATEAU') return <Ship className="w-3.5 h-3.5 inline mr-1" />;
  if (mode === 'AVION') return <Plane className="w-3.5 h-3.5 inline mr-1" />;
  return <Target className="w-3.5 h-3.5 inline mr-1" />;
};

const DevisPreview: React.FC<DevisPreviewProps> = ({ devis, logoImage, isDark, onClose }) => {
  const currency = devis.currency;
  const rate = CURRENCY_RATES[currency];
  const rateDisplay =
    currency === 'XOF'
      ? '1 XOF = 1.000 XOF'
      : `1 XOF = ${(1 / rate).toFixed(6)} ${currency}`;
  const totals = calcTotals(devis.lines);
  const grandTotal = totals.modeBoat + totals.modeAir + totals.modeCustom;
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => window.print();

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background: isDark ? 'rgba(5,20,30,0.92)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
    >
      {/* Toolbar */}
      <div
        className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 print:hidden"
        style={{
          background: isDark
            ? 'rgba(10,30,40,0.85)'
            : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: isDark ? 'hsl(185,80%,80%)' : 'hsl(179,55%,28%)' }}
          >
            Mode Aperçu — Devis {devis.number}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: isDark ? 'rgba(22,130,130,0.3)' : 'hsl(179,55%,90%)',
              color: isDark ? 'hsl(185,80%,80%)' : 'hsl(179,55%,28%)',
            }}
          >
            Lecture seule
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: isDark ? 'rgba(22,130,130,0.4)' : 'hsl(179,55%,35%)',
              color: 'white',
            }}
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
          <button
            onClick={() => exportToPDF(devis, logoImage)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: isDark ? 'rgba(150,70,220,0.5)' : 'hsl(270,60%,50%)',
              color: 'white',
            }}
          >
            <Download className="w-4 h-4" />
            Exporter PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'hsl(var(--border))',
              color: isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
              background: 'transparent',
            }}
          >
            <X className="w-4 h-4" />
            Fermer
          </button>
        </div>
      </div>

      {/* Document */}
      <div
        id="devis-preview-doc"
        className="my-20 mx-auto w-full print:my-0 print:mx-0 print:shadow-none"
        style={{ maxWidth: 1050 }}
      >
        <div
          className="rounded-2xl shadow-2xl overflow-hidden print:rounded-none"
          style={{
            background: isDark ? 'rgba(10,28,38,0.97)' : 'white',
            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e2e8f0',
          }}
        >
          {/* ── HEADER ── */}
          <div
            className="relative p-8"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(15,60,70,0.95) 0%, rgba(20,50,65,0.9) 50%, rgba(120,70,10,0.7) 100%)'
                : 'linear-gradient(135deg, hsl(179,55%,28%) 0%, hsl(179,50%,38%) 55%, hsl(32,80%,55%) 100%)',
            }}
          >
            {/* Decorative blobs for glass effect (dark mode) */}
            {isDark && (
              <>
                <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, hsl(185,80%,60%), transparent)', filter: 'blur(40px)' }} />
                <div className="absolute -bottom-8 right-1/3 w-48 h-48 rounded-full opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, hsl(32,90%,60%), transparent)', filter: 'blur(30px)' }} />
              </>
            )}

            <div className="relative flex items-start justify-between gap-6">
              {/* Left info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  {logoImage ? (
                    <img src={logoImage} alt="logo" className="h-16 w-auto rounded-xl shadow-lg border border-white/20" />
                  ) : (
                    <div className="h-16 w-16 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center">
                      <span className="text-white/40 text-xs font-bold">LOGO</span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-black tracking-wider text-white drop-shadow-md">GALIX SERVICES</h1>
                    <p className="text-white/60 text-sm mt-0.5">Gestion de devis professionnels</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                  {[
                    ['Devis N°', devis.number],
                    ['Date', today],
                    ['Client(e)', devis.clientName || '—'],
                    ['Contact', devis.clientContact || '—'],
                    ['Devise', CURRENCY_LABELS[currency]],
                    ['Taux', rateDisplay],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-baseline gap-2">
                      <span className="font-semibold text-white/70 whitespace-nowrap">{label} :</span>
                      <span className="text-white font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — devis number badge */}
              <div
                className="hidden md:flex flex-col items-center justify-center rounded-2xl px-8 py-5 flex-shrink-0 shadow-xl"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  minWidth: 150,
                }}
              >
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Devis</span>
                <span className="text-white font-black text-2xl tracking-wide">{devis.number}</span>
                <div className="w-10 h-0.5 rounded-full mt-2" style={{ background: 'rgba(255,255,255,0.3)' }} />
                <span className="text-white/50 text-xs mt-2">{today}</span>
              </div>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{
                  background: isDark ? 'rgba(22,100,100,0.6)' : 'hsl(179,55%,28%)',
                  color: 'white',
                }}>
                  {[
                    { label: 'N°', w: '4%', align: 'center' },
                    { label: 'IMAGE', w: '6%', align: 'center' },
                    { label: 'DESCRIPTION', w: '18%', align: 'left' },
                    { label: 'Q', w: '4%', align: 'center' },
                    { label: 'P.U', w: '9%', align: 'right' },
                    { label: `FRAIS EXPÉD. & PLATEFORME (${currency})`, w: '11%', align: 'right' },
                    { label: `PRIX TOTAL (${currency})`, w: '10%', align: 'right' },
                    { label: `RÉCUP. BATEAU (${currency})`, w: '11%', align: 'right' },
                    { label: `RÉCUP. AVION (${currency})`, w: '11%', align: 'right' },
                    { label: 'MODE CHOISI', w: '11%', align: 'center', orange: true },
                  ].map(({ label, w, align, orange }) => (
                    <th
                      key={label}
                      className="px-2 py-3 text-xs font-bold border-r"
                      style={{
                        width: w,
                        textAlign: align as 'center' | 'left' | 'right',
                        verticalAlign: 'middle',
                        borderColor: 'rgba(255,255,255,0.15)',
                        background: orange
                          ? isDark ? 'rgba(200,110,10,0.8)' : 'hsl(32,80%,50%)'
                          : undefined,
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devis.lines.map((line, i) => {
                  const total = calcLineTotal(line);
                  const isEven = i % 2 === 0;
                  return (
                    <tr
                      key={line.id}
                      style={{
                        background: isDark
                          ? isEven ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.05)'
                          : isEven ? 'white' : 'hsl(179,30%,97%)',
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e8f0f0',
                      }}
                    >
                      <td className="px-2 py-2 text-center font-semibold border-r"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#dde8e8', color: isDark ? 'hsl(185,60%,75%)' : 'hsl(179,55%,30%)' }}>
                        {i + 1}
                      </td>
                      <td className="px-1 py-2 text-center border-r"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#dde8e8' }}>
                        {line.image ? (
                          <img src={line.image} alt="" className="w-10 h-10 object-cover rounded mx-auto border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded border border-dashed mx-auto flex items-center justify-center"
                            style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#ccc' }}>
                            <span className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#aaa' }}>—</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 border-r"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#dde8e8', color: isDark ? 'hsl(var(--foreground))' : 'inherit' }}>
                        {line.description || <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#ccc' }}>—</span>}
                      </td>
                      <td className="px-2 py-2 text-center border-r"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#dde8e8' }}>
                        {line.quantity === '' ? '0' : line.quantity}
                      </td>
                      <td className="px-2 py-2 text-right border-r"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#dde8e8' }}>
                        {line.unitPrice === '' ? '—' : formatAmount(Number(line.unitPrice), currency)}
                      </td>
                      <td className="px-2 py-2 text-right border-r"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#dde8e8' }}>
                        {line.shippingPlatformFees === '' ? '—' : formatAmount(Number(line.shippingPlatformFees), currency)}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold border-r"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#dde8e8', color: isDark ? 'hsl(185,80%,75%)' : 'hsl(179,55%,28%)' }}>
                        {formatAmount(total, currency)}
                      </td>
                      <td className="px-2 py-2 text-right border-r"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#dde8e8' }}>
                        {line.recoveryBoat === '' ? '—' : formatAmount(Number(line.recoveryBoat), currency)}
                      </td>
                      <td className="px-2 py-2 text-right border-r"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#dde8e8' }}>
                        {line.recoveryAir === '' ? '—' : formatAmount(Number(line.recoveryAir), currency)}
                      </td>
                      {/* MODE CHOISI */}
                      <td className="px-2 py-2 text-center font-bold"
                        style={{
                          background: isDark ? 'rgba(180,100,10,0.35)' : 'hsl(32,80%,96%)',
                          color: isDark ? 'hsl(32,90%,80%)' : 'hsl(32,80%,40%)',
                        }}>
                        <span className="inline-flex items-center justify-center gap-1">
                          <ModeIcon mode={line.shippingMode} />
                          {line.shippingMode === 'CUSTOM' ? 'PERSO.' : line.shippingMode}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* TOTALS ROW */}
                <tr style={{
                  background: isDark ? 'rgba(22,100,100,0.25)' : 'hsl(179,30%,90%)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}>
                  <td colSpan={5} className="px-3 py-2.5 text-center border-r"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#c8dada', color: isDark ? 'hsl(185,60%,75%)' : 'hsl(179,55%,28%)' }}>
                    TOTAUX
                  </td>
                  <td className="px-2 py-2.5 text-right border-r"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#c8dada' }}>
                    {formatAmount(totals.totalFees, currency)}
                  </td>
                  <td className="px-2 py-2.5 text-right border-r"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#c8dada' }}>
                    {formatAmount(totals.totalPrix, currency)}
                  </td>
                  <td className="px-2 py-2.5 text-right border-r"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#c8dada' }}>
                    {formatAmount(totals.totalBoat, currency)}
                  </td>
                  <td className="px-2 py-2.5 text-right border-r"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#c8dada' }}>
                    {formatAmount(totals.totalAir, currency)}
                  </td>
                  <td className="px-2 py-2.5 text-right font-black"
                    style={{
                      background: isDark ? 'rgba(200,110,10,0.6)' : 'hsl(32,80%,50%)',
                      color: 'white',
                    }}>
                    {formatAmount(grandTotal, currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── SUMMARY CARDS ── */}
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { label: 'TOTAL BATEAU', value: totals.modeBoat, Icon: Ship, dark: { bg: 'rgba(0,120,150,0.35)', text: 'hsl(185,80%,85%)' }, light: { bg: 'hsl(179,55%,35%)', text: 'white' } },
              { label: 'TOTAL AVION', value: totals.modeAir, Icon: Plane, dark: { bg: 'rgba(160,90,20,0.35)', text: 'hsl(35,90%,85%)' }, light: { bg: 'hsl(32,90%,55%)', text: 'white' } },
              { label: 'TOTAL PERSONNALISÉ', value: totals.modeCustom, Icon: Target, dark: { bg: 'rgba(120,60,10,0.35)', text: 'hsl(32,90%,85%)' }, light: { bg: 'hsl(32,70%,65%)', text: 'white' } },
            ].map(({ label, value, Icon, dark: d, light: l }) => (
              <div key={label} className="flex flex-col items-center justify-center py-7 gap-2"
                style={{ background: isDark ? d.bg : l.bg, color: isDark ? d.text : l.text }}>
                <div className="flex items-center gap-2 text-sm font-bold tracking-wide opacity-90">
                  <Icon className="w-5 h-5" />
                  {label}
                </div>
                <div className="text-3xl font-black">{formatAmount(value, currency)}</div>
                <div className="text-xs opacity-60 uppercase tracking-widest">{currency}</div>
              </div>
            ))}
          </div>

          {/* ── FOOTER ── */}
          <div
            className="px-8 py-4 flex items-center justify-between text-xs"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'hsl(179,20%,96%)',
              borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #dde8e8',
              color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8',
            }}
          >
            <span>Document généré par <strong style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>GALIX SERVICES</strong></span>
            <span>{today}</span>
            <span className="italic">Aperçu — non contractuel</span>
          </div>
        </div>

        {/* bottom spacing */}
        <div className="h-12 print:hidden" />
      </div>
    </div>
  );
};

export default DevisPreview;
