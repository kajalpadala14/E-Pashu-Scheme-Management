# Dashboard/System Bugfix Roadmap

## Estimate

- Phase 1 dashboard data mapping: 1-2 hours
- Phase 2 vaccination workflow/schema: 2-3 hours
- Phase 3 pregnancy/breeding workflow/schema: 1.5-2 hours
- Phase 4 disease care + emergency-to-critical flow: 2-3 hours
- Phase 5 reports, alerts, notifications, SMS cleanup: 2-3 hours

Total code time: about 8-13 hours.
With Apps Script redeploy and live Sheet testing: about 1.5-2 working days.

## Phase 1: Dashboard Data Mapping

- Replace simplified animal/farmer dashboard sources with detailed livestock/farmer records.
- Fix Species Distribution showing `undefined`.
- Fix critical animals count from detailed animal status/disease status.
- Fix pregnant count from pregnancy records and animal pregnancy status.
- Fix vaccination coverage from vaccination records.
- Add active loan and insured owner stats.
- Show fallback recent activity from real rows when Activities sheet is empty.

## Phase 2: Vaccination Module

- Align Sheet headers, Apps Script, and frontend names for `vaccine`, `vaccineName`, `type`, `date`, `dueDate`.
- Add a new vaccination form.
- Make status update work against existing Sheet columns.
- Add SMS reminder queue/update behavior.

## Phase 3: Pregnancy/Breeding

- Align pregnancy/breeding schema with UI fields.
- Add pregnancy/breeding create form.
- Update animal pregnancy status when pregnancy record changes.
- Fix dashboard and reports pregnancy tracking.

## Phase 4: Disease Care And Emergency

- Add disease record create workflow.
- Fetch disease records consistently from the backend.
- Let field officer disease/emergency reports create health signals.
- Automatically mark relevant animals as Critical when emergency/disease severity requires it.

## Phase 5: Reports And Alerts

- Fix block-wise vaccination report using vaccination records joined with animal locations.
- Fix loan/insurance reports and filters.
- Generate alerts from vaccination due, pregnancy due, disease critical, and emergencies.
- Keep one sidebar entry for Alerts & Notifications.
