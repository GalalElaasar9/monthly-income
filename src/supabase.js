import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = "https://kajsbaujzujcgvruvomw.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_lf3S4lzwq9zzod3mvnqkQA_c2oeYf4e";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper to fetch user data
export const fetchUserDataFromSupabase = async (userId) => {
  const targetId = (userId || 'galalelaaser101@gmail.com').toLowerCase().trim();
  try {
    // 1. Try fetching with exact userId
    let { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('id', targetId)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch error for id:', targetId, error);
    }

    // 2. Fallback: if not found by targetId, check if any single user record exists in the table
    if (!data) {
      const { data: allRows, error: allErr } = await supabase
        .from('user_data')
        .select('*')
        .limit(1);

      if (!allErr && allRows && allRows.length > 0) {
        data = allRows[0];
      }
    }

    if (data) {
      return {
        id: data.id,
        email: data.email,
        incomes: Array.isArray(data.incomes) ? data.incomes : [],
        students: Array.isArray(data.students) ? data.students : [],
        withdrawals: Array.isArray(data.withdrawals) ? data.withdrawals : [],
        jobs: Array.isArray(data.jobs) && data.jobs.length > 0 ? data.jobs : null,
        monthlyGoal: data.monthly_goal ? Number(data.monthly_goal) : 0,
        currency: data.currency || 'EGP'
      };
    }
    return null;
  } catch (err) {
    console.error('Supabase fetch exception:', err);
    return null;
  }
};

// Helper to upsert user data
export const syncUserDataToSupabase = async (userId, dataPayload, email = '') => {
  const targetId = (userId || 'galalelaaser101@gmail.com').toLowerCase().trim();
  try {
    const updateObj = {
      id: targetId,
      updated_at: new Date().toISOString()
    };
    if (email) updateObj.email = email;
    if (dataPayload.incomes !== undefined) updateObj.incomes = dataPayload.incomes;
    if (dataPayload.students !== undefined) updateObj.students = dataPayload.students;
    if (dataPayload.withdrawals !== undefined) updateObj.withdrawals = dataPayload.withdrawals;
    if (dataPayload.jobs !== undefined) updateObj.jobs = dataPayload.jobs;
    if (dataPayload.monthlyGoal !== undefined) updateObj.monthly_goal = dataPayload.monthlyGoal;
    if (dataPayload.currency !== undefined) updateObj.currency = dataPayload.currency;

    const { error } = await supabase
      .from('user_data')
      .upsert(updateObj, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Failed to sync to Supabase:', err);
    throw err;
  }
};

// Real-time subscription to listen for instant changes across devices via WebSockets
export const subscribeToSupabaseUserData = (userId, onDataUpdate) => {
  const channel = supabase
    .channel('realtime_user_data_sync')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_data'
      },
      (payload) => {
        if (payload.new) {
          const row = payload.new;
          onDataUpdate({
            id: row.id,
            email: row.email,
            incomes: Array.isArray(row.incomes) ? row.incomes : [],
            students: Array.isArray(row.students) ? row.students : [],
            withdrawals: Array.isArray(row.withdrawals) ? row.withdrawals : [],
            jobs: Array.isArray(row.jobs) && row.jobs.length > 0 ? row.jobs : null,
            monthlyGoal: row.monthly_goal ? Number(row.monthly_goal) : 0,
            currency: row.currency || 'EGP'
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
