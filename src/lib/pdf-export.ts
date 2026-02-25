import { DevisData, DevisLine, Currency, CURRENCY_RATES, CURRENCY_LABELS } from '@/types/devis';
import { calcLineTotal, calcRecovery, formatAmount } from '@/lib/devis-utils';

export async function exportToPDF(devis: DevisData, logoImage?: string | null) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const currency = devis.currency;
  const rate = CURRENCY_RATES[currency];
  const pageW = 297;

  // ── Background ────────────────────────────────────────────────────────
  doc.setFillColor(240, 245, 245);
  doc.rect(0, 0, pageW, 210, 'F');

  // ── Header gradient band ──────────────────────────────────────────────
  // Teal left
  doc.setFillColor(22, 130, 130);
  doc.rect(0, 0, pageW * 0.62, 50, 'F');
  // Orange right
  doc.setFillColor(220, 140, 40);
  doc.rect(pageW * 0.62, 0, pageW * 0.38, 50, 'F');

  // ── Logo box (white card top-right) ───────────────────────────────────
  const logoBoxX = pageW - 52;
  const logoBoxY = 5;
  const logoBoxW = 44;
  const logoBoxH = 34;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(logoBoxX, logoBoxY, logoBoxW, logoBoxH, 3, 3, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(logoBoxX, logoBoxY, logoBoxW, logoBoxH, 3, 3, 'S');

  if (logoImage) {
    try {
      doc.addImage(logoImage, 'PNG', logoBoxX + 2, logoBoxY + 2, logoBoxW - 4, logoBoxH - 4);
    } catch (_) {
      // skip if image format not supported
    }
  } else {
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text('GALIX', logoBoxX + logoBoxW / 2, logoBoxY + logoBoxH / 2 - 2, { align: 'center' });
    doc.text('SERVICES', logoBoxX + logoBoxW / 2, logoBoxY + logoBoxH / 2 + 4, { align: 'center' });
  }

  // ── Header text ───────────────────────────────────────────────────────
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GALIX SERVICES', 12, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Devis N° ${devis.number}`, 12, 22);

  doc.setFont('helvetica', 'bold');
  doc.text('Client(e):', 12, 29);
  doc.setFont('helvetica', 'normal');
  doc.text(devis.clientName || '[Nom du Client]', 36, 29);

  doc.setFont('helvetica', 'bold');
  doc.text('Contact Client(e):', 12, 36);
  doc.setFont('helvetica', 'normal');
  doc.text(devis.clientContact || '[Contact Client]', 48, 36);

  // Currency pill on orange part
  doc.setFillColor(255, 255, 255, 0.3);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);

  const cLabel = CURRENCY_LABELS[currency];
  const rateStr = currency === 'XOF' ? 'Taux: 1 XOF = 1.000 XOF' : `Taux: 1 XOF = ${(1 / rate).toFixed(6)} ${currency}`;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Devise: ${cLabel}`, pageW * 0.64, 22);
  doc.setFont('helvetica', 'normal');
  doc.text(rateStr, pageW * 0.64, 29);

  // ── Table ─────────────────────────────────────────────────────────────
  const head = [[
    { content: 'N°', rowSpan: 1 },
    { content: 'IMAGES', rowSpan: 1 },
    { content: 'DESCRIPTION', rowSpan: 1 },
    { content: 'Q', rowSpan: 1 },
    { content: 'P.U', rowSpan: 1 },
    { content: `FRAIS D'EXPÉDITION\nET DE PLATEFORME\n(${currency})`, rowSpan: 1 },
    { content: `PRIX TOTAL\n(${currency})`, rowSpan: 1 },
    { content: `FRAIS DE RÉCUPÉRATION\n(BATEAU) (${currency})`, rowSpan: 1 },
    { content: `FRAIS DE RÉCUPÉRATION\n(AVION) (${currency})`, rowSpan: 1 },
    { content: 'MODE CHOISI', rowSpan: 1 },
  ]];

  const body = devis.lines.map((line, i) => [
    i + 1,
    '', // image not in table body
    line.description,
    line.quantity === '' ? '0' : String(line.quantity),
    line.unitPrice === '' ? '0.00' : formatAmount(Number(line.unitPrice), currency),
    line.shippingPlatformFees === '' ? '0.00' : formatAmount(Number(line.shippingPlatformFees), currency),
    formatAmount(calcLineTotal(line), currency),
    line.recoveryBoat === '' ? '0.00' : formatAmount(Number(line.recoveryBoat), currency),
    line.recoveryAir === '' ? '0.00' : formatAmount(Number(line.recoveryAir), currency),
    line.shippingMode,
  ]);

  // Totals row
  const { totalFees, totalPrix, totalBoat, totalAir, modeBoat, modeAir, modeCustom } = calcTotals(devis.lines);
  const grandTotal = modeBoat + modeAir + modeCustom;

  body.push([
    { content: 'TOTAUX', colSpan: 5, styles: { halign: 'center', fontStyle: 'bold', fillColor: [200, 215, 215] } } as any,
    { content: formatAmount(totalFees, currency), styles: { halign: 'right', fontStyle: 'bold', fillColor: [200, 215, 215] } } as any,
    { content: formatAmount(totalPrix, currency), styles: { halign: 'right', fontStyle: 'bold', fillColor: [200, 215, 215] } } as any,
    { content: formatAmount(totalBoat, currency), styles: { halign: 'right', fontStyle: 'bold', fillColor: [200, 215, 215] } } as any,
    { content: formatAmount(totalAir, currency), styles: { halign: 'right', fontStyle: 'bold', fillColor: [200, 215, 215] } } as any,
    { content: formatAmount(grandTotal, currency), styles: { halign: 'right', fontStyle: 'bold', fillColor: [220, 140, 40], textColor: [255, 255, 255] } } as any,
  ]);

  autoTable(doc, {
    startY: 55,
    head,
    body,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
      valign: 'middle',
      lineColor: [200, 215, 215],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [22, 100, 100],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      minCellHeight: 14,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 16 },
      2: { halign: 'left',   cellWidth: 45 },
      3: { halign: 'center', cellWidth: 10 },
      4: { halign: 'right',  cellWidth: 22 },
      5: { halign: 'right',  cellWidth: 28 },
      6: { halign: 'right',  cellWidth: 24 },
      7: { halign: 'right',  cellWidth: 30 },
      8: { halign: 'right',  cellWidth: 30 },
      9: { halign: 'center', cellWidth: 24, fillColor: [220, 140, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [240, 248, 248] },
    didParseCell: (data) => {
      // Last column always orange
      if (data.column.index === 9 && data.section === 'body') {
        data.cell.styles.fillColor = [220, 140, 40];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.halign = 'center';
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 130;

  // ── Totals summary cards ──────────────────────────────────────────────
  const cardY = finalY + 6;
  const cardH = 22;
  const cardW = (pageW - 24) / 3;

  // BATEAU card
  doc.setFillColor(22, 130, 130);
  doc.roundedRect(12, cardY, cardW, cardH, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TOTAL BATEAU', 12 + cardW / 2, cardY + 7, { align: 'center' });
  doc.setFontSize(12);
  doc.text(formatAmount(modeBoat, currency), 12 + cardW / 2, cardY + 17, { align: 'center' });

  // AVION card
  const card2X = 12 + cardW + 4;
  doc.setFillColor(220, 140, 40);
  doc.roundedRect(card2X, cardY, cardW, cardH, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TOTAL AVION', card2X + cardW / 2, cardY + 7, { align: 'center' });
  doc.setFontSize(12);
  doc.text(formatAmount(modeAir, currency), card2X + cardW / 2, cardY + 17, { align: 'center' });

  // PERSONNALISÉ card
  const card3X = card2X + cardW + 4;
  doc.setFillColor(200, 120, 30);
  doc.roundedRect(card3X, cardY, cardW, cardH, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TOTAL PERSONNALISÉ', card3X + cardW / 2, cardY + 7, { align: 'center' });
  doc.setFontSize(12);
  doc.text(formatAmount(modeCustom, currency), card3X + cardW / 2, cardY + 17, { align: 'center' });

  // ── Footer ────────────────────────────────────────────────────────────
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text(
    `Document généré par GALIX SERVICES – ${new Date().toLocaleDateString('fr-FR')}`,
    pageW / 2,
    205,
    { align: 'center' }
  );

  doc.save(`Devis-${devis.number}.pdf`);
}

// Keep these helpers from devis-utils (re-export usage)
function calcTotals(lines: DevisLine[]) {
  let totalPrix = 0, totalFees = 0, totalBoat = 0, totalAir = 0;
  let modeBoat = 0, modeAir = 0, modeCustom = 0;
  for (const line of lines) {
    const total = calcLineTotal(line);
    const { boat, air } = calcRecovery(line);
    totalPrix += total;
    totalFees += line.shippingPlatformFees === '' ? 0 : Number(line.shippingPlatformFees);
    totalBoat += boat;
    totalAir += air;
    if (line.shippingMode === 'BATEAU') modeBoat += total + boat;
    else if (line.shippingMode === 'AVION') modeAir += total + air;
    else modeCustom += total;
  }
  return { totalPrix, totalFees, totalBoat, totalAir, modeBoat, modeAir, modeCustom };
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
