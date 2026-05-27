# Herd Buddy Dashboard - Complete Product Guide

## 1. Document Purpose
This is the master handover and demo guide for the Herd Buddy Dashboard.
It explains:
- what features are implemented
- how users interact with each module
- how frontend and backend are connected
- which Google Sheet tabs/columns are required
- what has been improved recently
- how to deploy and validate everything end-to-end

Use this document for client demos, team onboarding, and future feature planning.

## 2. Product Snapshot
Herd Buddy is a web app for livestock operations with Google Sheets as the live data source.

### Tech stack
- Frontend: React + TypeScript + Vite + TanStack Query + Recharts + shadcn/ui
- Backend: Google Apps Script Web App
- Data store: Google Sheets (multi-tab model)

### Core goal
Improve livestock outcomes by making vaccination, pregnancy, alerts, reminders, and field execution trackable in one place.

## 3. User Personas and Value
### Farmers and owners
- registration of animals and farmer records
- vaccination and pregnancy follow-up visibility
- reminders and outreach support

### Vets and medical teams
- critical case monitoring
- overdue vaccination tracking
- village-level risk visibility

### Government and program officers
- village analytics and coverage trends
- risk-based planning and intervention prioritization

### Field officers
- task updates and operational follow-up
- pregnancy and vaccination status updates in workflow

## 4. Navigation and Routes
Implemented routes:
- `/` Dashboard
- `/animals` Animals list and create
- `/animals/:id` Animal profile
- `/farmers` Farmer management
- `/vaccinations` Vaccination tracker with status updates
- `/breeding` Pregnancy tracking
- `/alerts` Alerts and outbreak monitoring
- `/field-officers` Field task tracking
- `/ai-insights` Reminders and notifications workflow
- `/reports` Village analytics and report export
- `/profile` Profile and notification preferences

## 5. Feature Highlights (Current Build)

### 5.1 Dashboard and Monitoring
- live summary cards for animals, farmers, coverage, pending vaccinations, alerts
- vaccination trends chart
- health distribution chart
- monthly activity chart
- recent activity feed

### 5.2 Animal Management
- add and list animals
- searchable list and status visibility
- profile-level drill down through animal details page

### 5.3 Animal Profile
- vaccination history timeline
- breeding history timeline
- upcoming reminders
- dates shown in readable format (example: 12 Mar 2026)

### 5.4 Farmer Management
- create and list farmers
- Indian mobile validation enforced:
  - 10 digits
  - starts with 6/7/8/9
- normalized dial format used (`+91XXXXXXXXXX`)
- click-to-call action from farmer table

### 5.5 Vaccination Tracker (Enhanced)
- list vaccination rows by animal
- update status from dropdown:
  - Pending
  - Overdue
  - Done
- no longer limited to only Mark Done

### 5.6 Pregnancy Tracking
- create pregnancy records
- update lifecycle status:
  - Inseminated
  - Pregnant
  - Due Soon
  - Delivered
- summary cards for active and delivered counts
- table and form dates are human-readable where displayed

### 5.7 Alerts and Outbreak Intelligence
- base alerts pulled from Alerts sheet
- outbreak alerts auto-generated from critical animal clustering logic
- high-priority alerts surfaced in top navigation notifications

### 5.8 Reminders and Notifications
- sidebar label is now Reminders
- reminders page supports create/send workflow
- auto reminders can be generated from pending vaccination records
- due dates shown in formatted display style

### 5.9 Reports and Analytics (Major Upgrade)
- village-level table and charts
- multiple charts (no slider dependency):
  - vaccination coverage
  - health risk (critical + pending)
  - pregnancy and total animal load
- top KPI cards:
  - total animals
  - total pregnant
  - pending vaccinations
  - average coverage
  - top risk village
- date range filter (`fromDate`, `toDate`)
- export options:
  - CSV download
  - PDF download

### 5.10 Notification and Profile Click Behavior
- bell icon click:
  - navigates to Alerts
  - shows notification toast summary
- user icon click:
  - navigates to Profile page

## 6. Backend Action Map (Apps Script)
All frontend requests use `POST` with payload `{ action, payload }`.

### Core actions
- `dashboard.get`
- `animals.list`
- `animals.create`
- `animals.profile`
- `farmers.list`
- `farmers.create`
- `vaccinations.list`
- `vaccinations.markDone`
- `vaccinations.updateStatus`
- `breeding.list`
- `pregnancy.list`
- `pregnancy.create`
- `pregnancy.updateStatus`
- `alerts.list`
- `analytics.villageInsights`
- `reminders.list`
- `reminders.create`
- `reminders.send`
- `tasks.list`
- `tasks.toggle`

## 7. Google Sheet Data Model (Required Tabs)
Create these tabs exactly with these headers in row 1.

- `Animals`: `id,breed,age,owner,village,status`
- `Farmers`: `name,phone,village,animals`
- `Vaccinations`: `animalId,type,date,status`
- `Breeding`: `animalId,inseminationDate,expectedCalving,status`
- `Pregnancy`: `id,animalId,village,inseminationDate,expectedCalving,status,lastCheckDate,notes`
- `Alerts`: `id,message,priority,type,time`
- `Reminders`: `id,village,recipient,channel,message,dueDate,status,sentAt`
- `Tasks`: `id,task,village,completed`
- `Activities`: `action,detail,time`
- `VaccinationTrends`: `month,vaccinations`
- `HealthStatus`: `name,value,fill`
- `MonthlyActivity`: `month,registered,vaccinated,alerts`

## 8. Date Range Logic in Reports
Date filter in reports applies to:
- `Vaccinations.date`
- `Pregnancy.inseminationDate` (fallback: `lastCheckDate`)

Expected date format in sheets: `yyyy-mm-dd`

## 9. Dummy Data and Demo Readiness
A full paste-ready data pack is available in:
- `apps-script/DUMMY_SHEET_DATA.md`

Use it to populate all tabs quickly for realistic demo output.

## 10. Setup and Deployment

### 10.1 Apps Script setup
1. Open `script.google.com`
2. Create project and paste `apps-script/Code.gs`
3. Set Script Property `SPREADSHEET_ID`
4. Deploy as Web App (execute as Me)
5. Copy deployment URL

### 10.2 Frontend setup
1. Add `VITE_GAS_WEB_APP_URL` in `.env`
2. Run:
   - `npm install`
   - `npm run dev`
3. Open app and validate all routes

### 10.3 Critical note
After backend changes in `apps-script/Code.gs`, create a new Apps Script deployment (or update deployment). Without redeploy, frontend will keep calling older backend behavior.

## 11. Validation Checklist (Quick QA)
- farmers mobile validation accepts only valid Indian numbers
- call action opens phone dialer using `tel:+91...`
- vaccination status can be switched between Pending/Overdue/Done
- reports date range changes table and chart values
- CSV and PDF exports download correctly
- bell icon opens alerts and shows toast
- profile icon opens profile page
- reminders page can create and send reminders

## 12. Known Non-Blocking Notes
- Vite build currently shows existing CSS warning about `@import` order in global CSS.
- Bundle size warning appears for large chunks; functional behavior is not blocked.

## 13. Suggested Next Improvements
- add role-based login and route guards
- add audit and sanity-check screen for sheet data mismatches
- add report scheduling (weekly PDF/email)
- add server-side pagination for large data
- add village drill-down page for deeper analytics

---
This document reflects the latest implemented behavior in the current codebase and is intended as the authoritative product guide for this release.
