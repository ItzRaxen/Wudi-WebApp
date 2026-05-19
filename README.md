# WUDI Web

WUDI Web adalah versi web dari aplikasi mobile WUDI. Aplikasi ini dibuat dengan React + Vite dan mengikuti kontrak data yang ditemukan pada source `PDBL-Mobile-Apps`.

## Analisis Firebase dan Backend Mobile

Hasil analisis source mobile:

- Firebase config ada di `lib/firebase_options.dart` dan mengambil nilai dari `.env`.
- Firebase Auth dipakai melalui `firebase_custom_token` dari backend setelah login REST.
- Task dan group tidak ditulis langsung ke Cloud Firestore.
- Task memakai backend REST `/todos` dengan field:
  - `id`
  - `judul`
  - `deskripsi`
  - `deadline`
  - `priority`
  - `is_completed`
  - `team_id`
  - `assigned_emails`
  - `completed_by`
- Group memakai backend REST `/teams` dengan field:
  - `id`
  - `name`
  - `description`
  - `max_members`
  - `members`
  - `avatar_url`
- Firestore pada mobile dipakai untuk chat: `chats/{conversationId}/messages`.

Karena task dan group mobile bersumber dari REST backend, WUDI Web memakai endpoint REST yang sama agar data tetap sinkron dan tidak membuat struktur Firestore baru yang bisa membuat mobile tidak kompatibel. Firebase SDK tetap dikonfigurasi untuk Auth custom token dan Firestore.

## Tech Stack

- React.js + Vite
- Tailwind CSS
- React Router DOM
- Firebase Authentication + Cloud Firestore SDK
- FullCalendar
- TanStack React Query
- Zustand
- React Hook Form
- Zod
- Lucide React
- date-fns
- react-hot-toast

## Instalasi

```bash
npm install
```

## Environment Variables

Buat file `.env` dari `.env.example`.

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`VITE_API_URL` wajib diisi karena mobile menggunakan REST API untuk task dan group.

## Menjalankan Project

```bash
npm run dev
```

## Build Production

```bash
npm run build
```

## Struktur Folder

```text
src/
  app/
    router.jsx
    providers.jsx
    store.js
  components/
    layout/
    ui/
    forms/
    task/
    group/
    calendar/
  pages/
    auth/
    dashboard/
    personal-tasks/
    group-tasks/
    groups/
    today/
    search/
    calendar/
    settings/
  services/
    firebase.js
    apiClient.js
    authService.js
    taskService.js
    groupService.js
    searchService.js
    calendarService.js
  hooks/
  store/
  utils/
  constants/
  schemas/
```

## Fitur Utama

- Register, login, logout, protected routes, session persistence
- Dashboard summary
- Personal task CRUD, complete/pending, priority, due date, description, search, filter, sort
- Group management, member list, invite member
- Group task CRUD, assignment, complete/incomplete, priority, due date
- Today task untuk personal dan group task
- Global search
- Calendar month/week/day dengan FullCalendar
- Task detail modal, edit, delete, complete
- Responsive layout untuk desktop, tablet, dan mobile browser
- Dark mode support

## Catatan Sinkronisasi

React Query melakukan refetch berkala setiap 3 detik untuk meniru update real-time dari backend REST mobile. Jika backend menambahkan channel realtime atau Firestore mirror resmi untuk task/group, service dapat diganti tanpa mengubah UI karena semua operasi sudah dipisahkan di `src/services`.
