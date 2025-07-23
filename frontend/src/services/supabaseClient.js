import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uliivtyxnrslopoanavm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsaWl2dHl4bnJzbG9wb2FuYXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODg5NTYsImV4cCI6MjA2ODc2NDk1Nn0.5IyZhsXHcL4DuFs3XolMm9833icOpi6SOeFbdgROaJU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 