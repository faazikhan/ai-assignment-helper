import express from "express";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (_req, res) => {
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AssignHelp AI</title>

  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2360a5fa'/%3E%3Cstop offset='100%25' stop-color='%231d4ed8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='6' y='6' width='52' height='52' rx='14' fill='url(%23g)'/%3E%3Ccircle cx='24' cy='24' r='5' fill='white'/%3E%3Ccircle cx='40' cy='22' r='4' fill='white'/%3E%3Ccircle cx='40' cy='40' r='5' fill='white'/%3E%3Cpath d='M24 29 C24 36, 29 40, 36 40' stroke='white' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Cpath d='M29 24 C32 22, 35 22, 36 22' stroke='white' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Cpath d='M40 26 L40 35' stroke='white' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E">

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
      color: #111827;
    }

    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 20px 60px;
    }

    h1 {
      font-size: 48px;
      margin: 0 0 28px;
      font-weight: 800;
      letter-spacing: -1px;
    }

    h2 {
      font-size: 22px;
      margin: 0 0 16px;
      font-weight: 700;
    }

    h3 {
      font-size: 18px;
      margin: 18px 0 10px;
    }

    .brandRow {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 10px;
    }

    .brandRow h1 {
      margin: 0;
    }

    .brandLogo {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .siteIntro {
      margin: 0 0 24px;
      max-width: 780px;
      color: #475569;
      font-size: 16px;
      line-height: 1.7;
    }

    .siteIntro p {
      margin: 0 0 12px;
    }

    .siteIntro ul {
      margin-top: 10px;
      padding-left: 20px;
    }

    .siteIntro li {
      margin-bottom: 6px;
    }

    .disclaimerBox {
      margin-top: 10px;
      margin-bottom: 18px;
      padding: 16px 18px;
      border-radius: 12px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      color: #7c2d12;
      font-size: 14px;
      line-height: 1.6;
    }

    .disclaimerBox strong {
      display: block;
      margin-bottom: 6px;
      font-size: 15px;
    }

    .agreeBox {
      margin-top: 0;
      margin-bottom: 24px;
      padding: 14px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }

    .agreeLabel {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: #334155;
      font-size: 15px;
      line-height: 1.5;
      cursor: pointer;
      width: auto;
      margin: 0;
    }

    .agreeLabel input[type="checkbox"] {
      appearance: auto;
      -webkit-appearance: checkbox;
      width: 18px !important;
      height: 18px !important;
      min-width: 18px !important;
      max-width: 18px !important;
      flex: 0 0 18px;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
      outline: none !important;
      transform: none !important;
      accent-color: #2563eb;
      display: inline-block;
      vertical-align: middle;
    }

    .agreeText {
      display: inline-block;
      vertical-align: middle;
    }

    .card {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.6);
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 22px;
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.08);
    }

    input, textarea {
      width: 100%;
      max-width: 100%;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid #dbe3f0;
      background: #f9fbff;
      margin-bottom: 14px;
      font-size: 15px;
      color: #111827;
      outline: none;
      transition: all 0.2s ease;
    }

    input:focus, textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
      background: #ffffff;
    }

    textarea {
      min-height: 150px;
      resize: vertical;
    }

    button {
      padding: 12px 18px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      cursor: pointer;
      margin-right: 8px;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 15px;
      transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
      box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18);
    }

    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 22px rgba(37, 99, 235, 0.24);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .secondary {
      background: #eef2f7;
      color: #111827;
      box-shadow: none;
    }

    .secondary:hover {
      background: #e5eaf2;
      transform: none;
      box-shadow: none;
    }

    .status {
      margin-top: 12px;
      padding: 14px 16px;
      border-radius: 12px;
      display: none;
      font-size: 15px;
      font-weight: 500;
    }

    .status.success {
      display: block;
      background: #dcfce7;
      color: #166534;
    }

    .status.error {
      display: block;
      background: #fee2e2;
      color: #991b1b;
    }

    .muted {
      color: #64748b;
      font-size: 14px;
      margin-top: -4px;
      margin-bottom: 14px;
    }

    #usageBox {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      margin-top: 8px;
      font-weight: 600;
    }

    #historyBox {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 14px;
      min-height: 60px;
    }

    .history-item {
      background: white;
      border: 1px solid #e5e7eb;
      padding: 14px;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04);
    }

    .history-item:last-child {
      margin-bottom: 0;
    }

    #chatBox {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 12px;
      max-height: 500px;
      overflow-y: auto;
      padding-right: 6px;
    }

    .chat-message {
      max-width: 88%;
      padding: 14px 16px;
      border-radius: 16px;
      line-height: 1.6;
      font-size: 15px;
      position: relative;
    }

    .chat-user {
      align-self: flex-end;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      border-bottom-right-radius: 6px;
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.18);
      white-space: pre-wrap;
    }

    .chat-ai {
      align-self: flex-start;
      background: #f8fafc;
      color: #111827;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 6px;
    }

    .chat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 6px;
    }

    .chat-label {
      font-size: 12px;
      font-weight: 700;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .copy-btn {
      background: transparent;
      color: #475569;
      border: 1px solid #dbe3f0;
      box-shadow: none;
      padding: 6px 10px;
      font-size: 13px;
      border-radius: 10px;
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .copy-btn:hover {
      background: #eef2ff;
      color: #1d4ed8;
      border-color: #bfdbfe;
      transform: none;
      box-shadow: none;
    }

    .copy-btn.copied {
      background: #dcfce7;
      color: #166534;
      border-color: #bbf7d0;
    }

    .typing {
      font-style: italic;
      color: #64748b;
    }

    .chat-body h1,
    .chat-body h2,
    .chat-body h3 {
      margin: 10px 0 8px;
      line-height: 1.3;
    }

    .chat-body p {
      margin: 8px 0;
    }

    .chat-body ul,
    .chat-body ol {
      margin: 8px 0 8px 20px;
      padding: 0;
    }

    .chat-body li {
      margin: 6px 0;
    }

    .chat-body strong {
      font-weight: 700;
    }

    .chat-body code {
      background: #eef2ff;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 0.95em;
    }

    .chat-body pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 14px;
      border-radius: 12px;
      overflow-x: auto;
      white-space: pre-wrap;
    }

    .chat-body blockquote {
      border-left: 4px solid #cbd5e1;
      margin: 10px 0;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .history-answer {
      margin-top: 8px;
    }

    .history-answer h1,
    .history-answer h2,
    .history-answer h3 {
      margin: 8px 0 6px;
    }

    .history-answer p {
      margin: 6px 0;
    }

    .history-answer ul,
    .history-answer ol {
      margin: 6px 0 6px 18px;
    }

    @media (max-width: 700px) {
      h1 {
        font-size: 36px;
      }

      .chat-message {
        max-width: 100%;
      }
    }


  </style>
</head>
<body>
<div class="container">

  <div class="brandRow">
    <div class="brandLogo" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="52" height="52">
        <defs>
          <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#60a5fa"></stop>
            <stop offset="100%" stop-color="#1d4ed8"></stop>
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#brandGrad)"></rect>
        <circle cx="24" cy="24" r="5" fill="white"></circle>
        <circle cx="40" cy="22" r="4" fill="white" opacity="0.95"></circle>
        <circle cx="40" cy="40" r="5" fill="white"></circle>
        <path d="M24 29 C24 36, 29 40, 36 40" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"></path>
        <path d="M29 24 C32 22, 35 22, 36 22" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"></path>
        <path d="M40 26 L40 35" stroke="white" stroke-width="3" stroke-linecap="round"></path>
      </svg>
    </div>
    <h1>AssignHelp AI</h1>

  </div>

  <div class="siteIntro">
    <p>
      AssignHelp AI is your smart study support platform designed to help you understand questions, explore key concepts, and build stronger answers with confidence. Get clear, structured, and easy-to-follow explanations to support your learning every step of the way.
    </p>
    <ul>
      <li><strong>New User:</strong> Type your username & password and click <strong>Signup</strong> to create your account.</li>
      <li><strong>Returning User:</strong> Type you username & password and click <strong>Login</strong> to access your account.</li>
      <li><strong>To enable the login and signup buttons, please ensure you have checked the box labeled 'I agree to use this platform for learning purposes only.</strong></li>
      <li><strong>How to use:</strong> Type your question and click <strong>Ask</strong> to receive a detailed explanation.</li>
      <li><strong>Free access:</strong> You get <strong>5 free questions</strong> to try the platform.</li>
      <li><strong>Upgrade:</strong> After reaching the free limit, continue using the service with <strong>Pro</strong> for ongoing access.</li>
    </ul>
  </div>

  <div class="disclaimerBox">
    <strong>Disclaimer:</strong>
    This platform is designed to support learning and understanding of academic concepts. The responses provided are intended as guidance only.
    <br><br>
    Students are expected to use this information to assist their learning and must not copy or submit the content directly as their own work.
    <br><br>
    We do not take any responsibility for misuse of the content, including plagiarism or academic misconduct. Always follow your institution’s academic integrity policies.
  </div>

  <div class="agreeBox">
    <label class="agreeLabel" for="agreeCheckbox">
      <input id="agreeCheckbox" type="checkbox">
      <span class="agreeText">I agree to use this platform for learning purposes only.</span>
    </label>
  </div>

  <div class="card">
    <h2>Account</h2>

    <div id="authForm">
      <input id="email" type="email" placeholder="Email">
      <input id="password" type="password" placeholder="Password">
      <button id="signupBtn">Signup</button>
      <button id="loginBtn">Login</button>
    </div>

    <button id="logoutBtn" class="secondary" style="display:none;">Logout</button>
    <div id="authStatus" class="status"></div>
    <div id="userInfo" class="muted">Not logged in</div>
    <div id="usageBox">Free questions used: 0 / 5</div>
  </div>

  <div class="card">
    <h2>Ask Question</h2>
    <textarea id="question" placeholder="Type your question here..."></textarea>
    <div id="wordCount" class="muted">0 / 100 words</div>

    <div>
      <button id="askBtn">Ask</button>
      <button id="clearHistoryBtn" class="secondary">Clear History</button>
      <button id="refreshHistoryBtn" class="secondary">Refresh History</button>
    </div>

    <div id="askStatus" class="status"></div>

    <h2>Conversation</h2>
    <div id="chatBox"></div>
  </div>

  <div class="card">
    <h2>Saved History</h2>
    <div id="historyBox"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

  <script>
    const SUPABASE_URL = "https://yekfcakmrgjpubqtyqxv.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_mUBE7hZ3g_wCQHRrrF_-3A_Sk3LSEfi";
    const FREE_LIMIT = 5;

    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let currentUser = null;
    let usageCount = 0;

    const authStatus = document.getElementById("authStatus");
    const askStatus = document.getElementById("askStatus");
    const userInfo = document.getElementById("userInfo");
    const usageBox = document.getElementById("usageBox");
    const chatBox = document.getElementById("chatBox");
    const historyBox = document.getElementById("historyBox");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const questionInput = document.getElementById("question");

    const signupBtn = document.getElementById("signupBtn");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const authForm = document.getElementById("authForm");
    const askBtn = document.getElementById("askBtn");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");
    const wordCountBox = document.getElementById("wordCount");
    const agreeCheckbox = document.getElementById("agreeCheckbox");

    function setStatus(el, message, type) {
      el.className = "status " + type;
      el.textContent = message;
    }

    function clearStatus(el) {
      el.className = "status";
      el.textContent = "";
    }

    function updateUsageBox() {
      usageBox.textContent = "Free questions used: " + usageCount + " / " + FREE_LIMIT;
    }

    function updateAuthVisibility() {
      if (currentUser) {
        authForm.style.display = "none";
        logoutBtn.style.display = "inline-block";
      } else {
        authForm.style.display = "block";
        logoutBtn.style.display = "none";
      }
    }

    function updateUserInfo() {
      if (currentUser) {
        userInfo.textContent = "Logged in as: " + currentUser.email;
      } else {
        userInfo.textContent = "Not logged in";
      }
    }

    function updateAuthButtons() {
      const enabled = agreeCheckbox.checked;
      signupBtn.disabled = !enabled;
      loginBtn.disabled = !enabled;
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function safeMarkdownToHtml(text) {
      return marked.parse(String(text || ""));
    }

    async function copyToClipboard(text, button) {
      try {
        await navigator.clipboard.writeText(String(text || ""));
        const original = button.innerHTML;
        button.innerHTML = "✓ Copied";
        button.classList.add("copied");

        setTimeout(() => {
          button.innerHTML = original;
          button.classList.remove("copied");
        }, 1500);
      } catch (error) {
        console.error("Copy failed:", error);
        alert("Copy failed. Please try again.");
      }
    }

    function createCopyButton(textToCopy) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-btn";
      button.innerHTML = "📋 Copy";
      button.addEventListener("click", () => copyToClipboard(textToCopy, button));
      return button;
    }

    function renderChatMessage(role, text) {
      const wrapper = document.createElement("div");
      wrapper.className = "chat-message " + (role === "user" ? "chat-user" : "chat-ai");

      const top = document.createElement("div");
      top.className = "chat-top";

      const label = document.createElement("div");
      label.className = "chat-label";
      label.textContent = role === "user" ? "You" : "AssignHelp AI";

      top.appendChild(label);

      if (role === "ai") {
        top.appendChild(createCopyButton(text));
      }

      const body = document.createElement("div");
      body.className = "chat-body";

      if (role === "user") {
        body.textContent = text;
      } else {
        body.innerHTML = safeMarkdownToHtml(text);
      }

      wrapper.appendChild(top);
      wrapper.appendChild(body);
      chatBox.appendChild(wrapper);
    }

    function clearChatBox() {
      chatBox.innerHTML = "";
    }

    function showTypingMessage() {
      const wrapper = document.createElement("div");
      wrapper.className = "chat-message chat-ai typing";
      wrapper.id = "typingMessage";

      const top = document.createElement("div");
      top.className = "chat-top";

      const label = document.createElement("div");
      label.className = "chat-label";
      label.textContent = "AssignHelp AI";

      top.appendChild(label);

      const body = document.createElement("div");
      body.textContent = "Thinking...";

      wrapper.appendChild(top);
      wrapper.appendChild(body);
      chatBox.appendChild(wrapper);
    }

    function removeTypingMessage() {
      const typingMessage = document.getElementById("typingMessage");
      if (typingMessage) {
        typingMessage.remove();
      }
    }

    function scrollToBottom() {
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: "smooth"
      });
    }

    function updateAskButtonState() {
      const text = questionInput.value.trim();
      askBtn.disabled = !text;
      askBtn.style.opacity = text ? "1" : "0.5";
      askBtn.style.cursor = text ? "pointer" : "not-allowed";
    }

    async function ensureUsageRow() {
      const { data, error } = await sb
        .from("user_usage")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("ensureUsageRow select error:", error);
        throw error;
      }

      if (!data) {
        const { error: insertError } = await sb.from("user_usage").insert({
          user_id: currentUser.id,
          questions_used: 0
        });

        if (insertError) {
          console.error("ensureUsageRow insert error:", insertError);
          throw insertError;
        }

        usageCount = 0;
      } else {
        usageCount = data.questions_used || 0;
      }

      updateUsageBox();
    }

    async function signup() {
      clearStatus(authStatus);

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        setStatus(authStatus, "Please enter email and password.", "error");
        return;
      }

      if (!agreeCheckbox.checked) {
        setStatus(authStatus, "Please confirm that you will use this platform for learning purposes only.", "error");
        return;
      }

      const { data, error } = await sb.auth.signUp({
        email: email,
        password: password
      });

      if (error) {
        setStatus(authStatus, error.message, "error");
        return;
      }

      if (data.user) {
        const { error: profileError } = await sb.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email,
          plan: "free"
        });

        if (profileError) {
          console.error("profile upsert error:", profileError);
        }

        const { error: usageError } = await sb.from("user_usage").upsert({
          user_id: data.user.id,
          questions_used: 0
        });

        if (usageError) {
          console.error("usage upsert error:", usageError);
        }
      }

      setStatus(authStatus, "Signup successful. Now click Login.", "success");
    }

    async function login() {
      clearStatus(authStatus);

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        setStatus(authStatus, "Please enter email and password.", "error");
        return;
      }

      if (!agreeCheckbox.checked) {
        setStatus(authStatus, "Please confirm that you will use this platform for learning purposes only.", "error");
        return;
      }

      const { data, error } = await sb.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        setStatus(authStatus, error.message, "error");
        return;
      }

      currentUser = data.user;
      updateAuthVisibility();
      updateUserInfo();

      try {
        await ensureUsageRow();
        await loadHistory();
        setStatus(authStatus, "Logged in successfully.", "success");
      } catch (err) {
        console.error(err);
        setStatus(authStatus, "Login worked, but loading user data failed.", "error");
      }
    }

    async function logout() {
      await sb.auth.signOut();
      currentUser = null;
      usageCount = 0;
      updateAuthVisibility();
      clearChatBox();
      historyBox.textContent = "No history yet.";
      updateUserInfo();
      updateUsageBox();
      setStatus(authStatus, "Logged out.", "success");
    }

    async function loadHistory() {
      if (!currentUser) return;

      const { data, error } = await sb
        .from("history")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("loadHistory error:", error);
        setStatus(askStatus, "Could not load history.", "error");
        return;
      }

      if (!data || data.length === 0) {
        historyBox.textContent = "No history yet.";
        return;
      }

      let html = "";

      for (const item of data) {
        html += '<div class="history-item">';
        html += '<strong>Q:</strong> ' + escapeHtml(item.question);
        html += '<div class="history-answer"><strong>A:</strong><div>' + safeMarkdownToHtml(item.answer) + '</div></div>';
        html += '</div>';
      }

      historyBox.innerHTML = html;
    }

    async function clearHistory() {
      clearStatus(askStatus);

      if (!currentUser) {
        setStatus(askStatus, "Please login first.", "error");
        return;
      }

      const { error } = await sb
        .from("history")
        .delete()
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("clearHistory error:", error);
        setStatus(askStatus, "Could not clear history.", "error");
        return;
      }

      historyBox.textContent = "No history yet.";
      setStatus(askStatus, "History cleared. Usage count stayed the same.", "success");
    }

    function updateWordCount() {
      const text = questionInput.value.trim();
      const count = text ? text.split(/\\s+/).length : 0;

      wordCountBox.textContent = count + " / 100 words";

      if (count > 100) {
        wordCountBox.style.color = "#b91c1c";
      } else {
        wordCountBox.style.color = "#666";
      }

      updateAskButtonState();
    }

    async function showAiMessage(text) {
      renderChatMessage("ai", text);
      scrollToBottom();
    }

    async function ask() {
      clearStatus(askStatus);

      if (!currentUser) {
        setStatus(askStatus, "Please login first.", "error");
        return;
      }

      if (!agreeCheckbox.checked) {
        setStatus(askStatus, "Please confirm the learning-use checkbox before asking a question.", "error");
        return;
      }

      if (usageCount >= FREE_LIMIT) {
        setStatus(
          askStatus,
          "Free limit reached. Upgrade to continue using AssignHelp AI.",
          "error"
        );
        return;
      }

      const question = questionInput.value.trim();

      if (!question) {
        setStatus(askStatus, "Please enter a question.", "error");
        return;
      }

      const wordCount = question.split(/\\s+/).filter(Boolean).length;

      if (wordCount > 100) {
        setStatus(askStatus, "Question must be 100 words or less.", "error");
        return;
      }

      askBtn.disabled = true;
      askBtn.textContent = "Thinking...";

      renderChatMessage("user", question);
      scrollToBottom();
      showTypingMessage();
      scrollToBottom();

      try {
        const res = await fetch("/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ question: question })
        });

        const data = await res.json();

        removeTypingMessage();

        if (!res.ok) {
          setStatus(askStatus, data.error || "Something went wrong.", "error");
          return;
        }

        await showAiMessage(data.answer);

        usageCount = usageCount + 1;
        updateUsageBox();

        const { data: profile } = await sb
          .from("profiles")
          .select("plan")
          .eq("id", currentUser.id)
          .single();

        const plan = profile?.plan || "free";

        const { error: usageError } = await sb
          .from("user_usage")
          .update({ questions_used: usageCount })
          .eq("user_id", currentUser.id);

        if (usageError) {
          console.error("usage update error:", usageError);
          setStatus(askStatus, "Usage update failed.", "error");
          return;
        }

        const { error: historyError } = await sb.from("history").insert({
          user_id: currentUser.id,
          question: question,
          answer: data.answer
        });

        if (historyError) {
          console.error("history insert error:", historyError);
          setStatus(askStatus, "History save failed.", "error");
          return;
        }

        await loadHistory();

        if (plan === "free" && usageCount >= FREE_LIMIT) {
          setStatus(askStatus, "Free limit reached. Upgrade to continue.", "error");
        } else {
          setStatus(askStatus, "Answer generated successfully.", "success");
        }

        questionInput.value = "";
        updateWordCount();
      } catch (err) {
        console.error("ask error:", err);
        removeTypingMessage();
        setStatus(askStatus, "Failed to generate answer.", "error");
      } finally {
        askBtn.disabled = false;
        askBtn.textContent = "Ask";
        updateAskButtonState();
      }
    }

    async function restoreSession() {
      const { data, error } = await sb.auth.getSession();

      if (error) {
        console.error("restoreSession error:", error);
        return;
      }

      if (data.session && data.session.user) {
        currentUser = data.session.user;
        updateAuthVisibility();
        updateUserInfo();

        try {
          await ensureUsageRow();
          await loadHistory();
        } catch (err) {
          console.error("restoreSession load error:", err);
        }
      } else {
        updateAuthVisibility();
        updateUserInfo();
        updateUsageBox();
      }
    }

    if (signupBtn) signupBtn.addEventListener("click", signup);
    if (loginBtn) loginBtn.addEventListener("click", login);
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
    if (askBtn) askBtn.addEventListener("click", ask);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", clearHistory);
    if (refreshHistoryBtn) refreshHistoryBtn.addEventListener("click", loadHistory);
    if (agreeCheckbox) agreeCheckbox.addEventListener("change", updateAuthButtons);

    if (questionInput) {
      questionInput.addEventListener("input", updateWordCount);
    }

    window.addEventListener("load", async () => {
      updateWordCount();
      updateAskButtonState();
      updateAuthButtons();
      await restoreSession();
    });
  </script>
