# Apply Migrations Manually in Supabase

Since we need an access token for CLI authentication, here's the manual approach:

## How to Apply Migrations in Supabase Console:

1. Go to: https://app.supabase.com
2. Select your project: **Chama-OS**
3. Go to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Copy and run each migration file in order:

### Order of Migrations:
1. `20260523190508_368dbe46-3ea9-4af7-87d0-548192e23c54.sql`
2. `20260523204526_67d58332-ed0f-4e0a-8bb9-ba0023c2195f.sql`
3. `20260523212751_977a6b11-0cf0-403f-8006-b4040ed452e4.sql`
4. `20260524112520_ee77e54c-0a2b-4a46-b67c-c21a09e68cf7.sql`
5. `20260524121011_3d2ad54c-3d7f-4a1f-ab58-c36762ed1423.sql`
6. `20260524124018_010ba14c-77d0-4c32-a97a-c093dc8c3284.sql`
7. `20260524131901_9c461bf2-6545-424e-9b08-1b349d263fcc.sql`

## Steps:
1. Open each file from: `supabase/migrations/` folder
2. Copy all content
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Repeat for each migration

This will set up all your tables:
- profiles (user profiles)
- chamas (savings groups)
- memberships (user roles in chamas)
- profile_private (private user data)
- chama_invites (invitation system)
- contributions (member contributions)
- investments (group investments)
- loans (loans system)
- loan_repayments (repayment tracking)
- And all Row Level Security (RLS) policies
