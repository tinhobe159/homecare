Enhancing the Caregiving App Database for Real-World Workflows
==================================================================

Scope
-----
This document refines your demo database (db.json) to better match real-world
home care platforms operating in the US, UK, and Southeast Asia. It focuses on:
- Electronic Visit Verification (EVV)
- Scheduling & availability (including recurring schedules)
- Payroll & caregiver timesheets
- Compliance & background checks tracking
- Case management (care plans, tasks, and visit/clinical notes)
- Performance metrics & caregiver ranking
- Supervisor review & oversight flows
- Minimal changes to existing entities; modular add-ons for a demo

------------------------------------------------------------------
1) Comparison: Current Demo vs. Real-World Needs
------------------------------------------------------------------
What you already have (good):
- Users/roles, customer & caregiver profiles
- Services, packages, package-services mapping
- Appointments (one-off), invoices & line items, payments
- Basic EVV records (check-in/out, notes, signature)
- Availability & time-off requests
- Feedback/rating

What’s typically needed in production:
- EVV with geolocation (GPS) and supervisor sign-off
- Recurring schedules + conflict handling, auto-matching to availability
- Timesheets and payroll summaries derived from EVV
- Granular compliance records (background check, license/certs, trainings)
- Care plans with ongoing tasks (ADLs/IDALs) + richer visit notes
- Performance metrics beyond ratings (on-time rates, cancellations, hours)
- Supervisor verification of visits and periodic caregiver reviews
- End-to-end data flow: EVV → Timesheets/Payroll and EVV → Billing/Invoices

------------------------------------------------------------------
2) Proposed Schema Enhancements (Additions & Updates)
------------------------------------------------------------------

A) EVV Enhancements
-------------------
Goal: capture who/what/when/where for each visit and allow supervisor verification.
Add fields to evvRecords:
- checkInLocation: { lat, lng }
- checkOutLocation: { lat, lng }
- verifiedBy (userId), verifiedAt (timestamp)
- tasksCompleted: string[] or a separate appointmentTasks table

Example (updated evvRecords row):
{
  "id": 8,
  "appointmentId": 8,
  "caregiverId": 15,
  "checkInTime": "2025-08-08T11:00:00Z",
  "checkOutTime": "2025-08-08T13:00:00Z",
  "checkInLocation": { "lat": 40.7128, "lng": -74.0060 },
  "checkOutLocation": { "lat": 40.7129, "lng": -74.0055 },
  "status": "completed",
  "caregiverNotes": "Patient was in good spirits today",
  "patientSignatureUrl": "https://.../signature.png",
  "verifiedBy": 2,
  "verifiedAt": "2025-08-08T14:00:00Z",
  "tasksCompleted": ["Bathing Assistance", "Dressing Assistance"]
}

B) Scheduling & Availability
----------------------------
Add recurringSchedules to define templates that generate appointments.
{
  "id": 1,
  "customerId": 3,
  "caregiverId": null,
  "packageId": 1,
  "startDate": "2025-09-01",
  "endDate": "2025-12-31",
  "daysOfWeek": ["Monday", "Wednesday", "Friday"],
  "time": "09:00:00",
  "durationMinutes": 120,
  "notes": "Morning routine care"
}
Notes:
- Optionally add recurringScheduleId to appointments to trace origin.
- Use caregiverAvailability + timeOffRequests to prevent conflicts.

C) Payroll & Timesheets
-----------------------
Add caregiverTimesheets to summarize each pay period per caregiver.
{
  "id": 5,
  "caregiverId": 15,
  "periodStart": "2025-08-01",
  "periodEnd": "2025-08-15",
  "totalHours": 36.5,
  "totalPay": 820.00,
  "status": "approved"
}

Add timesheetEntries (optional if deriving from EVV directly):
{
  "id": 101,
  "caregiverId": 15,
  "appointmentId": 8,
  "date": "2025-08-08",
  "hoursWorked": 2.0,
  "payRate": 25.00,
  "payAmount": 50.00,
  "paid": false
}
Notes:
- If you skip timesheetEntries, compute totals directly from evvRecords.
- EVV → Timesheets approval → Payroll processing.


D) Compliance & Background Checks
---------------------------------
Add caregiverCompliance / caregiverDocuments:
{
  "id": 10,
  "caregiverId": 12,
  "type": "Background Check",
  "status": "verified",
  "completedDate": "2025-01-15",
  "expiryDate": "2026-01-15",
  "documentUrl": null
},
{
  "id": 11,
  "caregiverId": 12,
  "type": "Nursing License",
  "status": "verified",
  "licenseNumber": "RN123456",
  "expiryDate": "2025-12-31",
  "documentUrl": "https://files.example.com/license_RN123456.pdf"
}
Notes:
- Keep summary fields in caregiverProfiles (e.g., backgroundCheckStatus/date).
- Use expiry to flag lapsed compliance and deactivate caregivers if needed.

