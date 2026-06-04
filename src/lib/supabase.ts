// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fddyeiledgxchbdcrtee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZHllaWxlZGd4Y2hiZGNydGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDMxMjIsImV4cCI6MjA5NTk3OTEyMn0.VxQEdSQ7nganI0LWj5kX_T4834E13Jwi-n4xyHy0C4E';

export const supabase = createClient(supabaseUrl, supabaseKey);