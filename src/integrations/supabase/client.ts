// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://olvtlevlbgtalcnhcnvh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdnRsZXZsYmd0YWxjbmhjbnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4NTQ5MjAsImV4cCI6MjA1NTQzMDkyMH0.Xa_PvI1tU4c_vsHH6FAO4Km65w4eY9UjiQ6f0jbdjDE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);