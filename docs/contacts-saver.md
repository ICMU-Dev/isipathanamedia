# ICMU Contacts

Open **Admin panel → Tools → ICMU Contacts** (on mobile, use More → Tools).
The route is `/:adminPath/dashboard/tools/contacts`.

Active Admins and Super Admins share the same directory. An Admin role combined
with Broadcaster still grants access. Writers and broadcaster-only accounts do not
have access. Authorized admins can add, edit, and delete shared contacts.

Quick entry asks for a name and a category. The + menu adds phone, email, map link,
or address fields; at least one valid detail is required before Save is enabled.
Use **+ → Another phone** for up to five numbers. A small chat-icon button records
WhatsApp availability independently for each number. This is an admin-provided
flag, not automatic registration verification. Numbers are normalized, duplicates
rejected, and all numbers participate in search and WhatsApp filtering. With more
than one number, the call shortcut opens the details sheet to choose a number.
Existing contact-person and notes values are preserved when editing older entries.
The searchable BeUI category picker includes 16 broad service categories grouped
into creative/production, equipment/spaces, and partners/support. Searches such as
posters, stickers, badges, apparel, offset, or digital find Printing & branding.
Legacy badge-printing and banner-printing entries display under this broader category
without requiring an update to their records.

Sri Lankan local phone numbers are normalized to +94. International numbers require
a country code. Call and email actions appear only for available contact methods.
WhatsApp appears when the saving admin explicitly marks the phone as available on
WhatsApp; the app does not claim to detect WhatsApp registration.
Map links accept supported Google Maps, Apple Maps, Bing Maps, and OpenStreetMap
HTTPS URLs. Address-only and map-only contacts are supported.

Desktop offers cards or a list, a category sidebar, and quick contact lists. Phones
use compact alphabetical rows and a separate filter sheet. Contact details open
in a bottom sheet on phones and a side drawer on desktop. The three-dot menu groups
View details, Edit contact, Copy details, and Delete contact. Add/edit forms use the
BeUI morphing modal with a native dialog for focus containment and background
inertness. Sheets slide in/out, rows slide gently into place, and muted BeUI pill
tabs slide their active indicator. Surfaces and action badges use the current
theme accent at 10% opacity. Motion respects reduced-motion preferences. The desktop sidebar groups
existing role-filtered links under Workspace, Communication, and Utilities & account.

Search covers names, contact people, categories, phone numbers, email, location,
and notes. Results are fetched in pages of 24. Editing and deleting use the last
loaded update timestamp to reject concurrent changes. Refresh before retrying a
conflict. Failed saves retain the form contents; deletion requires confirmation.

## Authentication and deployment

The existing index/password and Google sign-in experiences are preserved. Deploy
the five checked-in Contacts migrations before the frontend. They were applied to
the connected `icmu-web` Supabase project; their filenames match remote migration
history. No frontend deployment or Git push is performed by this implementation.

Password sign-in additionally requests a Contacts credential after the existing
login succeeds. It is a random 256-bit token stored separately from the profile
and never included in broadcast SSO cookies or URLs. Only a SHA-256 digest is
stored in the private database schema. Tokens last 8 hours, or 30 days with Remember
Me; expiry is enforced by the database. Signing out revokes the current token and
the local Supabase session. Password changes, suspension, and removal of the Admin
role invalidate access. The Contacts credential endpoint limits failed attempts
per account. That limit does not retrofit rate limiting onto legacy login RPCs.

Existing password sessions from before deployment need to sign out and in once.
The directory provides a Sign in again action when verified access is missing.
Google access uses the signed Supabase JWT, confirmed server-side email, linked
Google identity, and a live Supabase auth session, with a current active admin
record. It never trusts browser user metadata to authorize access.

All contact operations enforce RLS. The anonymous database role is also used by
this site's legacy password flow, so it receives limited column grants subject to
RLS and verified Contacts credentials. A claimed user index alone grants no access.
Privileged functions and token storage live in `contacts_private`, which must not
be added to the Data API's exposed schemas. Public RPC wrappers are security
invokers. Creation/update attribution and timestamps are assigned in the database.

## Existing security limitation

The requested wider account-security remediation remains incomplete. Existing
user-table policies trust a caller-supplied user index, and
legacy password-reset/identity-linking RPCs still permit account changes without
the new Contacts proof. The public users read policy also exposes credential
hashes. Those existing account-takeover paths can undermine any feature that trusts
these accounts, including ICMU Contacts. Its new RLS prevents direct index-only
access, but the whole feature cannot be considered fully production-secure until
the account-management paths are hardened. Do not treat this change as a security
audit or remediation of the wider application.

Supabase's existing security-advisor findings also include unrelated tables with
RLS disabled and legacy function permissions. See the
[Supabase database linter guidance](https://supabase.com/docs/guides/database/database-linter)
for remediation. The final advisor check reported no findings for Contacts objects.

## Verification

Run `npm run test:contacts` for input/action tests and the real PostgreSQL (PGlite)
database suite, including all five migrations, permission checks, shared access,
validation, CRUD, concurrent edits, rate limiting, and credential revocation.
PGlite is a pinned development dependency; it is not bundled into the website.

`supabase/tests/contacts_saver.sql` also runs on a migrated Supabase development
database. It uses uniquely named fixtures in a transaction and rolls them all
back. The suite was also run successfully against the connected project.

Browser checks with mocked data passed for desktop and mobile rendering, form
errors, failed-save recovery, add/edit/delete, search, categories, pagination,
dynamic actions, expired access, and writer restrictions. No test contacts were
retained in the connected database. The production build and targeted lint checks
passed. The build retains existing warnings about outdated Browserslist data and
the unresolved `/palingu.ttf` asset; neither was introduced by this feature.
