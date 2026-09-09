export interface SaltPill {
  id: string;
  name: string;
  category?: string;
}

export interface ComparisonPair {
  id: string;
  formulaId: string;
  brandName: string;
  brandManufacturer: string;
  brandPrice: number;
  brandPack: string;
  genericName: string;
  genericManufacturer: string;
  genericPrice: number;
  genericPack: string;
  savingsRupees: number;
  savingsPercent: number;
  badge: string;
  verifiedTag: string;
  detailId?: string;
}

export interface PharmacyOffer {
  id: string;
  pharmacyName: string;
  licenseNumber: string;
  locality: string;
  distanceKm: number;
  rating: number;
  pricePerStrip: number;
  mrpPerStrip: number;
  tabletsPerStrip: number;
  deliveryTimeMins: number;
  isLowest?: boolean;
  savingsAmount?: number;
  stockStatus: string;
  deliveryFeeText: string;
  packType?: string;
}

export interface CartItem {
  id: string;
  name: string;
  category: string;
  pharmacyName: string;
  price: number;
  mrp: number;
  pricePerUnit: string;
  quantity: number;
  packDetail: string;
  batchNumber: string;
  savingsAmount: number;
  imageUrl: string;
}

export type ScreenTab = 'compare' | 'medicine-detail' | 'details' | 'cart' | 'orders' | 'prescriptions';

export interface PrescriptionRecord {
  id: string;
  doctorName: string;
  clinic: string;
  date: string;
  medicines: {
    prescribed: string;
    genericEquivalent: string;
    savings: string;
  }[];
  status: 'Verified & Digitized' | 'Analyzing AI OCR' | 'Order Ready';
  prescriptionImage?: string;
}
