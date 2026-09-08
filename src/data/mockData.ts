import { ComparisonPair, PharmacyOffer, CartItem, PrescriptionRecord } from '../types';

export const HOTLINK_IMAGES = {
  brandLogo: "https://lh3.googleusercontent.com/aida/AEtjO1WW_xGYDnymtWs5DrWSjAK3PClb-8xYgKw9p9FpkrcLvKDEqy04_11KljqHVplo38xPCJxvnElnlV5q2dkBpWUoYF7K-6TrkdLSSpdJ6GeNJHmEOL0DhlN-z3pmRd2Uu2lNUzEETzcFR20MSlPgmxC5WnhtigoAYo8gETfBaNGRRzvESLVo6sTaac7qIH2ExgBpFQMZ40NPGs8ThCg1MXY4-LgitdVpI-R7mrf1brHK1MIc-Htkrt3IjL0w",
  labChemist: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4nF2zUHEaZQzEPREfr7L_fqCAwBCQyJQ3XG4UsmNsy57DxhvwTWAiA-BQnOpKOYU0C2z-tXhH6ecw3H-nurHYg8-wLmWD_FN08AGf1snC27bSXkF6Ak34jJbNqS1Un0ICXAazFxGJeOs95XKAIRa_omxQq0tEBef7hiDdXQdymSbV9G3lvgQuwVB4RmIbR--vhDeKls10g_caBM5vKaRkmUkYNXpqIVEvhbQ9FWBvzPuxnm197oKxEw",
  paracetamolBlister: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0P1UtMCeQiNx2w-bcWeCUFFpzLF24iIe3Cp14GAZ5EB13ymClblYwtJWU7ByhbebjjxryBDdp4OmJXRHka7igtzWaMWtXv9me9YlSXChLWYZfW_-jsUyR8HjK1C0LGpXemLMNThRUpKBpKU7eVMukONcRCHPBm7Kf626g4YQgmyLof3wdsPQ611VG3SgU4zHJmczu85b5JETLuuRKe8vqJ9obmmoClxrwGcEvtgTr5P-8gwiWM459Ow",
  atorvastatinBlister: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2ox6R8_W0rkSEFboR7B4tYoVqdnvB8FaadBVFLBDVxeDwjdsIQhrdgaYARQkZDYIzVuyDAvc5rUufa5vcTZfYjsHh2aW17Tz2mbfru9TpYH8Gatk1Xq44HMG6xpxskqcZyRB25nTmFCVdRmWn0b8YbuzOQrEjvPQxsWgLB2MKXuOOKwfGISB0S044qiizjYpE8c_36lRYyuPGUsekFiCPJChOqE0d_ZuzyRRqzrzWCX5AcJUi2SIMUw",
  deliveryRider: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnvaJUdpYCF0zipbC3LqOUwD5jeVjKlA1lVNrjMxid3_rBCvSNaPUb9YjnNU7Eio-1qh-cRZjzT3_H7FiELxSjc7f1lQeWB8KSMkypLBwYAkpRuIkvH5Us20Y3qDCXAI9kW88k4G7epRRZCfPFUuqXTQe5elWC6f_OxbFnlN0js6lXsC-YJaqLn3f_3IVsCy4KbL6U5mdkwc0m6pbRuSikUY3i9UOYYoTPt4ZId2IsgGmem9_Qhtg04Q",
  paracetamolOrderItem: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFNJr6eZQaYzfayiTAJJIdVbFP9MFyGyCxOc6Xqq6CJgalIFsuZq_D_NDUKEdlYA_b_q1-ObVkR-qhR28qk3YqIxIUiNVlYfcWOq7piIQxjt446lNNw-x_FgEBsiVCM_PYVgOepjJLuVqb2wUvAZYfxPnGdFiFUa5RK-Qbeek8bqMCAcdZ011Tv9z-cgELvVSfBHfJsaGzK8oMC8te4eQMYBsgzvmXaxmswM1Xam0SBxTaVgClz3iJ-g",
  atorvastatinOrderItem: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFRKi4_ZWQzWgI3K7OnFKV4FW-EZ4zTM9-Py6R260SjruibOHpQJvGOVMwdVCf4bO09NSm26Ay95QsDAOYkbo-pMU4OnJRanM_Zu3IY4I73jVGecWL7cjL5Mw-f7cI2cnoy2QlX8NbZ67TW7NV4iHrZ5J_6joC4NvQOJeH9qn8O7T_1wxg_U7EgPigFFOzy7z9pTCzyc0tKDK-bPuUH6SOfzU1xMrlie61kVjF5dH94BGkE2MNaMsziQ",
  architectureDiagram: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOe4hR5-JkWL1Y1V24f_QY5R3fM8xJ23oH3x19kG3L1kG3-88Xv7-9V7k-xR90V3-1",
};

