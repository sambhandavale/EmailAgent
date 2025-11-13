# **Email Agent Service**

A modular **TypeScript + Node.js Email Agent** that automates Gmail operations for multiple users. Supports **reactive** (on-demand) and **proactive** (scheduled) email workflows, making it ideal for applications like Broker Copilot to streamline client communications.

---

## **Features**

* Send emails on-demand or scheduled via Gmail API.
* Read inbox messages and analyze emails automatically.
* Watch inbox with Gmail Pub/Sub for real-time events.
* Multi-user support with OAuth 2.0.
* Scheduled workflows for automated reminders, status updates, or reports.
* Centralized logging, error handling, and secure APIs.
* Modular structure for easy addition of Outlook, IMAP, or other services.

---

## **Architecture**

```
src/
│
├── core/             # DB, OAuth, scheduler, logger, config
├── models/           # User, Workflow, EmailLog schemas
├── services/         # Gmail, Auth, Workflow services
├── controllers/      # API logic for Gmail & workflows
├── routes/           # Modular Express routes
├── middlewares/      # Auth, validation, error handling
├── types/            # Shared TS types/interfaces
└── index.ts          # App entry point
```

* **Proactive workflows:** Scheduler polls the DB and executes pending workflows automatically.
* **Reactive APIs:** Other apps can call `/api/gmail` endpoints for immediate actions.

---

## **Getting Started**

1. Clone the repo:

```bash
git clone https://github.com/yourusername/email-agent.git
cd email-agent
npm install
```

2. Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/email-agent
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/oauth2callback
GMAIL_PUBSUB_TOPIC=projects/your-project/topics/email
JWT_SECRET=your-secret-key
```

3. Run the server:

```bash
npm run build
npm start
```

Server runs on `http://localhost:5000`. Scheduler starts automatically.

---

## **API Endpoints**

### Gmail

* **POST** `/api/gmail`
  Body: `{ action: "send" | "read" | "watch", data: {...} }`

**Example: Send Email**

```json
{
  "action": "send",
  "data": {
    "userId": "user123",
    "to": "client@example.com",
    "subject": "Policy Renewal",
    "body": "Your policy is expiring soon."
  }
}
```

### Workflow

* **POST** `/api/workflow/run`
  Manually trigger all pending workflows.

---

## **Use Case Example**

* **Broker Copilot:** Automatically sends policy renewal reminders, tracks client responses, and updates workflow status. Scheduler executes workflows every 2 minutes, ensuring **proactive email automation**.

---

## **Why Use This Agent**

* Fully **modular & extendable** for multiple email providers.
* Supports **multi-user automation**.
* Handles both **reactive API calls** and **proactive scheduled workflows**.
* **Centralized logging and error handling** for production readiness.

