/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: Supabase Hook                                                                          ║
 * ║ Description: React hook for accessing Supabase client and authentication                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { getConfig } from '@/lib/config';

// Initialize Supabase client
const config = getConfig();
const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey
);

interface UseSupabaseReturn {
  supabase: typeof supabase;
  isInitialized: boolean;
}

export function useSupabase(): UseSupabaseReturn {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Verify connection and set initialized state
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('health_check').select('*').limit(1);
        if (error) throw error;
        console.info('Supabase connection verified');
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to connect to Supabase:', error);
        setIsInitialized(false);
      }
    };

    checkConnection();
  }, []);

  return {
    supabase,
    isInitialized
  };
}

// Export singleton instance for non-React usage
export { supabase };