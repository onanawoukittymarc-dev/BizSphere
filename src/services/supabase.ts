// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://supabase.com/dashboard/org/jnpdbjuposkusfieadlt';
const SUPABASE_ANON_KEY = 'sb_publishable_9LrNtntO5kUrSBmOc21z2A_mN0RlO4c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});