import React, { useRef } from 'react';
import { DevisData, DevisLine, Currency, CURRENCY_RATES, CURRENCY_LABELS } from '@/types/devis';
import { calcTotals, createNewLine, formatAmount } from '@/lib/devis-utils';
import { DevisTableRow, ShippingIcon } from './DevisTableRow';
import { exportToPDF, exportToJSON, importFromJSON } from '@/lib/pdf-export';
import {
  Plus, RotateCcw, Download, Upload, Save,
  ImageIcon, Moon, Sun, Ship, Plane, Target,
  GripVertical
} from 'lucide-react';
import { useState } from 'react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { useColumnResize, ColumnDef } from '@/hooks/use-column-resize';

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'num',   defaultWidth: 40,  minWidth: 30 },
  { key: 'image', defaultWidth: 70,  minWidth: 50 },
  { key: 'desc',  defaultWidth: 180, minWidth: 100 },
  { key: 'qty',   defaultWidth: 55,  minWidth: 40 },
  { key: 'pu',    defaultWidth: 90,  minWidth: 60 },
  { key: 'fees',  defaultWidth: 110, minWidth: 70 },
  { key: 'total', defaultWidth: 100, minWidth: 70 },
  { key: 'boat',  defaultWidth: 110, minWidth: 70 },
  { key: 'air',   defaultWidth: 110, minWidth: 70 },
  { key: 'mode',  defaultWidth: 120, minWidth: 80 },
];

const INITIAL_DATA: DevisData = {
  number: '#2024-001',
  clientName: '',
  clientContact: '',
  currency: 'XOF',
  lines: [createNewLine()],
};

