import React, { useRef, useState } from 'react';
import { DevisData, DevisLine, Currency, CURRENCY_RATES, CURRENCY_LABELS } from '@/types/devis';
import { calcTotals, createNewLine, formatAmount } from '@/lib/devis-utils';
import { DevisTableRow } from './DevisTableRow';
import { exportToPDF, exportToJSON, importFromJSON } from '@/lib/pdf-export';
import { Plus, RotateCcw, Download, Upload, Save, Image } from 'lucide-react';

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

  const updateField = (field: keyof Omit<DevisData, 'lines'>, value: unknown) => {
    setDevis((prev) => ({ ...prev, [field]: value }));
  };

  const updateLine = (id: string, field: keyof DevisLine, value: unknown) => {
    setDevis((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  };

  const addLine = () => {
    setDevis((prev) => ({ ...prev, lines: [...prev.lines, createNewLine()] }));
  };

  const deleteLine = (id: string) => {
    setDevis((prev) => ({ ...prev, lines: prev.lines.filter((l) => l.id !== id) }));
  };

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
      alert('Erreur lors de l\'importation du fichier JSON');
    }
  };

  const totals = calcTotals(devis.lines);
  const currency = devis.currency;
  const rate = CURRENCY_RATES[currency];
  const rateDisplay = currency === 'XOF'
    ? '1 XOF = 1.000 XOF'
    : `1 XOF = ${(1 / rate).toFixed(6)} ${currency}`;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* MAIN CARD */}
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border">

          {/* HEADER */}
          <div
            className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
            style={{ background: 'linear-gradient(135deg, hsl(179,55%,28%) 0%, hsl(179,50%,38%) 50%, hsl(32,80%,55%) 100%)' }}
          >
            <div className="flex-1 space-y-3 text-primary-foreground">
              {/* Logo + title */}
              <div className="flex items-center gap-4 mb-2">
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                {logoImage ? (
                  <img
                    src={logoImage}
                    alt="logo"
                    className="h-14 w-auto cursor-pointer rounded"
                    onClick={() => logoRef.current?.click()}
                  />
                ) : (
                  <button
                    onClick={() => logoRef.current?.click()}
                    className="flex flex-col items-center justify-center h-14 w-14 bg-white/20 rounded-lg border-2 border-dashed border-white/50 hover:bg-white/30 transition-colors text-white"
                  >
                    <Image className="w-5 h-5" />
                    <span className="text-[9px] mt-0.5">Logo</span>
                  </button>
                )}
                <h1 className="text-2xl font-bold tracking-wide">GALIX SERVICES</h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <span className="font-semibold whitespace-nowrap">Devis N°</span>
                  <input
                    className="bg-transparent border-b border-white/60 outline-none flex-1 text-white placeholder:text-white/60 px-1"
                    value={devis.number}
                    onChange={(e) => updateField('number', e.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="font-semibold whitespace-nowrap">Client(e):</span>
                  <input
                    className="bg-transparent border-b border-white/60 outline-none flex-1 text-white placeholder:text-white/60 px-1"
                    placeholder="[Nom du Client]"
                    value={devis.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="font-semibold whitespace-nowrap">Contact Client(e):</span>
                  <input
                    className="bg-transparent border-b border-white/60 outline-none flex-1 text-white placeholder:text-white/60 px-1"
                    placeholder="[Contact Client]"
                    value={devis.clientContact}
                    onChange={(e) => updateField('clientContact', e.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="font-semibold whitespace-nowrap">Devise:</span>
                  <select
                    className="bg-white/20 border border-white/40 rounded text-white px-2 py-0.5 outline-none cursor-pointer"
                    value={devis.currency}
                    onChange={(e) => updateField('currency', e.target.value as Currency)}
                  >
                    {(Object.entries(CURRENCY_LABELS) as [Currency, string][]).map(([k, v]) => (
                      <option key={k} value={k} className="text-foreground bg-card">{v}</option>
                    ))}
                  </select>
                  <span className="text-white/80 text-xs">Taux: {rateDisplay}</span>
                </label>
              </div>
            </div>

            {/* Logo placeholder top-right */}
            <div className="hidden md:block w-32 h-24 bg-white/90 rounded-lg flex-shrink-0 overflow-hidden shadow-md">
              {logoImage ? (
                <img src={logoImage} alt="logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center p-2">
                  Logo entreprise
                </div>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: 'hsl(var(--table-header-bg))', color: 'hsl(var(--table-header-fg))' }}>
                  <th className="px-2 py-3 text-center border-r border-white/20 text-xs font-bold">N°</th>
                  <th className="px-2 py-3 text-center border-r border-white/20 text-xs font-bold">IMAGES</th>
                  <th className="px-2 py-3 text-left border-r border-white/20 text-xs font-bold">DESCRIPTION</th>
                  <th className="px-2 py-3 text-center border-r border-white/20 text-xs font-bold">Q</th>
                  <th className="px-2 py-3 text-center border-r border-white/20 text-xs font-bold">P.U</th>
                  <th className="px-2 py-3 text-center border-r border-white/20 text-xs font-bold leading-tight">
                    FRAIS D'EXPÉDITION<br/>ET DE PLATEFORME ({currency})
                  </th>
                  <th className="px-2 py-3 text-center border-r border-white/20 text-xs font-bold leading-tight">
                    PRIX TOTAL ({currency})
                  </th>
                  <th className="px-2 py-3 text-center border-r border-white/20 text-xs font-bold leading-tight">
                    FRAIS DE RÉCUPÉRATION<br/>(BATEAU) ({currency})
                  </th>
                  <th className="px-2 py-3 text-center border-r border-white/20 text-xs font-bold leading-tight">
                    FRAIS DE RÉCUPÉRATION<br/>(AVION) ({currency})
                  </th>
                  <th className="px-2 py-3 text-center border-r border-white/20 text-xs font-bold"
                    style={{ background: 'hsl(var(--table-mode-bg))' }}>
                    🎯 MODE CHOISI
                  </th>
                  <th className="px-2 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {devis.lines.map((line, i) => (
                  <DevisTableRow
                    key={line.id}
                    line={line}
                    index={i}
                    onChange={updateLine}
                    onDelete={deleteLine}
                  />
                ))}
                {/* TOTAUX ROW */}
                <tr style={{ background: 'hsl(210 15% 88%)' }} className="font-bold text-sm">
                  <td colSpan={5} className="px-2 py-2 text-center text-sm border-r border-border">TOTAUX</td>
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
                    style={{ background: 'hsl(var(--table-mode-bg))', color: 'white' }}
                  >
                    {formatAmount(totals.modeBoat + totals.modeAir + totals.modeCustom, currency)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-wrap items-stretch border-t border-border">
            {/* Add line */}
            <button
              onClick={addLine}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors hover:opacity-90 flex-1 justify-center min-w-[140px]"
              style={{ background: 'hsl(179 55% 35%)', color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              Ajouter une ligne
            </button>

            {/* Réinitialiser */}
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors hover:opacity-90 flex-1 justify-center min-w-[130px]"
              style={{ background: 'hsl(25 85% 50%)', color: 'white' }}
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>

            {/* Export PDF */}
            <button
              onClick={() => exportToPDF(devis)}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors hover:opacity-90 flex-1 justify-center min-w-[130px]"
              style={{ background: 'hsl(270 60% 50%)', color: 'white' }}
            >
              <Download className="w-4 h-4" />
              Exporter PDF
            </button>

            {/* Importer JSON */}
            <button
              onClick={() => jsonImportRef.current?.click()}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors hover:opacity-90 flex-1 justify-center min-w-[130px]"
              style={{ background: 'hsl(250 70% 55%)', color: 'white' }}
            >
              <Upload className="w-4 h-4" />
              Importer JSON
            </button>
            <input ref={jsonImportRef} type="file" accept=".json" className="hidden" onChange={handleJSONImport} />

            {/* Sauvegarder JSON */}
            <button
              onClick={() => exportToJSON(devis)}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors hover:opacity-90 flex-1 justify-center min-w-[140px]"
              style={{ background: 'hsl(140 60% 35%)', color: 'white' }}
            >
              <Save className="w-4 h-4" />
              Sauvegarder JSON
            </button>

            {/* Summary totals */}
            <div
              className="flex items-center gap-1 px-4 py-4 text-sm font-bold flex-1 justify-center min-w-[110px]"
              style={{ background: 'hsl(179 55% 88%)', color: 'hsl(179 55% 20%)' }}
            >
              <span>🚢 BATEAU:</span>
              <span>{formatAmount(totals.modeBoat, currency)}</span>
            </div>

            <div
              className="flex items-center gap-1 px-4 py-4 text-sm font-bold flex-1 justify-center min-w-[110px]"
              style={{ background: 'hsl(32 90% 88%)', color: 'hsl(32 90% 25%)' }}
            >
              <span>✈️ AVION:</span>
              <span>{formatAmount(totals.modeAir, currency)}</span>
            </div>

            <div
              className="flex items-center gap-1 px-4 py-4 text-sm font-bold flex-1 justify-center min-w-[120px]"
              style={{ background: 'hsl(32 85% 75%)', color: 'hsl(32 90% 20%)' }}
            >
              <span>🎯 PERSONNALISÉ:</span>
              <span>{formatAmount(totals.modeCustom, currency)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DevisApp;
