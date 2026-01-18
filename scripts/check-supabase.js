
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

console.log('Reading .env from:', envPath);

if (!fs.existsSync(envPath)) {
    console.error('.env file not found at', envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    const parts = line.split('=');
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, ''); // simple unquote
    if (key) {
        envVars[key] = value;
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    console.log('Found keys:', Object.keys(envVars));
    process.exit(1);
}

console.log('Found Supabase URL and Key.');
console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Connection failed with error:', error);
            process.exit(1);
        } else {
            console.log('Connection successful!');
            console.log('Table "users" is accessible. Row count:', count);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

testConnection();
