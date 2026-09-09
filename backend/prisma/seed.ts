import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GenericMed CDSCO Pharmaceutical Database...');

  // 1. Clean existing records in dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.coldChainLog.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.pharmacyInventory.deleteMany({});
  await prisma.brandGenericMap.deleteMany({});
  await prisma.medicine.deleteMany({});
  await prisma.pharmacy.deleteMany({});
  await prisma.activeSalt.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users across all RBAC roles
  console.log('👤 Seeding RBAC Users...');
  const patient = await prisma.user.create({
    data: {
      phone: '+919876543210',
      name: 'Rahul Sharma (Patient)',
      email: 'rahul.sharma@example.com',
      role: 'PATIENT',
      address: '#402 Palm Grove, 12th Main Indiranagar, Bengaluru 560038',
    },
  });

  const pharmacist = await prisma.user.create({
    data: {
      phone: '+919876543211',
      name: 'Priya Nair (Reg. Pharmacist)',
      email: 'priya.pharmacist@janaushadhi.gov.in',
      role: 'PHARMACIST',
      address: 'Jan Aushadhi Kendra #104, Indiranagar, Bengaluru 560038',
    },
  });

  const deliveryAgent = await prisma.user.create({
    data: {
      phone: '+919876543212',
      name: 'Suresh Kumar (Cold-Chain Courier)',
      email: 'suresh.courier@genericmed.in',
      role: 'DELIVERY_AGENT',
      address: 'Hub #4, HAL 2nd Stage, Bengaluru',
    },
  });

  const admin = await prisma.user.create({
    data: {
      phone: '+919876543213',
      name: 'Dr. Vikram Malhotra (CDSCO Regulatory Officer)',
      email: 'vikram.malhotra@cdsco.gov.in',
      role: 'ADMIN',
      address: 'Central Drugs Standard Control Organisation, South Zone, Chennai',
    },
  });

  // 3. Seed Active Salts (Standardized Pharmacopoeia Specifications)
  console.log('🧪 Seeding Active Pharmaceutical Ingredients (APIs)...');
  const saltData = [
    {
      id: 'PARA-650-IP',
      chemicalName: 'Paracetamol IP 650mg',
      standard: 'Indian Pharmacopoeia (IP)',
      therapeuticClass: 'Analgesic / Antipyretic',
      dissolutionProfile: '≥ 85% in 30 minutes in simulated gastric fluid (pH 1.2)',
    },
    {
      id: 'AMOX-CLAV-625',
      chemicalName: 'Amoxicillin Trihydrate (500mg) + Potassium Clavulanate (125mg) IP',
      standard: 'Indian Pharmacopoeia (IP)',
      therapeuticClass: 'Broad-Spectrum Penicillin / Beta-lactamase Inhibitor',
      dissolutionProfile: 'USP Dissolution Stage 2 compliant (≥ 80% in 45 minutes)',
    },
    {
      id: 'ATOR-20-IP',
      chemicalName: 'Atorvastatin Calcium Trihydrate IP 20mg',
      standard: 'Indian Pharmacopoeia (IP)',
      therapeuticClass: 'HMG-CoA Reductase Inhibitor (Cardiovascular)',
      dissolutionProfile: 'Dissolution in phosphate buffer pH 6.8 with 0.5% SLS',
    },
    {
      id: 'MET-500-SR',
      chemicalName: 'Metformin Hydrochloride IP 500mg Sustained Release',
      standard: 'Indian Pharmacopoeia (IP)',
      therapeuticClass: 'Biguanide Antidiabetic',
      dissolutionProfile: 'Zero-order sustained matrix dissolution over 10 hours',
    },
    {
      id: 'PANTO-40-IP',
      chemicalName: 'Pantoprazole Sodium IP 40mg (Enteric Coated)',
      standard: 'Indian Pharmacopoeia (IP)',
      therapeuticClass: 'Proton Pump Inhibitor (Gastrointestinal)',
      dissolutionProfile: 'Acid resistance in 0.1N HCl for 2h; ≥75% release in pH 6.8 buffer',
    },
    {
      id: 'TELMI-40-IP',
      chemicalName: 'Telmisartan IP 40mg',
      standard: 'Indian Pharmacopoeia (IP)',
      therapeuticClass: 'Angiotensin II Receptor Antagonist (Antihypertensive)',
      dissolutionProfile: '≥ 75% in 30 minutes in 0.1N HCl (pH 1.2)',
    },
    {
      id: 'AZITH-500-IP',
      chemicalName: 'Azithromycin Dihydrate IP 500mg',
      standard: 'Indian Pharmacopoeia (IP)',
      therapeuticClass: 'Macrolide Antibiotic',
      dissolutionProfile: '≥ 80% dissolution in pH 6.0 phosphate buffer within 30 minutes',
    },
    {
      id: 'CEFIX-200-IP',
      chemicalName: 'Cefixime Trihydrate IP 200mg',
      standard: 'Indian Pharmacopoeia (IP) • Schedule H1',
      therapeuticClass: 'Cephalosporin Antibiotic',
      dissolutionProfile: '≥ 75% release in 45 minutes (IP monograph standard)',
    },
    {
      id: 'ROSU-10-IP',
      chemicalName: 'Rosuvastatin Calcium IP 10mg',
      standard: 'Indian Pharmacopoeia (IP)',
      therapeuticClass: 'Lipid Lowering Statin',
      dissolutionProfile: '≥ 80% release in citrate buffer pH 6.6',
    },
    {
      id: 'LEVO-MONTE-IP',
      chemicalName: 'Levocetirizine Dihydrochloride (5mg) + Montelukast Sodium (10mg) IP',
      standard: 'Indian Pharmacopoeia (IP)',
      therapeuticClass: 'Dual Action Antihistamine & Leukotriene Antagonist',
      dissolutionProfile: 'Differential dissolution in twin buffer stages (pH 1.2 and pH 6.8)',
    },
    {
      id: 'D3-60K-CHOL',
      chemicalName: 'Cholecalciferol IP 60,000 IU (Soft Gelatin / Chewable)',
      standard: 'Indian Pharmacopoeia (IP)',
      therapeuticClass: 'Bone Mineral Density & Vitamin D Supplement',
      dissolutionProfile: 'Oil dispersion rupture test compliant within 15 minutes',
    },
    {
      id: 'ALPRA-05-H1',
      chemicalName: 'Alprazolam IP 0.5mg',
      standard: 'Indian Pharmacopoeia (IP) • Schedule H1 Narcotic Watch',
      therapeuticClass: 'Anxiolytic Benzodiazepine',
      dissolutionProfile: '≥ 85% release in 30 minutes in 0.1M HCl',
    },
  ];

  for (const s of saltData) {
    await prisma.activeSalt.create({ data: s });
  }

  // 4. Seed Pharmacies
  console.log('🏥 Seeding Hyperlocal Pharmacies...');
  const janAushadhi = await prisma.pharmacy.create({
    data: {
      name: 'Jan Aushadhi Kendra #104 (PMBI Certified)',
      licenseNo: 'DL-KA-2024-8849-20B/21B',
      locality: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru',
      latitude: 12.9719,
      longitude: 77.6412,
      rating: 4.9,
      phone: '+91 80 2520 1104',
    },
  });

  const apollo = await prisma.pharmacy.create({
    data: {
      name: 'Apollo Med Central Indiranagar',
      licenseNo: 'Lic #KA-BLR-20B-189',
      locality: '100 Feet Road, Indiranagar, Bengaluru',
      latitude: 12.9734,
      longitude: 77.6401,
      rating: 4.8,
      phone: '+91 80 4115 8890',
    },
  });

  const medplus = await prisma.pharmacy.create({
    data: {
      name: 'MedPlus Pharmacy CMH Road',
      licenseNo: 'Lic #KA-BLR-21B-404',
      locality: 'CMH Road, Indiranagar, Bengaluru',
      latitude: 12.9781,
      longitude: 77.6385,
      rating: 4.7,
      phone: '+91 80 2528 4404',
    },
  });

  const wellness = await prisma.pharmacy.create({
    data: {
      name: 'Wellness Forever 24/7 Superstore',
      licenseNo: 'Lic #KA-BLR-20B-712',
      locality: 'Old Airport Road, Bengaluru',
      latitude: 12.9602,
      longitude: 77.6489,
      rating: 4.8,
      phone: '+91 80 2522 9900',
    },
  });

  // 5. Seed Core Medicine Formulations & Brand-to-Generic Mappings
  console.log('💊 Seeding Core Medicine Pairs and Formulations...');
  const corePairs = [
    {
      formulaId: 'PARA-650-IP',
      brandTradeName: 'Dolo 650mg',
      brandMfg: 'Micro Labs Ltd',
      brandMrp: 34.50,
      brandSelling: 34.50,
      genericTradeName: 'Paracetamol IP 650mg',
      genericMfg: 'Jan Aushadhi / Cipla Gen',
      genericMrp: 34.50,
      genericSelling: 10.50,
      packDetail: 'Strip of 15',
      units: 15,
      isH1: false,
    },
    {
      formulaId: 'AMOX-CLAV-625',
      brandTradeName: 'Augmentin 625 Duo',
      brandMfg: 'GSK Pharmaceuticals Ltd',
      brandMrp: 192.00,
      brandSelling: 192.00,
      genericTradeName: 'Amoxy-Clav 625mg',
      genericMfg: 'Alkem / Zydus Generic',
      genericMrp: 192.00,
      genericSelling: 50.00,
      packDetail: 'Strip of 10',
      units: 10,
      isH1: true,
    },
    {
      formulaId: 'ATOR-20-IP',
      brandTradeName: 'Lipitor 20mg',
      brandMfg: 'Pfizer India Ltd',
      brandMrp: 180.00,
      brandSelling: 180.00,
      genericTradeName: 'Atorvastatin 20mg',
      genericMfg: 'Cipla / Torrent Generic',
      genericMrp: 180.00,
      genericSelling: 28.00,
      packDetail: 'Strip of 10',
      units: 10,
      isH1: false,
    },
    {
      formulaId: 'MET-500-SR',
      brandTradeName: 'Glycomet 500 SR',
      brandMfg: 'USV Ltd',
      brandMrp: 45.00,
      brandSelling: 45.00,
      genericTradeName: 'Metformin 500mg SR',
      genericMfg: 'Jan Aushadhi / Sun Gen',
      genericMrp: 45.00,
      genericSelling: 12.00,
      packDetail: 'Strip of 20',
      units: 20,
      isH1: false,
    },
    {
      formulaId: 'PANTO-40-IP',
      brandTradeName: 'Pantocid 40mg',
      brandMfg: 'Sun Pharma Ltd',
      brandMrp: 155.00,
      brandSelling: 155.00,
      genericTradeName: 'Pantoprazole 40mg',
      genericMfg: 'Jan Aushadhi / Mankind Gen',
      genericMrp: 155.00,
      genericSelling: 32.00,
      packDetail: 'Strip of 15',
      units: 15,
      isH1: false,
    },
    {
      formulaId: 'TELMI-40-IP',
      brandTradeName: 'Telma 40mg',
      brandMfg: 'Glenmark Pharmaceuticals',
      brandMrp: 145.00,
      brandSelling: 145.00,
      genericTradeName: 'Telmisartan 40mg IP',
      genericMfg: 'Torrent / Jan Aushadhi',
      genericMrp: 145.00,
      genericSelling: 35.00,
      packDetail: 'Strip of 15',
      units: 15,
      isH1: false,
    },
    {
      formulaId: 'AZITH-500-IP',
      brandTradeName: 'Azithral 500mg',
      brandMfg: 'Alembic Pharmaceuticals',
      brandMrp: 130.00,
      brandSelling: 130.00,
      genericTradeName: 'Azithromycin 500mg IP',
      genericMfg: 'Cipla Gen / Jan Aushadhi',
      genericMrp: 130.00,
      genericSelling: 42.00,
      packDetail: 'Strip of 5',
      units: 5,
      isH1: true,
    },
    {
      formulaId: 'CEFIX-200-IP',
      brandTradeName: 'Zifi 200mg',
      brandMfg: 'FDC Ltd',
      brandMrp: 115.00,
      brandSelling: 115.00,
      genericTradeName: 'Cefixime 200mg IP',
      genericMfg: 'Jan Aushadhi / Alkem Gen',
      genericMrp: 115.00,
      genericSelling: 38.00,
      packDetail: 'Strip of 10',
      units: 10,
      isH1: true,
    },
    {
      formulaId: 'ROSU-10-IP',
      brandTradeName: 'Rosuvas 10mg',
      brandMfg: 'Sun Pharma Ltd',
      brandMrp: 165.00,
      brandSelling: 165.00,
      genericTradeName: 'Rosuvastatin 10mg IP',
      genericMfg: 'Jan Aushadhi / Torrent Gen',
      genericMrp: 165.00,
      genericSelling: 34.00,
      packDetail: 'Strip of 10',
      units: 10,
      isH1: false,
    },
    {
      formulaId: 'LEVO-MONTE-IP',
      brandTradeName: 'Montair-LC',
      brandMfg: 'Cipla Ltd',
      brandMrp: 215.00,
      brandSelling: 215.00,
      genericTradeName: 'Montelukast + Levocetirizine',
      genericMfg: 'Jan Aushadhi / Mankind Gen',
      genericMrp: 215.00,
      genericSelling: 55.00,
      packDetail: 'Strip of 10',
      units: 10,
      isH1: false,
    },
    {
      formulaId: 'D3-60K-CHOL',
      brandTradeName: 'Calcirol 60000 IU',
      brandMfg: 'Cadila Pharmaceuticals',
      brandMrp: 138.00,
      brandSelling: 138.00,
      genericTradeName: 'Cholecalciferol D3 60K',
      genericMfg: 'Jan Aushadhi / Zydus Gen',
      genericMrp: 138.00,
      genericSelling: 32.00,
      packDetail: 'Pack of 4 Softgels',
      units: 4,
      isH1: false,
    },
    {
      formulaId: 'ALPRA-05-H1',
      brandTradeName: 'Restyl 0.5mg',
      brandMfg: 'Cipla Ltd',
      brandMrp: 68.00,
      brandSelling: 68.00,
      genericTradeName: 'Alprazolam 0.5mg IP',
      genericMfg: 'Jan Aushadhi / Sun Gen',
      genericMrp: 68.00,
      genericSelling: 14.00,
      packDetail: 'Strip of 15',
      units: 15,
      isH1: true,
    },
  ];

  let createdMedicinesCount = 0;

  for (const pair of corePairs) {
    const brand = await prisma.medicine.create({
      data: {
        formulaId: pair.formulaId,
        tradeName: pair.brandTradeName,
        manufacturer: pair.brandMfg,
        isGeneric: false,
        isScheduleH1: pair.isH1,
        mrp: pair.brandMrp,
        sellingPrice: pair.brandSelling,
        dosageForm: 'Tablet',
        unitsPerPack: pair.units,
        unitCost: pair.brandSelling / pair.units,
        packDetail: pair.packDetail,
      },
    });

    const generic = await prisma.medicine.create({
      data: {
        formulaId: pair.formulaId,
        tradeName: pair.genericTradeName,
        manufacturer: pair.genericMfg,
        isGeneric: true,
        isScheduleH1: pair.isH1,
        mrp: pair.genericMrp,
        sellingPrice: pair.genericSelling,
        dosageForm: 'Tablet',
        unitsPerPack: pair.units,
        unitCost: pair.genericSelling / pair.units,
        packDetail: pair.packDetail,
      },
    });

    const savingsRupees = pair.brandSelling - pair.genericSelling;
    const savingsPercent = Math.round((savingsRupees / pair.brandSelling) * 100);

    await prisma.brandGenericMap.create({
      data: {
        brandMedicineId: brand.id,
        genericMedicineId: generic.id,
        bioequivalenceScore: 99.4,
        savingsRupees,
        savingsPercent,
        verifiedTag: '100% Bio-identical molecule composition • IP/USP Certified',
      },
    });

    // Seed Pharmacy Inventory
    await prisma.pharmacyInventory.create({
      data: {
        pharmacyId: janAushadhi.id,
        medicineId: generic.id,
        batchNumber: `GEN-2026-${Math.floor(10 + Math.random() * 89)}`,
        expiryDate: new Date('2028-09-30'),
        stockUnits: 350,
        sellingPrice: pair.genericSelling,
      },
    });

    await prisma.pharmacyInventory.create({
      data: {
        pharmacyId: apollo.id,
        medicineId: generic.id,
        batchNumber: `AP-9921-${Math.floor(10 + Math.random() * 89)}`,
        expiryDate: new Date('2028-04-30'),
        stockUnits: 180,
        sellingPrice: pair.genericSelling + 2.0,
      },
    });

    createdMedicinesCount += 2;
  }

  // 6. Programmatically expand catalog to 500+ formulations across Jan Aushadhi tiers
  console.log('📈 Programmatically scaling catalog to 500+ generic pharmaceutical formulations...');
  const therapeuticClasses = [
    { prefix: 'CARDIO', name: 'Cardiovascular & Hypertensive', count: 80, salts: ['Amlodipine', 'Metoprolol', 'Losartan', 'Ramipril', 'Clopidogrel'] },
    { prefix: 'ANTIBIO', name: 'Antibacterial & Antimicrobial', count: 90, salts: ['Ciprofloxacin', 'Ofloxacin', 'Doxycycline', 'Levofloxacin', 'Clarithromycin'] },
    { prefix: 'DIABET', name: 'Endocrine & Antidiabetic', count: 80, salts: ['Glimepiride', 'Teneligliptin', 'Dapagliflozin', 'Vildagliptin', 'Gliclazide'] },
    { prefix: 'GASTRO', name: 'Gastrointestinal & Antacids', count: 70, salts: ['Omeprazole', 'Rabeprazole', 'Esomeprazole', 'Domperidone', 'Ondansetron'] },
    { prefix: 'ANALGES', name: 'Pain, Analgesics & Anti-inflammatory', count: 80, salts: ['Ibuprofen', 'Diclofenac Sodium', 'Aceclofenac', 'Tramadol', 'Ketorolac'] },
    { prefix: 'RESPIR', name: 'Respiratory, Cold & Allergy', count: 60, salts: ['Cetirizine', 'Fexofenadine', 'Bilastine', 'Salbutamol', 'Budesonide'] },
    { prefix: 'VITAMIN', name: 'Essential Micronutrients & Hematology', count: 60, salts: ['Methylcobalamin B12', 'Folic Acid', 'Ferrous Ascorbate', 'Zinc Sulphate', 'Calcium Carbonate'] },
  ];

  for (const group of therapeuticClasses) {
    for (let i = 1; i <= group.count; i++) {
      const saltName = group.salts[i % group.salts.length];
      const strength = [5, 10, 20, 50, 100, 250, 500][i % 7];
      const formulaId = `${group.prefix}-${saltName.substring(0, 4).toUpperCase()}-${strength}-IP`;

      // Upsert Salt
      await prisma.activeSalt.upsert({
        where: { id: formulaId },
        create: {
          id: formulaId,
          chemicalName: `${saltName} IP ${strength}mg`,
          standard: 'Indian Pharmacopoeia (IP)',
          therapeuticClass: group.name,
          dissolutionProfile: 'Standard Monograph Stage 1 release verified',
        },
        update: {},
      });

      const brandPrice = 60 + (i % 25) * 5;
      const genericPrice = Math.round(brandPrice * 0.28);
      const units = (i % 3 === 0) ? 15 : 10;

      const brand = await prisma.medicine.create({
        data: {
          formulaId,
          tradeName: `${saltName} Premium #${i}`,
          manufacturer: 'Major Pharma Brand Ltd',
          isGeneric: false,
          isScheduleH1: group.prefix === 'ANTIBIO',
          mrp: brandPrice,
          sellingPrice: brandPrice,
          dosageForm: (i % 5 === 0) ? 'Capsule' : 'Tablet',
          unitsPerPack: units,
          unitCost: brandPrice / units,
          packDetail: `Strip of ${units}`,
        },
      });

      const generic = await prisma.medicine.create({
        data: {
          formulaId,
          tradeName: `${saltName} Generic IP ${strength}mg`,
          manufacturer: 'Pradhan Mantri Jan Aushadhi Pariyojana',
          isGeneric: true,
          isScheduleH1: group.prefix === 'ANTIBIO',
          mrp: brandPrice,
          sellingPrice: genericPrice,
          dosageForm: (i % 5 === 0) ? 'Capsule' : 'Tablet',
          unitsPerPack: units,
          unitCost: genericPrice / units,
          packDetail: `Strip of ${units}`,
        },
      });

      await prisma.brandGenericMap.create({
        data: {
          brandMedicineId: brand.id,
          genericMedicineId: generic.id,
          bioequivalenceScore: 99.2,
          savingsRupees: brandPrice - genericPrice,
          savingsPercent: Math.round(((brandPrice - genericPrice) / brandPrice) * 100),
          verifiedTag: 'CDSCO Form 20B/21B Audited Bioequivalent',
        },
      });

      createdMedicinesCount += 2;
    }
  }

  // 7. Seed Prescriptions
  console.log('📑 Seeding Verified Prescriptions...');
  await prisma.prescription.create({
    data: {
      id: 'RX-2026-081',
      userId: patient.id,
      doctorName: 'Dr. Sandeep K. Joshi (MD)',
      clinic: 'Manipal Hospital, Bengaluru',
      doctorRegNo: 'KMC-2018-77491',
      date: '04 Sep 2026',
      status: 'Verified & Digitized',
      extractedJson: JSON.stringify({
        verifiedMedicines: ['Paracetamol IP 650mg', 'Atorvastatin 20mg', 'Amoxy-Clav 625'],
      }),
      confidenceScore: 0.98,
      needsManualReview: false,
    },
  });

  await prisma.prescription.create({
    data: {
      id: 'RX-2026-074',
      userId: patient.id,
      doctorName: 'Dr. Ananya Rao (Cardiologist)',
      clinic: 'Apollo Clinic Indiranagar',
      doctorRegNo: 'KMC-2014-99812',
      date: '28 Aug 2026',
      status: 'Order Ready',
      extractedJson: JSON.stringify({
        verifiedMedicines: ['Telmisartan 40mg', 'Rosuvastatin 10mg'],
      }),
      confidenceScore: 0.96,
      needsManualReview: false,
    },
  });

  // 8. Seed Order and Cold-Chain Telemetry Log
  console.log('📦 Seeding Cold-Chain Orders & Telemetry...');
  const sampleOrder = await prisma.order.create({
    data: {
      id: 'ORD-8921',
      userId: patient.id,
      pharmacyId: janAushadhi.id,
      status: 'DISPATCHED',
      deliveryOtp: '4892',
      totalAmount: 110.00,
      totalSavings: 236.00,
      deliveryAddress: patient.address || '',
      coldChainSla: true,
    },
  });

  await prisma.coldChainLog.createMany({
    data: [
      { orderId: sampleOrder.id, temperatureCelsius: 4.6, isWithinSla: true },
      { orderId: sampleOrder.id, temperatureCelsius: 4.9, isWithinSla: true },
      { orderId: sampleOrder.id, temperatureCelsius: 4.8, isWithinSla: true },
    ],
  });

  // 9. Record CDSCO Compliance Audit Trail
  await prisma.auditLog.create({
    data: {
      userId: pharmacist.id,
      action: 'SYSTEM_INITIALIZED_AND_SEEDED',
      details: `Database initialized with ${createdMedicinesCount} pharmaceutical SKUs across 500+ standard formulations. CDSCO Schedule H1 prescription verification active.`,
      ipAddress: '127.0.0.1',
    },
  });

  console.log(`✅ Seeding Complete! Total Medicines Created: ${createdMedicinesCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
