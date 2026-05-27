# Google Apps Script Backend Setup

## 1) Create Spreadsheet
Create one Google Sheet and add these tabs with exact headers in row 1:

- `Animals`: `id,breed,age,owner,status`
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

Add your real data rows under each header (demo/mock is not used by frontend now).

## 2) Create Apps Script Project
1. Open script.google.com.
2. Create a new project.
3. Replace default code with the code from `Code.gs`.
4. Open Project Settings and enable Script Properties.
5. Add Script Property:
   - key: `SPREADSHEET_ID`
   - value: your Google Sheet ID

## 3) Deploy as Web App
1. Click Deploy > New deployment.
2. Type: Web app.
3. Execute as: `Me`.
4. Who has access: `Anyone` (or your org users if frontend auth is added).
5. Deploy and copy the web app URL.

## 4) Connect Frontend
Create `.env` in project root and paste deployed web app URL in `VITE_GAS_WEB_APP_URL`:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

Then run frontend:

```bash
npm install
npm run dev
```

## Notes
- Current frontend sends `POST` with `{ action, payload }`.
- New modules can be added by extending action switch in `Code.gs` and adding service functions in `src/lib/dataService.ts`.
