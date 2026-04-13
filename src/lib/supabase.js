import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://opqivuzvyvvvajokutvc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcWl2dXp2eXZ2dmFqb2t1dHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTg0ODIsImV4cCI6MjA5MDQ3NDQ4Mn0.7mH_9ikNMnM2zfUFQrb1ot6t47plzib6No2GPT0gfa0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
