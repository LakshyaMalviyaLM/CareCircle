import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useCare } from '../../context/CareContext';
import { Shield, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

export default function EditMemberRoleModal({ isOpen, onClose, member }) {
  const { updateCareMemberRole, removeCareMember } = useCare();

  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setRole(member.permissionRole || 'editor');
      setError('');
    }
  }, [member]);

  if (!member) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateCareMemberRole(member.circleId || member.id, role);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update role.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm(`Are you sure you want to remove ${member.name} from the Care Circle? They will lose access to this profile.`)) {
      setLoading(true);
      try {
        await removeCareMember(member.circleId || member.id);
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to remove member.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Caregiver Permissions"
      subtitle={`Configure authorization level for ${member.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
          />
          <div>
            <h4 className="text-sm font-bold text-[#142B4A]">{member.name}</h4>
            <p className="text-xs text-slate-500">{member.role} • {member.relationship}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            Permission Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white font-medium"
          >
            <option value="admin">Admin (Full Management & Prescriptions)</option>
            <option value="editor">Editor (Log Doses, Schedule Visits, Post Notes)</option>
            <option value="viewer">Viewer (Read-Only Adherence & Visits)</option>
          </select>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-600 space-y-1">
          <span className="font-bold text-[#142B4A] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#13A89E]" /> Database RLS Policy
          </span>
          <p className="text-[11px] leading-relaxed">
            Role changes are enforced directly in PostgreSQL via the <code className="text-[#142B4A] font-bold">has_patient_access</code> security function.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove Access
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Update Role'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
