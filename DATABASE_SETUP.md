# Chama-OS Database Setup Guide

## Overview
This project uses **Supabase** (PostgreSQL-based) as its database backend.

## Current Setup
- ✅ Project ID: `vjxfsggzztbckfopdpxg`
- ✅ Region: Hosted on Supabase
- ✅ Auth: Supabase Auth with Google OAuth
- ✅ Database: PostgreSQL (via Supabase)

## Environment Variables (.env)
Required for the app to work:
```
SUPABASE_URL=https://vjxfsggzztbckfopdpxg.supabase.co
SUPABASE_PUBLISHABLE_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
VITE_SUPABASE_URL=https://vjxfsggzztbckfopdpxg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[your-anon-key]
```

## Database Schema
Your migrations include:

### Core Tables
1. **profiles** - User profile information
2. **chamas** - Chama/savings group organizations
3. **memberships** - User membership in chamas (with roles)
4. **profile_private** - Private user data (phone numbers)
5. **chama_invites** - Invitation system for new members

### Financial Tables
6. **contributions** - Member contributions to chama
7. **investments** - Chama group investments
8. **loans** - Loans given out by chama
9. **loan_repayments** - Loan repayment tracking

## User Flow & Login
1. User visits app → `/login` route
2. Clicks "Sign in with Google"
3. Google OAuth redirects to Supabase
4. Supabase creates/updates user in `profiles` table
5. User can create or join a chama

## Roles in Chama
- **Chairperson** - Admin, can invite members
- **Treasurer** - Manages finances
- **Secretary** - Records keeper
- **Member** - Regular member

## Testing Login
1. Make sure `.env` has correct credentials
2. Visit `http://localhost:8080/login`
3. Click Google sign-in
4. You'll be redirected to create/join a chama

## Troubleshooting
- **"Missing Supabase variables"**: Check `.env` file has all keys
- **OAuth not working**: Verify Google OAuth credentials in Supabase console
- **Database errors**: Check migrations were applied via Supabase CLI
