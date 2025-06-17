import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
  // Optionally throw an error or handle the missing configuration gracefully
  // throw new Error('Missing Supabase environment variables');
}

// Initialize client only if variables are present
export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
}) : null; // Set to null if config is missing

// Helper function to check if Supabase is initialized
const isSupabaseAvailable = () => {
  if (!supabase) {
    console.error("Supabase client not initialized. Check environment variables.");
    return false;
  }
  return true;
};

// Real-time subscriptions (check if supabase is available)
export const subscribeToUserUpdates = (userId: string, callback: (payload: any) => void) => {
  if (!isSupabaseAvailable()) return null;
  return supabase
    .channel(`user-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToCoinsUpdates = (userId: string, callback: (payload: any) => void) => {
  if (!isSupabaseAvailable()) return null;
  return supabase
    .channel(`coins-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions', // Assuming transactions reflect coin changes
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToAchievements = (userId: string, callback: (payload: any) => void) => {
  if (!isSupabaseAvailable()) return null;
  // Assuming achievements are stored in user_progress table
  return supabase
    .channel(`achievements-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        // Extract achievements from the payload if needed
        if (payload.new && payload.new.achievements) {
          callback(payload.new.achievements);
        } else {
          callback(payload); // Or handle differently
        }
      }
    )
    .subscribe();
};

// Database operations (check if supabase is available)
export const getUserProfile = async (userId: string) => {
  if (!isSupabaseAvailable()) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  if (!isSupabaseAvailable()) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTransactions = async (userId: string, limit = 10) => {
  if (!isSupabaseAvailable()) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const getAchievements = async (userId: string) => {
  if (!isSupabaseAvailable()) throw new Error("Supabase client not initialized.");
  // Fetch from user_progress table where achievements are stored
  const { data, error } = await supabase
    .from('user_progress')
    .select('achievements')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data?.achievements || []; // Return the achievements array
};

