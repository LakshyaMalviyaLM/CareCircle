import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useCare } from '../../context/CareContext';
import { KeyRound, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function RedeemInviteModal({ isOpen, onClose, initialCode = '' }) {
  const { acceptCareCircleInvite } = useCare();
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!inviteCode.trim()) {
      setError('Please enter a Care Circle invite code.');
      return;
    }

    setLoading(true);

    try {
      await acceptCareCircleInvite(inviteCode.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setInviteCode('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Redeem invite error:', err);
      setError(err.message || 'Invalid or expired invitation code.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInviteCode('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join a Care Circle"
      subtitle="Enter your family invitation code to access the shared patient profile"
      maxWidth="max-w-md"
    >
      {success ? (
        <div className="py-6 text-center space-y-3 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-[#142B4A]">Successfully Connected!</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You now have authorized access to view and coordinate care on this senior profile.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Care Circle Passcode *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. CC-8F92A1"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-3 py-2.5 text-base font-bold font-mono tracking-wider border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none uppercase"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Enter the 6-character code provided by the primary family caregiver or patient.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" size="md" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={loading}>
              {loading ? 'Verifying Code...' : 'Connect to Care Circle'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
