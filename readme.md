# 📧 Email Agent

An intelligent **Email Agent** that connects to Gmail using the Google API, fetches emails, and enables sending new ones.
This is the base module for a larger multi-agent automation system (including calendar, scheduling, and summarization agents).

---

## 🚀 Features

* 🔐 Secure Google OAuth2 authentication
* 📥 Fetch emails from Gmail using the Gmail API
* 📤 Send new emails via authenticated Gmail accounts
* 🧩 Modular design — supports both **TypeScript** and **Python** versions
* ⚙️ Ready to extend for:

  * Email classification (priority, intent detection, etc.)
  * Meeting scheduling
  * AI-based summarization and response automation

---

## 🏗️ Project Structure

```
email-agent/
├── ts-version/
│   ├── src/
│   │   ├── index.ts
│   │   ├── db.ts
│   │   ├── routes.ts
│   │   ├── utils.ts
│   │   ├── daemon.ts
│   │   ├── types.ts
│   │ 
│   ├── package.json
│   └── README.md
│
├── python-version/             # Python version
│
└── README.md
```

---

## ⚙️ Setup

### 1️⃣ Create Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable the **Gmail API**.
3. Create **OAuth 2.0 credentials** → `Web application`.
4. Add redirect URI:

   ```
   {{url}}/auth/callback
   ```
5. Download the `credentials.json` file and place it in your project root.

---

### 2️⃣ Environment Variables

Create a `.env` file in both versions with:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://localhost:5000/auth/callback
REFRESH_TOKEN=your_refresh_token
PORT=5000
```

---

### 3️⃣ Run

#### 🟦 TypeScript version

```bash
cd ts-version
npm install
npm run dev
```

#### 🐍 Python version

```bash
cd python-version
pip install -r requirements.txt
python app.py
```

---

## 🧠 How It Works

1. User authenticates using **Google OAuth2**.
2. The agent retrieves a secure access token.
3. It uses Gmail API to:

   * Fetch messages from the inbox.
   * Send outgoing emails on behalf of the user.
4. Future modules will add:

   * AI classification for prioritizing emails.
   * Calendar and task synchronization.
   * Automated email summarization and response suggestions.

---

## 📌 Roadmap

* [ ] Add email priority classification (AI/NLP based)
* [ ] Integrate Google Calendar Agent
* [ ] Add Notion task creation
* [ ] Add meeting summarization (transcript → summary → tasks)

