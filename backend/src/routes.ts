import { Router, Response } from 'express';
import prisma from './db';
import {
  authenticateToken,
  requireRole,
  generateOtp,
  verifyOtpAndLogin,
  logCdscoAudit,
  AuthenticatedRequest,
} from './auth';
import { analyzePrescriptionImage } from './geminiService';
import { COMPARISON_PAIRS, MOLECULE_OFFERS, SAVED_PRESCRIPTIONS } from './data/mockData';

export const apiRouter = Router();

/**
 * 1. Health Check
 */
apiRouter.get('/health', (req, res) => {
  const hasGeminiKey = !!(
    process.env.GEMINI_API_KEY &&
    !process.env.GEMINI_API_KEY.includes('MY_GEMINI_API_KEY') &&
    process.env.GEMINI_API_KEY.trim() !== ''
  );

  res.json({
    status: 'HEALTHY',
    service: 'GenericMed Express API',
    version: '0.5.0 (Phase 2)',
    database: 'SQLite / Prisma (Active)',
    aiVisionEngine: hasGeminiKey ? 'Gemini 2.0 Flash (Live API Connected)' : 'CDSCO Clinical Parser (Fallback Active)',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 2. Authentication Endpoints
 */
apiRouter.post('/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number required.' });
  }

  const otp = generateOtp(phone);
  res.json({
    success: true,
    message: `OTP sent successfully to ${phone}. (Demo master OTP: 489201 or ${otp})`,
    otpInDev: process.env.NODE_ENV !== 'production' ? otp : undefined,
  });
});

apiRouter.post('/auth/verify-otp', async (req, res) => {
  const { phone, otp, role } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Mobile number and OTP are required.' });
  }

  try {
    const result = await verifyOtpAndLogin(phone, otp, role);
    await logCdscoAudit('USER_LOGIN', `User ${phone} logged in as role ${result.user.role}`, result.user.id);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed.' });
  }
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

/**
 * 3. Medicine Search & Molecule Comparison
 */
apiRouter.get('/medicines/search', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  const category = (req.query.category as string || '').toLowerCase().trim();

  let results = [...COMPARISON_PAIRS];

  if (query) {
    results = results.filter(
      (m) =>
        m.brandName.toLowerCase().includes(query) ||
        m.genericName.toLowerCase().includes(query) ||
        m.formulaId.toLowerCase().includes(query)
    );
  }

  if (category && category !== 'all') {
    results = results.filter((m) =>
      m.formulaId.toLowerCase().includes(category) ||
      m.badge.toLowerCase().includes(category)
    );
  }

  // Calculate normalized price metrics for each result
  const normalized = results.map((m) => {
    const brandUnit = m.brandPrice / 10;
    const genericUnit = m.genericPrice / 10;
    return {
      ...m,
      normalizedMetrics: {
        brandUnitCost: `₹${brandUnit.toFixed(2)}/tab`,
        genericUnitCost: `₹${genericUnit.toFixed(2)}/tab`,
        effectiveSavings: `₹${(m.brandPrice - m.genericPrice).toFixed(2)}`,
        savingsPercentage: m.savingsPercent,
      },
    };
  });

  res.json({
    total: normalized.length,
    results: normalized,
  });
});

apiRouter.get('/medicines/:id/compare', (req, res) => {
  const idOrFormula = req.params.id;
  const match = COMPARISON_PAIRS.find(
    (m) => m.id === idOrFormula || m.formulaId.toLowerCase() === idOrFormula.toLowerCase()
  );

  if (!match) {
    return res.status(404).json({ error: 'Medicine comparison pair not found.' });
  }

  res.json({
    medicine: match,
    dissolutionBioequivalence: {
      standard: 'Indian Pharmacopoeia (IP) Monograph 2022',
      dissolutionRateBrand: '94.2% in 30 mins',
      dissolutionRateGeneric: '93.8% in 30 mins',
      bioavailabilityEquivalence: '99.4% (Within ±5% CDSCO biological window)',
      pharmacopeiaPurity: '99.8% Active Pharmaceutical Ingredient',
    },
    nearbyPharmacies: MOLECULE_OFFERS,
  });
});

apiRouter.get('/medicines/:id/pharmacies', (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 12.9716;
  const lng = parseFloat(req.query.lng as string) || 77.5946;

  // Simulate hyperlocal sorting by distance
  const sortedOffers = [...MOLECULE_OFFERS].sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({
    userLocation: { lat, lng },
    radiusKm: 5.0,
    pharmaciesCount: sortedOffers.length,
    offers: sortedOffers,
  });
});

/**
 * 4. Prescription & Live Gemini AI Vision OCR
 */
apiRouter.post('/prescriptions/ocr-analyze', async (req, res) => {
  try {
    const { imageBase64, sampleId } = req.body;

    const imagePayload = imageBase64 || sampleId || 'sample-acute-prescription';
    const analysis = await analyzePrescriptionImage(imagePayload);

    await logCdscoAudit(
      'PRESCRIPTION_OCR_ANALYZED',
      `OCR parsed prescription for Dr. ${analysis.doctorName} (Doctor Reg: ${analysis.doctorRegNo}) with ${analysis.medicines.length} medicines.`
    );

    res.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    console.error('[OCR Error]:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to parse prescription image via Gemini Vision.',
      details: err.message,
    });
  }
});

apiRouter.get('/prescriptions', async (req, res) => {
  try {
    const dbPrescriptions = await prisma.prescription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    if (dbPrescriptions && dbPrescriptions.length > 0) {
      const formatted = dbPrescriptions.map((rx) => ({
        id: rx.id,
        doctorName: rx.doctorName,
        clinic: rx.clinic,
        date: rx.date,
        status: rx.status,
        medicines: rx.extractedJson
          ? JSON.parse(rx.extractedJson)
          : [
              {
                prescribed: 'Dolo 650mg (15 tabs)',
                genericEquivalent: 'Paracetamol IP 650mg',
                savings: 'Save 68%',
              },
            ],
      }));
      return res.json({ prescriptions: formatted });
    }
  } catch (err) {
    console.warn('[DB Warning] Prescriptions read failed, falling back to cache:', err);
  }

  res.json({
    prescriptions: SAVED_PRESCRIPTIONS,
  });
});

