import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useCare } from '../../context/CareContext';

export default function AddMemberModal({ isOpen, onClose }) {
  const { addCareMember } = useCare();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: 'Family',
    phone: '',
    email: '',
    relationship: '',
    permissions: 'Can Edit Schedules',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    isEmergencyContact: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    addCareMember(formData);
    onClose();
    setFormData({
      name: '',
      role: '',
      category: 'Family',
      phone: '',
      email: '',
      relationship: '',
      permissions: 'Can Edit Schedules',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      isEmergencyContact: false
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Care Circle Member"
      subtitle="Grant access to family caregivers, visiting nurses, or physicians"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. David Vance, Nurse Lisa"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Son, Home Nurse, Physical Therapist"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white"
            >
              <option value="Family">Family Member</option>
              <option value="Healthcare">Nurse / Home Health</option>
              <option value="Physician">Doctor / Specialist</option>
              <option value="Support">Therapist / Support Aide</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Access Level</label>
            <select
              value={formData.permissions}
              onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white"
            >
              <option value="Full Admin Access">Full Admin (Manage all records)</option>
              <option value="Can Edit Schedules">Can Edit Schedules & Log Meds</option>
              <option value="Log Vitals & Clinical Notes">Log Vitals & Clinical Notes</option>
              <option value="View Medical Logs">View Only (Read-only)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              placeholder="member@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
            />
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#142B4A] block">Add to Emergency Contact List?</span>
            <span className="text-[11px] text-slate-600">Will receive immediate SMS broadcast during SOS</span>
          </div>
          <input
            type="checkbox"
            checked={formData.isEmergencyContact}
            onChange={(e) => setFormData({ ...formData, isEmergencyContact: e.target.checked })}
            className="w-4 h-4 text-[#13A89E] rounded focus:ring-[#13A89E]"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit">
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
