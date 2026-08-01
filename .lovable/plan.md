# Invites: send a real email, drop the copy-paste link

Today the invite dialog says "Email sending is coming soon" and shows a raw
`/login?invite=<token>` link. That message is out of date: the server already
emails the person a sign-in / set-password link when you invite them. The
dialog just never told you.

## What changes

- After you click **Send invite**, the dialog confirms: "Invite email sent to
  member@example.com — they'll get a link to set their password and join."
- The raw link block is removed from the normal path. It only appears as a
  fallback if the email could not be sent, labelled clearly as a manual backup.
- The dialog description is corrected (it currently says "same Google email"
  even though members sign in with email + password too).
- Same treatment for invites seeded during chama creation, so no other screen
  shows the "coming soon" wording.

## Sender address

Invite emails currently go out from Lovable's default sender. For branded email
from your own domain (e.g. `invites@yourdomain.com`) and better deliverability,
you'd need to connect a domain you own — say the word and I'll walk you
through it. Not required for invites to work.

## Technical notes

- `inviteMember` already returns `emailed: boolean`; `InviteMemberDialog.tsx`
  will branch on it instead of always rendering `lastLink`.
- No server or database changes needed.
