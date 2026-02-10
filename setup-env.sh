#!/bin/bash

# Create .env file with Supabase credentials
cat > .env << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://zzodexvvxyyndilxtmsm.supabase.co
SUPABASE_ANON_KEY=sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6b2RleHZ2eHl5bmRpbHh0bXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTc4MTksImV4cCI6MjA4NjE5MzgxOX0.4fSH_hzTOrJM6K5h54_Dgv6ae5jxBXyXmGzCFiLjcZM

# Server Configuration
PORT=3000
EOF

echo ".env file created successfully!"
