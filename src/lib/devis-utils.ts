import { DevisLine, Currency, CURRENCY_RATES } from '@/types/devis';

export function getNum(val: number | ''): number {
  return val === '' ? 0 : val;
}

export function calcLineTotal(line: DevisLine): number {
  const q = getNum(line.quantity);
  const pu = getNum(line.unitPrice);
  const fees = getNum(line.shippingPlatformFees);
  return q * pu + fees;
}

export function calcRecovery(line: DevisLine): { boat: number; air: number } {
  const total = calcLineTotal(line);
  const boat = getNum(line.recoveryBoat);
  const air = getNum(line.recoveryAir);
  return { boat: boat || 0, air: air || 0 };
}

export function calcTotals(lines: DevisLine[]) {
  let totalPrix = 0;
  let totalFees = 0;
  let totalBoat = 0;
  let totalAir = 0;
  let modeBoat = 0;
  let modeAir = 0;
  let modeCustom = 0;

  for (const line of lines) {
    const total = calcLineTotal(line);
    const { boat, air } = calcRecovery(line);
    totalPrix += total;
    totalFees += getNum(line.shippingPlatformFees);
    totalBoat += boat;
    totalAir += air;

    if (line.shippingMode === 'BATEAU') modeBoat += total + boat;
    else if (line.shippingMode === 'AVION') modeAir += total + air;
    else modeCustom += total;
  }

  return { totalPrix, totalFees, totalBoat, totalAir, modeBoat, modeAir, modeCustom };
}

export function convertFromXOF(amount: number, currency: Currency): number {
  if (currency === 'XOF') return amount;
  return amount / CURRENCY_RATES[currency];
}

export function formatAmount(amount: number, currency: Currency): string {
  const converted = convertFromXOF(amount, currency);
  return converted.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function createNewLine(): DevisLine {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: '',
    unitPrice: '',
    shippingPlatformFees: '',
    shippingMode: 'BATEAU',
    recoveryBoat: '',
    recoveryAir: '',
  };
}
