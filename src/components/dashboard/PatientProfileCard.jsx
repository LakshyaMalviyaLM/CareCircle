import { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import {
  Phone,
  AlertCircle,
  ShieldCheck,
  Stethoscope,
  Edit,
  ClipboardList,
  FileCheck
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import EditHealthProfileModal from '../profile/EditHealthProfileModal';

export default function PatientProfileCard() {
  const { activePatient, updateHealthProfile } = useCare();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const defaultConditions = [
    'Essential Hypertension (Stage 2)',
    'Type 2 Diabetes Mellitus',
    'Osteoarthritis (Bilateral Knees)'
  ];

  const defaultAllergies = ['Penicillin', 'Sulfa Drugs'];

  const conditionsList = activePatient.existing_conditions?.length
    ? activePatient.existing_conditions
    : defaultConditions;

  const allergiesList = activePatient.allergies?.length
    ? activePatient.allergies
    : defaultAllergies;

  return (
    <>
      <Card className="p-6 relative overflow-hidden bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Patient Photo and Identity */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={activePatient.avatar}
                alt={activePatient.name}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-[#13A89E] shadow-sm"
              />
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#16A37B] border-2 border-white flex items-center justify-center text-white"
                title="Active & Monitored"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#142B4A] tracking-tight">
                  {activePatient.name}
                </h2>
                <Badge variant="primary" size="sm">
                  Age {activePatient.age}
                </Badge>
                <Badge variant="navy" size="sm">
                  Blood Group: {activePatient.bloodType || 'O+'}
                </Badge>
                {activePatient.advance_directives && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-[#E9A23B] border border-amber-200 flex items-center gap-1">
                    <FileCheck className="w-3 h-3" /> {activePatient.advance_directives}
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-[#718096] flex items-center gap-1.5 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#13A89E]" />
                Primary Focus: <span className="font-semibold text-[#172B4D]">{activePatient.primaryCondition}</span>
              </p>

              {/* Conditions & Allergies Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Allergies Alert */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[#DC5555] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Allergies:
                  </span>
                  {allergiesList.map((allg, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-[#DC5555] border border-rose-200"
                    >
                      {allg}
                    </span>
                  ))}
                </div>

                <span className="text-slate-300 hidden sm:inline">•</span>

                {/* Chronic Conditions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-medium text-[#718096] flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5 text-[#13A89E]" /> Conditions:
                  </span>
                  {conditionsList.slice(0, 2).map((cond, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F6F8FC] text-[#172B4D] border border-slate-200"
                    >
                      {cond}
                    </span>
                  ))}
                  {conditionsList.length > 2 && (
                    <span className="text-[10px] text-[#718096] font-semibold">
                      +{conditionsList.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Vitals Snapshot */}
          <div className="w-full md:w-auto grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F6F8FC] p-3.5 rounded-xl border border-slate-200/80">
            <div className="p-2">
              <span className="text-[10px] font-bold text-[#718096] block uppercase tracking-wider">Blood Pressure</span>
              <span className="text-base font-extrabold text-[#142B4A]">
                {activePatient.vitals?.bloodPressure || '124/82 mmHg'}
              </span>
              <span className="text-[10px] text-[#16A37B] font-semibold block">Target range</span>
            </div>
            <div className="p-2 border-l border-slate-200">
              <span className="text-[10px] font-bold text-[#718096] block uppercase tracking-wider">Heart Rate</span>
              <span className="text-base font-extrabold text-[#142B4A]">
                {activePatient.vitals?.heartRate || '72 bpm'}
              </span>
              <span className="text-[10px] text-[#718096] font-medium block">Resting pulse</span>
            </div>
            <div className="p-2 border-l border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-[#718096] block uppercase tracking-wider">Blood Glucose</span>
              <span className="text-base font-extrabold text-[#142B4A]">
                {activePatient.vitals?.bloodGlucose || '108 mg/dL'}
              </span>
              <span className="text-[10px] text-[#16A37B] font-semibold block">Fasting target</span>
            </div>
          </div>
        </div>

        {/* Meta Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-[#718096]">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-[#13A89E]" />
              <span>Primary Doctor:</span>
              <strong className="text-[#172B4D]">{activePatient.primaryDoctor?.name || 'Dr. Robert Miller, MD'}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#16A37B]" />
              <span>Emergency Contact:</span>
              <strong className="text-[#172B4D]">
                {activePatient.emergencyContact?.name || 'Sarah Jenkins'} ({activePatient.emergencyContact?.relationship?.split('&')[0] || 'Daughter'})
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-xs font-semibold text-[#0F8C83] hover:bg-teal-100 transition-colors cursor-pointer"
              title="Edit Personal Health Profile"
            >
              <Edit className="w-3.5 h-3.5 text-[#13A89E]" /> Edit Profile
            </button>

            <a
              href={`tel:${activePatient.emergencyContact?.phone || '(555) 782-9012'}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#172B4D] hover:bg-slate-50 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#16A37B]" /> Call Contact
            </a>
          </div>
        </div>
      </Card>

      {/* Edit Health Profile Modal */}
      <EditHealthProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        patientId={activePatient.id}
        initialData={activePatient}
        onProfileUpdated={(updated) => {
          updateHealthProfile(updated);
        }}
      />
    </>
  );
}
