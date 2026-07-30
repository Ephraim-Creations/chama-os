## Goal

"Set PIN" in Settings → Security must save a new 4-digit PIN for the signed-in member, overwrite any previous one, and let them sign in with email + that PIN.

## Current state (verified)

- The Security card is already wired to the PIN server functions (set / remove / status), and the login screen already has the PIN keypad calling the PIN sign-in function.
- The `user_pins` table exists but contains **0 rows** — so no PIN has ever been stored successfully. The failure point is not yet confirmed; step 1 is to confirm it rather than guess.

## Step 1 — Reproduce and locate the failure

Sign in as a test member in the preview browser, open Settings, type a PIN, press Set PIN, and capture the exact error from the console/network and server-function logs. Then re-check the table for a new row.

Likely candidates to check while reproducing:
- the auth bearer reaching the server function (protected calls need the token attached),
- table permissions/grants for the service-role write path,
- the unique/primary key used by the upsert (a missing conflict target makes the save fail silently or error).

## Step 2 — Fix what the reproduction shows

Repair whichever layer fails so that pressing Set PIN:
- stores a salted hash of the new PIN, replacing any earlier PIN for that member,
- resets any failed-attempt counter and lock so the new PIN works immediately,
- flips the card to "A 4-digit PIN is active on your account." with Change / Remove options.

## Step 3 — Verify the sign-in loop end to end

Sign out, choose the PIN tab on the login screen, enter the email and the new 4-digit PIN, and confirm it lands on the dashboard. Then change the PIN in Settings and confirm the old PIN is rejected and the new one works. Also confirm Remove PIN deletes the row and the login PIN tab then rejects it.

## Out of scope

No change to who may set a PIN — it stays self-service only; no official can set or reset someone else's.
