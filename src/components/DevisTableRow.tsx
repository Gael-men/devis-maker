import React, { useRef } from 'react';
import { DevisLine, ShippingMode } from '@/types/devis';
import { calcLineTotal } from '@/lib/devis-utils';
import { Trash2, Upload, Ship, Plane, Target } from 'lucide-react';

interface DevisTableRowProps {
  line: DevisLine;
  index: number;
  isDark: boolean;
  columnWidths: Record<string, number>;
  onChange: (id: string, field: keyof DevisLine, value: unknown) => void;
  onDelete: (id: string) => void;
}

const numInput = 'w-full bg-transparent border-0 outline-none text-right text-sm p-1 text-foreground placeholder:text-muted-foreground';
const textInput = 'w-full bg-transparent border-0 outline-none text-sm p-1 text-foreground placeholder:text-muted-foreground';

const ShippingIcon = ({ mode, size = 14 }: { mode: ShippingMode; size?: number }) => {
  if (mode === 'BATEAU') return <Ship size={size} className="inline-block" />;
  if (mode === 'AVION') return <Plane size={size} className="inline-block" />;
  return <Target size={size} className="inline-block" />;
};

export const DevisTableRow: React.FC<DevisTableRowProps> = ({ line, index, isDark, columnWidths, onChange, onDelete }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(line.id, 'image', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const total = calcLineTotal(line);
  const rowClass = isDark
    ? `border-b border-border ${index % 2 === 0 ? 'glass-row' : 'glass-row-alt'}`
    : `border-b border-border ${index % 2 !== 0 ? 'bg-[hsl(var(--table-row-alt))]' : 'bg-card'} hover:bg-accent/40 transition-colors`;

  return (
    <tr className={rowClass}>
      {/* N° */}
      <td style={{ width: columnWidths['num'] }} className="px-2 py-1 text-center text-sm font-medium border-r border-border">
        {index + 1}
      </td>

      {/* IMAGE */}
      <td style={{ width: columnWidths['image'] }} className="px-1 py-1 text-center border-r border-border">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {line.image ? (
          <img
            src={line.image}
            alt="product"
            className="w-10 h-10 object-cover rounded cursor-pointer mx-auto border border-border"
            onClick={() => fileRef.current?.click()}
          />
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mx-auto"
            title="Importer une image"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importer</span>
          </button>
        )}
      </td>

      {/* DESCRIPTION */}
      <td style={{ width: columnWidths['desc'] }} className="px-1 py-1 border-r border-border">
        <input
          className={textInput}
          placeholder="Description..."
          value={line.description}
          onChange={(e) => onChange(line.id, 'description', e.target.value)}
        />
      </td>

      {/* Q */}
      <td style={{ width: columnWidths['qty'] }} className="px-1 py-1 border-r border-border">
        <input
          className={numInput}
          type="number"
          min="0"
          placeholder="0"
          value={line.quantity}
          onChange={(e) => onChange(line.id, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </td>

      {/* P.U */}
      <td style={{ width: columnWidths['pu'] }} className="px-1 py-1 border-r border-border">
        <input
          className={numInput}
          type="number"
          min="0"
          placeholder="0.00"
          value={line.unitPrice}
          onChange={(e) => onChange(line.id, 'unitPrice', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </td>

      {/* FRAIS EXPÉD. PLATEFORME */}
      <td style={{ width: columnWidths['fees'] }} className="px-1 py-1 border-r border-border">
        <input
          className={numInput}
          type="number"
          min="0"
          placeholder="0.00"
          value={line.shippingPlatformFees}
          onChange={(e) => onChange(line.id, 'shippingPlatformFees', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </td>

      {/* PRIX TOTAL */}
      <td style={{ width: columnWidths['total'] }} className="px-2 py-1 text-right text-sm font-semibold border-r border-border">
        {total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>

      {/* FRAIS RÉCUP. BATEAU */}
      <td style={{ width: columnWidths['boat'] }} className="px-1 py-1 border-r border-border">
        <input
          className={numInput}
          type="number"
          min="0"
          placeholder="0.00"
          value={line.recoveryBoat}
          onChange={(e) => onChange(line.id, 'recoveryBoat', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </td>

      {/* FRAIS RÉCUP. AVION */}
      <td style={{ width: columnWidths['air'] }} className="px-1 py-1 border-r border-border">
        <input
          className={numInput}
          type="number"
          min="0"
          placeholder="0.00"
          value={line.recoveryAir}
          onChange={(e) => onChange(line.id, 'recoveryAir', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </td>

      {/* MODE CHOISI */}
      <td style={{ width: columnWidths['mode'] }} className="px-1 py-1 border-r border-border">
        <select
          className="w-full text-xs border border-primary/40 rounded px-1 py-1 bg-card text-foreground outline-none cursor-pointer focus:border-primary"
          value={line.shippingMode}
          onChange={(e) => onChange(line.id, 'shippingMode', e.target.value as ShippingMode)}
        >
          <option value="BATEAU">BATEAU</option>
          <option value="AVION">AVION</option>
          <option value="CUSTOM">PERSONNALISÉ</option>
        </select>
      </td>

      {/* DELETE */}
      <td className="px-1 py-1 text-center w-10">
        <button
          onClick={() => onDelete(line.id)}
          className="text-destructive hover:opacity-70 transition-opacity p-1 rounded hover:bg-destructive/10"
          title="Supprimer la ligne"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
};

export { ShippingIcon };
