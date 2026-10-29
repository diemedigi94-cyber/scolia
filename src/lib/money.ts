import { Currency, FeeItem, Payment, StudentBalanceSummary, Student } from '@/types';

/**
 * Formatage d'un montant monétaire
 * - USD : stocké en cents (ex: 5000 -> "50.00 $")
 * - CDF : stocké en unités entières (ex: 120000 -> "120 000 CDF")
 */
export function formatMoney(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    const dollars = (amount / 100).toFixed(2);
    return `${dollars} $`;
  } else {
    return `${amount.toLocaleString('fr-FR')} CDF`;
  }
}

/**
 * Convertit une saisie utilisateur (ex: "50" ou "50.50" en USD) en entier pour la base de données
 */
export function parseInputToAmount(inputValue: string | number, currency: Currency): number {
  if (typeof inputValue === 'number') {
    return currency === 'USD' ? Math.round(inputValue * 100) : Math.round(inputValue);
  }
  const clean = inputValue.replace(/\s+/g, '').replace(',', '.');
  const num = parseFloat(clean);
  if (isNaN(num) || num <= 0) return 0;
  return currency === 'USD' ? Math.round(num * 100) : Math.round(num);
}

/**
 * Calcul précis des soldes pour un élève donné
 * - Les paiements annulés (isCancelled === true) sont STRICTEMENT ignorés dans le cumul payé
 * - Calcul séparé pour USD et CDF
 */
export function calculateStudentBalances(
  student: Student,
  className: string,
  classFeeItems: FeeItem[],
  studentPayments: Payment[],
  referenceDate: string = new Date().toISOString().split('T')[0]
): StudentBalanceSummary {
  // 1. Calcul des dus par devise
  let totalDueUSD = 0;
  let totalDueCDF = 0;

  for (const fee of classFeeItems) {
    if (fee.currency === 'USD') {
      totalDueUSD += fee.amount;
    } else if (fee.currency === 'CDF') {
      totalDueCDF += fee.amount;
    }
  }

  // 2. Calcul des payés par devise (uniquement paiements actifs)
  let totalPaidUSD = 0;
  let totalPaidCDF = 0;

  for (const p of studentPayments) {
    if (p.isCancelled) continue; // Sécurité : ignorer tout paiement annulé
    if (p.studentId !== student.id) continue;

    if (p.currency === 'USD') {
      totalPaidUSD += p.amount;
    } else if (p.currency === 'CDF') {
      totalPaidCDF += p.amount;
    }
  }

  const balanceUSD = Math.max(0, totalDueUSD - totalPaidUSD);
  const balanceCDF = Math.max(0, totalDueCDF - totalPaidCDF);

  // 3. Détection du statut et des jours de retard
  let status: 'SOLDE' | 'PARTIEL' | 'EN_RETARD' = 'SOLDE';
  let daysOverdue = 0;

  const hasRemainingBalance = balanceUSD > 0 || balanceCDF > 0;
  const hasPaidSomething = totalPaidUSD > 0 || totalPaidCDF > 0;

  if (!hasRemainingBalance && (totalDueUSD > 0 || totalDueCDF > 0)) {
    status = 'SOLDE';
  } else if (hasRemainingBalance) {
    // Vérifier les dates d'échéance dépassées
    const refDateObj = new Date(referenceDate);
    let maxOverdueFeeDate: Date | null = null;

    for (const fee of classFeeItems) {
      const feeDueDate = new Date(fee.dueDate);
      if (feeDueDate < refDateObj) {
        // Cette échéance est passée
        if (!maxOverdueFeeDate || feeDueDate < maxOverdueFeeDate) {
          maxOverdueFeeDate = feeDueDate;
        }
      }
    }

    if (maxOverdueFeeDate) {
      status = 'EN_RETARD';
      const diffTime = Math.abs(refDateObj.getTime() - maxOverdueFeeDate.getTime());
      daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (hasPaidSomething) {
      status = 'PARTIEL';
    } else {
      status = 'PARTIEL'; // Non encore échu mais non soldé
    }
  }

  return {
    student,
    className,
    totalDueUSD,
    totalPaidUSD,
    balanceUSD,
    totalDueCDF,
    totalPaidCDF,
    balanceCDF,
    status,
    daysOverdue,
  };
}

/**
 * Calcul des totaux pour le tableau de bord
 */
export function calculateDashboardTotals(
  feeItems: FeeItem[],
  students: Student[],
  payments: Payment[]
) {
  // Calcul du total attendu
  let expectedUSD = 0;
  let expectedCDF = 0;

  for (const student of students) {
    if (!student.isActive) continue;
    const studentFees = feeItems.filter((f) => f.classId === student.classId);
    for (const f of studentFees) {
      if (f.currency === 'USD') expectedUSD += f.amount;
      if (f.currency === 'CDF') expectedCDF += f.amount;
    }
  }

  // Calcul du total encaissé (non annulé)
  let collectedUSD = 0;
  let collectedCDF = 0;

  const paymentMethodsUSD: Record<string, number> = { CASH: 0, MOBILE_MONEY: 0, BANK_TRANSFER: 0 };
  const paymentMethodsCDF: Record<string, number> = { CASH: 0, MOBILE_MONEY: 0, BANK_TRANSFER: 0 };

  for (const p of payments) {
    if (p.isCancelled) continue;
    if (p.currency === 'USD') {
      collectedUSD += p.amount;
      paymentMethodsUSD[p.paymentMethod] = (paymentMethodsUSD[p.paymentMethod] || 0) + p.amount;
    } else if (p.currency === 'CDF') {
      collectedCDF += p.amount;
      paymentMethodsCDF[p.paymentMethod] = (paymentMethodsCDF[p.paymentMethod] || 0) + p.amount;
    }
  }

  const remainingUSD = Math.max(0, expectedUSD - collectedUSD);
  const remainingCDF = Math.max(0, expectedCDF - collectedCDF);

  const rateUSD = expectedUSD > 0 ? Math.min(100, Math.round((collectedUSD / expectedUSD) * 100)) : 100;
  const rateCDF = expectedCDF > 0 ? Math.min(100, Math.round((collectedCDF / expectedCDF) * 100)) : 100;

  return {
    expectedUSD,
    collectedUSD,
    remainingUSD,
    rateUSD,
    expectedCDF,
    collectedCDF,
    remainingCDF,
    rateCDF,
    paymentMethodsUSD,
    paymentMethodsCDF,
  };
}
