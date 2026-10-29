'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  School,
  UserProfile,
  Role,
  ClassItem,
  Student,
  FeeItem,
  Payment,
  AuditLog,
  Currency,
  PaymentMethod,
} from '@/types';
import {
  DEMO_SCHOOL,
  DEMO_USERS,
  DEMO_CLASSES,
  DEMO_STUDENTS,
  DEMO_FEE_ITEMS,
  DEMO_PAYMENTS,
  DEMO_AUDIT_LOGS,
} from './mock-data';

interface AppContextType {
  currentSchool: School;
  currentUser: UserProfile | null;
  currentRole: Role;
  classes: ClassItem[];
  students: Student[];
  feeItems: FeeItem[];
  payments: Payment[];
  auditLogs: AuditLog[];
  // Actions
  loginAs: (role: Role) => void;
  logout: () => void;
  createSchool: (data: { name: string; city: string; phone?: string; currencyDefault: Currency }) => void;
  addClass: (name: string, section?: string) => void;
  addStudent: (data: Omit<Student, 'id' | 'schoolId' | 'createdAt'>) => void;
  importStudents: (data: Omit<Student, 'id' | 'schoolId' | 'createdAt'>[]) => number;
  addFeeItem: (data: Omit<FeeItem, 'id' | 'schoolId' | 'createdAt'>) => void;
  recordPayment: (data: {
    studentId: string;
    feeItemId?: string;
    amount: number;
    currency: Currency;
    paymentMethod: PaymentMethod;
    reference?: string;
    paymentDate: string;
  }) => Payment;
  cancelPayment: (paymentId: string, reason: string) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'scolia_state_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentSchool, setCurrentSchool] = useState<School>(DEMO_SCHOOL);
  const [currentRole, setCurrentRole] = useState<Role>('director');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEMO_USERS.directeur.profile);
  const [classes, setClasses] = useState<ClassItem[]>(DEMO_CLASSES);
  const [students, setStudents] = useState<Student[]>(DEMO_STUDENTS);
  const [feeItems, setFeeItems] = useState<FeeItem[]>(DEMO_FEE_ITEMS);
  const [payments, setPayments] = useState<Payment[]>(DEMO_PAYMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DEMO_AUDIT_LOGS);

  // Charger depuis le localStorage au démarrage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentSchool) setCurrentSchool(parsed.currentSchool);
        if (parsed.currentRole) setCurrentRole(parsed.currentRole);
        if (parsed.currentUser) setCurrentUser(parsed.currentUser);
        if (parsed.classes) setClasses(parsed.classes);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.feeItems) setFeeItems(parsed.feeItems);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch {
      // Utilise les données par défaut si erreur de parsing
    }
  }, []);

  // Sauvegarder dans le localStorage à chaque modification
  useEffect(() => {
    try {
      const state = {
        currentSchool,
        currentRole,
        currentUser,
        classes,
        students,
        feeItems,
        payments,
        auditLogs,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignorer si stockage saturé
    }
  }, [currentSchool, currentRole, currentUser, classes, students, feeItems, payments, auditLogs]);

  const addAudit = (action: string, entityType: string, entityId: string, details: string) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      schoolId: currentSchool.id,
      userId: currentUser?.id || 'anonyme',
      userName: currentUser?.fullName || 'Utilisateur',
      userRole: currentRole,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const loginAs = (role: Role) => {
    setCurrentRole(role);
    if (role === 'director') {
      setCurrentUser(DEMO_USERS.directeur.profile);
    } else {
      setCurrentUser(DEMO_USERS.caissier.profile);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createSchool = (data: { name: string; city: string; phone?: string; currencyDefault: Currency }) => {
    const newSchool: School = {
      id: `school-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      city: data.city || 'Kinshasa',
      phone: data.phone,
      currencyDefault: data.currencyDefault,
      allowMultiCurrency: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentSchool(newSchool);
    setCurrentRole('director');
    setCurrentUser({
      id: `user-dir-${Date.now()}`,
      fullName: 'Directeur Fondateur',
      email: 'directeur@ecole.cd',
      phone: data.phone,
    });
    addAudit('CREATION_ECOLE', 'school', newSchool.id, `Création de l'école ${newSchool.name}`);
  };

  const addClass = (name: string, section?: string) => {
    const newClass: ClassItem = {
      id: `class-${Date.now()}`,
      schoolId: currentSchool.id,
      academicYearId: 'year-2026-2027',
      name,
      section,
    };
    setClasses((prev) => [...prev, newClass]);
    addAudit('CREATION_CLASSE', 'class', newClass.id, `Création de la classe : ${name}`);
  };

  const addStudent = (data: Omit<Student, 'id' | 'schoolId' | 'createdAt'>) => {
    const newStudent: Student = {
      ...data,
      id: `stud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId: currentSchool.id,
      createdAt: new Date().toISOString(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    addAudit('INSCRIPTION_ELEVE', 'student', newStudent.id, `Inscription de ${newStudent.firstName} ${newStudent.lastName}`);
  };

  const importStudents = (list: Omit<Student, 'id' | 'schoolId' | 'createdAt'>[]): number => {
    const now = new Date().toISOString();
    const newStudents: Student[] = list.map((item, idx) => ({
      ...item,
      id: `stud-import-${Date.now()}-${idx}`,
      schoolId: currentSchool.id,
      createdAt: now,
    }));
    setStudents((prev) => [...newStudents, ...prev]);
    addAudit(
      'IMPORT_ELEVES',
      'student',
      currentSchool.id,
      `Import groupé de ${newStudents.length} élèves depuis un fichier`
    );
    return newStudents.length;
  };

  const addFeeItem = (data: Omit<FeeItem, 'id' | 'schoolId' | 'createdAt'>) => {
    const newFee: FeeItem = {
      ...data,
      id: `fee-${Date.now()}`,
      schoolId: currentSchool.id,
      createdAt: new Date().toISOString(),
    };
    setFeeItems((prev) => [...prev, newFee]);
    addAudit('CREATION_FRAIS', 'fee_item', newFee.id, `Création du frais : ${newFee.name}`);
  };

  const recordPayment = (data: {
    studentId: string;
    feeItemId?: string;
    amount: number;
    currency: Currency;
    paymentMethod: PaymentMethod;
    reference?: string;
    paymentDate: string;
  }): Payment => {
    const student = students.find((s) => s.id === data.studentId);
    const fee = feeItems.find((f) => f.id === data.feeItemId);
    const receiptNum = `REC-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      schoolId: currentSchool.id,
      studentId: data.studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'Élève',
      className: student?.className,
      feeItemId: data.feeItemId,
      feeItemName: fee?.name,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      paymentDate: data.paymentDate,
      createdBy: currentUser?.id || 'caisse',
      createdByName: currentUser?.fullName || 'Caissier',
      receiptNumber: receiptNum,
      isCancelled: false,
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);
    addAudit(
      'ENCAISSEMENT_PAIEMENT',
      'payment',
      newPayment.id,
      `Reçu ${receiptNum} : Encaissement de ${data.amount} (${data.currency}) par ${newPayment.createdByName} pour ${newPayment.studentName}`
    );

    return newPayment;
  };

  const cancelPayment = (paymentId: string, reason: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            isCancelled: true,
            cancelledAt: new Date().toISOString(),
            cancelledBy: currentUser?.id,
            cancelReason: reason,
          };
        }
        return p;
      })
    );

    const target = payments.find((p) => p.id === paymentId);
    addAudit(
      'ANNULATION_PAIEMENT',
      'payment',
      paymentId,
      `Annulation du reçu ${target?.receiptNumber} par ${currentUser?.fullName}. Motif: "${reason}"`
    );
  };

  const resetDemoData = () => {
    setCurrentSchool(DEMO_SCHOOL);
    setCurrentRole('director');
    setCurrentUser(DEMO_USERS.directeur.profile);
    setClasses(DEMO_CLASSES);
    setStudents(DEMO_STUDENTS);
    setFeeItems(DEMO_FEE_ITEMS);
    setPayments(DEMO_PAYMENTS);
    setAuditLogs(DEMO_AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        currentSchool,
        currentUser,
        currentRole,
        classes,
        students,
        feeItems,
        payments,
        auditLogs,
        loginAs,
        logout,
        createSchool,
        addClass,
        addStudent,
        importStudents,
        addFeeItem,
        recordPayment,
        cancelPayment,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé dans un AppProvider');
  }
  return context;
}
