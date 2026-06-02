# Backend Audit Report

## Frontend API Surface

The frontend service layer in `src/lib/dataService.ts` calls these Apps Script actions:

- `dashboard.get`
- `animals.list`, `animals.create`, `animals.delete`, `animals.profile`
- `farmers.list`, `farmers.create`, `farmers.delete`
- `vaccinations.list`, `vaccinations.create`, `vaccinations.markDone`, `vaccinations.updateStatus`
- `breeding.list`
- `locations.list`, `locations.create`, `locations.update`, `locations.delete`
- `schemeData.list`, `schemeData.create`, `schemeData.update`, `schemeData.delete`, `schemeData.bulkUpsert`
- `schemeBeneficiaries.list`, `schemeBeneficiaries.create`, `schemeBeneficiaries.update`, `schemeBeneficiaries.delete`, `schemeBeneficiaries.bulkUpsert`
- `alerts.list`
- `healthRecords.list`, `healthRecords.create`
- `tasks.list`, `tasks.create`, `tasks.toggle`
- `fieldOfficers.list`
- `supervisorVerifications.list`
- `pregnancy.list`, `pregnancy.create`, `pregnancy.updateStatus`
- `analytics.villageInsights`
- `reminders.list`, `reminders.create`, `reminders.send`
- `users.list`, `users.lookupByEmail`, `users.upsert`, `users.delete`
- `photoEvidence.list`, `photoEvidence.create`, `photo.fetch`
- `dailyReports.list`, `dailyReports.create`
- `emergencies.list`, `emergencies.create`

## Findings

### Root-cause issue
- The Apps Script router lowercased incoming actions, but the switch cases were written with mixed-case scheme action names. This caused valid calls such as `schemeData.list` to fall through to the default branch.

### Missing or incomplete backend capabilities
- `schemeData.get`
- `schemeData.stats`
- `schemeData.filters`
- `schemeData.export`
- `beneficiaryData.list`
- `beneficiaryData.get`
- `beneficiaryData.create`
- `beneficiaryData.update`
- `beneficiaryData.delete`
- `beneficiaryData.stats`
- `beneficiaryData.filters`
- `beneficiaryData.export`
- `beneficiaryData.bulkImport`

### Contract issues
- The backend response helper did not emit the requested `message` field.
- Unknown actions returned `Unknown action: ...` instead of the requested `Action not found` shape.

## Sheet Architecture

### Existing sheets retained
- `Animals`
- `Farmers`
- `Employees`-equivalent user directory: `Users`
- `LocationMaster`-equivalent location sheet: `Locations`
- `Vaccinations`
- `Breeding`
- `Alerts`
- `FieldOfficers`
- `Reports`-related sheets such as `DailyFieldReports`, `EmergencyReports`, `PhotoEvidence`, `Tasks`, `Users`

### New / provisioned sheets
- `SchemeData`
- `SchemeBeneficiaries`
- `BeneficiaryData`
- `AuditLogs` is still not referenced by the current frontend and remains a future enhancement if you want append-only audit history persisted in Sheets.

## What Was Updated

- Normalized all action dispatch to lower-case matching.
- Added `message` + `error` compatibility in responses.
- Added new scheme CRUD helpers, stats, filters, and export endpoints.
- Added the new `BeneficiaryData` sheet and CRUD/import/export endpoints.
- Kept the legacy `schemeBeneficiaries.*` actions working for the existing frontend.
- Added automatic sheet provisioning for the new sheet definitions.

## Verification

- Apps Script file parses successfully as JavaScript.
- Unknown action paths now return a structured error response instead of falling through silently.
