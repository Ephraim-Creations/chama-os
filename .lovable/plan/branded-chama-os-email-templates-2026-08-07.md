# Branded Chama-OS email templates

Goal: every email the system sends (sign-in link, password reset, invite, email change, re-auth) uses one premium, branded template built around the Chama-OS logo.

## One prerequisite first

Custom-branded emails can only be sent from a sender domain you own (e.g. `notify.chama-os.co.ke`). Right now the project has no email domain set up, so emails go out with Lovable's default look. Once the domain is set up (a short guided flow, DNS verification runs in the background), the branded templates activate automatically.

If you don't have a domain yet, you can buy one in Project Settings → Domains, or use any registrar.

## The design (applied to all emails)

- Page background `#F4F4F7`, centered white card with rounded corners and a soft shadow.
- Chama-OS logo centered at the top of the card, 80px circle, followed by a thin divider.
- Centered bold heading in `#1A1A1A`, then friendly body copy.
- Pill-shaped CTA button in `#28A745`, bold white uppercase label.
- Small expiry note under the button ("This link will expire in 15 minutes").
- Security line at the bottom of the card: "If you did not request this email, you can safely ignore it."
- Footer on the gray background: "© 2026 Chama-OS-Kenya. All rights reserved."

## Per-email copy

| Email | Heading | Button |
| --- | --- | --- |
| One-time login link | Secure Access Link | LOG IN TO YOUR ACCOUNT |
| Password reset | Reset Your Password | SET A NEW PASSWORD |
| Signup confirmation | Confirm Your Email | CONFIRM MY EMAIL |
| Member invite | You've Been Invited | JOIN YOUR CHAMA |
| Email change | Confirm Your New Email | CONFIRM THE CHANGE |
| Re-authentication | Confirm It's You | Code shown inline (no button) |

## Technical notes

- Set up the sender domain, then email infrastructure, then scaffold the auth email templates (six React Email `.tsx` components plus the auth hook route).
- Extract a shared `EmailLayout` component (card, logo, divider, CTA, footer) so all six templates stay identical in styling; each template only supplies heading, body copy, and CTA label.
- Host the uploaded logo as a CDN asset so the emails reference a stable absolute `https` URL (email clients can't load relative or app-bundled images), and also install it as the app favicon.
- Card `Body` background stays white per email-client rendering rules; the gray `#F4F4F7` sits on the outer wrapper.
- Tested by previewing each rendered template before finishing.
