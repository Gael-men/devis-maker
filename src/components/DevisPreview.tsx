import React from 'react';
import { DevisData, CURRENCY_LABELS, CURRENCY_RATES } from '@/types/devis';
import { calcLineTotal, calcTotals, formatAmount } from '@/lib/devis-utils';
import { X, Printer, Download, Ship, Plane, Target, ImageIcon } from 'lucide-react';
import { exportToPDF } from '@/lib/pdf-export';

interface DevisPreviewProps {
  devis: DevisData;
  logoImage: string | null;
  isDark: boolean;
  onClose: () => void;
}

const ModeIcon = ({ mode }: { mode: string }) => {
  if (mode === 'BATEAU') return <Ship className="w-3 h-3 inline mr-1 flex-shrink-0" />;
  if (mode === 'AVION') return <Plane className="w-3 h-3 inline mr-1 flex-shrink-0" />;
  return <Target className="w-3 h-3 inline mr-1 flex-shrink-0" />;
};

// ── Palette identique au PDF ──────────────────────────────────────────────────
const TEAL       = '#168282';
const TEAL_DARK  = '#0f5050';
const ORANGE     = '#DC8C28';
const ORANGE_DARK= '#b8721a';

// Dark-mode glass variants
const D_TEAL_BG  = 'rgba(15,80,80,0.75)';
const D_TEAL_ALT = 'rgba(15,60,60,0.5)';
const D_ORANGE_BG= 'rgba(160,90,10,0.75)';
const D_ROW_EVEN = 'rgba(255,255,255,0.025)';
const D_ROW_ODD  = 'rgba(255,255,255,0.055)';
const D_TOTAL_BG = 'rgba(22,100,100,0.35)';
const D_BORDER   = 'rgba(255,255,255,0.07)';
const D_PAGE_BG  = 'rgba(8,22,30,0.98)';

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

  // ── Color helpers ──────────────────────────────────────────────────────────
  const headerTealBg = isDark ? D_TEAL_BG    : TEAL;
  const headerOrangeBg= isDark ? D_ORANGE_BG  : ORANGE;
  const tableBorder   = isDark ? D_BORDER     : '#c8dada';
  const pageBackground= isDark ? D_PAGE_BG    : '#f0f5f5';
  const docBackground = isDark ? 'rgba(12,30,40,0.98)' : '#ffffff';
  const theadBg       = isDark ? 'rgba(15,70,70,0.9)'  : TEAL_DARK;
  const modeBg        = isDark ? D_ORANGE_BG  : ORANGE;
  const totalsBg      = isDark ? D_TOTAL_BG   : '#c8dada';

  const colHeaders = [
    { label: 'N°',                                   w: '4%',  align: 'center' as const },
    { label: 'IMAGES',                               w: '6%',  align: 'center' as const },
    { label: 'DESCRIPTION',                          w: '20%', align: 'left'   as const },
    { label: 'Q',                                    w: '4%',  align: 'center' as const },
    { label: 'P.U',                                  w: '8%',  align: 'center' as const },
    { label: `FRAIS D'EXPÉDITION\nET DE PLATEFORME\n(${currency})`, w: '10%', align: 'center' as const },
    { label: `PRIX TOTAL\n(${currency})`,            w: '9%',  align: 'center' as const },
    { label: `FRAIS DE RÉCUPÉRATION\n(BATEAU) (${currency})`, w: '11%', align: 'center' as const },
    { label: `FRAIS DE RÉCUPÉRATION\n(AVION) (${currency})`,  w: '11%', align: 'center' as const },
    { label: 'MODE CHOISI',                          w: '10%', align: 'center' as const, orange: true },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: isDark ? 'rgba(4,14,20,0.96)' : 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)' }}
    >
      {/* ── TOOLBAR ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-6 py-3 print:hidden"
        style={{
          background: isDark ? 'rgba(8,25,35,0.92)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#dde8e8'}`,
          boxShadow: isDark ? '0 2px 20px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: TEAL }} />
          <span className="font-bold text-sm tracking-wide" style={{ color: isDark ? 'hsl(185,70%,75%)' : TEAL_DARK }}>
            Aperçu du Devis
          </span>
          <span
            className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
            style={{
              background: isDark ? 'rgba(22,130,130,0.2)' : 'hsl(179,55%,90%)',
              color: isDark ? 'hsl(185,80%,75%)' : TEAL,
            }}
          >
            Lecture seule
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ background: isDark ? 'rgba(22,130,130,0.5)' : TEAL, color: 'white' }}
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer
          </button>
          <button
            onClick={() => exportToPDF(devis, logoImage)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ background: isDark ? 'rgba(220,140,40,0.6)' : ORANGE, color: 'white' }}
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-opacity hover:opacity-80"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db',
              background: 'transparent',
              color: isDark ? 'rgba(255,255,255,0.7)' : '#374151',
            }}
          >
            <X className="w-3.5 h-3.5" />
            Fermer
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE DOCUMENT AREA ── */}
      <div className="flex-1 overflow-y-auto py-8 px-4" style={{ background: pageBackground }}>
        <div
          className="mx-auto rounded-xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
          style={{ maxWidth: 1080, background: docBackground, border: `1px solid ${tableBorder}` }}
        >

          {/* ── HEADER — two-tone band like PDF ── */}
          <div className="flex" style={{ minHeight: 110 }}>
            {/* LEFT teal band (62%) */}
            <div
              className="flex-1 px-7 py-6 flex flex-col justify-center gap-3 relative overflow-hidden"
              style={{ background: headerTealBg, flexBasis: '62%' }}
            >
              {isDark && (
                <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(100,220,220,0.07), transparent)', filter: 'blur(30px)' }} />
              )}
              {/* Logo + Title row */}
              <div className="flex items-center gap-4">
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden"
                  style={{
                    width: 64, height: 48,
                    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  {logoImage ? (
                    <img src={logoImage} alt="logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <ImageIcon className="w-4 h-4" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#aaa' }} />
                      <span className="text-[8px] font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : '#bbb' }}>LOGO</span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-widest text-white drop-shadow">GALIX SERVICES</h1>
                  <p className="text-[11px] text-white/60 mt-0.5">Gestion de devis professionnels</p>
                </div>
              </div>

              {/* Client info */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs">
                {[
                  ['Devis N°', devis.number],
                  ['Client(e)', devis.clientName || '[Nom du Client]'],
                  ['Contact Client(e)', devis.clientContact || '[Contact Client]'],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-baseline gap-1.5">
                    <span className="font-semibold text-white/70 whitespace-nowrap">{label} :</span>
                    <span className="text-white font-medium truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT orange band (38%) */}
            <div
              className="px-7 py-6 flex flex-col justify-center gap-2 relative overflow-hidden"
              style={{ background: headerOrangeBg, flexBasis: '38%' }}
            >
              {isDark && (
                <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,180,50,0.08), transparent)', filter: 'blur(25px)' }} />
              )}
              {/* Logo box top-right (white card) */}
              <div className="flex items-start justify-end mb-1">
                <div
                  className="rounded-xl overflow-hidden flex items-center justify-center"
                  style={{
                    width: 80, height: 56,
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  {logoImage ? (
                    <img src={logoImage} alt="logo" className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[9px] font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#999' }}>GALIX</span>
                      <span className="text-[9px] font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#999' }}>SERVICES</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Currency info */}
              <div className="text-xs text-white font-semibold">{CURRENCY_LABELS[currency]}</div>
              <div className="text-[10px] text-white/70">Taux : {rateDisplay}</div>
              <div className="text-[10px] text-white/60 mt-1">{today}</div>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  {colHeaders.map(({ label, w, align, orange }) => (
                    <th
                      key={label}
                      style={{
                        width: w,
                        background: orange ? modeBg : theadBg,
                        color: 'white',
                        textAlign: align,
                        verticalAlign: 'middle',
                        padding: '8px 6px',
                        fontWeight: 700,
                        fontSize: 10,
                        whiteSpace: 'pre-line',
                        lineHeight: 1.4,
                        borderRight: `1px solid rgba(255,255,255,0.15)`,
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
                  const rowBg = isDark ? (isEven ? D_ROW_EVEN : D_ROW_ODD) : (isEven ? '#ffffff' : '#f0f8f8');
                  const cellBorder = `1px solid ${tableBorder}`;

                  return (
                    <tr key={line.id} style={{ background: rowBg, borderBottom: cellBorder }}>
                      {/* N° */}
                      <td style={{ padding: '6px 4px', textAlign: 'center', borderRight: cellBorder, fontWeight: 600, color: isDark ? 'hsl(185,60%,75%)' : TEAL }}>
                        {i + 1}
                      </td>
                      {/* IMAGE */}
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: cellBorder }}>
                        {line.image ? (
                          <img src={line.image} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4, margin: 'auto', display: 'block', border: `1px solid ${tableBorder}` }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: 4, border: `1px dashed ${isDark ? 'rgba(255,255,255,0.12)' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
                            <span style={{ fontSize: 9, color: isDark ? 'rgba(255,255,255,0.2)' : '#ccc' }}>—</span>
                          </div>
                        )}
                      </td>
                      {/* DESCRIPTION */}
                      <td style={{ padding: '6px 8px', borderRight: cellBorder, color: isDark ? 'rgba(255,255,255,0.85)' : '#1a2a2a' }}>
                        {line.description || <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#ccc' }}>—</span>}
                      </td>
                      {/* Q */}
                      <td style={{ padding: '6px 4px', textAlign: 'center', borderRight: cellBorder }}>
                        {line.quantity === '' ? '0' : line.quantity}
                      </td>
                      {/* P.U */}
                      <td style={{ padding: '6px 6px', textAlign: 'right', borderRight: cellBorder }}>
                        {line.unitPrice === '' ? '—' : formatAmount(Number(line.unitPrice), currency)}
                      </td>
                      {/* FRAIS EXPÉD */}
                      <td style={{ padding: '6px 6px', textAlign: 'right', borderRight: cellBorder }}>
                        {line.shippingPlatformFees === '' ? '—' : formatAmount(Number(line.shippingPlatformFees), currency)}
                      </td>
                      {/* PRIX TOTAL */}
                      <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600, borderRight: cellBorder, color: isDark ? 'hsl(185,70%,75%)' : TEAL_DARK }}>
                        {formatAmount(total, currency)}
                      </td>
                      {/* RÉCUP BATEAU */}
                      <td style={{ padding: '6px 6px', textAlign: 'right', borderRight: cellBorder }}>
                        {line.recoveryBoat === '' ? '—' : formatAmount(Number(line.recoveryBoat), currency)}
                      </td>
                      {/* RÉCUP AVION */}
                      <td style={{ padding: '6px 6px', textAlign: 'right', borderRight: cellBorder }}>
                        {line.recoveryAir === '' ? '—' : formatAmount(Number(line.recoveryAir), currency)}
                      </td>
                      {/* MODE CHOISI */}
                      <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 700, background: isDark ? 'rgba(180,100,10,0.3)' : 'hsl(32,80%,96%)', color: isDark ? 'hsl(32,90%,78%)' : ORANGE_DARK }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                          <ModeIcon mode={line.shippingMode} />
                          {line.shippingMode === 'CUSTOM' ? 'PERSO.' : line.shippingMode}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* ── TOTALS ROW ── */}
                <tr style={{ background: totalsBg, fontWeight: 700, fontSize: 11 }}>
                  <td colSpan={5} style={{ padding: '8px 10px', textAlign: 'center', borderRight: `1px solid ${tableBorder}`, color: isDark ? 'hsl(185,60%,80%)' : TEAL_DARK }}>
                    TOTAUX
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', borderRight: `1px solid ${tableBorder}` }}>
                    {formatAmount(totals.totalFees, currency)}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', borderRight: `1px solid ${tableBorder}` }}>
                    {formatAmount(totals.totalPrix, currency)}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', borderRight: `1px solid ${tableBorder}` }}>
                    {formatAmount(totals.totalBoat, currency)}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', borderRight: `1px solid ${tableBorder}` }}>
                    {formatAmount(totals.totalAir, currency)}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, background: isDark ? 'rgba(200,120,10,0.7)' : ORANGE, color: 'white' }}>
                    {formatAmount(grandTotal, currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── SUMMARY CARDS — identical to PDF footer cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[
              { label: 'TOTAL BATEAU',      value: totals.modeBoat,  Icon: Ship,   lightBg: TEAL,                darkBg: 'rgba(0,110,120,0.55)',   lightText: 'white', darkText: 'hsl(185,80%,88%)' },
              { label: 'TOTAL AVION',       value: totals.modeAir,   Icon: Plane,  lightBg: ORANGE,              darkBg: 'rgba(160,90,20,0.55)',   lightText: 'white', darkText: 'hsl(35,90%,85%)'  },
              { label: 'TOTAL PERSONNALISÉ',value: totals.modeCustom, Icon: Target, lightBg: ORANGE_DARK,        darkBg: 'rgba(120,60,10,0.55)',   lightText: 'white', darkText: 'hsl(32,90%,82%)'  },
            ].map(({ label, value, Icon, lightBg, darkBg, lightText, darkText }, idx) => (
              <div
                key={label}
                style={{
                  background: isDark ? darkBg : lightBg,
                  color: isDark ? darkText : lightText,
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  borderRight: idx < 2 ? `1px solid ${tableBorder}` : undefined,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isDark && (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.03), transparent)', pointerEvents: 'none' }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, opacity: 0.9 }}>
                  <Icon style={{ width: 16, height: 16 }} />
                  {label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{formatAmount(value, currency)}</div>
                <div style={{ fontSize: 10, opacity: 0.55, letterSpacing: 2 }}>{currency}</div>
              </div>
            ))}
          </div>

          {/* ── FOOTER ── */}
          <div
            style={{
              padding: '10px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 10,
              color: isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8',
              background: isDark ? 'rgba(255,255,255,0.02)' : '#f0f8f8',
              borderTop: `1px solid ${tableBorder}`,
            }}
          >
            <span>Document généré par <strong style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b' }}>GALIX SERVICES</strong></span>
            <span>{today}</span>
            <span style={{ fontStyle: 'italic' }}>Aperçu — non contractuel</span>
          </div>

        </div>
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};

export default DevisPreview;
