export type Role = 'director' | 'cashier';

export type Currency = 'USD' | 'CDF';

export type PaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER';

export interface School {
  id: string;
  name: string;
  slug: string;
  city: string;
  phone?: string;
  currencyDefault: Currency;
  allowMultiCurrency: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone?: string;
  email: string;
}

export interface Membership {
  id: string;
  schoolId: string;
  userId: string;
  role: Role;
  createdAt: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string; // e.g. "2026-2027"
  isCurrent: boolean;
}

export interface ClassItem {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string; // e.g. "7ème EB", "3ème Maternelle", "4ème Scientifique"
  section?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  className?: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  parentName: string;
  parentPhone: string; // WhatsApp format "+243..."
  matricule?: string;
  isActive: boolean;
  createdAt: string;
}

export interface FeeItem {
  id: string;
  schoolId: string;
  classId: string;
  name: string; // e.g. "Inscription", "1ère Tranche", "2ème Tranche"
  amount: number; // In smallest unit: cents for USD (e.g. 5000 = $50.00), units for CDF (e.g. 125000)
  currency: Currency;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Payment {
  id: string;
  schoolId: string;
  studentId: string;
  studentName?: string;
  className?: string;
  feeItemId?: string;
  feeItemName?: string;
  amount: number; // Smallest unit: cents for USD, units for CDF
  currency: Currency;
  paymentMethod: PaymentMethod;
  reference?: string; // Bordereau, Transaction M-Pesa, etc.
  paymentDate: string; // YYYY-MM-DD
  createdBy: string;
  createdByName?: string;
  receiptNumber: string;
  isCancelled: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  schoolId: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  createdAt: string;
}

export interface StudentBalanceSummary {
  student: Student;
  className: string;
  totalDueUSD: number;
  totalPaidUSD: number;
  balanceUSD: number;
  totalDueCDF: number;
  totalPaidCDF: number;
  balanceCDF: number;
  status: 'SOLDE' | 'PARTIEL' | 'EN_RETARD';
  daysOverdue: number;
}
