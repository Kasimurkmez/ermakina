# Er Makina Fixture Tracking System - AI Coding Guidelines

## Architecture Overview
This is a React TypeScript SPA for tracking manufacturing fixtures using Firebase (Firestore + Storage). Core data flows from Excel imports → Firestore → UI components with real-time filtering/search. Images are stored in Firebase Storage with automatic cleanup on deletion.

**Key Components:**
- `useFixtureData` hook: Manages all CRUD operations, Excel processing, and data filtering
- `DataTable`: Complex row coloring based on Turkish status keywords (e.g., "ARIZALI", "İADE", "İPTAL")
- Multiple modals for operations (AddDataModal, OperatorSelectionModal, etc.)
- Authentication with admin/guest roles; admins have 5-minute inactivity timeout

## Critical Workflows
- **Data Import**: Excel files processed via `XLSX` library, duplicates skipped by "seri no" field
- **Backup**: `yedekle.cjs` uses Firebase Admin SDK to export Firestore to local JSON daily
- **Deployment**: `BASLAT.bat` runs backup, kills old processes, serves built app via `npx serve -s dist -l 8080`
- **Development**: `npm run dev` (Vite), `npm run build` (TypeScript + Vite), `npm run lint` (ESLint with --ext ts,tsx)

## Project-Specific Patterns
- **Status Logic**: Use Turkish keywords in uppercase for status checks (e.g., `combinedText.includes("İADE")` in DataTable.tsx)
- **Date Handling**: Custom parsing for "DD.MM.YYYY HH:mm" format with time-ago calculations
- **Image Management**: Upload to Firebase Storage under "fixtures/" folder, delete old images on update/remove
- **Row Coloring**: Conditional classes based on operator/status combinations (blue for assigned, red for problematic)
- **Excel Export**: Uses `exceljs` for generating workbooks with custom headers
- **Toast Notifications**: `react-hot-toast` for user feedback, Turkish messages
- **PWA**: Vite PWA plugin for offline capabilities

## Integration Points
- **Firebase Config**: Hardcoded in `components/firebase.ts` (not env-based)
- **Cloudinary**: Alternative image service in `cloudinary.ts` (not currently used, preset "fikstur")
- **Electron**: Desktop wrapper in `electron/main.js`, loads Vite dev server in development
- **Docker**: Simple Alpine container exposing port 80 for dev server

## Conventions
- **Language**: All UI text and logic in Turkish; maintain consistency
- **File Naming**: Kebab-case for components (e.g., `AddDataModal.tsx`), camelCase for hooks
- **Data Keys**: Use spaces in Firestore field names (e.g., "seri no", "müşteri mülkiyeti")
- **Error Handling**: Wrap async operations in try/catch, show user-friendly Turkish messages
- **State Management**: Local state with React hooks; no external state libraries
- **Styling**: Tailwind CSS with custom color schemes for status indicators

## Examples
- **Filtering Data**: `filtered = filtered.filter(item => values.includes(item[key]))` in useFixtureData
- **Time Calculation**: Parse "DD.MM.YYYY HH:mm" to Date object for diff calculations
- **Modal Triggers**: Pass item data to modals via props (e.g., `onEdit: (item: FixtureData) => void`)
- **Image Upload**: Use `uploadBytes` and `getDownloadURL` from Firebase Storage SDK</content>
<parameter name="filePath">c:\Users\Administrator\Desktop\ermakina-main\.github\copilot-instructions.md