export type Currency = 'XOF' | 'EUR' | 'USD';
export type ShippingMode = 'BATEAU' | 'AVION' | 'CUSTOM';

export interface DevisLine {
  id: string;
  image?: string; // base64 or URL
  description: string;
  quantity: number | '';
  unitPrice: number | '';
  shippingPlatformFees: number | '';
  shippingMode: ShippingMode;
  // Frais de récupération Bateau
  recoveryBoat: number | '';
  // Frais de récupération Avion
  recoveryAir: number | '';
}

export interface DevisData {
  number: string;
  clientName: string;
  clientContact: string;
  currency: Currency;
  lines: DevisLine[];
}

export const CURRENCY_RATES: Record<Currency, number> = {
  XOF: 1,
  EUR: 655.957,
  USD: 600,
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  XOF: 'XOF (CFA)',
  EUR: 'EUR (Euro)',
  USD: 'USD (Dollar)',
};
