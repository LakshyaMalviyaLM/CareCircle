import React, { useState } from 'react';
import { useCare } from '../context/CareContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import InviteMemberModal from '../components/care-circle/InviteMemberModal';
import RedeemInviteModal from '../components/care-circle/RedeemInviteModal';
import EditMemberRoleModal from '../components/care-circle/EditMemberRoleModal';
import {
  Users2,
  UserPlus,
  KeyRound,
  Phone,
  Mail,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  Sparkles,
  Heart,
  Send,
  Clock,
  Pill,
  Activity,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Copy,
  Check,
  MoreVertical,
  Settings
} from 'lucide-react';

export default function CareCirclePage() {
  const {
    activePatient,
    careCircle,
    timeline,
    pendingInvitations,
    isRealtimeActive
  } = useCare();
  const { user, profile } = useAuth();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  // Daily handoff notes
  const [bulletinNotes, setBulletinNotes] = useState([
    {
      id: 1,
      author: 'Sarah Jenkins',
      role: 'Primary Caregiver',
      time: 'Today at 9:00 AM',
      content:
        'Mom ate a full bowl of oatmeal and blueberries. She was in great spirits and we did 15 minutes of seated knee extensions.'
    },
    {
      id: 2,
      author: 'Nurse Lisa Morales',
      role: 'Visiting Nurse',
      time: 'Yesterday at 4:30 PM',
      content:
        'Checked vitals and skin integrity. All looked healthy. Reminder that Dr. Miller appointment is scheduled for Thursday Nov 20.'
    }
  ]);
  const [newNote, setNewNote] = useState('');

  const handlePostNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setBulletinNotes((prev) => [
      {
        id: Date.now(),
        author: profile?.full_name || 'Caregiver',
        role: profile?.role || 'Primary Caregiver',
        time: 'Just now',
        content: newNote.trim()
      },
      ...prev
    ]);
    setNewNote('');
  };

  const handleCopyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const getTimelineIcon = (type, status) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-3.5 h-3.5 text-emerald-600" />;
      case 'vitals':
        return <Activity className="w-3.5 h-3.5 text-blue-600" />;
      case 'visit':
        return <Users2 className="w-3.5 h-3.5 text-teal-600" />;
      case 'emergency':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#13A89E] uppercase tracking-wider">
              Family & Clinical Care Network
            </span>
            <span className="text-xs text-slate-400">• {careCircle.length} authorized members</span>
            {isRealtimeActive && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Realtime Sync
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight mt-1">
            Family Care Circle
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connecting family caregivers, nurses, and doctors collaborating on {activePatient.name}’s daily wellbeing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-center">
          <Button
            variant="outline"
            size="md"
            icon={KeyRound}
            onClick={() => setIsRedeemOpen(true)}
            className="text-xs font-semibold"
          >
            Enter Invite Passcode
          </Button>

          <Button
            variant="accent"
            size="md"
            icon={UserPlus}
            onClick={() => setIsInviteOpen(true)}
            className="font-bold shadow-sm"
          >
            Invite Family / Nurse
          </Button>
        </div>
      </div>

      {/* Permission Legend & Security Architecture Banner */}
      <div className="p-4 rounded-2xl bg-[#142B4A] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#1E3E6B] shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <ShieldCheck className="w-5 h-5 text-[#13A89E]" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Database Row-Level Security Enforced</h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Access permissions are strictly enforced inside PostgreSQL via <code className="text-teal-300 font-mono">has_patient_access()</code>. Only authorized care circle members can access patient data.
            </p>
          </div>
        </div>

        {/* Roles Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-bold border border-white/20">
            Admin: Full Control
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-bold border border-white/20">
            Editor: Log Meds & Visits
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-bold border border-white/20">
            Viewer: Read-Only
          </span>
        </div>
      </div>

      {/* Pending Invitations Section (if any) */}
      {pendingInvitations && pendingInvitations.length > 0 && (
        <Card className="p-4 sm:p-5 bg-amber-50/50 border-amber-200">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-amber-950">Active Care Circle Invitations ({pendingInvitations.length})</h4>
            </div>
            <span className="text-[11px] text-amber-800 font-semibold">Share code with invited caregivers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id || inv.invite_code}
                className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-[#142B4A] block truncate">
                    {inv.invited_name || inv.invited_email}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {inv.relationship} • {inv.permission_role?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyInviteCode(inv.invite_code)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#142B4A] hover:bg-[#1E3E6B] text-white text-[11px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Copy Invite Code"
                >
                  {copiedCode === inv.invite_code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {inv.invite_code}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Care Circle Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {careCircle.map((member) => {
          const isAdmin = member.permissionRole === 'admin';
          const isEditor = member.permissionRole === 'editor';

          return (
            <Card
              key={member.id}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all shadow-2xs"
            >
              <div>
                {/* Member Top Info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-2xs"
                    />
                    {member.isEmergencyContact && (
                      <span
                        className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black border-2 border-white shadow-2xs"
                        title="Designated Emergency SOS Contact"
                      >
                        SOS
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <Badge
                        variant={isAdmin ? 'navy' : isEditor ? 'accent' : 'default'}
                        size="sm"
                      >
                        {member.permissionRole?.toUpperCase() || 'MEMBER'}
                      </Badge>
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {member.activeStatus || 'Active'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#142B4A] mt-1.5 truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {member.role || member.relationship}
                    </p>
                  </div>
                </div>

                {/* Contact info & Permissions summary */}
                <div className="mt-4 space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Relationship:</span>
                    <span className="font-semibold text-slate-800">{member.relationship || 'Caregiver'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Permissions:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[170px] text-right">
                      {member.permissions || 'Can Edit Schedules'}
                    </span>
                  </div>
                  {member.email && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[170px]">
                        {member.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${member.phone}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#142B4A] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call</span>
                </a>

                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#13A89E]" />
                    <span>Email</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    setSelectedMember(member);
                    setIsEditRoleOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Configure Member Permissions"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Real-time Activity Timeline & Daily Care Handoff Bulletin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Live Activity Audit Timeline */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EAF3FC] text-[#142B4A] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#142B4A]">Live Activity Timeline</h3>
                <p className="text-xs text-slate-500">Real-time caregiver actions & medication logging</p>
              </div>
            </div>
            <Badge variant="accent" size="sm">
              Audit Trail
            </Badge>
          </div>

          <div className="relative pl-6 space-y-5 mt-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.slice(0, 6).map((item) => (
              <div key={item.id} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center shrink-0 bg-white shadow-2xs">
                  {getTimelineIcon(item.iconType, item.status)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#142B4A]">{item.action}</span>
                    <span className="text-[11px] font-medium text-slate-400 shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                    <span className="font-semibold text-slate-700">{item.author}</span>
                    <span>•</span>
                    <span className="text-[#13A89E] font-medium">{item.authorRole || 'Caregiver'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Shared Family Care Bulletin & Daily Handoff Notes */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EAF3FC] text-[#142B4A] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#142B4A]">Daily Care Handoff Bulletin</h3>
                <p className="text-xs text-slate-500">Shared notes between family and visiting nurses</p>
              </div>
            </div>
            <Badge variant="primary" size="sm">
              Family Sync
            </Badge>
          </div>

          {/* Note Composer */}
          <form onSubmit={handlePostNote} className="mt-4 flex gap-2.5">
            <input
              type="text"
              placeholder="Post a handoff note (mood, fluid intake, walks, appetite)..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:bg-white focus:outline-none"
            />
            <Button
              variant="accent"
              size="sm"
              type="submit"
              icon={Send}
              className="shrink-0 text-xs font-bold"
            >
              Post Note
            </Button>
          </form>

          {/* Notes Feed */}
          <div className="space-y-3 mt-4 divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
            {bulletinNotes.map((note) => (
              <div key={note.id} className="pt-3 first:pt-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#142B4A]">{note.author}</span>
                    <span className="text-[10px] text-[#13A89E] font-semibold">({note.role})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{note.time}</span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      <RedeemInviteModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
      />

      <EditMemberRoleModal
        isOpen={isEditRoleOpen}
        onClose={() => {
          setIsEditRoleOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
      />
    </div>
  );
}
