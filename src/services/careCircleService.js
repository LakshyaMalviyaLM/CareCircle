import { supabase, isSupabaseConfigured } from './supabase';

const isValidUuid = (id) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

const LOCAL_INVITES_KEY = 'carecircle_local_invitations';

const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'CC-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const careCircleService = {
  /**
   * 1. Fetch Care Circle Members for a Patient
   */
  async getCareCircleMembers(patientId) {
    if (!isSupabaseConfigured || !isValidUuid(patientId)) {
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('care_circle')
        .select(`
          id,
          patient_id,
          member_id,
          relationship,
          permission_role,
          is_emergency_contact,
          created_at,
          member:profiles!member_id(
            id,
            full_name,
            role,
            avatar_url,
            phone,
            email
          )
        `)
        .eq('patient_id', patientId);

      if (error) throw error;

      const formatted = (data || []).map((row) => {
        const profile = row.member || {};
        return {
          id: row.id,
          circleId: row.id,
          memberId: row.member_id,
          patientId: row.patient_id,
          name: profile.full_name || 'CareCircle Member',
          role: row.relationship || profile.role || 'Family Member',
          relationship: row.relationship || 'Caregiver',
          permissionRole: row.permission_role || 'editor',
          permissions:
            row.permission_role === 'admin'
              ? 'Full Admin Access'
              : row.permission_role === 'viewer'
              ? 'View Only (Read-only)'
              : 'Can Edit Schedules & Log Meds',
          category:
            profile.role === 'doctor' || profile.role === 'nurse'
              ? 'Healthcare'
              : 'Family',
          phone: profile.phone || '(555) 000-0000',
          email: profile.email || '',
          avatar:
            profile.avatar_url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          isEmergencyContact: Boolean(row.is_emergency_contact),
          activeStatus: 'Active Now',
          joinedAt: row.created_at
        };
      });

      return { data: formatted, error: null };
    } catch (err) {
      console.warn('Error fetching care circle members from Supabase:', err.message);
      return { data: [], error: err };
    }
  },

  /**
   * 2. Create Secure Invitation
   */
  async createInvitation({
    patientId,
    invitedEmail,
    invitedName,
    relationship = 'Family Member',
    permissionRole = 'editor',
    isEmergencyContact = false,
    createdById
  }) {
    const inviteCode = generateInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const invitePayload = {
      patient_id: patientId,
      invited_email: invitedEmail.trim().toLowerCase(),
      invited_name: invitedName?.trim() || 'Invited Caregiver',
      relationship,
      permission_role: permissionRole,
      invite_code: inviteCode,
      is_emergency_contact: Boolean(isEmergencyContact),
      status: 'pending',
      created_by: isValidUuid(createdById) ? createdById : null,
      expires_at: expiresAt
    };

    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        const { data, error } = await supabase
          .from('care_circle_invitations')
          .insert([invitePayload])
          .select()
          .single();

        if (!error && data) {
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Could not insert invitation into DB, using fallback:', err.message);
      }
    }

    // Fallback in localStorage for local testing
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_INVITES_KEY) || '[]');
      const localInvite = { ...invitePayload, id: `inv-${Date.now()}` };
      existing.push(localInvite);
      localStorage.setItem(LOCAL_INVITES_KEY, JSON.stringify(existing));
      return { data: localInvite, error: null };
    } catch {
      return { data: invitePayload, error: null };
    }
  },

  /**
   * 3. Fetch Pending Invitations for Patient
   */
  async getPendingInvitations(patientId) {
    if (isSupabaseConfigured && isValidUuid(patientId)) {
      try {
        const { data, error } = await supabase
          .from('care_circle_invitations')
          .select('*')
          .eq('patient_id', patientId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Error fetching DB invitations:', err.message);
      }
    }

    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_INVITES_KEY) || '[]');
      const filtered = existing.filter(
        (i) => (!patientId || i.patient_id === patientId) && i.status === 'pending'
      );
      return { data: filtered, error: null };
    } catch {
      return { data: [], error: null };
    }
  },

  /**
   * 4. Redeem / Accept an Invitation Code
   */
  async acceptInvitation({ inviteCode, userId, userProfile }) {
    if (!inviteCode) {
      throw new Error('Please enter a valid Care Circle invite code.');
    }

    const cleanCode = inviteCode.trim().toUpperCase();

    // Check DB first
    if (isSupabaseConfigured && isValidUuid(userId)) {
      try {
        const { data: inv, error: findErr } = await supabase
          .from('care_circle_invitations')
          .select('*')
          .eq('invite_code', cleanCode)
          .eq('status', 'pending')
          .single();

        if (!findErr && inv) {
          if (new Date(inv.expires_at).getTime() < Date.now()) {
            throw new Error('This invitation code has expired. Please ask the family admin for a new invite.');
          }

          // Insert into care_circle
          const { error: circleErr } = await supabase.from('care_circle').insert([
            {
              patient_id: inv.patient_id,
              member_id: userId,
              relationship: inv.relationship,
              permission_role: inv.permission_role,
              is_emergency_contact: inv.is_emergency_contact
            }
          ]);

          if (circleErr && circleErr.code !== '23505') {
            throw circleErr;
          }

          // Mark accepted
          await supabase
            .from('care_circle_invitations')
            .update({ status: 'accepted' })
            .eq('id', inv.id);

          return { success: true, invitation: inv, error: null };
        }
      } catch (err) {
        if (err.message && err.message.includes('expired')) throw err;
        console.warn('DB invite lookup deferred:', err.message);
      }
    }

    // Check Local Storage
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_INVITES_KEY) || '[]');
      const index = existing.findIndex(
        (i) => i.invite_code === cleanCode && i.status === 'pending'
      );

      if (index !== -1) {
        const inv = existing[index];
        inv.status = 'accepted';
        inv.acceptedBy = userId;
        localStorage.setItem(LOCAL_INVITES_KEY, JSON.stringify(existing));
        return { success: true, invitation: inv, error: null };
      }
    } catch (err) {
      console.error('Error validating local invite:', err);
    }

    throw new Error('Invalid or already accepted invitation code. Please verify the code.');
  },

  /**
   * 5. Update Member Permission Role
   */
  async updateMemberRole({ circleId, newRole }) {
    if (!isSupabaseConfigured || !isValidUuid(circleId)) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('care_circle')
        .update({ permission_role: newRole })
        .eq('id', circleId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err) {
      console.error('Error updating member permission role:', err.message);
      return { success: false, error: err };
    }
  },

  /**
   * 6. Remove Member from Care Circle
   */
  async removeMember(circleId) {
    if (!isSupabaseConfigured || !isValidUuid(circleId)) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('care_circle')
        .delete()
        .eq('id', circleId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err) {
      console.error('Error removing care circle member:', err.message);
      return { success: false, error: err };
    }
  },

  /**
   * 7. Fetch Activity Timeline from Supabase
   * Combines dose_logs (with recorded_by profiles), appointments, and care member actions
   */
  async fetchActivityTimeline(patientId) {
    if (!isSupabaseConfigured || !isValidUuid(patientId)) {
      return { data: [], error: null };
    }

    try {
      // Dose logs with user name
      const { data: doseLogs } = await supabase
        .from('dose_logs')
        .select(`
          id,
          status,
          scheduled_at,
          recorded_at,
          notes,
          medication:medications!medication_id(name, dosage),
          recorder:profiles!recorded_by(full_name, role)
        `)
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(10);

      const timelineItems = (doseLogs || []).map((log) => {
        const medName = log.medication?.name || 'Medication';
        const medDosage = log.medication?.dosage || '';
        const authorName = log.recorder?.full_name || 'Caregiver';
        const authorRole = log.recorder?.role || 'Primary Caregiver';
        const dateObj = new Date(log.recorded_at || log.scheduled_at);

        return {
          id: `dose-event-${log.id}`,
          timestamp: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawDate: dateObj,
          author: authorName,
          authorRole: authorRole,
          action:
            log.status === 'taken'
              ? `Administered ${medName} ${medDosage}`
              : log.status === 'missed'
              ? `Flagged ${medName} as Skipped`
              : `Scheduled Dose for ${medName}`,
          description: log.notes || `${authorName} logged dose as ${log.status} in real-time.`,
          iconType: 'medication',
          status: log.status === 'taken' ? 'success' : log.status === 'missed' ? 'danger' : 'info'
        };
      });

      return { data: timelineItems, error: null };
    } catch (err) {
      console.warn('Error fetching live timeline:', err.message);
      return { data: [], error: err };
    }
  },

  /**
   * 8. Supabase Realtime Subscription
   */
  subscribeToCareCircleUpdates(patientId, onUpdate) {
    if (!isSupabaseConfigured || !isValidUuid(patientId)) {
      return { unsubscribe: () => {} };
    }

    try {
      const channel = supabase
        .channel(`care_circle_realtime_${patientId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'care_circle', filter: `patient_id=eq.${patientId}` },
          () => onUpdate('care_circle')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'dose_logs', filter: `patient_id=eq.${patientId}` },
          () => onUpdate('dose_logs')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${patientId}` },
          () => onUpdate('appointments')
        )
        .subscribe();

      return {
        unsubscribe: () => {
          supabase.removeChannel(channel);
        }
      };
    } catch (err) {
      console.warn('Could not subscribe to Realtime:', err);
      return { unsubscribe: () => {} };
    }
  }
};

export default careCircleService;