export const COMPARISON_PAIRS: ComparisonPair[] = [
  {
    id: "comp-1",
    formulaId: "PARA-650-IP",
    brandName: "Dolo 650mg",
    brandManufacturer: "Micro Labs Ltd",
    brandPrice: 34.50,
    brandPack: "15 tabs",
    genericName: "Paracetamol IP",
    genericManufacturer: "Jan Aushadhi / Cipla Gen",
    genericPrice: 10.50,
    genericPack: "15 tabs",
    savingsRupees: 24,
    savingsPercent: 68,
    badge: "Save ₹24/strip (68%)",
    verifiedTag: "100% Bio-identical molecule composition",
    detailId: "CAN-MOL-1049",
  },
  {
    id: "comp-2",
    formulaId: "AMOX-CLAV-625",
    brandName: "Augmentin 625",
    brandManufacturer: "GSK Pharma",
    brandPrice: 192.00,
    brandPack: "10 tabs",
    genericName: "Amoxy-Clav 625",
    genericManufacturer: "Alkem / Zydus Generic",
    genericPrice: 50.00,
    genericPack: "10 tabs",
    savingsRupees: 142,
    savingsPercent: 74,
    badge: "Save ₹142/strip (74%)",
    verifiedTag: "USP & IP Dissolution Verified",
  },
  {
    id: "comp-3",
    formulaId: "ATOR-20-IP",
    brandName: "Lipitor 20mg",
    brandManufacturer: "Pfizer India",
    brandPrice: 180.00,
    brandPack: "10 tabs",
    genericName: "Atorvastatin 20mg",
    genericManufacturer: "Cipla / Torrent Generic",
    genericPrice: 28.00,
    genericPack: "10 tabs",
    savingsRupees: 152,
    savingsPercent: 84,
    badge: "Save ₹152/strip (84%)",
    verifiedTag: "Lipid Parity Audited",
  },
  {
    id: "comp-4",
    formulaId: "MET-500-SR",
    brandName: "Glycomet 500",
    brandManufacturer: "USV Ltd",
    brandPrice: 45.00,
    brandPack: "20 tabs",
    genericName: "Metformin 500mg SR",
    genericManufacturer: "Jan Aushadhi / Sun Gen",
    genericPrice: 12.00,
    genericPack: "20 tabs",
    savingsRupees: 33,
    savingsPercent: 73,
    badge: "Save ₹33/strip (73%)",
    verifiedTag: "Glycemic Stability Certified",
  }
];

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: "cart-item-1",
    name: "Paracetamol 650mg",
    category: "ANALGESIC • IP GRADE",
    pharmacyName: "Apollo Med Indiranagar",
    price: 42.00,
    mrp: 108.00,
    pricePerUnit: "₹21.00 / strip",
    quantity: 2,
    packDetail: "Strip of 15",
    batchNumber: "Batch #AP-9921",
    savingsAmount: 66.00,
    imageUrl: HOTLINK_IMAGES.paracetamolBlister,
  },
  {
    id: "cart-item-2",
    name: "Atorvastatin 20mg",
    category: "CARDIO • LIPID REGULATOR",
    pharmacyName: "MedPlus Retail Indiranagar",
    price: 28.00,
    mrp: 110.00,
    pricePerUnit: "₹28.00 / blister",
    quantity: 1,
    packDetail: "Blister of 10",
    batchNumber: "Batch #MP-4408",
    savingsAmount: 82.00,
    imageUrl: HOTLINK_IMAGES.atorvastatinBlister,
  }
];

export const MOLECULE_OFFERS: PharmacyOffer[] = [
  {
    id: "offer-apollo",
    pharmacyName: "Apollo Med Central",
    licenseNumber: "Lic #KA-BLR-20B-189",
    locality: "Indiranagar",
    distanceKm: 1.2,
    rating: 4.9,
    pricePerStrip: 21.00,
    mrpPerStrip: 54.00,
    tabletsPerStrip: 15,
    deliveryTimeMins: 35,
    isLowest: true,
    savingsAmount: 33.00,
    stockStatus: "Stock synced 4m ago (120+ packs)",
    deliveryFeeText: "₹15 or FREE > ₹99",
  },
  {
    id: "offer-medplus",
    pharmacyName: "MedPlus Pharmacy",
    licenseNumber: "Lic #KA-BLR-21B-404",
    locality: "CMH Road",
    distanceKm: 2.1,
    rating: 4.8,
    pricePerStrip: 23.50,
    mrpPerStrip: 54.00,
    tabletsPerStrip: 15,
    deliveryTimeMins: 45,
    isLowest: false,
    savingsAmount: 30.50,
    stockStatus: "Stock synced 8m ago",
    deliveryFeeText: "Delivery in 45 mins",
  },
  {
    id: "offer-wellness",
    pharmacyName: "Wellness Forever",
    licenseNumber: "Lic #KA-BLR-20B-712",
    locality: "Old Airport Rd",
    distanceKm: 0.8,
    rating: 4.7,
    pricePerStrip: 28.00,
    mrpPerStrip: 50.00,
    tabletsPerStrip: 10,
    deliveryTimeMins: 25,
    isLowest: false,
    savingsAmount: 22.00,
    stockStatus: "Hyper-fast 25m dispatch",
    deliveryFeeText: "Cold Chain Active",
    packType: "10-PACK"
  }
];

export const SAVED_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    id: "RX-2026-081",
    doctorName: "Dr. Sandeep K. Joshi (MD)",
    clinic: "Manipal Hospital, Bengaluru",
    date: "04 Sep 2026",
    medicines: [
      { prescribed: "Dolo 650mg (15 tabs)", genericEquivalent: "Paracetamol IP 650mg", savings: "Save 68%" },
      { prescribed: "Atorva 20mg (10 tabs)", genericEquivalent: "Atorvastatin 20mg", savings: "Save 74%" },
      { prescribed: "Augmentin 625 (10 tabs)", genericEquivalent: "Amoxy-Clav 625", savings: "Save 74%" }
    ],
    status: "Verified & Digitized"
  },
  {
    id: "RX-2026-074",
    doctorName: "Dr. Ananya Rao (Cardiologist)",
    clinic: "Apollo Clinic Indiranagar",
    date: "28 Aug 2026",
    medicines: [
      { prescribed: "Telma 40mg (15 tabs)", genericEquivalent: "Telmisartan 40mg", savings: "Save 76%" },
      { prescribed: "Rosuvas 10mg (10 tabs)", genericEquivalent: "Rosuvastatin 10mg", savings: "Save 70%" }
    ],
    status: "Order Ready"
  }
];
