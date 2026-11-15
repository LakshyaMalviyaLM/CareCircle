import { useCare } from '../context/CareContext';

export function useMedications() {
  const {
    medications,
    toggleMedicationStatus,
    addMedication,
    updateMedication,
    deleteMedication
  } = useCare();

  const takenMeds = medications.filter(m => m.status === 'taken');
  const pendingMeds = medications.filter(m => m.status === 'pending');
  const missedMeds = medications.filter(m => m.status === 'missed');
  const refillsNeeded = medications.filter(m => m.needsRefill);

  return {
    medications,
    takenMeds,
    pendingMeds,
    missedMeds,
    refillsNeeded,
    toggleMedicationStatus,
    addMedication,
    updateMedication,
    deleteMedication
  };
}
