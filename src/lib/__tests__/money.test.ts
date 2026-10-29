import { formatMoney, parseInputToAmount, calculateStudentBalances, calculateDashboardTotals } from '../money';
import { FeeItem, Payment, Student } from '@/types';

/**
 * Suite de tests unitaires pour la logique financière de Scolia
 */
export function runMoneyTests(): { total: number; passed: number; failures: string[] } {
  const failures: string[] = [];
  let testCount = 0;

  function assert(condition: boolean, testName: string) {
    testCount++;
    if (!condition) {
      failures.push(`ÉCHEC: ${testName}`);
    }
  }

  // 1. Test formatage des montants
  assert(formatMoney(5000, 'USD') === '50.00 $', 'Formatage USD standard (5000 cents -> 50.00 $)');
  assert(formatMoney(15050, 'USD') === '150.50 $', 'Formatage USD avec centimes (15050 cents -> 150.50 $)');
  assert(formatMoney(120000, 'CDF').includes('120') && formatMoney(120000, 'CDF').includes('CDF'), 'Formatage CDF entiers');

  // 2. Test conversion saisie utilisateur
  assert(parseInputToAmount('50', 'USD') === 5000, 'Saisie "50" USD -> 5000 cents');
  assert(parseInputToAmount('50.50', 'USD') === 5050, 'Saisie "50.50" USD -> 5050 cents');
  assert(parseInputToAmount('50,25', 'USD') === 5025, 'Saisie avec virgule "50,25" USD -> 5025 cents');
  assert(parseInputToAmount('120000', 'CDF') === 120000, 'Saisie "120000" CDF -> 120000 unités');

  // 3. Test calcul de solde & paiements partiels
  const mockStudent: Student = {
    id: 'stud-test-1',
    schoolId: 'school-1',
    classId: 'class-1',
    firstName: 'Test',
    lastName: 'Eleve',
    gender: 'M',
    parentName: 'Parent Test',
    parentPhone: '+243810000000',
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
  };

  const mockFees: FeeItem[] = [
    {
      id: 'f1',
      schoolId: 'school-1',
      classId: 'class-1',
      name: 'Inscription',
      amount: 5000, // 50$
      currency: 'USD',
      dueDate: '2026-09-15',
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'f2',
      schoolId: 'school-1',
      classId: 'class-1',
      name: '1ère Tranche',
      amount: 15000, // 150$
      currency: 'USD',
      dueDate: '2026-10-15',
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'f3',
      schoolId: 'school-1',
      classId: 'class-1',
      name: 'Uniforme',
      amount: 50000, // 50 000 CDF
      currency: 'CDF',
      dueDate: '2026-09-15',
      createdAt: '2026-09-01T00:00:00Z',
    },
  ];

  // Cas A : Paiement partiel USD (30$ payés sur 200$)
  const partialPayment: Payment[] = [
    {
      id: 'p1',
      schoolId: 'school-1',
      studentId: 'stud-test-1',
      amount: 3000, // 30$
      currency: 'USD',
      paymentMethod: 'CASH',
      paymentDate: '2026-09-10',
      createdBy: 'u1',
      receiptNumber: 'REC-001',
      isCancelled: false,
      createdAt: '2026-09-10T00:00:00Z',
    },
  ];

  const balanceA = calculateStudentBalances(mockStudent, '7EB', mockFees, partialPayment, '2026-10-20');
  assert(balanceA.totalDueUSD === 20000, 'Total dû USD doit être 200.00 $ (20000 cents)');
  assert(balanceA.totalPaidUSD === 3000, 'Total payé USD doit être 30.00 $');
  assert(balanceA.balanceUSD === 17000, 'Solde restant USD doit être 170.00 $');
  assert(balanceA.totalDueCDF === 50000, 'Total dû CDF doit être 50 000 CDF');
  assert(balanceA.balanceCDF === 50000, 'Solde CDF intact');
  assert(balanceA.status === 'EN_RETARD', 'Statut doit être EN_RETARD car la date du 15-10 est échue');

  // Cas B : Annulation d'un paiement
  // Si le paiement de 30$ est annulé, le solde payé doit retomber à 0 !
  const cancelledPayment: Payment[] = [
    {
      ...partialPayment[0],
      isCancelled: true,
      cancelledAt: '2026-09-12T00:00:00Z',
      cancelReason: 'Erreur de saisie',
    },
  ];

  const balanceB = calculateStudentBalances(mockStudent, '7EB', mockFees, cancelledPayment, '2026-10-20');
  assert(balanceB.totalPaidUSD === 0, 'Le montant payé doit être 0 car le paiement est annulé');
  assert(balanceB.balanceUSD === 20000, 'Le solde restant USD doit être égal au total dû');

  // Cas C : Règlement complet
  const fullPayments: Payment[] = [
    {
      id: 'p1',
      schoolId: 'school-1',
      studentId: 'stud-test-1',
      amount: 20000, // 200$
      currency: 'USD',
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: '2026-09-10',
      createdBy: 'u1',
      receiptNumber: 'REC-002',
      isCancelled: false,
      createdAt: '2026-09-10T00:00:00Z',
    },
    {
      id: 'p2',
      schoolId: 'school-1',
      studentId: 'stud-test-1',
      amount: 50000, // 50 000 CDF
      currency: 'CDF',
      paymentMethod: 'MOBILE_MONEY',
      paymentDate: '2026-09-10',
      createdBy: 'u1',
      receiptNumber: 'REC-003',
      isCancelled: false,
      createdAt: '2026-09-10T00:00:00Z',
    },
  ];

  const balanceC = calculateStudentBalances(mockStudent, '7EB', mockFees, fullPayments, '2026-10-20');
  assert(balanceC.balanceUSD === 0, 'Solde restant USD à 0');
  assert(balanceC.balanceCDF === 0, 'Solde restant CDF à 0');
  assert(balanceC.status === 'SOLDE', 'Statut doit être SOLDE');

  // 4. Test agrégation Tableau de bord
  const totals = calculateDashboardTotals(mockFees, [mockStudent], fullPayments);
  assert(totals.collectedUSD === 20000, 'Dashboard: USD encaissé correct');
  assert(totals.remainingUSD === 0, 'Dashboard: USD restant à 0');
  assert(totals.collectedCDF === 50000, 'Dashboard: CDF encaissé correct');
  assert(totals.remainingCDF === 0, 'Dashboard: CDF restant à 0');
  assert(totals.rateUSD === 100, 'Taux de recouvrement USD 100%');

  return {
    total: testCount,
    passed: testCount - failures.length,
    failures,
  };
}