const DevisApp: React.FC = () => {
  const [devis, setDevis] = useState<DevisData>(INITIAL_DATA);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { widths: columnWidths, startResize } = useColumnResize(COLUMN_DEFS);

  const updateField = (field: keyof Omit<DevisData, 'lines'>, value: unknown) => {
    setDevis((prev) => ({ ...prev, [field]: value }));
  };

  const updateLine = (id: string, field: keyof DevisLine, value: unknown) => {
    setDevis((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  };

  const addLine = () => setDevis((prev) => ({ ...prev, lines: [...prev.lines, createNewLine()] }));

  const deleteLine = (id: string) =>
    setDevis((prev) => ({ ...prev, lines: prev.lines.filter((l) => l.id !== id) }));

  const reset = () => {
    if (confirm('Réinitialiser le devis ?')) {
      setDevis(INITIAL_DATA);
      setLogoImage(null);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleJSONImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importFromJSON(file);
      setDevis(data);
    } catch {
      alert("Erreur lors de l'importation du fichier JSON");
    }
  };

  const totals = calcTotals(devis.lines);
  const currency = devis.currency;
  const rate = CURRENCY_RATES[currency];
  const rateDisplay =
    currency === 'XOF'
      ? '1 XOF = 1.000 XOF'
      : `1 XOF = ${(1 / rate).toFixed(6)} ${currency}`;

  // ── Header column labels with resize handles ──────────────────────────
  const headerCols: { key: string; label: React.ReactNode; align?: string }[] = [
    { key: 'num',   label: 'N°',           align: 'center' },
    { key: 'image', label: 'IMAGES',        align: 'center' },
    { key: 'desc',  label: 'DESCRIPTION',  align: 'left' },
    { key: 'qty',   label: 'Q',             align: 'center' },
    { key: 'pu',    label: 'P.U',           align: 'center' },
    {
      key: 'fees',
      label: (
        <span className="leading-tight">
          FRAIS D'EXPÉDITION<br />ET DE PLATEFORME<br />({currency})
        </span>
      ),
      align: 'center',
    },
    {
      key: 'total',
      label: (
        <span className="leading-tight">
          PRIX TOTAL<br />({currency})
        </span>
      ),
      align: 'center',
    },
    {
      key: 'boat',
      label: (
        <span className="leading-tight">
          FRAIS DE RÉCUPÉRATION<br />(BATEAU) ({currency})
        </span>
      ),
      align: 'center',
    },
    {
      key: 'air',
      label: (
        <span className="leading-tight">
          FRAIS DE RÉCUPÉRATION<br />(AVION) ({currency})
        </span>
      ),
      align: 'center',
    },
  ];

  const headerBg = isDark ? 'glass-table-header' : '';
  const headerStyle = !isDark
    ? { background: 'hsl(var(--table-header-bg))', color: 'hsl(var(--table-header-fg))' }
    : {};

  const panelClass = isDark ? 'glass-panel' : 'bg-card border border-border';
  const headerClass = isDark ? 'glass-header' : '';
  const headerGradient = !isDark
    ? { background: 'linear-gradient(135deg, hsl(179,55%,28%) 0%, hsl(179,50%,38%) 50%, hsl(32,80%,55%) 100%)' }
    : {};

  return (
    <div className={`min-h-screen bg-background p-4 md:p-6 transition-colors duration-300`}>
      <div className="max-w-[1400px] mx-auto">

        {/* Dark mode toggle */}
        <div className="flex justify-end mb-3">
          <button
            onClick={toggleDark}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-card text-foreground hover:bg-accent/40 transition-all shadow-sm"
            title={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Mode Clair' : 'Mode Sombre'}
          </button>
        </div>

        {/* MAIN CARD */}
        <div className={`rounded-2xl shadow-xl overflow-hidden ${panelClass}`}>

          {/* HEADER */}
          <div
            className={`relative p-6 md:p-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4 ${headerClass}`}
            style={headerGradient}
          >
            <div className="flex-1 space-y-3 text-primary-foreground">
              {/* Logo + title */}
              <div className="flex items-center gap-4 mb-2">
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                {logoImage ? (
                  <img
                    src={logoImage}
                    alt="logo"
                    className="h-14 w-auto cursor-pointer rounded-lg shadow border border-white/30"
                    onClick={() => logoRef.current?.click()}
                  />
                ) : (
                  <button
                    onClick={() => logoRef.current?.click()}
                    className="flex flex-col items-center justify-center h-14 w-14 bg-white/20 rounded-xl border-2 border-dashed border-white/50 hover:bg-white/30 transition-colors text-white"
                    title="Importer votre logo"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-[9px] mt-0.5 font-medium">Logo</span>
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold tracking-wide drop-shadow">GALIX SERVICES</h1>
                  <p className="text-xs text-white/70 font-medium">Gestion de devis professionnels</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <span className="font-semibold whitespace-nowrap text-white/90">Devis N°</span>
                  <input
                    className="bg-transparent border-b border-white/50 outline-none flex-1 text-white placeholder:text-white/50 px-1 focus:border-white transition-colors"
                    value={devis.number}
                    onChange={(e) => updateField('number', e.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="font-semibold whitespace-nowrap text-white/90">Client(e):</span>
                  <input
                    className="bg-transparent border-b border-white/50 outline-none flex-1 text-white placeholder:text-white/50 px-1 focus:border-white transition-colors"
                    placeholder="[Nom du Client]"
                    value={devis.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="font-semibold whitespace-nowrap text-white/90">Contact Client(e):</span>
                  <input
                    className="bg-transparent border-b border-white/50 outline-none flex-1 text-white placeholder:text-white/50 px-1 focus:border-white transition-colors"
                    placeholder="[Contact Client]"
                    value={devis.clientContact}
                    onChange={(e) => updateField('clientContact', e.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="font-semibold whitespace-nowrap text-white/90">Devise:</span>
                  <select
                    className="bg-white/20 border border-white/30 rounded-lg text-white px-2 py-0.5 outline-none cursor-pointer hover:bg-white/30 transition-colors"
                    value={devis.currency}
                    onChange={(e) => updateField('currency', e.target.value as Currency)}
                  >
                    {(Object.entries(CURRENCY_LABELS) as [Currency, string][]).map(([k, v]) => (
                      <option key={k} value={k} className="text-foreground bg-card">{v}</option>
                    ))}
                  </select>
                  <span className="text-white/70 text-xs italic">Taux: {rateDisplay}</span>
                </label>
              </div>
            </div>

            {/* Logo top-right */}
            <div
              className={`hidden md:flex w-32 h-24 rounded-xl flex-shrink-0 overflow-hidden shadow-lg items-center justify-center cursor-pointer transition-all
                ${isDark ? 'bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15' : 'bg-white/90 border border-white/40 hover:bg-white'}`}
              onClick={() => logoRef.current?.click()}
              title="Cliquer pour changer le logo"
            >
              {logoImage ? (
                <img src={logoImage} alt="logo" className="w-full h-full object-contain p-1" />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-center p-2 gap-1">
                  <ImageIcon className={`w-8 h-8 ${isDark ? 'text-white/40' : 'text-muted-foreground/50'}`} />
                  <span className={`text-xs ${isDark ? 'text-white/50' : 'text-muted-foreground/70'}`}>Logo entreprise</span>
                </div>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
              <colgroup>
                {COLUMN_DEFS.map((c) => (
                  <col key={c.key} style={{ width: columnWidths[c.key] }} />
                ))}
                <col style={{ width: 40 }} />
              </colgroup>
              <thead>
                <tr className={headerBg} style={headerStyle}>
                  {headerCols.map(({ key, label, align }) => (
                    <th
                      key={key}
                      className="px-2 py-3 text-xs font-bold border-r border-white/20 relative select-none"
                      style={{ textAlign: (align as 'center' | 'left') ?? 'center', verticalAlign: 'middle' }}
                    >
                      {label}
                      {/* Resize handle */}
                      <div
                        className="col-resize-handle"
                        onMouseDown={(e) => startResize(e, key)}
                        title="Redimensionner la colonne"
                      >
                        <GripVertical className="w-2.5 h-2.5 text-white/60" />
                      </div>
                    </th>
                  ))}
                  {/* MODE CHOISI – special orange column */}
                  <th
                    className="px-2 py-3 text-xs font-bold border-r border-white/20 relative select-none"
                    style={{
                      background: isDark ? 'hsla(32,80%,40%,0.8)' : 'hsl(var(--table-mode-bg))',
                      color: 'white',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      width: columnWidths['mode'],
                    }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>MODE CHOISI</span>
                    </div>
                    <div
                      className="col-resize-handle"
                      onMouseDown={(e) => startResize(e, 'mode')}
                    >
                      <GripVertical className="w-2.5 h-2.5 text-white/60" />
                    </div>
                  </th>
                  <th className="w-10 px-1"></th>
                </tr>
              </thead>
              <tbody>
                {devis.lines.map((line, i) => (
                  <DevisTableRow
                    key={line.id}
                    line={line}
                    index={i}
                    isDark={isDark}
                    columnWidths={columnWidths}
                    onChange={updateLine}
                    onDelete={deleteLine}
                  />
                ))}

                {/* TOTAUX ROW */}
                <tr
                  className={`font-bold text-sm ${isDark ? 'glass-totals' : ''}`}
                  style={!isDark ? { background: 'hsl(210 15% 88%)' } : {}}
                >
                  <td colSpan={5} className="px-2 py-2 text-center border-r border-border text-sm">
                    TOTAUX
                  </td>
                  <td className="px-2 py-2 text-right border-r border-border">
                    {formatAmount(totals.totalFees, currency)}
                  </td>
                  <td className="px-2 py-2 text-right border-r border-border">
                    {formatAmount(totals.totalPrix, currency)}
                  </td>
                  <td className="px-2 py-2 text-right border-r border-border">
                    {formatAmount(totals.totalBoat, currency)}
                  </td>
                  <td className="px-2 py-2 text-right border-r border-border">
                    {formatAmount(totals.totalAir, currency)}
                  </td>
                  <td
                    className="px-2 py-2 text-right font-bold border-r border-border"
                    style={{
                      background: isDark ? 'hsla(32,80%,40%,0.75)' : 'hsl(var(--table-mode-bg))',
                      color: 'white',
                    }}
                  >
                    {formatAmount(totals.modeBoat + totals.modeAir + totals.modeCustom, currency)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ACTION BAR */}
          <div className={`flex flex-wrap items-stretch border-t border-border ${isDark ? 'glass-action-bar' : ''}`}>
            <button
              onClick={addLine}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold hover:opacity-90 transition-opacity flex-1 justify-center min-w-[140px]"
              style={{ background: 'hsl(179 55% 35%)', color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              Ajouter une ligne
            </button>

            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold hover:opacity-90 transition-opacity flex-1 justify-center min-w-[130px]"
              style={{ background: 'hsl(25 85% 50%)', color: 'white' }}
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>

            <button
              onClick={() => exportToPDF(devis, logoImage)}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold hover:opacity-90 transition-opacity flex-1 justify-center min-w-[130px]"
              style={{ background: 'hsl(270 60% 50%)', color: 'white' }}
            >
              <Download className="w-4 h-4" />
              Exporter PDF
            </button>

            <button
              onClick={() => jsonImportRef.current?.click()}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold hover:opacity-90 transition-opacity flex-1 justify-center min-w-[130px]"
              style={{ background: 'hsl(250 70% 55%)', color: 'white' }}
            >
              <Upload className="w-4 h-4" />
              Importer JSON
            </button>
            <input ref={jsonImportRef} type="file" accept=".json" className="hidden" onChange={handleJSONImport} />

            <button
              onClick={() => exportToJSON(devis)}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold hover:opacity-90 transition-opacity flex-1 justify-center min-w-[140px]"
              style={{ background: 'hsl(140 60% 35%)', color: 'white' }}
            >
              <Save className="w-4 h-4" />
              Sauvegarder JSON
            </button>
          </div>

          {/* TOTALS SUMMARY CARDS */}
          <div className={`grid grid-cols-3 gap-0 border-t border-border ${isDark ? 'glass-action-bar' : ''}`}>
            {/* BATEAU */}
            <div
              className={`flex flex-col items-center justify-center py-5 gap-1 border-r border-border ${isDark ? 'glass-total-card' : ''}`}
              style={!isDark ? { background: 'hsl(179 55% 35%)', color: 'white' } : {
                background: 'rgba(0,120,150,0.35)',
                color: 'hsl(185,80%,85%)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
                <Ship className="w-5 h-5" />
                TOTAL BATEAU
              </div>
              <div className="text-2xl font-bold">{formatAmount(totals.modeBoat, currency)}</div>
            </div>

            {/* AVION */}
            <div
              className={`flex flex-col items-center justify-center py-5 gap-1 border-r border-border ${isDark ? 'glass-total-card' : ''}`}
              style={!isDark ? { background: 'hsl(32 90% 55%)', color: 'white' } : {
                background: 'rgba(160,90,20,0.35)',
                color: 'hsl(35,90%,85%)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
                <Plane className="w-5 h-5" />
                TOTAL AVION
              </div>
              <div className="text-2xl font-bold">{formatAmount(totals.modeAir, currency)}</div>
            </div>

            {/* PERSONNALISÉ */}
            <div
              className={`flex flex-col items-center justify-center py-5 gap-1 ${isDark ? 'glass-total-card' : ''}`}
              style={!isDark ? { background: 'hsl(32 70% 65%)', color: 'white' } : {
                background: 'rgba(120,60,10,0.35)',
                color: 'hsl(32,90%,85%)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
                <Target className="w-5 h-5" />
                TOTAL PERSONNALISÉ
              </div>
              <div className="text-2xl font-bold">{formatAmount(totals.modeCustom, currency)}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DevisApp;
