import express from "express";
import OpenAI from "openai";
import crypto from "crypto";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;
const FREE_QUESTION_LIMIT = 5;
const COOKIE_NAME = "assignment_helper_session";

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

const client = new OpenAI({ apiKey });

app.use(express.json({ limit: "1mb" }));

const adapter = new JSONFile(path.join(__dirname, "db.json"));
const db = new Low(adapter, {
  users: [],
  sessions: []
});
await db.read();
db.data ||= { users: [], sessions: [] };
await db.write();

function makeId() {
  return crypto.randomUUID();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, originalHash] = String(stored || "").split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const idx = part.indexOf("=");
        return [decodeURIComponent(part.slice(0, idx)), decodeURIComponent(part.slice(idx + 1))];
      })
  );
}

function setSessionCookie(res, sessionToken) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  );
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function getSessionRecord(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return db.data.sessions.find((s) => s.token === token) || null;
}

function getCurrentUser(req) {
  const session = getSessionRecord(req);
  if (!session) return null;
  return db.data.users.find((u) => u.id === session.userId) || null;
}

function requireUser(req, res) {
  const user = getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: "Please sign in first." });
    return null;
  }
  return user;
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    plan: user.plan,
    questionsUsed: user.questionsUsed,
    freeLimit: FREE_QUESTION_LIMIT
  };
}

