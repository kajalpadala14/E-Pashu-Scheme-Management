# Google Apps Script Backend Setup

## 1) Create Spreadsheet
Create one Google Sheet. The script can auto-create the required tabs and headers, so manual tab creation is optional.

If you want to create tabs manually, use these names:

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

Add your real data rows under each header. Demo/mock data is not used by the frontend.

## 2) Create Apps Script Project
1. Open script.google.com.
2. Create a new project.
3. Replace default code with the code from `Code.gs`.
4. Open Project Settings and enable Script Properties.
5. Add Script Property:
   - key: `SPREADSHEET_ID`
   - value: your Google Sheet ID
6. In the Apps Script editor, run `setupEPashuBackend` once and approve permissions.

## 3) Deploy as Web App
1. Click Deploy > New deployment.
2. Type: Web app.
3. Execute as: `Me`.
4. Who has access: `Anyone` (or your org users if frontend auth is added).
5. Deploy and copy the web app URL.
6. Open the web app URL in browser. It should return JSON with `"status":"connected"`.

## 4) Connect Frontend
Create `.env` in project root and paste deployed web app URL in `VITE_GAS_WEB_APP_URL`:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

The local `.env` file is already created in this project. Paste your deployed URL after `VITE_GAS_WEB_APP_URL=`.

Then run frontend:

```bash
npm install
npm run dev
```

## Notes
- Current frontend sends `POST` with `{ action, payload }`.
- Opening the Web App URL with `GET` returns a health check.
- New modules can be added by extending action switch in `Code.gs` and adding service functions in `src/lib/dataService.ts`.
