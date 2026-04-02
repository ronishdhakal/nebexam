# NEB Exam Project

Educational platform for Nepal's NEB (National Examination Board) students — Classes 10, 11, 12.

## Stack

**Backend** (`nebexam-backend/`)
- Django REST Framework, Python
- SQLite (dev), Token auth
- `drf_spectacular` for OpenAPI docs
- TIME_ZONE: Asia/Kathmandu
- CORS: localhost:3000 allowed
- File-based cache (`.cache/`, 1hr TTL, `CachedViewSetMixin` for read-heavy views)
- Cloudflare R2 storage for media (falls back to local `/uploads/` in dev)

**Frontend** (`nebexam-frontend/`)
- Next.js App Router, plain JSX (no TypeScript)
- Tiptap rich text editor/renderer
- Zustand auth store
- API base client: `src/lib/api.js`

## Backend Apps

- `users` — Custom User model (email-based login), SubscriptionTier (free/basic/premium), Level (Class 10/11/12). Referral fields: `referral_code` (auto-generated 8-char), `referral_balance`. CRM field: `crm_status` (none/follow_up/contacted/done). `UserSession` model tracks per-device sessions (max 1 desktop + 1 mobile per user).
- `content` — Subject → Area → Chapter hierarchy. Subjects have class_level, streams (science/management), syllabus (Tiptap JSON). Chapters have rich_text_notes (Tiptap JSON) and pdf_notes.
- `questionbank` — QuestionBankEntry → QuestionGroup → QuestionNode tree. Question types: MCQ, short, long, passage, fill_blank, true_false, essay, letter, grammar. Content stored as Tiptap JSON.
- `payments` — SubscriptionPlan, Coupon, Payment. New: `CheckoutAttempt` (tracks last checkout visit per user), `PayoutRequest` (payout with status pending/approved/rejected), `ReferralReward` (10% commission on referral payments, pending/released).
- `news` — `NewsCategory` + `News` and `BlogCategory` + `Blog`. Both have slug, excerpt, content (Tiptap JSON), featured_image, is_published, published_at. Image upload endpoints. Cached via `CachedViewSetMixin`.

## Frontend Structure

```
src/
  app/
    admin/          # Admin panel
      subjects, areas, chapters, question-bank, users
      blog/         # Blog CRUD + categories
      news/         # News CRUD + categories
      referral/     # Referral tracking + payout request management
      settings/
    (public)/       # Public site
      class pages, subject/syllabus/chapter views, question bank
      blog/         # Public blog listing + detail
      news/         # Public news listing + detail
      referral-program/  # Referral program info page
      subscription/ # Subscription plans page
      checkout/[plan], payment/success
  services/         # API service modules per resource
  hooks/            # Custom React hooks
    useBlog, useBlogCategories, useNews, useNewsCategories
  components/
    admin/
      blog/         # BlogForm (title, excerpt, category, Tiptap content, image upload)
      news/         # NewsForm + CategoryForm
    dashboard/
      ProfileBanner, StatsGrid, SubjectsList, SubscriptionWidget
      UpgradePlanModal, ReferralCard (referral code, stats, payout request)
    layout/         # Navbar, Sidebar, Footer
    home/LoggedInHome
  lib/api.js        # Base API client
  store/authStore.js
```

## Referral System

- Every user gets an auto-generated 8-character referral code
- 10% commission (`ReferralReward`) created when a referee completes a payment
- Minimum Rs. 100 balance to request payout
- Payout methods: eSewa, Khalti, Bank Transfer
- Admin can approve/reject payout requests with notes
- `ReferralCard` dashboard widget shows code, stats, payout status, who used code
- Only shown when eSewa is enabled in config

## Dev Notes

- Backend changes usually require corresponding frontend service/hook/component updates.
- Rich text content is always Tiptap JSON — use the Tiptap renderer for display and editor for input.
- Auth is token-based (DRF TokenAuthentication); token stored in Zustand auth store.
- Add `CachedViewSetMixin` to read-heavy ViewSets; writes auto-invalidate the full cache.
- News and Blog share the same structure — changes to one usually mirror to the other.
