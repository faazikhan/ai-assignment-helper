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
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.5;
    }
    h1, h2 {
      margin-bottom: 12px;
    }
    input, textarea, button {
      font: inherit;
    }
    input, textarea {
      width: 100%;
      max-width: 600px;
      padding: 10px;
      margin-bottom: 12px;
      border: 1px solid #bbb;
      border-radius: 6px;
    }
    textarea {
      min-height: 120px;
      resize: vertical;
    }
    button {
      padding: 10px 16px;
      margin-right: 8px;
      margin-bottom: 8px;
      border: 1px solid #999;
      border-radius: 6px;
      background: #f5f5f5;
      cursor: pointer;
    }
    button:hover {
      background: #ececec;
    }
    .row {
      margin-bottom: 24px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 24px;
    }
    .status {
      margin: 12px 0;
      padding: 10px 12px;
      border-radius: 6px;
      display: none;
    }
    .status.info {
      display: block;
      background: #eef4ff;
    }
    .status.error {
      display: block;
      background: #fff0f0;
      color: #a00000;
    }
    .status.success {
      display: block;
      background: #eefbf0;
      color: #0d6b2f;
    }
    .muted {
      color: #666;
      font-size: 14px;
    }
    #answer {
      white-space: pre-wrap;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 14px;
      min-height: 80px;
      background: #fafafa;
    }
    #usageBox, #historyBox {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 12px;
      background: #fafafa;
      margin-top: 10px;
    }
    .history-item {
      border-bottom: 1px solid #e3e3e3;
      padding: 10px 0;
    }
    .history-item:last-child {
      border-bottom: none;
    }
  </style>
</head>
<body>
  <h1>AssignHelp AI</h1>

  <div class="row">
    <h2>Signup / Login</h2>
    <input id="email" type="email" placeholder="Email">
    <input id="password" type="password" placeholder="Password">
    <div>
      <button id="signupBtn">Signup</button>
      <button id="loginBtn">Login</button>
      <button id="logoutBtn">Logout</button>
    </div>
    <div id="authStatus" class="status"></div>
    <div id="userInfo" class="muted">Not logged in</div>
    <div id="usageBox">Free questions used: 0 / 5</div>
  </div>

  <div class="row">
    <h2>Ask Question</h2>
    <textarea id="question" placeholder="Type your question here..."></textarea>
    <div>
      <button id="askBtn">Ask</button>
      <button id="clearHistoryBtn">Clear History</button>
      <button id="refreshHistoryBtn">Refresh History</button>
    </div>
    <div id="askStatus" class="status"></div>
    <h2>Answer</h2>
    <div id="answer"></div>
  </div>

  <div class="row">
    <h2>History</h2>
    <div id="historyBox">No history yet.</div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
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
    const answerBox = document.getElementById("answer");
    const historyBox = document.getElementById("historyBox");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const questionInput = document.getElementById("question");

    const signupBtn = document.getElementById("signupBtn");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const askBtn = document.getElementById("askBtn");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");

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

    function updateUserInfo() {
      if (currentUser) {
        userInfo.textContent = "Logged in as: " + currentUser.email;
      } else {
        userInfo.textContent = "Not logged in";
      }
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
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

      const { data, error } = await sb.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        setStatus(authStatus, error.message, "error");
        return;
      }

      currentUser = data.user;
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
      answerBox.textContent = "";
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
        html += '<strong>Q:</strong> ' + escapeHtml(item.question) + '<br>';
        html += '<strong>A:</strong> ' + escapeHtml(item.answer);
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

 async function ask() {
  clearStatus(askStatus);

  if (!currentUser) {
    setStatus(askStatus, "Please login first.", "error");
    return;
  }

  if (usageCount >= FREE_LIMIT) {
    setStatus(askStatus, "Free limit reached.", "error");
    return;
  }

  const question = questionInput.value.trim();

  if (!question) {
    setStatus(askStatus, "Please enter a question.", "error");
    return;
  }

  const wordCount = question.split(/\s+/).filter(Boolean).length;

  if (wordCount > 100) {
    setStatus(askStatus, "Question must be 100 words or less.", "error");
    return;
  }

  const res = await fetch("/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question: question })
  });

  const data = await res.json();

  if (!res.ok) {
    setStatus(askStatus, data.error || "Something went wrong.", "error");
    return;
  }

  answerBox.textContent = data.answer;

  usageCount = usageCount + 1;
  updateUsageBox();

  const { error: usageError } = await sb
    .from("user_usage")
    .update({ questions_used: usageCount })
    .eq("user_id", currentUser.id);

  if (usageError) {
    console.error("usage update error:", usageError);
    setStatus(askStatus, "Answer worked, but usage update failed.", "error");
    return;
  }

  const { error: historyError } = await sb.from("history").insert({
    user_id: currentUser.id,
    question: question,
    answer: data.answer
  });

  if (historyError) {
    console.error("history insert error:", historyError);
    setStatus(askStatus, "Answer worked, but history save failed.", "error");
    return;
  }

  await loadHistory();
  setStatus(askStatus, "Answer generated successfully.", "success");
}

    async function restoreSession() {
      const { data, error } = await sb.auth.getSession();

      if (error) {
        console.error("restoreSession error:", error);
        return;
      }

      if (data.session && data.session.user) {
        currentUser = data.session.user;
        updateUserInfo();

        try {
          await ensureUsageRow();
          await loadHistory();
        } catch (err) {
          console.error("restoreSession load error:", err);
        }
      } else {
        updateUserInfo();
        updateUsageBox();
      }
    }

    signupBtn.addEventListener("click", signup);
    loginBtn.addEventListener("click", login);
    logoutBtn.addEventListener("click", logout);
    askBtn.addEventListener("click", ask);
    clearHistoryBtn.addEventListener("click", clearHistory);
    refreshHistoryBtn.addEventListener("click", loadHistory);

    window.addEventListener("load", restoreSession);
  </script>
</body>
</html>`);
});

app.post("/ask", async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const wordCount = question.split(/\s+/).filter(Boolean).length;

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
              text: "You are a helpful academic tutor. Always answer in 250 to 300 words or fewer. Even if the user asks for a longer answer, never exceed 250 to 300 words. Be clear, direct, and concise. Give dot points. Teach them rather giving them direct answer as we dont want them to cheat. Alway give a full stop (.) at the end."
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

    let answer = response.output_text || "No answer returned.";

    const answerWords = answer.split(/\s+/).filter(Boolean);
    if (answerWords.length > 250) {
      answer = answerWords.slice(0, 250).join(" ");
    }

    return res.json({
      answer: answer
    });
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