function formatAssistantAnswer(rawText) {
  return String(rawText || "").replace(/\r\n/g, "\n").trim();
}

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Assignment Helper</title>
  <style>
    :root {
      --bg: #f5f7fb;
      --panel: #ffffff;
      --text: #14213d;
      --muted: #667085;
      --line: #e6ecf5;
      --primary: #2563eb;
      --primary-strong: #1d4ed8;
      --primary-soft: #eef4ff;
      --chat-user: #edf4ff;
      --chat-ai: #ffffff;
      --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      --error-bg: #fff1f2;
      --error-text: #b42318;
      --warn-bg: #fff7ed;
      --warn-text: #b54708;
      --success-bg: #ecfdf3;
      --success-text: #067647;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      color: var(--text);
      background: linear-gradient(180deg, #eef4ff 0%, #f8fbff 36%, #f5f7fb 100%);
    }
    .layout {
      max-width: 1220px;
      margin: 0 auto;
      padding: 24px;
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 24px;
      min-height: 100vh;
    }
    .sidebar, .main-panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 24px;
      box-shadow: var(--shadow);
    }
    .sidebar {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      height: fit-content;
      position: sticky;
      top: 24px;
    }
    .badge {
      display: inline-flex;
      align-self: flex-start;
      padding: 8px 14px;
      border-radius: 999px;
      background: var(--primary-soft);
      color: var(--primary);
      font-weight: 700;
      font-size: 13px;
    }
    .brand h1 {
      margin: 10px 0 8px;
      font-size: 30px;
      line-height: 1.1;
    }
    .brand p {
      margin: 0;
      color: var(--muted);
      line-height: 1.5;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 16px;
      background: #fbfdff;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .stat-value {
      font-weight: 800;
      color: var(--primary);
    }
    .progress {
      width: 100%;
      height: 10px;
      background: #e9eef7;
      border-radius: 999px;
      overflow: hidden;
      margin-top: 10px;
    }
    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--primary), #60a5fa);
      border-radius: 999px;
      transition: width 0.25s ease;
    }
    .history-card h3, .auth-card h3 {
      margin: 0 0 8px;
      font-size: 18px;
    }
    .history-card p, .auth-card p {
      margin: 0;
      color: var(--muted);
      line-height: 1.5;
    }
    .history-list {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 280px;
      overflow: auto;
    }
    .history-item {
      text-align: left;
      background: white;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 12px;
      font-weight: 600;
      color: var(--text);
    }
    .history-item small {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-weight: 500;
    }
    .main-panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: calc(100vh - 48px);
    }
    .chat-wrap {
      padding: 20px 22px 14px;
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      min-height: 420px;
    }
    .empty-state {
      margin: auto 0;
      text-align: center;
      padding: 32px 20px;
    }
    .empty-state h2 {
      font-size: 40px;
      margin: 0 0 12px;
    }
    .empty-state p {
      color: var(--muted);
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .msg {
      max-width: 86%;
      border-radius: 22px;
      padding: 16px 18px;
      border: 1px solid var(--line);
      line-height: 1.65;
      white-space: pre-wrap;
    }
    .msg.user {
      align-self: flex-end;
      background: var(--chat-user);
      border-color: #d8e5ff;
    }
    .msg.ai {
      align-self: flex-start;
      background: var(--chat-ai);
    }
    .msg-header {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .typing {
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }
    .typing span {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #9cb0d0;
      animation: bounce 1.2s infinite ease-in-out;
    }
    .typing span:nth-child(2) { animation-delay: 0.15s; }
    .typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.75); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
    .composer {
      border-top: 1px solid var(--line);
      padding: 18px 22px 22px;
      background: #fcfdff;
    }
    .input-shell {
      border: 1px solid var(--line);
      border-radius: 22px;
      background: white;
      padding: 14px;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
    }
    textarea, input {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 14px;
      outline: none;
      font: inherit;
      color: var(--text);
      background: white;
      padding: 12px 14px;
    }
    textarea {
      min-height: 100px;
      resize: vertical;
      border: 0;
      padding: 0;
      border-radius: 0;
    }
    .composer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .mini-note {
      color: var(--muted);
      font-size: 13px;
    }
    .btn-row, .auth-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    button {
      border: 0;
      border-radius: 16px;
      padding: 12px 18px;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }
    .primary-btn {
      background: var(--primary);
      color: white;
    }
    .primary-btn:hover { background: var(--primary-strong); }
    .soft-btn {
      background: #edf2ff;
      color: var(--primary);
    }
    .danger-btn {
      background: #fff1f2;
      color: #b42318;
    }
    .status {
      display: none;
      margin-top: 12px;
      padding: 14px 16px;
      border-radius: 16px;
      font-weight: 700;
    }
    .status.info {
      background: #eef4ff;
      color: var(--primary);
    }
    .status.error {
      background: var(--error-bg);
      color: var(--error-text);
    }
    .status.warn {
      background: var(--warn-bg);
      color: var(--warn-text);
    }
    .status.success {
      background: var(--success-bg);
      color: var(--success-text);
    }
    .auth-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 12px;
    }
    .auth-note {
      font-size: 13px;
      color: var(--muted);
      margin-top: 8px;
    }
    .user-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary-soft);
      color: var(--primary);
      padding: 10px 14px;
      border-radius: 999px;
      font-weight: 700;
    }
    @media (max-width: 980px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { position: static; }
      .main-panel { min-height: auto; }
      .msg { max-width: 100%; }
      .empty-state h2 { font-size: 30px; }
    }
  </style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <div class="badge">Assignment AI</div>
        <h1>Study smarter</h1>
        <p>Chat-style assignment help with user accounts, persistent history, and a five-question free limit.</p>
      </div>

      <div class="card auth-card">
        <h3>Account</h3>
        <p id="authSubtext">Create an account or sign in to keep your quota and history saved.</p>

        <div id="loggedOutView" class="auth-stack">
          <input id="emailInput" type="email" placeholder="Email address" />
          <input id="passwordInput" type="password" placeholder="Password" />
          <div class="auth-row">
            <button class="primary-btn" id="signupBtn" type="button">Sign Up</button>
            <button class="soft-btn" id="loginBtn" type="button">Log In</button>
          </div>
          <div class="auth-note">Local demo auth only. Great for testing before adding real production auth later.</div>
        </div>

        <div id="loggedInView" style="display:none; margin-top: 12px;">
          <div class="user-chip" id="userChip"></div>
          <div class="auth-row" style="margin-top: 12px;">
            <button class="danger-btn" id="logoutBtn" type="button">Log Out</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="stat-row">
          <span>Free questions used</span>
          <span class="stat-value" id="usedCount">0 / 5</span>
        </div>
        <div class="progress"><div class="progress-fill" id="progressFill"></div></div>
      </div>

      <div class="card history-card">
        <h3>Recent questions</h3>
        <p>History can be cleared without resetting quota.</p>
        <div class="history-list" id="historyList"></div>
      </div>
    </aside>

    <main class="main-panel">
      <section class="chat-wrap" id="chatWrap">
        <div class="empty-state" id="emptyState">
          <h2>Ask anything about your assignment</h2>
          <p>Sign in first, then get clearer explanations, cleaner structure, and step-by-step help in a chat-style layout.</p>
        </div>
      </section>

      <section class="composer">
        <div class="input-shell">
          <textarea id="question" placeholder="Paste your assignment question here..." disabled></textarea>
          <div class="composer-actions">
            <div class="mini-note">Press Enter to send. Shift + Enter for a new line.</div>
            <div class="btn-row">
              <button class="soft-btn" id="newChatBtn" type="button">New Chat</button>
              <button class="danger-btn" id="clearHistoryBtn" type="button">Clear History</button>
              <button class="primary-btn" id="askBtn" disabled>Send</button>
            </div>
          </div>
        </div>
        <div class="status info" id="status"></div>
      </section>
    </main>
  </div>

  <script>
    const FREE_LIMIT = 5;

    const askBtn = document.getElementById("askBtn");
    const signupBtn = document.getElementById("signupBtn");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const newChatBtn = document.getElementById("newChatBtn");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    const questionEl = document.getElementById("question");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const chatWrap = document.getElementById("chatWrap");
    const statusEl = document.getElementById("status");
    const emptyState = document.getElementById("emptyState");
    const usedCount = document.getElementById("usedCount");
    const progressFill = document.getElementById("progressFill");
    const historyList = document.getElementById("historyList");
    const loggedOutView = document.getElementById("loggedOutView");
    const loggedInView = document.getElementById("loggedInView");
    const userChip = document.getElementById("userChip");
    const authSubtext = document.getElementById("authSubtext");

    let typingNode = null;
    let currentUser = null;

    function showStatus(message, type = "info") {
      statusEl.style.display = "block";
      statusEl.className = "status " + type;
      statusEl.textContent = message;
    }

    function hideStatus() {
      statusEl.style.display = "none";
      statusEl.textContent = "";
      statusEl.className = "status info";
    }

    function createMessage(role, content) {
      emptyState.style.display = "none";
      const msg = document.createElement("div");
      msg.className = "msg " + role;

      const header = document.createElement("div");
      header.className = "msg-header";
      header.textContent = role === "user" ? "You" : "AI Helper";

      const body = document.createElement("div");
      body.textContent = content;

      msg.appendChild(header);
      msg.appendChild(body);
      chatWrap.appendChild(msg);
      chatWrap.scrollTop = chatWrap.scrollHeight;
    }

    function resetChatView() {
      chatWrap.innerHTML = "";
      chatWrap.appendChild(emptyState);
      emptyState.style.display = "block";
    }

    function showTyping() {
      emptyState.style.display = "none";
      typingNode = document.createElement("div");
      typingNode.className = "msg ai";
      typingNode.innerHTML = '<div class="msg-header">AI Helper</div><div class="typing"><span></span><span></span><span></span></div>';
      chatWrap.appendChild(typingNode);
      chatWrap.scrollTop = chatWrap.scrollHeight;
    }

    function hideTyping() {
      if (typingNode) {
        typingNode.remove();
        typingNode = null;
      }
    }

    function updateUsage(count) {
      usedCount.textContent = count + " / " + FREE_LIMIT;
      progressFill.style.width = Math.min((count / FREE_LIMIT) * 100, 100) + "%";
    }

    function renderHistory(history) {
      historyList.innerHTML = "";
      if (!history.length) {
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = "No questions yet.<small>Your recent prompts will appear here.</small>";
        historyList.appendChild(item);
        return;
      }

      history.slice().reverse().forEach((entry) => {
        const btn = document.createElement("button");
        btn.className = "history-item";
        btn.type = "button";
        btn.innerHTML = entry.question.slice(0, 90) + (entry.question.length > 90 ? "..." : "") + "<small>Click to reuse this question</small>";
        btn.addEventListener("click", () => {
          questionEl.value = entry.question;
          questionEl.focus();
        });
        historyList.appendChild(btn);
      });
    }

    function renderMessages(history) {
      resetChatView();
      if (!history.length) return;
      history.forEach((entry) => {
        createMessage("user", entry.question);
        createMessage("ai", entry.answer);
      });
    }

    function setAuthUI(user) {
      currentUser = user;
      const loggedIn = !!user;
      loggedOutView.style.display = loggedIn ? "none" : "flex";
      loggedInView.style.display = loggedIn ? "block" : "none";
      askBtn.disabled = !loggedIn;
      questionEl.disabled = !loggedIn;
      clearHistoryBtn.disabled = !loggedIn;
      newChatBtn.disabled = !loggedIn;

      if (loggedIn) {
        userChip.textContent = user.email + " • " + user.plan;
        authSubtext.textContent = "Your account keeps history and usage saved in the local database.";
      } else {
        userChip.textContent = "";
        authSubtext.textContent = "Create an account or sign in to keep your quota and history saved.";
        updateUsage(0);
        renderHistory([]);
        resetChatView();
      }
    }

    async function fetchJSON(url, options = {}) {
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
      });
      const data = await response.json();
      if (!response.ok) {
        throw data;
      }
      return data;
    }

    async function loadMe() {
      try {
        const data = await fetchJSON("/api/me");
        setAuthUI(data.user);
        updateUsage(data.user.questionsUsed || 0);
        renderHistory(data.history || []);
        renderMessages(data.history || []);
      } catch {
        setAuthUI(null);
      }
    }

    async function signUp() {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      if (!email || !password) {
        showStatus("Please enter email and password.", "error");
        return;
      }
      try {
        const data = await fetchJSON("/api/signup", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
        setAuthUI(data.user);
        updateUsage(data.user.questionsUsed || 0);
        renderHistory([]);
        resetChatView();
        hideStatus();
      } catch (error) {
        showStatus(error.error || "Could not sign up.", "error");
      }
    }

    async function logIn() {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      if (!email || !password) {
        showStatus("Please enter email and password.", "error");
        return;
      }
      try {
        const data = await fetchJSON("/api/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
        setAuthUI(data.user);
        updateUsage(data.user.questionsUsed || 0);
        renderHistory(data.history || []);
        renderMessages(data.history || []);
        hideStatus();
      } catch (error) {
        showStatus(error.error || "Could not log in.", "error");
      }
    }

    async function logOut() {
      try {
        await fetchJSON("/api/logout", { method: "POST", body: JSON.stringify({}) });
      } catch {
        // ignore
      }
      setAuthUI(null);
      hideStatus();
    }

    async function askQuestion() {
      const question = questionEl.value.trim();
      if (!question) {
        showStatus("Please enter a question first.", "error");
        return;
      }

      hideStatus();
      askBtn.disabled = true;
      askBtn.textContent = "Sending...";
      createMessage("user", question);
      showTyping();

      try {
        const data = await fetchJSON("/api/answer", {
          method: "POST",
          body: JSON.stringify({ question })
        });

        hideTyping();
        createMessage("ai", data.answer);
        updateUsage(data.user.questionsUsed || 0);
        renderHistory(data.history || []);
        questionEl.value = "";
      } catch (error) {
        hideTyping();
        showStatus(error.error || "Something went wrong.", error.limitReached ? "warn" : "error");
      } finally {
        askBtn.disabled = !currentUser;
        askBtn.textContent = "Send";
      }
    }

    async function clearHistory() {
      try {
        const data = await fetchJSON("/api/history", { method: "DELETE", body: JSON.stringify({}) });
        renderHistory(data.history || []);
        resetChatView();
        updateUsage(data.user.questionsUsed || 0);
        showStatus("History cleared. Your free usage count stayed the same.", "success");
      } catch (error) {
        showStatus(error.error || "Could not clear history.", "error");
      }
    }

    signupBtn.addEventListener("click", signUp);
    loginBtn.addEventListener("click", logIn);
    logoutBtn.addEventListener("click", logOut);
    askBtn.addEventListener("click", askQuestion);
    clearHistoryBtn.addEventListener("click", clearHistory);
    newChatBtn.addEventListener("click", () => {
      resetChatView();
      hideStatus();
      questionEl.value = "";
      questionEl.focus();
    });

    questionEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        askQuestion();
      }
    });

    loadMe();
  </script>
