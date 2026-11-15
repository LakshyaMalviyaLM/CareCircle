import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useCare } from '../../context/CareContext';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  User,
  Shield,
  Phone,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Link as LinkIcon,
  HeartHandshake
} from 'lucide-react';

export default function InviteMemberModal({ isOpen, onClose }) {
  const { inviteCareMember, activePatient } = useCare();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    relationship: 'Family Member',
    permissionRole: 'editor',
    isEmergencyContact: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const invite = await inviteCareMember({
        ...formData,
        patientId: activePatient.id || user?.id,
        createdById: user?.id
      });

      setGeneratedInvite(invite);
    } catch (err) {
      console.error('Failed to create invitation:', err);
      setError(err.message || 'Could not generate invitation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedInvite?.invite_code) return;
    navigator.clipboard.writeText(generatedInvite.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!generatedInvite?.invite_code) return;
    const inviteUrl = `${window.location.origin}/#/care-circle?code=${generatedInvite.invite_code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClose = () => {
    setGeneratedInvite(null);
    setFormData({
      name: '',
      email: '',
      relationship: 'Family Member',
      permissionRole: 'editor',
      isEmergencyContact: false
    });
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Care Circle Member"
      subtitle={`Grant authorized caregiver access to ${activePatient.name}'s medical profile`}
      maxWidth="max-w-xl"
    >
      {generatedInvite ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-extrabold text-emerald-950">
              Invitation Successfully Created!
            </h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Share this secure invitation code or link with{' '}
              <strong>{formData.name || formData.email}</strong>. Once they redeem it, they will be granted{' '}
              <strong>{formData.permissionRole.toUpperCase()}</strong> permissions.
            </p>
          </div>

          {/* Invite Code Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Secure Care Circle Passcode
            </span>
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <code className="text-xl font-black text-[#142B4A] tracking-widest font-mono">
                {generatedInvite.invite_code}
              </code>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-[#142B4A] hover:bg-[#1E3E6B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Direct Join Link */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-slate-500 text-[11px]">Or copy direct redemption link:</span>
              <button
                onClick={handleCopyLink}
                className="text-xs font-bold text-[#13A89E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                {copiedLink ? 'Link Copied!' : 'Copy Direct Link'}
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="md" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Caregiver Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. David Vance, Nurse Lisa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="member@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Relationship & Permission Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Relationship to Senior *
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white"
              >
                <option value="Daughter">Daughter</option>
                <option value="Son">Son</option>
                <option value="Spouse">Spouse / Partner</option>
                <option value="Primary Caregiver">Primary Caregiver</option>
                <option value="Visiting Nurse">Visiting Nurse (Home Health)</option>
                <option value="Physician">Attending Physician / Doctor</option>
                <option value="Physical Therapist">Physical Therapist</option>
                <option value="Neighbor / Friend">Neighbor / Friend</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Permission Role *
              </label>
              <select
                value={formData.permissionRole}
                onChange={(e) => setFormData({ ...formData, permissionRole: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-white"
              >
                <option value="editor">Editor (Log Doses, Schedule Visits, Post Notes)</option>
                <option value="admin">Admin (Full Control: Prescriptions, Team, Info)</option>
                <option value="viewer">Viewer (Read-Only Adherence & Visits)</option>
              </select>
            </div>
          </div>

          {/* Permission explanation banner */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-[#142B4A] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#13A89E]" />
              Role Authorization Policy
            </span>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {formData.permissionRole === 'admin'
                ? 'Admin: Has full write access. Can invite and remove members, update patient clinical vitals, prescriptions, and medical data.'
                : formData.permissionRole === 'editor'
                ? 'Editor: Can record daily doses as taken, schedule clinic appointments, and post daily care handoff notes.'
                : 'Viewer: Read-only access. Can view the schedule and medication status, but cannot modify records.'}
            </p>
          </div>

          {/* Emergency SOS Contact */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                Primary Emergency SOS Contact?
              </span>
              <span className="text-[11px] text-amber-700">
                Receives high-priority alerts when emergency SOS beacon is triggered
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.isEmergencyContact}
              onChange={(e) => setFormData({ ...formData, isEmergencyContact: e.target.checked })}
              className="w-5 h-5 text-[#13A89E] rounded focus:ring-[#13A89E] cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" size="md" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="accent" size="md" type="submit" disabled={loading}>
              {loading ? 'Creating Invitation...' : 'Generate Secure Invitation'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
