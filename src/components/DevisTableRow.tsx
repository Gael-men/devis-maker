import React, { useRef } from 'react';
import { DevisLine, ShippingMode } from '@/types/devis';
import { calcLineTotal } from '@/lib/devis-utils';
import { Trash2, Upload } from 'lucide-react';

interface DevisTableRowProps {
  line: DevisLine;
  index: number;
  onChange: (id: string, field: keyof DevisLine, value: unknown) => void;
  onDelete: (id: string) => void;
}

const numInput = 'w-full bg-transparent border-0 outline-none text-right text-sm p-1';
const textInput = 'w-full bg-transparent border-0 outline-none text-sm p-1';

export const DevisTableRow: React.FC<DevisTableRowProps> = ({ line, index, onChange, onDelete }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(line.id, 'image', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const total = calcLineTotal(line);

  return (
    <tr className="border-b border-border hover:bg-[hsl(var(--table-row-alt))]">
      {/* N° */}
      <td className="px-2 py-1 text-center text-sm font-medium border-r border-border">{index + 1}</td>

      {/* IMAGE */}
      <td className="px-1 py-1 text-center border-r border-border">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {line.image ? (
          <img
            src={line.image}
            alt="product"
            className="w-12 h-12 object-cover rounded cursor-pointer mx-auto"
            onClick={() => fileRef.current?.click()}
          />
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-xs text-primary hover:underline mx-auto"
          >
            <Upload className="w-3 h-3" /> Importer
          </button>
        )}
      </td>

      {/* DESCRIPTION */}
      <td className="px-1 py-1 border-r border-border min-w-[160px]">
        <input
          className={textInput}
          placeholder="Description..."
          value={line.description}
          onChange={(e) => onChange(line.id, 'description', e.target.value)}
        />
      </td>

      {/* Q */}
      <td className="px-1 py-1 border-r border-border w-14">
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
      <td className="px-1 py-1 border-r border-border w-24">
        <input
          className={numInput}
          type="number"
          min="0"
          placeholder="0"
          value={line.unitPrice}
          onChange={(e) => onChange(line.id, 'unitPrice', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </td>

      {/* FRAIS EXPÉD. PLATEFORME */}
      <td className="px-1 py-1 border-r border-border w-28">
        <input
          className={numInput}
          type="number"
          min="0"
          placeholder="0"
          value={line.shippingPlatformFees}
          onChange={(e) => onChange(line.id, 'shippingPlatformFees', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </td>

      {/* PRIX TOTAL */}
      <td className="px-2 py-1 text-right text-sm font-semibold border-r border-border w-24">
        {total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>

      {/* FRAIS RÉCUP. BATEAU */}
      <td className="px-1 py-1 border-r border-border w-28">
        <input
          className={numInput}
          type="number"
          min="0"
          placeholder="0"
          value={line.recoveryBoat}
          onChange={(e) => onChange(line.id, 'recoveryBoat', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </td>

      {/* FRAIS RÉCUP. AVION */}
      <td className="px-1 py-1 border-r border-border w-28">
        <input
          className={numInput}
          type="number"
          min="0"
          placeholder="0"
          value={line.recoveryAir}
          onChange={(e) => onChange(line.id, 'recoveryAir', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </td>

      {/* MODE CHOISI */}
      <td className="px-1 py-1 border-r border-border w-32">
        <select
          className="w-full text-xs border border-primary rounded px-1 py-1 bg-card text-foreground outline-none cursor-pointer"
          value={line.shippingMode}
          onChange={(e) => onChange(line.id, 'shippingMode', e.target.value as ShippingMode)}
        >
          <option value="BATEAU">🚢 BATEAU</option>
          <option value="AVION">✈️ AVION</option>
          <option value="CUSTOM">🎯 PERSONNALISÉ</option>
        </select>
      </td>

      {/* DELETE */}
      <td className="px-1 py-1 text-center w-10">
        <button
          onClick={() => onDelete(line.id)}
          className="text-destructive hover:opacity-80 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};
