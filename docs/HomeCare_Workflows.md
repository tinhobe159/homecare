# HomeCare System Workflows

## 🏥 System Overview

This HomeCare system supports three primary components:
- **Command Center** (Admin Portal)
- **Customer App**
- **Caregiver App**

Supports:
- All homecare services (elderly care, nursing, therapy, cleaning, etc.)
- Real-time GPS tracking, chat, and notifications
- Payments: Cash, Card, Bank Transfer
- Recurring schedules via RRULE
- Role-based access: Admin, Sales, Customer, Caregiver

---

## 1. 📥 Service Request Creation

### Actors:
- Customer (or Admin/Sales on their behalf)
- Backend System

### Workflow:
1. Customer selects service, time, and recurrence
2. Enters address, duration, notes
3. Chooses payment method (cash/card/bank)
4. Confirms and submits
5. Backend validates and stores as “Pending”

### Notifications:
- Confirmation to customer
- Alert to admin/coordinator

---

## 2. 👩‍⚕️ Caregiver Matching & Assignment

### Actors:
- Admin (optional)
- Matching Algorithm
- Caregiver(s)
- Customer

### Matching:
- Filters caregivers by skill, location, availability
- Admin manually assigns or lets system auto-match
- Caregiver can accept/decline if enabled

### Notifications:
- Offer sent to caregiver
- Assignment confirmation to customer
- Admin alerted of any delays

---

## 3. 📆 Scheduling & Recurrence

### Actors:
- Customer
- Caregiver
- Admin
- Scheduler System

### Logic:
- RRULE used for recurrence (weekly, monthly, etc.)
- Caregiver availability & time-off honored
- Reassignment triggered if conflicts arise

### Notifications:
- Schedule reminders
- Reschedule alerts
- Admin notifications for conflicts

---

## 4. 🚗 Service Delivery & Tracking

### Actors:
- Caregiver
- Customer
- Admin

### Steps:
1. Caregiver receives reminder, starts travel
2. Real-time GPS sent to backend
3. Caregiver checks in (with GPS + timestamp)
4. Performs tasks (checklist, notes)
5. Checks out, confirms work done
6. Customer signs (optional)

### Data:
- Timestamps
- GPS locations (EVV compliance)
- Task status and notes

---

## 5. 💳 Payment Workflow

### Payment Methods:
- Cash: Caregiver collects, admin verifies
- Card: Charged after service, auto or manual
- Bank Transfer: Client pays to bank, admin marks paid

### Notifications:
- Receipts or reminders
- Admin alerts for failed or late payments

### Data:
- Payment status per appointment
- Method, amount, transaction ID

---

## 6. ⭐ Feedback and Quality Control

### Actors:
- Customer
- Caregiver (internal notes)
- Admin

### Workflow:
- Rating and comment prompt post-service
- Admin reviews low feedback
- Action: follow-up, reassignment, training

### Notifications:
- Rating requests
- Admin alerts for bad ratings
- Caregiver praise or warning

---

## 🔐 Role Overview

- **Admin**: Full access; schedules, manages users, billing
- **Sales/Support**: Assist bookings, limited admin rights
- **Customer**: Book, pay, view status
- **Caregiver**: View schedule, perform service, check-in/out

---

## ✅ Real-Time Capabilities

- Push notifications for all major events
- In-app chat (Customer ⟷ Caregiver)
- Real-time GPS caregiver tracking
- Live admin dashboard for oversight

---

## 🧠 Scheduling Engine Highlights

- RRULE-based recurrence
- Dynamic reassignment if caregiver unavailable
- Supports split assignments for recurring series
- Real-time validation of conflicts & overlaps

---

## 📌 Data Integrity & Logs

- All status changes timestamped
- All interactions auditable (e.g., who reassigned, who paid)
- EVV-compliant location verification

---

## 🗂️ Summary

This HomeCare system ensures:
- Transparent service lifecycle
- Efficient admin coordination
- Reliable caregiver scheduling
- Trust & visibility for customers

Ideal for real-world use across diverse care settings.

