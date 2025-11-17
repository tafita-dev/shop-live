import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://owsfzbpgydutmputgile.supabase.com';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93c2Z6YnBneWR1dG1wdXRnaWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODEyMjgsImV4cCI6MjA3ODU1NzIyOH0.bVMz8LwEtiJejCjdBDRMA52cVQyrzphwFYxj7MHy6z0'; // depuis ton projet Supabase

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

import mongoose from 'mongoose';