E) Case Management (Care Plans, Tasks, Notes)
---------------------------------------------
Add carePlans:
{
  "id": 3,
  "customerId": 6,
  "planName": "Post-Surgery Recovery Plan",
  "createdBy": 2,
  "createdAt": "2025-07-28T08:00:00Z",
  "status": "active",
  "goals": "Assist with daily activities during knee surgery rehab; improve mobility."
}

Add carePlanTasks:
{
  "id": 18,
  "carePlanId": 3,
  "taskDescription": "Assist with bathing and dressing",
  "frequency": "daily",
  "assignedTo": null,
  "status": "active"
}

Add visitNotes for richer clinical documentation per appointment:
{
  "id": 5,
  "appointmentId": 8,
  "authorId": 15,
  "noteText": "Client walked 50 feet with walker today, improvement from last week.",
  "createdAt": "2025-08-08T13:05:00Z"
}

F) Performance Metrics & Caregiver Ranking
------------------------------------------
Extend caregiverProfiles with aggregates:
- completedAppointments (int)
- onTimeRate (0..1)
- cancellationCount (int)
- lastActive (date)
- rating (avg), totalReviews (already present)

Example:
{
  "id": 1,
  "userId": 12,
  "yearsExperience": 8,
  "hourlyRate": 25,
  "rating": 4.8,
  "totalReviews": 130,
  "completedAppointments": 120,
  "onTimeRate": 0.98,
  "cancellationCount": 1,
  "lastActive": "2025-08-10"
}

G) Supervisor Review & Oversight
--------------------------------
- EVV verification fields (verifiedBy, verifiedAt).
- Optional supervisorReviews table:
{
  "id": 3,
  "caregiverId": 15,
  "supervisorId": 2,
  "reviewDate": "2025-08-30",
  "comments": "Observed visit – caregiver followed care plan well.",
  "score": 5
}
- Continue using auditLogs on all new/changed entities.


------------------------------------------------------------------
3) ERD-Style Relationships (Text Overview)
------------------------------------------------------------------
Users (id) 
  ├─< CustomerProfiles (userId)
  ├─< CaregiverProfiles (userId)
  └─< AdministratorProfiles (userId)

CaregiverProfiles (id)
  ├─< CaregiverCompliance (caregiverId)
  ├─< CaregiverAvailability (caregiverId)
  ├─< TimeOffRequests (caregiverId)
  ├─< CaregiverTimesheets (caregiverId)
  └─< SupervisorReviews (caregiverId)

CustomerProfiles (id)
  ├─< CarePlans (customerId)
  ├─< UserRequests (userId)
  └─< Appointments (userId)

CarePlans (id)
  └─< CarePlanTasks (carePlanId)

RecurringSchedules (customerId, caregiverId?)
  └─ generates Appointments (add optional recurringScheduleId in appointments)

Appointments (id)
  ├─ 1:1 EVVRecords (appointmentId)
  ├─< VisitNotes (appointmentId)
  ├─< Feedback (appointmentId)
  └─< TimesheetEntries (appointmentId)  [optional]

CaregiverTimesheets (id)
  └─< TimesheetEntries (timesheetId)   [optional]

Services/Packages (existing)
  └─ Packages ─< PackageServices ─> Services
  └─ Appointments (packageId)

Invoices (customerId)
  └─< InvoiceLineItems (invoiceId); many line-items may reference appointmentId

AuditLogs track changes across entities


------------------------------------------------------------------
4) Rollout Order (Demo-Friendly)
------------------------------------------------------------------
Phase 1:
- Update EVV record with location + supervisor verification.
- Add recurringSchedules; link to appointments via recurringScheduleId.
- Compute performance metrics (onTimeRate, completedAppointments).

Phase 2:
- Add caregiverTimesheets and (optional) timesheetEntries; derive from EVV.
- Add caregiverCompliance with background check/license records.
- Add visitNotes for richer clinical documentation.

Phase 3:
- Add carePlans and carePlanTasks; connect tasks to EVV tasksCompleted.
- Add supervisorReviews (optional); extend audit logging.
- Tighten billing linkage: use verified EVV to generate invoice line-items.

Notes
-----
- Keep JSON server naming: camelCase in app/UI, snake_case in DB if needed by your adapter.
- For demo simplicity, skip security/PII safeguards; in production, lock down compliance docs and GPS.
- Skills-based matching is already supported via skills + caregiverSkills; combine with performance metrics + availability in app logic.
- If you want real-time tracking, reuse caregiverLocations (status + timestamp).

End of document.