</div>
</body>
</html>`);
});

app.post("/ask", async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const wordCount = question.split(/\\s+/).filter(Boolean).length;

    if (wordCount > 100) {
      return res.status(400).json({
        error: "Question must be 100 words or less."
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
              text: "You are a helpful academic tutor. Your role is to explain concepts clearly, naturally, and professionally. Write in a human, supportive teaching style. Rules: Give a complete answer unless the question is extremely broad. Use clean markdown formatting. Start with a short overview. Then use helpful headings when appropriate, such as Explanation, Key Points, Example, and Summary. Use bullet points where they improve clarity. If the user asks an academic question, teach the concept instead of pretending to be the student. Do not mention AI writing, plagiarism detection, Turnitin, or how to avoid detection. Avoid robotic phrasing. Do not cut off mid-sentence. For simple questions, answer briefly. For study questions, give a fuller answer with explanation and an example when useful. Keep the answer readable, helpful, and well structured. Do not include follow-up suggestions. Do not add optional next steps. Do not end with offers such as 'If you want, I can also give you', 'I can also help with', or 'Let me know if you want'. End cleanly after the final useful sentence."
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

    const answer = String(response.output_text || "No answer returned.").trim();

    return res.json({ answer });
  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({
      error: "Failed to generate answer."
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});