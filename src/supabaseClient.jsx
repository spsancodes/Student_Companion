import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xrajlglzpdryabnsqczj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYWpsZ2x6cGRyeWFibnNxY3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDE0MjgsImV4cCI6MjA2NDQxNzQyOH0.1GCDNgHfBsgWmmBPimoGexqOpzwa0Jz9E_91Imzs1v4'

export const supabase = createClient(supabaseUrl, supabaseKey)
