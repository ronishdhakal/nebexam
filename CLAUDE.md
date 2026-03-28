# NEB Exam Project

Educational platform for Nepal's NEB (National Examination Board) students — Classes 10, 11, 12.

## Stack

**Backend** (`nebexam-backend/`)
- Django REST Framework, Python
- SQLite (dev), Token auth
- `drf_spectacular` for OpenAPI docs
- TIME_ZONE: Asia/Kathmandu
- CORS: localhost:3000 allowed

**Frontend** (`nebexam-frontend/`)
- Next.js App Router, plain JSX (no TypeScript)
- Tiptap rich text editor/renderer
- Zustand auth store
- API base client: `src/lib/api.js`

## Backend Apps

- `users` — Custom User model (email-based login), SubscriptionTier (free/basic/premium), Level (Class 10/11/12)
- `content` — Subject → Area → Chapter hierarchy. Subjects have class_level, streams (science/management), syllabus (Tiptap JSON). Chapters have rich_text_notes (Tiptap JSON) and pdf_notes.
- `questionbank` — QuestionBankEntry → QuestionGroup → QuestionNode tree. Question types: MCQ, short, long, passage, fill_blank, true_false, essay, letter, grammar. Content stored as Tiptap JSON.

## Frontend Structure

```
src/
  app/
    admin/          # Admin panel: subjects, areas, chapters, question-bank, users
    (public)/       # Public site: class pages, subject/syllabus/chapter views, question bank
  services/         # API service modules per resource
  hooks/            # Custom React hooks
  components/       # Reusable components (admin, layout, subject, question, chapter)
  lib/api.js        # Base API client
  store/authStore.js
```

## Dev Notes

- Backend changes usually require corresponding frontend service/hook/component updates.
- Rich text content is always Tiptap JSON — use the Tiptap renderer for display and editor for input.
- Auth is token-based (DRF TokenAuthentication); token stored in Zustand auth store.