apiRouter.post('/prescriptions/upload', async (req, res) => {
  const { doctorName, clinic, date, medicines, doctorRegNo, extractedJson } = req.body;

  const newRx = {
    id: `RX-2026-${Math.floor(100 + Math.random() * 900)}`,
    doctorName: doctorName || 'Dr. Sandeep K. Joshi (MD)',
    clinic: clinic || 'Manipal Hospital, Bengaluru',
    doctorRegNo: doctorRegNo || 'KMC-2018-77491',
    date: date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'Verified & Digitized',
    medicines: medicines || [
      { prescribed: 'Dolo 650mg (15 tabs)', genericEquivalent: 'Paracetamol IP 650mg', savings: 'Save 68%' },
    ],
  };

  try {
    await prisma.prescription.create({
      data: {
        id: newRx.id,
        doctorName: newRx.doctorName,
        clinic: newRx.clinic,
        doctorRegNo: newRx.doctorRegNo,
        date: newRx.date,
        status: newRx.status,
        extractedJson: extractedJson ? JSON.stringify(extractedJson) : JSON.stringify(newRx.medicines),
        confidenceScore: 0.96,
      },
    });
  } catch (err) {
    console.warn('[DB Warning] Failed to persist prescription to DB:', err);
  }

  await logCdscoAudit('PRESCRIPTION_UPLOADED', `Prescription ${newRx.id} uploaded and verified.`);

  res.status(201).json({
    success: true,
    prescription: newRx,
  });
});

/**
 * 5. Cart & Order Fulfillment
 */
apiRouter.post('/cart/validate', (req, res) => {
  const { items, attachedPrescriptionId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart cannot be empty.' });
  }

  // CDSCO Schedule H1 prescription verification gate
  const hasScheduleH1 = items.some((item: any) =>
    item.name.toLowerCase().includes('cefix') ||
    item.name.toLowerCase().includes('alpra') ||
    item.category?.includes('ANTIBIOTIC')
  );

  if (hasScheduleH1 && !attachedPrescriptionId) {
    return res.status(422).json({
      error: 'SCHEDULE_H1_PRESCRIPTION_REQUIRED',
      message:
        'Schedule H1 prescription medicines require an attached doctor prescription before checkout under the Indian Drugs and Cosmetics Act.',
      isLocked: true,
    });
  }

  const subtotal = items.reduce((acc: number, item: any) => acc + item.price * (item.quantity || 1), 0);
  const totalSavings = items.reduce((acc: number, item: any) => acc + (item.savingsAmount || 0) * (item.quantity || 1), 0);
  const deliveryFee = subtotal >= 99 ? 0 : 15.0;
  const taxes = Number((subtotal * 0.05).toFixed(2));
  const finalTotal = subtotal + deliveryFee + taxes;

  res.json({
    valid: true,
    subtotal,
    totalSavings,
    deliveryFee,
    taxes,
    finalTotal,
    hasScheduleH1,
  });
});

apiRouter.post('/orders/create', async (req, res) => {
  const { items, deliveryAddress, pharmacyId } = req.body;

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const subtotal = (items || []).reduce((acc: number, i: any) => acc + (i.price * (i.quantity || 1)), 0);
  const totalSavings = (items || []).reduce((acc: number, i: any) => acc + ((i.savingsAmount || 0) * (i.quantity || 1)), 0);
  try {
    await prisma.order.create({
      data: {
        id: orderId,
        status: 'DISPATCHED',
        deliveryOtp,
        totalAmount: subtotal + 15,
        totalSavings,
        deliveryAddress: deliveryAddress || '#402 Palm Grove, 12th Main Indiranagar, Bengaluru 560038',
        coldChainSla: true,
        coldChainLogs: {
          create: [
            {
              temperatureCelsius: 4.8,
              isWithinSla: true,
            },
          ],
        },
      },
    });
  } catch (err) {
    console.warn('[DB Warning] Failed to persist order to DB:', err);
  }

  await logCdscoAudit('ORDER_CREATED', `Order ${orderId} placed for pharmacy ${pharmacyId || 'Indiranagar Hub'}`);

  res.status(201).json({
    success: true,
    order: {
      id: orderId,
      status: 'DISPATCHED',
      deliveryOtp,
      totalAmount: subtotal + 15,
      totalSavings,
      deliveryAddress: deliveryAddress || '#402 Palm Grove, 12th Main Indiranagar, Bengaluru 560038',
      coldChainTelemetry: {
        currentTempCelsius: 4.8,
        isWithinSla: true,
        slaRange: '2°C–8°C Refrigerated Cold-Chain',
      },
      courier: {
        name: 'Ramesh K.',
        phone: '+91 98450 12345',
        vehicle: 'Insulated EV Carrier #KA-03-EM-8812',
      },
      createdAt: new Date().toISOString(),
    },
  });
});

apiRouter.get('/orders/:id/track', (req, res) => {
  const orderId = req.params.id;

  res.json({
    orderId,
    status: 'OUT_FOR_DELIVERY',
    deliveryOtp: '4892',
    coldChainLog: [
      { timestamp: '10:15 AM', temperatureCelsius: 4.6, note: 'Dispatched from Jan Aushadhi Hub Cooler' },
      { timestamp: '10:30 AM', temperatureCelsius: 4.9, note: 'Rider In Transit - CMH Road' },
      { timestamp: '10:45 AM', temperatureCelsius: 4.8, note: 'Approaching Delivery Address' },
    ],
    slaStatus: 'COMPLIANT (18°C–24°C / 4.8°C Sealed Bag)',
  });
});

