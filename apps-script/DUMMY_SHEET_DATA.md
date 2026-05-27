# Dummy Data For Google Sheet (Paste-Ready)

Use this to make the app look realistic quickly.
For each tab, keep the header row exactly same and paste rows below it.

## 1) Animals tab
Header:
```csv
id,breed,age,owner,village,status
```
Rows:
```csv
ANM-001,Sahiwal,4,Rajesh Kumar,Rampur,Healthy
ANM-002,Gir,6,Sita Devi,Lakshmipur,Critical
ANM-003,HF Cross,3,Mohan Singh,Krishnanagar,Due
ANM-004,Murrah,5,Priya Sharma,Govindpur,Healthy
ANM-005,Jersey,2,Amit Patel,Rampur,Critical
ANM-006,Tharparkar,7,Kavita Devi,Lakshmipur,Healthy
ANM-007,Red Sindhi,4,Ramesh Yadav,Shivpura,Due
ANM-008,Kankrej,3,Pooja Verma,Nandgaon,Healthy
ANM-009,Sahiwal,5,Sunita Bai,Rampur,Healthy
ANM-010,HF Cross,2,Imran Khan,Krishnanagar,Critical
ANM-011,Murrah,6,Geeta Devi,Govindpur,Due
ANM-012,Jersey,4,Vikram Singh,Shivpura,Healthy
```

## 2) Farmers tab
Header:
```csv
name,phone,village,animals
```
Rows:
```csv
Rajesh Kumar,+919876543210,Rampur,3
Sita Devi,+919123456789,Lakshmipur,2
Mohan Singh,+918765432109,Krishnanagar,2
Priya Sharma,+917654321098,Govindpur,2
Amit Patel,+919234561234,Rampur,2
Kavita Devi,+918888777666,Lakshmipur,1
Ramesh Yadav,+917777666555,Shivpura,2
Pooja Verma,+916666555444,Nandgaon,1
Sunita Bai,+919999888777,Rampur,1
Imran Khan,+919111222333,Krishnanagar,1
Geeta Devi,+918001234567,Govindpur,1
Vikram Singh,+917001234567,Shivpura,1
```

## 3) Vaccinations tab
Header:
```csv
animalId,type,date,status
```
Rows:
```csv
ANM-001,FMD,2026-01-12,Done
ANM-001,HS,2026-03-20,Pending
ANM-002,FMD,2026-02-15,Overdue
ANM-003,Brucellosis,2026-02-28,Done
ANM-004,FMD,2026-03-05,Done
ANM-005,HS,2026-03-25,Pending
ANM-006,FMD,2026-01-30,Done
ANM-007,Anthrax,2026-02-10,Pending
ANM-008,FMD,2026-03-18,Done
ANM-009,HS,2026-03-27,Pending
ANM-010,FMD,2026-02-22,Overdue
ANM-011,Brucellosis,2026-03-12,Done
ANM-012,FMD,2026-03-29,Pending
```

## 4) Breeding tab
Header:
```csv
animalId,inseminationDate,expectedCalving,status
```
Rows:
```csv
ANM-001,2025-10-10,2026-07-15,Confirmed
ANM-002,2025-11-20,2026-08-25,Confirmed
ANM-004,2025-12-05,2026-09-08,Pending
ANM-006,2025-09-18,2026-06-24,Confirmed
ANM-008,2026-01-07,2026-10-12,Pending
ANM-010,2025-12-22,2026-09-27,Confirmed
```

## 5) Pregnancy tab
Header:
```csv
id,animalId,village,inseminationDate,expectedCalving,status,lastCheckDate,notes
```
Rows:
```csv
PRG-1001,ANM-001,Rampur,2025-10-10,2026-07-15,Pregnant,2026-03-10,Normal development
PRG-1002,ANM-002,Lakshmipur,2025-11-20,2026-08-25,Due Soon,2026-03-25,Needs close monitoring
PRG-1003,ANM-004,Govindpur,2025-12-05,2026-09-08,Inseminated,2026-03-11,Early stage
PRG-1004,ANM-006,Lakshmipur,2025-09-18,2026-06-24,Pregnant,2026-03-20,Healthy
PRG-1005,ANM-008,Nandgaon,2026-01-07,2026-10-12,Inseminated,2026-03-29,Follow-up next month
PRG-1006,ANM-010,Krishnanagar,2025-12-22,2026-09-27,Due Soon,2026-03-27,Calving prep started
```

## 6) Alerts tab
Header:
```csv
id,message,priority,type,time
```
Rows:
```csv
1,FMD overdue for ANM-002,High,Vaccination,2 hours ago
2,Critical health alert for ANM-010,High,Health,4 hours ago
3,HS vaccine pending for ANM-005,Medium,Reminder,6 hours ago
4,Possible disease cluster in Rampur,High,AI Alert,1 day ago
5,Breeding follow-up due for ANM-008,Medium,Breeding,1 day ago
6,Monthly summary generated,Low,System,2 days ago
```

## 7) Reminders tab
Header:
```csv
id,village,recipient,channel,message,dueDate,status,sentAt
```
Rows:
```csv
REM-2001,Rampur,Rajesh Kumar,SMS,FMD booster due for ANM-001,2026-04-05,Pending,
REM-2002,Lakshmipur,Sita Devi,WhatsApp,Visit center for ANM-002 checkup,2026-04-06,Pending,
REM-2003,Govindpur,Priya Sharma,Call,Pregnancy scan due for ANM-004,2026-04-08,Pending,
REM-2004,Shivpura,Ramesh Yadav,SMS,Vaccination camp on Sunday,2026-04-07,Sent,2026-04-01T09:20:00.000Z
```

## 8) Tasks tab
Header:
```csv
id,task,village,completed
```
Rows:
```csv
1,Vaccinate ANM-005,Rampur,false
2,Health check ANM-010,Krishnanagar,false
3,Pregnancy review ANM-002,Lakshmipur,true
4,New registration drive,Govindpur,false
5,Follow-up on overdue vaccines,Shivpura,true
```

## 9) Activities tab
Header:
```csv
action,detail,time
```
Rows:
```csv
Vaccination done,ANM-004 received FMD,30 min ago
Alert generated,Critical status for ANM-010,1 hour ago
Reminder sent,Ramesh Yadav notified,2 hours ago
Task completed,Pregnancy review in Lakshmipur,5 hours ago
Farmer added,Imran Khan registered,1 day ago
```

## 10) VaccinationTrends tab
Header:
```csv
month,vaccinations
```
Rows:
```csv
Oct,34
Nov,42
Dec,39
Jan,46
Feb,53
Mar,61
```

## 11) HealthStatus tab
Header:
```csv
name,value,fill
```
Rows:
```csv
Healthy,58,hsl(152, 60%, 40%)

## 12) HealthRecords tab
Header:
```csv
animalId,date,condition,notes,status
```
Rows:
```csv
ANM-010,2026-03-20,Foot-and-mouth disease,Observed lesions on mouth and feet,Critical
ANM-004,2025-12-05,Mastitis,Swollen udder,Recovered
```
Due,25,hsl(45, 90%, 50%)
Critical,17,hsl(0, 72%, 51%)
```

## 12) MonthlyActivity tab
Header:
```csv
month,registered,vaccinated,alerts
```
Rows:
```csv
Oct,10,34,3
Nov,12,42,4
Dec,9,39,2
Jan,14,46,5
Feb,16,53,6
Mar,19,61,7
```

## Date Range Note
Date range filter in Reports works on:
- Vaccinations.date
- Pregnancy.inseminationDate (fallback: lastCheckDate)

Keep these dates in yyyy-mm-dd format for correct filtering.
