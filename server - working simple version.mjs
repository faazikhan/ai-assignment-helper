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
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  background: #f5f7fb;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

h1, h2 {
  margin-top: 0;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

input, textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 12px;
  font-size: 14px;
}

textarea {
  min-height: 140px;
  resize: vertical;
}

button {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: white;
  cursor: pointer;
  margin-right: 8px;
  margin-bottom: 8px;
}

button:hover {
  background: #1d4ed8;
}

.secondary {
  background: #e5e7eb;
  color: black;
}

.secondary:hover {
  background: #d1d5db;
}

.status {
  margin-top: 10px;
  padding: 10px;
  border-radius: 8px;
  display: none;
}

.status.success {
  display: block;
  background: #dcfce7;
}

.status.error {
  display: block;
  background: #fee2e2;
}

#answer {
  background: #f9fafb;
  padding: 15px;
  border-radius: 10px;
  white-space: pre-wrap;
  margin-top: 10px;
  min-height: 80px;
}

.history-item {
  background: #f9fafb;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
.muted {
  color: #666;
  font-size: 14px;
  margin-top: -4px;
  margin-bottom: 12px;
}
}

textarea {
  width: 100%;
  max-width: 100%;
}

button {
  border-radius: 8px;
  padding: 10px 16px;
}

.status.success {
  background: #d1fae5;
}

.status.error {
  background: #fee2e2;
}

</style>
</head>
<body>
<div class="container">
  <h1>AssignHelp AI</h1>

  <div class="card">
<h2>Account</h2>
    <input id="email" type="email" placeholder="Email">
    <input id="password" type="password" placeholder="Password">
    <div>
      <button id="signupBtn">Signup</button>
<button id="loginBtn">Login</button>
<button id="logoutBtn" class="secondary">Logout</button>
    </div>
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
    <h2>Answer</h2>
    <div id="answer"></div>
  </div>

  <div class="card">
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
    const wordCountBox = document.getElementById("wordCount");

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

function updateAskButtonState() {
  const text = questionInput.value.trim();

  if (!text) {
    askBtn.disabled = true;
    askBtn.style.opacity = "0.5";
    askBtn.style.cursor = "not-allowed";
  } else {
    askBtn.disabled = false;
    askBtn.style.opacity = "1";
    askBtn.style.cursor = "pointer";
  }
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
async function ask() {
  clearStatus(askStatus);

  if (!currentUser) {
    setStatus(askStatus, "Please login first.", "error");
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
  answerBox.textContent = "Generating answer...";

  try {
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
      answerBox.textContent = "";
      return;
    }

    answerBox.textContent = data.answer;

    usageCount = usageCount + 1;
    updateUsageBox();


const { data: profile } = await sb
  .from("profiles")
  .select("plan")
  .eq("id", currentUser.id)
  .single();

const plan = profile?.plan || "free";

if (plan === "free" && usageCount >= FREE_LIMIT) {
  setStatus(askStatus, "Free limit reached. Upgrade to continue.", "error");
  return;
}



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
    setStatus(askStatus, "Answer generated successfully.", "success");
questionInput.value = "";
updateWordCount();
  } finally {
    askBtn.disabled = false;
    askBtn.textContent = "Ask";
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

if (signupBtn) signupBtn.addEventListener("click", signup);
if (loginBtn) loginBtn.addEventListener("click", login);
if (logoutBtn) logoutBtn.addEventListener("click", logout);
if (askBtn) askBtn.addEventListener("click", ask);
if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", clearHistory);
if (refreshHistoryBtn) refreshHistoryBtn.addEventListener("click", loadHistory);

if (questionInput) {
  questionInput.addEventListener("input", updateWordCount);
}

window.addEventListener("load", async () => {
  updateWordCount();
updateAskButtonState();
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
              text: "You are a helpful academic tutor. Answer in 220 to 260 words. Never exceed 260 words. Use short bullet points where helpful. Teach the concept instead of giving a cheating-style direct submission answer. List points clearly and end with one complete summary sentence. Make sure the response is complete and never cuts off mid-sentence. Keep each bullet short, around 1 to 2 sentences maximum."
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

    let answer = String(response.output_text || "No answer returned.").trim();

    const words = answer.split(/\s+/).filter(Boolean);

    if (words.length > 260) {
      const shortened = words.slice(0, 260).join(" ");

      // Cut back to last full sentence if possible
      const lastSentenceEnd = Math.max(
        shortened.lastIndexOf("."),
        shortened.lastIndexOf("!"),
        shortened.lastIndexOf("?")
      );

      if (lastSentenceEnd > 100) {
        answer = shortened.slice(0, lastSentenceEnd + 1).trim();
      } else {
        answer = shortened.trim() + " ...";
      }
    }

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