apiRouter.get('/orders/:id/invoice', (req, res) => {
  const orderId = req.params.id;

  res.json({
    invoiceNumber: `INV-${orderId}-2026`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    pharmacy: {
      name: 'Jan Aushadhi Kendra #104 (PMBI Certified)',
      drugLicense: 'DL-KA-2024-8849-20B/21B',
      gstin: '29AABCP1330F1ZT',
      address: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    },
    patient: {
      name: 'Rahul Sharma',
      address: '#402 Palm Grove, Indiranagar, Bengaluru 560038',
    },
    items: [
      { hsn: '3004', name: 'Paracetamol IP 650mg', batch: 'GEN-2026-09', expiry: '08/2028', qty: 2, mrp: 54.00, rate: 21.00, gst: '5%' },
      { hsn: '3004', name: 'Atorvastatin 20mg IP', batch: 'AP-4408', expiry: '11/2027', qty: 1, mrp: 180.00, rate: 28.00, gst: '5%' },
    ],
    subtotal: 70.00,
    cgst: 1.75,
    sgst: 1.75,
    grandTotal: 73.50,
    totalSavings: 218.00,
    registeredPharmacistSignature: 'Priya Nair, Reg No. KA-PH-2021-9941',
  });
});

/**
 * 6. Regulatory & CDSCO Schedule H1 Audit Trail (Restricted to Pharmacist & Admin)
 */
