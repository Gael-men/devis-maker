import { DevisData, DevisLine, Currency, CURRENCY_RATES, CURRENCY_LABELS } from '@/types/devis';
import { calcLineTotal, calcRecovery, formatAmount } from '@/lib/devis-utils';

export async function exportToPDF(devis: DevisData) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const currency = devis.currency;
  const rate = CURRENCY_RATES[currency];

  // Header
  doc.setFillColor(22, 130, 130);
  doc.rect(0, 0, 297, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('GALIX SERVICES', 14, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Devis N° ${devis.number}`, 14, 22);
  doc.text(`Client: ${devis.clientName}`, 14, 28);
  doc.text(`Contact: ${devis.clientContact}`, 14, 34);
  doc.text(`Devise: ${CURRENCY_LABELS[currency]} | Taux: 1 XOF = ${(1 / rate).toFixed(4)} ${currency}`, 150, 28);

  const head = [
    ['N°', 'DESCRIPTION', 'Q', 'P.U', 'FRAIS EXPÉD. PLATEFORME', 'PRIX TOTAL', 'RÉCUP. BATEAU', 'RÉCUP. AVION', 'MODE']
  ];

  const body = devis.lines.map((line, i) => [
    i + 1,
    line.description,
    line.quantity === '' ? '' : line.quantity,
    line.unitPrice === '' ? '' : formatAmount(Number(line.unitPrice), currency),
    line.shippingPlatformFees === '' ? '' : formatAmount(Number(line.shippingPlatformFees), currency),
    formatAmount(calcLineTotal(line), currency),
    line.recoveryBoat === '' ? '' : formatAmount(Number(line.recoveryBoat), currency),
    line.recoveryAir === '' ? '' : formatAmount(Number(line.recoveryAir), currency),
    line.shippingMode,
  ]);

  autoTable(doc, {
    startY: 45,
    head,
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [22, 100, 100], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 250, 250] },
  });

  doc.save(`Devis-${devis.number}.pdf`);
}

export function exportToJSON(devis: DevisData) {
  const blob = new Blob([JSON.stringify(devis, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Devis-${devis.number}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<DevisData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as DevisData;
        resolve(data);
      } catch {
        reject(new Error('Fichier JSON invalide'));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