</body>
</html>`);
});

app.post("/api/signup", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const existing = db.data.users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const user = {
    id: makeId(),
    email,
    passwordHash: hashPassword(password),
    plan: "free",
    questionsUsed: 0,
    history: [],
    createdAt: new Date().toISOString()
  };

  db.data.users.push(user);
  const session = { token: makeId(), userId: user.id, createdAt: new Date().toISOString() };
  db.data.sessions.push(session);
  await db.write();
  setSessionCookie(res, session.token);

  return res.json({ user: publicUser(user), history: user.history });
});

app.post("/api/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const user = db.data.users.find((u) => u.email === email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const session = { token: makeId(), userId: user.id, createdAt: new Date().toISOString() };
  db.data.sessions.push(session);
  await db.write();
  setSessionCookie(res, session.token);

  return res.json({ user: publicUser(user), history: user.history });
});

app.post("/api/logout", async (req, res) => {
  const session = getSessionRecord(req);
  if (session) {
    db.data.sessions = db.data.sessions.filter((s) => s.token !== session.token);
    await db.write();
  }
  clearSessionCookie(res);
  return res.json({ ok: true });
});

app.get("/api/me", (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: "Not signed in." });
  }
  return res.json({ user: publicUser(user), history: user.history });
});

app.delete("/api/history", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;

  user.history = [];
  await db.write();

  return res.json({ user: publicUser(user), history: user.history });
});

app.post("/api/answer", async (req, res) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const question = String(req.body?.question || "").trim();
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    if (user.plan === "free" && user.questionsUsed >= FREE_QUESTION_LIMIT) {
      return res.status(403).json({
        error: `You have reached the free limit of ${FREE_QUESTION_LIMIT} questions.`,
        limitReached: true
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are an academic tutor. Give clear, structured, step-by-step help. Use headings when helpful. Use bullet points when useful. Do not help users cheat. Focus on explanation, learning, and practical guidance."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: question
            }
          ]
        }
      ]
    });

    const answer = formatAssistantAnswer(response.output_text || "No answer returned.");

    user.questionsUsed += 1;
    user.history.push({
      id: makeId(),
      question,
      answer,
      createdAt: new Date().toISOString()
    });
    user.history = user.history.slice(-20);
    await db.write();

    return res.json({
      answer,
      history: user.history,
      user: publicUser(user)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error?.message || "Server error while generating answer."
    });
  }
});

app.listen(port, () => {
  console.log("AI Assignment Helper running on http://localhost:" + port);
});