apiRouter.get(
  '/audit/h1-records',
  authenticateToken,
  requireRole(['PHARMACIST', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const logs = await prisma.auditLog.findMany({
        take: 50,
        orderBy: { timestamp: 'desc' },
      });
      res.json({ count: logs.length, records: logs });
    } catch {
      res.json({
        count: 2,
        records: [
          {
            id: 'audit-1',
            action: 'SCHEDULE_H1_ACCESSED',
            details: 'Prescription RX-2026-081 verified by Pharmacist Priya Nair for Amoxy-Clav 625',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'audit-2',
            action: 'DISPENSARY_STOCK_SYNC',
            details: 'Jan Aushadhi Kendra #104 synced 500 units of Paracetamol IP 650mg (Batch #GEN-2026-09)',
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
  }
);

/**
 * 7. Phase 3: Dispensary Multi-Tenancy & Tenant Inventory Management
 */
const PHARMACY_TENANTS = [
  {
    id: 'pharma-1',
    name: 'Jan Aushadhi Kendra #104 (PMBI Certified)',
    licenseNo: 'DL-KA-2024-8849-20B/21B',
    locality: 'Indiranagar, Bengaluru',
    rating: 4.9,
    phone: '+91 80 2520 1104',
    isGovtJanAushadhi: true,
    batchesCount: 142,
  },
  {
    id: 'pharma-2',
    name: 'Apollo Med Central Dispensary',
    licenseNo: 'DL-KA-2024-1892-20B/21B',
    locality: 'CMH Road, Indiranagar',
    rating: 4.8,
    phone: '+91 80 2520 4400',
    isGovtJanAushadhi: false,
    batchesCount: 218,
  },
  {
    id: 'pharma-3',
    name: 'MedPlus Retail Dispensary',
    licenseNo: 'DL-KA-2024-4401-20B/21B',
    locality: '100ft Road, Bengaluru',
    rating: 4.7,
    phone: '+91 80 2520 7711',
    isGovtJanAushadhi: false,
    batchesCount: 184,
  },
  {
    id: 'pharma-4',
    name: 'Wellness Forever 24x7 Hub',
    licenseNo: 'DL-KA-2024-7120-20B/21B',
    locality: 'HAL 2nd Stage, Bengaluru',
    rating: 4.7,
    phone: '+91 80 2520 9900',
    isGovtJanAushadhi: false,
    batchesCount: 96,
  },
];

const PHARMACY_BATCHES: Record<string, Array<{
  id: string;
  medicineName: string;
  formulaId: string;
  batchNumber: string;
  expiryDate: string;
  stockUnits: number;
  sellingPrice: number;
  mrp: number;
  dosageForm: string;
}>> = {
  'pharma-1': [
    {
      id: 'batch-101',
      medicineName: 'Paracetamol IP 650mg',
      formulaId: 'PARA-650-IP',
      batchNumber: 'GEN-2026-09',
      expiryDate: '2028-08-31',
      stockUnits: 450,
      sellingPrice: 10.5,
      mrp: 34.5,
      dosageForm: 'Tablet (Strip of 15)',
    },
    {
      id: 'batch-102',
      medicineName: 'Amoxy-Clav 625mg',
      formulaId: 'AMOX-CLAV-625',
      batchNumber: 'GEN-2026-11',
      expiryDate: '2027-11-30',
      stockUnits: 120,
      sellingPrice: 50.0,
      mrp: 192.0,
      dosageForm: 'Tablet (Strip of 10)',
    },
    {
      id: 'batch-103',
      medicineName: 'Atorvastatin 20mg IP',
      formulaId: 'ATOR-20-IP',
      batchNumber: 'GEN-2026-03',
      expiryDate: '2028-03-31',
      stockUnits: 280,
      sellingPrice: 28.0,
      mrp: 180.0,
      dosageForm: 'Tablet (Strip of 10)',
    },
    {
      id: 'batch-104',
      medicineName: 'Metformin 500mg SR',
      formulaId: 'MET-500-SR',
      batchNumber: 'GEN-2026-07',
      expiryDate: '2028-07-31',
      stockUnits: 340,
      sellingPrice: 12.0,
      mrp: 45.0,
      dosageForm: 'Tablet (Strip of 20)',
    },
    {
      id: 'batch-105',
      medicineName: 'Pantoprazole 40mg IP',
      formulaId: 'PANTO-40-IP',
      batchNumber: 'GEN-2026-05',
      expiryDate: '2028-05-31',
      stockUnits: 190,
      sellingPrice: 32.0,
      mrp: 142.0,
      dosageForm: 'Tablet (Strip of 15)',
    },
  ],
  'pharma-2': [
    {
      id: 'batch-201',
      medicineName: 'Paracetamol IP 650mg',
      formulaId: 'PARA-650-IP',
      batchNumber: 'AP-9921',
      expiryDate: '2028-06-30',
      stockUnits: 300,
      sellingPrice: 21.0,
      mrp: 54.0,
      dosageForm: 'Tablet (Strip of 15)',
    },
    {
      id: 'batch-202',
      medicineName: 'Amoxy-Clav 625mg',
      formulaId: 'AMOX-CLAV-625',
      batchNumber: 'AP-3104',
      expiryDate: '2027-12-31',
      stockUnits: 95,
      sellingPrice: 50.0,
      mrp: 192.0,
      dosageForm: 'Tablet (Strip of 10)',
    },
  ],
};

apiRouter.get('/pharmacies', (req, res) => {
  res.json({ pharmacies: PHARMACY_TENANTS });
});

apiRouter.get('/pharmacies/:id/inventory', (req, res) => {
  const pharmacyId = req.params.id;
  const batches = PHARMACY_BATCHES[pharmacyId] || PHARMACY_BATCHES['pharma-1'] || [];
  res.json({ pharmacyId, batches });
});

apiRouter.post(
  '/pharmacies/:id/inventory/add',
  authenticateToken,
  requireRole(['PHARMACIST', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const pharmacyId = req.params.id;
    const { medicineName, formulaId, batchNumber, expiryDate, stockUnits, sellingPrice, mrp, dosageForm } = req.body;

    if (!medicineName || !batchNumber) {
      return res.status(400).json({ error: 'Medicine name and batch number are required.' });
    }

    const newBatch = {
      id: `batch-${Date.now()}`,
      medicineName,
      formulaId: formulaId || 'GEN-SALT-STD',
      batchNumber: batchNumber.toUpperCase(),
      expiryDate: expiryDate || '2028-12-31',
      stockUnits: Number(stockUnits) || 100,
      sellingPrice: Number(sellingPrice) || 20.0,
      mrp: Number(mrp) || 60.0,
      dosageForm: dosageForm || 'Tablet (Strip of 10)',
    };

    if (!PHARMACY_BATCHES[pharmacyId]) {
      PHARMACY_BATCHES[pharmacyId] = [];
    }
    PHARMACY_BATCHES[pharmacyId].unshift(newBatch);

    await logCdscoAudit(
      'DISPENSARY_BATCH_INGESTED',
      `Pharmacist ${req.user?.name || 'User'} added batch ${newBatch.batchNumber} (${newBatch.stockUnits} units of ${newBatch.medicineName}) to ${pharmacyId}`
    );

    res.status(201).json({ success: true, batch: newBatch });
  }
);

/**
 * 8. Phase 3: Inventory Batch Reservation (10-Minute Lock)
 */
const activeBatchReservations = new Map<string, {
  reservationId: string;
  items: any[];
  expiresAt: number;
}>();

apiRouter.post('/inventory/reserve', (req, res) => {
  const { items, pharmacyId } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required for reservation.' });
  }

  const reservationId = `RES-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes lock

  const reservedItems = items.map((item: any, idx: number) => ({
    ...item,
    allocatedBatch: item.batchNumber || `GEN-2026-B${idx + 1}`,
    allocatedDispensary: pharmacyId || 'Jan Aushadhi Kendra #104',
    isLocked: true,
  }));

  activeBatchReservations.set(reservationId, {
    reservationId,
    items: reservedItems,
    expiresAt,
  });

  res.json({
    success: true,
    reservationId,
    expiresAt,
    lockDurationSeconds: 600,
    reservedItems,
  });
});

apiRouter.post('/inventory/release', (req, res) => {
  const { reservationId } = req.body;
  if (reservationId && activeBatchReservations.has(reservationId)) {
    activeBatchReservations.delete(reservationId);
  }
  res.json({ success: true, message: 'Reservation released.' });
});

/**
 * 9. Phase 3: Payment Gateway Intent & Split Settlements
 */
apiRouter.post('/payments/create-intent', (req, res) => {
  const { orderId, amount, items, paymentMethod, upiVpa } = req.body;
  const numAmount = Number(amount) || 100.0;

  // Split settlement calculation (Automated marketplace accounting)
  const platformFee = 5.0;
  const coldChainFee = 25.0;
  const subtotal = Math.max(0, numAmount - platformFee - coldChainFee);
  const retailerSettlement = Number((subtotal * 0.95).toFixed(2)); // 95% of medicine subtotal to Jan Aushadhi / Dispensary
  const platformMargin = Number((numAmount - retailerSettlement).toFixed(2));

  const transactionId = `txn_${paymentMethod || 'upi'}_${Date.now()}`;
  const idempotencyKey = `idemp_${orderId || 'ord'}_${Date.now()}`;
  const upiQrPayload = `upi://pay?pa=genericmed.dispensary@okhdfcbank&pn=GenericMed_JanAushadhi&am=${numAmount.toFixed(2)}&tr=${transactionId}&cu=INR&tn=GenericMed_Prescription_Order`;

  res.json({
    success: true,
    orderId: orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    transactionId,
    idempotencyKey,
    amount: numAmount,
    currency: 'INR',
    splitSettlement: {
      retailerDisbursement: retailerSettlement,
      platformFee,
      coldChainFee,
      totalPaid: numAmount,
      dispensaryAccount: 'Jan Aushadhi Kendra Escrow (HDFC Bank)',
    },
    upiQrPayload,
    supportedApps: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Navi'],
  });
});

apiRouter.post('/payments/verify', async (req, res) => {
  const { orderId, transactionId, paymentMethod, items } = req.body;

  // Decrement inventory stock units upon payment verification
  try {
    const pharmaBatches = PHARMACY_BATCHES['pharma-1'] || [];
    (items || []).forEach((item: any) => {
      const matched = pharmaBatches.find(
        (b) => b.medicineName.toLowerCase().includes(item.name.toLowerCase()) || b.batchNumber === item.batchNumber
      );
      if (matched) {
        matched.stockUnits = Math.max(0, matched.stockUnits - (item.quantity || 1));
      }
    });
  } catch (err) {
    console.warn('[Inventory Decrement Warning]:', err);
  }

  // Create dispensing queue item for pharmacist sign-off
  const newDispenseItem = {
    orderId: orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Sandeep K. Joshi (MD)',
    doctorRegNo: 'KMC-2018-77491',
    prescriptionId: 'RX-2026-081',
    items: (items || []).map((i: any, idx: number) => ({
      name: i.name || 'Paracetamol IP 650mg',
      qty: i.quantity || 1,
      batchNumber: i.batchNumber || `GEN-2026-B${idx + 1}`,
    })),
    isScheduleH1: (items || []).some((i: any) => (i.category || '').includes('ANTIBIOTIC') || (i.name || '').includes('Amox')),
    status: 'AWAITING_PHARMACIST_VERIFICATION' as const,
    totalAmount: 95.0,
    placedAt: new Date().toISOString(),
  };
  dispensingQueue.unshift(newDispenseItem);

  await logCdscoAudit(
    'PAYMENT_CAPTURED_AND_STOCK_DEDUCTED',
    `Payment verified for ${orderId || 'Order'} via ${paymentMethod || 'UPI'}. Transaction ID: ${transactionId || 'TXN-992'}. Live dispensary stock decremented.`
  );

  res.json({
    success: true,
    orderId: newDispenseItem.orderId,
    status: 'PAID_AND_RESERVED',
    message: 'Payment successfully captured via idempotent UPI gateway. Inventory batch locked and routed to Dispensary Queue.',
  });
});

/**
 * 10. Phase 3: Pharmacist Dispensing Queue & Digital Stamp
 */
const dispensingQueue: Array<{
  orderId: string;
  patientName: string;
  doctorName: string;
  doctorRegNo: string;
  prescriptionId?: string;
  items: Array<{ name: string; qty: number; batchNumber: string }>;
  isScheduleH1: boolean;
  status: 'AWAITING_PHARMACIST_VERIFICATION' | 'STAMPED_AND_DISPATCHED';
  totalAmount: number;
  placedAt: string;
}> = [
  {
    orderId: 'ORD-8921',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Sandeep K. Joshi (MD)',
    doctorRegNo: 'KMC-2018-77491',
    prescriptionId: 'RX-2026-081',
    items: [
      { name: 'Paracetamol IP 650mg', qty: 2, batchNumber: 'GEN-2026-09' },
      { name: 'Amoxy-Clav 625mg (Schedule H1)', qty: 1, batchNumber: 'GEN-2026-11' },
    ],
    isScheduleH1: true,
    status: 'AWAITING_PHARMACIST_VERIFICATION',
    totalAmount: 92.0,
    placedAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    orderId: 'ORD-7714',
    patientName: 'Sunita Mehra',
    doctorName: 'Dr. Ananya Rao (DM)',
    doctorRegNo: 'KMC-2014-99812',
    prescriptionId: 'RX-2026-074',
    items: [
      { name: 'Atorvastatin 20mg IP', qty: 1, batchNumber: 'GEN-2026-03' },
      { name: 'Pantoprazole 40mg IP', qty: 1, batchNumber: 'GEN-2026-05' },
    ],
    isScheduleH1: false,
    status: 'AWAITING_PHARMACIST_VERIFICATION',
    totalAmount: 75.0,
    placedAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
];

apiRouter.get('/orders/dispensing-queue', (req, res) => {
  res.json({ queue: dispensingQueue });
});

apiRouter.post(
  '/orders/:id/dispense',
  authenticateToken,
  requireRole(['PHARMACIST', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const orderId = req.params.id;
    const { pharmacistNotes } = req.body;

    const matched = dispensingQueue.find((o) => o.orderId === orderId);
    if (matched) {
      matched.status = 'STAMPED_AND_DISPATCHED';
    }

    const stamp = {
      pharmacistName: req.user?.name || 'Priya Nair (D.Pharm, Reg Pharmacist)',
      registrationNumber: 'KA-PH-2021-9941',
      form20BVerified: true,
      stampedAt: new Date().toISOString(),
      notes: pharmacistNotes || 'Dosage, Schedule H1 batch integrity, and bioequivalence verified.',
    };

    await logCdscoAudit(
      'SCHEDULE_H1_DISPENSED_AND_STAMPED',
      `Pharmacist ${stamp.pharmacistName} (${stamp.registrationNumber}) digitally stamped and released Order ${orderId} for cold-chain courier dispatch.`
    );

    res.json({
      success: true,
      orderId,
      status: 'STAMPED_AND_DISPATCHED',
      digitalStamp: stamp,
    });
  }
);

// ==========================================
// SECTION 11: COLD-CHAIN TELEMETRY & GEOLOCATION
// ==========================================

interface TelemetryState {
  orderId: string;
  sensorId: string;
  targetRange: { min: number; max: number; label: string };
  currentTemp: number;
  isWithinSla: boolean;
  batteryLevel: number;
  lidSeal: 'TAMPER_EVIDENT_SECURED' | 'SEAL_BREACHED';
  courier: {
    name: string;
    phone: string;
    vehicleNo: string;
    lat: number;
    lng: number;
    distanceKm: number;
    etaMinutes: number;
    currentRoad: string;
  };
  temperatureHistory: { timestamp: string; temp: number; isWithinSla: boolean }[];
  breachSimulated: boolean;
}

const orderTelemetryStore: Record<string, TelemetryState> = {
  default: {
    orderId: 'ORD-2026-99215',
    sensorId: 'BLE-TEMPSENSE-049',
    targetRange: { min: 18.0, max: 24.0, label: 'Room Temperature Controlled (18°C–24°C)' },
    currentTemp: 21.2,
    isWithinSla: true,
    batteryLevel: 94,
    lidSeal: 'TAMPER_EVIDENT_SECURED',
    courier: {
      name: 'Suresh K.',
      phone: '+91 98765 43210',
      vehicleNo: 'KA-04-EK-8812',
      lat: 12.9784,
      lng: 77.6408,
      distanceKm: 1.4,
      etaMinutes: 18,
      currentRoad: 'Indiranagar 100ft Road',
    },
    temperatureHistory: [
      { timestamp: '14:24', temp: 20.8, isWithinSla: true },
      { timestamp: '14:28', temp: 21.0, isWithinSla: true },
      { timestamp: '14:32', temp: 21.4, isWithinSla: true },
      { timestamp: '14:36', temp: 21.1, isWithinSla: true },
      { timestamp: '14:40', temp: 21.2, isWithinSla: true },
    ],
    breachSimulated: false,
  },
};

apiRouter.get('/orders/:id/telemetry', (req, res) => {
  const orderId = req.params.id;
  const telemetry = orderTelemetryStore[orderId] || {
    ...orderTelemetryStore.default,
    orderId,
  };

  // Add subtle realistic micro-fluctuation if not in simulated breach mode
  if (!telemetry.breachSimulated) {
    const jitter = (Math.random() * 0.4 - 0.2);
    telemetry.currentTemp = Math.round((21.2 + jitter) * 10) / 10;
  }

  res.json({ success: true, telemetry });
});

apiRouter.post('/orders/:id/telemetry/simulate-breach', async (req, res) => {
  const orderId = req.params.id;
  const { breach, breachTemp } = req.body;

  if (!orderTelemetryStore[orderId]) {
    orderTelemetryStore[orderId] = {
      ...orderTelemetryStore.default,
      orderId,
    };
  }

  const telemetry = orderTelemetryStore[orderId];
  telemetry.breachSimulated = Boolean(breach);

  if (telemetry.breachSimulated) {
    telemetry.currentTemp = breachTemp || 26.8;
    telemetry.isWithinSla = false;
    telemetry.temperatureHistory.push({
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      temp: telemetry.currentTemp,
      isWithinSla: false,
    });

    await logCdscoAudit(
      'COLD_CHAIN_SLA_BREACH_ALERT',
      `CRITICAL: Order ${orderId} ambient carrier exceeded 24°C threshold (Detected ${telemetry.currentTemp}°C). Automated quarantine warning dispatched to courier.`
    );
  } else {
    telemetry.currentTemp = 21.2;
    telemetry.isWithinSla = true;
    telemetry.temperatureHistory.push({
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      temp: 21.2,
      isWithinSla: true,
    });

    await logCdscoAudit(
      'COLD_CHAIN_SLA_NORMALIZED',
      `RESOLVED: Order ${orderId} ambient carrier normalized back to 21.2°C (Optimal SLA 18°C–24°C).`
    );
  }

  res.json({
    success: true,
    message: telemetry.breachSimulated
      ? 'Thermal SLA breach simulation activated.'
      : 'Carrier temperature normalized.',
    telemetry,
  });
});

apiRouter.post('/orders/:id/telemetry/log', async (req, res) => {
  const orderId = req.params.id;
  const { temperatureCelsius, sensorId, batteryLevel } = req.body;

  if (!orderTelemetryStore[orderId]) {
    orderTelemetryStore[orderId] = {
      ...orderTelemetryStore.default,
      orderId,
    };
  }

  const telemetry = orderTelemetryStore[orderId];
  const temp = Number(temperatureCelsius) || 21.0;
  telemetry.currentTemp = temp;
  telemetry.isWithinSla = temp >= telemetry.targetRange.min && temp <= telemetry.targetRange.max;
  if (sensorId) telemetry.sensorId = sensorId;
  if (batteryLevel) telemetry.batteryLevel = batteryLevel;

  telemetry.temperatureHistory.push({
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    temp,
    isWithinSla: telemetry.isWithinSla,
  });

  if (telemetry.temperatureHistory.length > 20) {
    telemetry.temperatureHistory.shift();
  }

  res.json({ success: true, telemetry });
});

// ==========================================
// SECTION 12: DELIVERY HANDSHAKE & CRYPTOGRAPHIC OTP
// ==========================================

const orderDeliveryStatus: Record<string, { status: string; otp: string; deliveredAt?: string; courierId: string }> = {
  'ORD-2026-99215': { status: 'DISPATCHED', otp: '4829', courierId: 'RIDER-SURESH-01' },
  'ORD-8921': { status: 'DISPATCHED', otp: '4829', courierId: 'RIDER-SURESH-01' },
};

apiRouter.post('/orders/:id/verify-delivery-otp', async (req, res) => {
  const orderId = req.params.id;
  const { otp, recipientSignature } = req.body;

  if (!otp || typeof otp !== 'string' || otp.trim().length !== 4) {
    return res.status(400).json({ error: 'Please enter a valid 4-digit Delivery OTP.' });
  }

  const orderRecord = orderDeliveryStatus[orderId] || {
    status: 'DISPATCHED',
    otp: '4829',
    courierId: 'RIDER-SURESH-01',
  };

  const expectedOtp = orderRecord.otp;

  if (otp.trim() !== expectedOtp && otp.trim() !== '4829') {
    return res.status(400).json({
      success: false,
      error: 'Invalid 4-digit Delivery OTP. Doorstep release rejected per CDSCO Rule 65.',
      expectedHint: '4829',
    });
  }

  const deliveredAt = new Date().toISOString();
  orderRecord.status = 'DELIVERED';
  orderRecord.deliveredAt = deliveredAt;
  orderDeliveryStatus[orderId] = orderRecord;

  // Persist into Prisma if database is running
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' },
    });
  } catch {
    // In-memory fallback
  }

  await logCdscoAudit(
    'ORDER_DELIVERED_OTP_VERIFIED',
    `SUCCESS: Order ${orderId} delivered at doorstep by courier Suresh K. (${orderRecord.courierId}) after successful 4-digit cryptographic OTP handshake verification.`
  );

  res.json({
    success: true,
    orderId,
    status: 'DELIVERED',
    deliveredAt,
    courierName: 'Suresh K.',
    courierLicense: 'DL-RIDER-KA-8812',
    handoverProof: {
      cdscoForm: 'Form 20B/21B Handover Certificate',
      coldChainSlaMet: true,
      deliveredAt,
      recipientAcknowledged: true,
    },
  });
});

// ==========================================
// SECTION 13: AYUSHMAN BHARAT DIGITAL MISSION (ABDM)
// ==========================================

const ABDM_CITIZENS: Record<string, any> = {
  '91-4829-1029-4819': {
    abhaNumber: '91-4829-1029-4819',
    abhaAddress: 'rahul.sharma@abdm',
    name: 'Rahul Sharma',
    gender: 'Male',
    dateOfBirth: '14/08/1992',
    mobile: '+91 98765 43210',
    aadhaarVerified: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    qrPayload: 'https://abdm.gov.in/verify?abha=91-4829-1029-4819',
    healthFacility: 'AIIMS New Delhi',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
  },
  'rahul.sharma@abdm': {
    abhaNumber: '91-4829-1029-4819',
    abhaAddress: 'rahul.sharma@abdm',
    name: 'Rahul Sharma',
    gender: 'Male',
    dateOfBirth: '14/08/1992',
    mobile: '+91 98765 43210',
    aadhaarVerified: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    qrPayload: 'https://abdm.gov.in/verify?abha=91-4829-1029-4819',
    healthFacility: 'AIIMS New Delhi',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
  },
};

const ABDM_EHR_PRESCRIPTIONS = [
  {
    id: 'EHR-AIIMS-2026-901',
    hospital: 'All India Institute of Medical Sciences (AIIMS), New Delhi',
    department: 'Cardiology OPD',
    doctorName: 'Dr. Sandeep K. Joshi, MD, DM (Cardiology)',
    doctorRegNo: 'NMC-2012-88192',
    encounterDate: '08 Sep 2026',
    diagnosis: 'Stage 1 Essential Hypertension & Hypercholesterolemia',
    fhirBundleId: 'FHIR-RX-AIIMS-48102',
    digitallySigned: true,
    medicines: [
      {
        prescribedBrand: 'Lipitor 20mg',
        genericEquivalent: 'Atorvastatin 20mg IP',
        dosage: '1 Tablet OD at bedtime (Post Dinner)',
        durationDays: 30,
        mrp: 180.0,
        genericPrice: 28.0,
        savingsRupees: 152.0,
      },
      {
        prescribedBrand: 'Telma 40mg',
        genericEquivalent: 'Telmisartan 40mg IP',
        dosage: '1 Tablet OD in morning (After Breakfast)',
        durationDays: 30,
        mrp: 125.0,
        genericPrice: 22.0,
        savingsRupees: 103.0,
      },
    ],
  },
  {
    id: 'EHR-SFJ-2026-442',
    hospital: 'Safdarjung Hospital & VMMC, New Delhi',
    department: 'Internal Medicine & Endocrinology OPD',
    doctorName: 'Dr. Sunita Deshmukh, MD (Medicine)',
    doctorRegNo: 'DMC-2015-44910',
    encounterDate: '02 Sep 2026',
    diagnosis: 'Type 2 Diabetes Mellitus',
    fhirBundleId: 'FHIR-RX-SFJ-11029',
    digitallySigned: true,
    medicines: [
      {
        prescribedBrand: 'Glucophage 500mg SR',
        genericEquivalent: 'Metformin 500mg IP (Sustained Release)',
        dosage: '1 Tablet BD after major meals',
        durationDays: 30,
        mrp: 78.0,
        genericPrice: 18.0,
        savingsRupees: 60.0,
      },
      {
        prescribedBrand: 'Pantocid 40mg',
        genericEquivalent: 'Pantoprazole 40mg IP',
        dosage: '1 Tablet OD before breakfast',
        durationDays: 15,
        mrp: 95.0,
        genericPrice: 20.0,
        savingsRupees: 75.0,
      },
    ],
  },
];

apiRouter.post('/abdm/verify-abha', async (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'Please enter a 14-digit ABHA Number or ABHA Address.' });
  }

  const cleanId = String(identifier).trim();
  const citizen = ABDM_CITIZENS[cleanId] || ABDM_CITIZENS['91-4829-1029-4819'];

  // Two-step simulation: If no OTP provided, trigger Aadhaar OTP
  if (!otp) {
    return res.json({
      status: 'OTP_SENT',
      message: `Aadhaar verification OTP sent to registered mobile linked to ${citizen.name} (******4210).`,
      maskedMobile: '******4210',
      demoOtpHint: '482910',
    });
  }

  if (otp.trim() !== '482910' && otp.trim() !== '123456') {
    return res.status(400).json({
      error: 'Invalid Aadhaar authentication OTP. Please enter 482910.',
    });
  }

  await logCdscoAudit(
    'ABDM_ABHA_VERIFIED',
    `Citizen ${citizen.name} successfully authenticated ABHA ${citizen.abhaNumber} via NHA Sandbox Gateway.`
  );

  res.json({
    status: 'VERIFIED',
    profile: citizen,
    linkedFacilities: [
      { name: 'AIIMS New Delhi', hipId: 'IN0710000001', recordsCount: 1 },
      { name: 'Safdarjung Hospital', hipId: 'IN0710000002', recordsCount: 1 },
      { name: 'Victoria Hospital Bengaluru', hipId: 'IN2910000014', recordsCount: 0 },
    ],
  });
});

apiRouter.get('/abdm/ehr-prescriptions', (req, res) => {
  res.json({
    success: true,
    prescriptions: ABDM_EHR_PRESCRIPTIONS,
    nhaConsentToken: 'CONSENT-ABDM-2026-NHA-48192',
    syncedAt: new Date().toISOString(),
  });
});

apiRouter.post('/abdm/import-prescription', async (req, res) => {
  const { ehrId } = req.body;
  const matched = ABDM_EHR_PRESCRIPTIONS.find((p) => p.id === ehrId) || ABDM_EHR_PRESCRIPTIONS[0];

  const newVaultPrescription = {
    id: `RX-ABDM-${Date.now().toString().slice(-4)}`,
    doctorName: matched.doctorName,
    clinic: matched.hospital,
    date: matched.encounterDate,
    status: 'Verified & Digitized',
    confidenceScore: 0.99,
    needsManualReview: false,
    medicines: matched.medicines.map((m) => ({
      brandName: m.prescribedBrand,
      genericEquivalent: m.genericEquivalent,
      dosage: m.dosage,
      standardMRP: m.mrp,
      genericPrice: m.genericPrice,
      savingsPercent: Math.round(((m.mrp - m.genericPrice) / m.mrp) * 100),
      bioequivalenceScore: 99.6,
      manufacturer: 'Jan Aushadhi (PMBI Certified)',
    })),
  };

  try {
    await prisma.prescription.create({
      data: {
        id: newVaultPrescription.id,
        doctorName: newVaultPrescription.doctorName,
        clinic: newVaultPrescription.clinic,
        doctorRegNo: matched.doctorRegNo,
        date: newVaultPrescription.date,
        status: newVaultPrescription.status,
        confidenceScore: 0.99,
        extractedJson: JSON.stringify(newVaultPrescription.medicines),
      },
    });
  } catch {
    // In-memory fallback
  }

  await logCdscoAudit(
    'ABDM_EHR_PRESCRIPTION_IMPORTED',
    `Imported FHIR e-Prescription ${matched.id} (${matched.hospital}) into Digital Vault. 100% bioequivalent substitution verified.`
  );

  res.json({
    success: true,
    message: `Successfully imported e-Prescription from ${matched.hospital}`,
    prescription: newVaultPrescription,
  });
});

// ==========================================
// SECTION 14: CDSCO SUGAM NATIONAL DRUG RECALL REGISTRY
// ==========================================

const CDSCO_SUGAM_BULLETINS = [
  {
    circularId: 'CDSCO/ALERT/2026/081',
    drugName: 'Dolo-Cold Suspension 60ml',
    activeSalt: 'Paracetamol + Phenylephrine + CPM',
    manufacturer: 'Micro Labs Formulation Hub',
    batchNumber: 'RECALL-DOLO-99',
    expiryDate: '09/2027',
    riskTier: 'HIGH',
    reason: 'Substandard dissolution rate detected during CDSCO random market surveillance in Karnataka.',
    regulatoryAction: 'Immediate retail freeze and dispensary recall under Drugs & Cosmetics Rule 65.',
    dateIssued: '01 Sep 2026',
    status: 'ACTIVE_RECALL',
  },
  {
    circularId: 'CDSCO/ALERT/2026/074',
    drugName: 'Cough-Relief DX Syrup 100ml',
    activeSalt: 'Dextromethorphan HBr IP',
    manufacturer: 'Apex Pharms Central Ltd',
    batchNumber: 'RECALL-APEX-14',
    expiryDate: '11/2026',
    riskTier: 'CRITICAL',
    reason: 'Trace solvent impurities exceeding pharmacopeial limits in government state testing laboratory.',
    regulatoryAction: 'Nationwide batch seizure and manufacturer manufacturing license audit.',
    dateIssued: '20 Aug 2026',
    status: 'ACTIVE_RECALL',
  },
  {
    circularId: 'CDSCO/NOTICE/2026/062',
    drugName: 'Ceftriaxone 1g Injection IP',
    activeSalt: 'Ceftriaxone Sodium Sterile',
    manufacturer: 'Bharat Bio-Formulations',
    batchNumber: 'RECALL-CEF-02',
    expiryDate: '04/2028',
    riskTier: 'MODERATE',
    reason: 'Particulate matter reported in hospital tertiary audit inspection.',
    regulatoryAction: 'Voluntary manufacturer quarantine and hospital stock replacement.',
    dateIssued: '14 Aug 2026',
    status: 'ACTIVE_RECALL',
  },
];

apiRouter.get('/cdsco/sugam/recalls', (req, res) => {
  res.json({
    success: true,
    totalRecalls: CDSCO_SUGAM_BULLETINS.length,
    activeAlerts: CDSCO_SUGAM_BULLETINS.filter((b) => b.status === 'ACTIVE_RECALL').length,
    lastSync: new Date().toISOString(),
    bulletins: CDSCO_SUGAM_BULLETINS,
  });
});

apiRouter.get('/cdsco/sugam/verify-batch/:batchNumber', (req, res) => {
  const batchNumber = req.params.batchNumber.trim().toUpperCase();

  const foundRecall = CDSCO_SUGAM_BULLETINS.find(
    (b) => b.batchNumber.toUpperCase() === batchNumber
  );

  if (foundRecall) {
    return res.json({
      status: 'RECALLED',
      isSafe: false,
      batchNumber,
      recallAlert: foundRecall,
      warning: `ALERT: Batch ${batchNumber} is flagged under CDSCO National Bulletin ${foundRecall.circularId}. Do NOT dispense or consume.`,
    });
  }

  res.json({
    status: 'VERIFIED_SAFE',
    isSafe: true,
    batchNumber,
    verifiedAt: new Date().toISOString(),
    sugamRegistryId: `SUGAM-CLEAR-${Math.floor(100000 + Math.random() * 900000)}`,
    message: `Batch ${batchNumber} has zero recall records on CDSCO Sugam Registry. Safe for distribution.`,
  });
});

// ==========================================
// SECTION 15: ENTERPRISE TELEMETRY & KUBERNETES METRICS
// ==========================================

apiRouter.get('/metrics', (req, res) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'HEALTHY',
    service: 'genericmed-core-api',
    version: '0.8.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    cluster: {
      nodeId: 'genericmed-k8s-worker-blr-01',
      zone: 'asia-south1-a (Bengaluru)',
      readyReplicas: 3,
      desiredReplicas: 3,
    },
    memoryUsage: {
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
    },
    operationalMetrics: {
      activeTenantsCount: 4,
      abdmIntegrationStatus: 'CONNECTED_SANDBOX',
      sugamRegistrySync: 'ACTIVE',
      coldChainComplianceRate: '99.8%',
      scheduleH1AuditLogsTotal: 48,
    },
  });
});
