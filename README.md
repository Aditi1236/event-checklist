# Roster — Club Event Checklist

A responsive event checklist manager for clubs, built with React, React Router, and Tailwind CSS. All data is saved to your browser's localStorage, so it persists across refreshes.

## Features
- Dashboard with event cards (date, location, live progress)
- Create / edit / delete events (with delete confirmation)
- Per-event checklist grouped into Before / During / After Event
- Add / edit / delete tasks (with delete confirmation)
- Checkbox toggling with an animated circular "stamp" + bar progress indicator
- Fully responsive: desktop, tablet, and mobile

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/   Reusable UI: EventCard, TaskItem, forms, modal, progress bar/stamp
  context/      EventsContext — localStorage-backed global state + CRUD actions
  pages/        Dashboard.jsx, EventDetail.jsx
  utils/        localStorage helpers, date/id helpers, category config
```
