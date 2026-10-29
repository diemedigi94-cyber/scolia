'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { Student } from '@/types';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Plus,
  Download,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';

export default function StudentsPage() {
  const { classes, students, addStudent, addClass, importStudents } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'import' | 'classes'>('list');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  // Formulaire d'ajout élève individuel
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+243');
  const [matricule, setMatricule] = useState('');
  const [msgSuccess, setMsgSuccess] = useState('');

  // Formulaire d'ajout classe
  const [newClassName, setNewClassName] = useState('');

  // Import CSV
  const [csvContent, setCsvContent] = useState('');
  const [importSummary, setImportSummary] = useState('');

  const filteredStudents =
    selectedClassId === 'ALL'
      ? students
      : students.filter((s) => s.classId === selectedClassId);

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !parentPhone.trim()) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    const cls = classes.find((c) => c.id === classId);

    addStudent({
      classId,
      className: cls?.name,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      parentName: parentName.trim() || 'Parent',
      parentPhone: parentPhone.trim(),
      matricule: matricule.trim() || undefined,
      isActive: true,
    });

    setMsgSuccess(`Élève ${firstName} ${lastName} enregistré avec succès !`);
    setFirstName('');
    setLastName('');
    setMatricule('');
    setTimeout(() => {
      setMsgSuccess('');
      setActiveTab('list');
    }, 1500);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    addClass(newClassName.trim());
    setNewClassName('');
    alert('Classe ajoutée !');
  };

  // Parser CSV simple et robuste
  const handleParseAndImportCSV = () => {
    if (!csvContent.trim()) {
      alert('Veuillez coller le contenu du fichier CSV ou sélectionner un fichier.');
      return;
    }

    const lines = csvContent.trim().split(/\r?\n/);
    const newStudents: Omit<Student, 'id' | 'schoolId' | 'createdAt'>[] = [];
    let skipped = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Ignorer l'en-tête
      if (i === 0 && line.toLowerCase().includes('nom')) continue;

      // Séparateurs virgule ou point-virgule
      const parts = line.split(/[;,]/).map((p) => p.trim());
      if (parts.length >= 4) {
        const nom = parts[0] || '';
        const prenom = parts[1] || '';
        const nomClasse = parts[2] || '';
        const nomParent = parts[3] || 'Parent';
        let phone = parts[4] || '+243';
        const genre = (parts[5] || 'M').toUpperCase() === 'F' ? 'F' : 'M';

        // Nettoyage téléphone
        if (!phone.startsWith('+')) {
          phone = `+${phone}`;
        }

        // Trouver ou associer la classe
        let targetClass = classes.find((c) =>
          c.name.toLowerCase().includes(nomClasse.toLowerCase())
        );
        if (!targetClass && classes.length > 0) {
          targetClass = classes[0];
        }

        if (nom && prenom) {
          newStudents.push({
            classId: targetClass ? targetClass.id : 'class-def',
            className: targetClass ? targetClass.name : nomClasse,
            firstName: prenom,
            lastName: nom,
            gender: genre,
            parentName: nomParent,
            parentPhone: phone,
            isActive: true,
          });
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    if (newStudents.length > 0) {
      const count = importStudents(newStudents);
      setImportSummary(`✅ ${count} élèves importés avec succès ! (${skipped} lignes ignorées)`);
      setCsvContent('');
      setTimeout(() => {
        setActiveTab('list');
      }, 1500);
    } else {
      alert('Aucun élève valide détecté dans le texte. Vérifiez le format.');
    }
  };

  // Télécharger un modèle type CSV
  const downloadSampleCSV = () => {
    const header = 'Nom;Prénom;Classe;NomParent;TéléphoneWhatsApp;Genre\n';
    const sample =
      'Kalonji;Glodi;7EB;Papa Dieudonné Kalonji;+243812345601;M\n' +
      'Mwamba;Plamedi;7EB;Maman Sophie Mwamba;+243823456702;F\n' +
      'Ilunga;Benie;8EB;Papa Christian Ilunga;+243993456703;F\n';
    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modele_import_eleves_scolia.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Onglets de navigation supérieurs */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm gap-1">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Élèves ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'add'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Ajouter
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'import'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Import CSV
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'classes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Classes
        </button>
      </div>

      {/* 1. LISTE DES ÉLÈVES */}
      {activeTab === 'list' && (
        <div className="space-y-3">
          {/* Filtre par classe */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedClassId('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedClassId === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Toutes ({students.length})
            </button>
            {classes.map((c) => {
              const count = students.filter((s) => s.classId === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassId(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedClassId === c.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Liste des cartes élèves */}
          <div className="space-y-2">
            {filteredStudents.map((st) => (
              <div
                key={st.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">
                    {st.firstName} {st.lastName}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-medium text-blue-600">{st.className || 'Classe'}</span>
                    <span>•</span>
                    <span className="truncate">{st.parentName}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {st.parentPhone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. AJOUTER UN ÉLÈVE MANUELLEMENT */}
      {activeTab === 'add' && (
        <form onSubmit={handleCreateStudent} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Nouvel élève
          </h2>

          {msgSuccess && (
            <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{msgSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600">Nom de famille *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ex: Kalonji"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600">Prénom *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex: Glodi"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600">Classe *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600">Genre</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
              >
                <option value="M">Masculin (M)</option>
                <option value="F">Féminin (F)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600">Nom du Parent ou Tuteur *</label>
            <input
              type="text"
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Ex: Maman Sophie Mwamba"
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600">Numéro WhatsApp du Parent *</label>
            <input
              type="tel"
              required
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="+243..."
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all"
          >
            Enregistrer l’élève
          </button>
        </form>
      )}

      {/* 3. IMPORTATION GROUPÉE PAR CSV / EXCEL */}
      {activeTab === 'import' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Importer des élèves depuis Excel / CSV
            </h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Pour intégrer une classe complète rapidement, copiez-collez les lignes d’un tableau ou téléchargez notre modèle.
          </p>

          <button
            onClick={downloadSampleCSV}
            className="w-full py-2.5 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"
          >
            <Download className="w-4 h-4" />
            Télécharger le modèle type Excel / CSV
          </button>

          {importSummary && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-xl font-bold">
              {importSummary}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600">
              Collez vos données CSV ici (séparateur point-virgule ou virgule) :
            </label>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={"Nom;Prénom;Classe;NomParent;TéléphoneWhatsApp;Genre\nKalonji;Glodi;7EB;Papa Dieudonné;+243812345601;M"}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleParseAndImportCSV}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all"
          >
            Lancer l’importation immédiate
          </button>
        </div>
      )}

      {/* 4. GESTION DES CLASSES */}
      {activeTab === 'classes' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Classes de l’école</h2>

          <form onSubmit={handleCreateClass} className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: 2ème Maternelle, 3ème Littéraire..."
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
            />
            <button
              type="submit"
              className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold"
            >
              Ajouter
            </button>
          </form>

          <div className="divide-y divide-slate-100">
            {classes.map((c) => {
              const count = students.filter((s) => s.classId === c.id).length;
              return (
                <div key={c.id} className="py-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{c.name}</span>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {count} élèves
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
