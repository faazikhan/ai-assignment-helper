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

#answer {
  background: linear-gradient(180deg, #f8fbff 0%, #f4f7fb 100%);
  border: 1px solid #e5e7eb;
  padding: 18px;
  border-radius: 14px;
  white-space: pre-wrap;
  margin-top: 10px;
  min-height: 90px;
  line-height: 1.7;
  font-size: 16px;
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
max-height: 400px;
  overflow-y: auto;
  padding-right: 6px;
}

.chat-message {
  max-width: 80%;
  padding: 14px 16px;
  border-radius: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: 15px;
}

.chat-user {
  align-self: flex-end;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border-bottom-right-radius: 6px;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.18);
}

.chat-ai {
  align-self: flex-start;
  background: #f8fafc;
  color: #111827;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 6px;
}

.chat-label {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.8;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.typing {
  font-style: italic;
  color: #64748b;
}

#chatBox {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 6px;
}

</style>








</head>
<body>
<div class="container">
  <h1>AssignHelp AI</h1>

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
<div id="historyBox"></div>  </div>

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

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }




function renderChatMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = "chat-message " + (role === "user" ? "chat-user" : "chat-ai");

  const label = document.createElement("div");
  label.className = "chat-label";
  label.textContent = role === "user" ? "You" : "AssignHelp AI";

  const body = document.createElement("div");
  body.textContent = text;

  wrapper.appendChild(label);
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

  const label = document.createElement("div");
  label.className = "chat-label";
  label.textContent = "AssignHelp AI";

  const body = document.createElement("div");
  body.textContent = "Thinking...";

  wrapper.appendChild(label);
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
updateAuthVisibility();
      usageCount = 0;
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



async function typeAiMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "chat-message chat-ai";

  const label = document.createElement("div");
  label.className = "chat-label";
  label.textContent = "AssignHelp AI";

  const body = document.createElement("div");
  body.textContent = "";

  wrapper.appendChild(label);
  wrapper.appendChild(body);
  chatBox.appendChild(wrapper);

  const words = text.split(" ");
  let current = "";

  for (let i = 0; i < words.length; i++) {
    current += (i === 0 ? "" : " ") + words[i];
    body.textContent = current;

    scrollToBottom();

    await new Promise(resolve => setTimeout(resolve, 25));
  }
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

    if (!res.ok) {
      setStatus(askStatus, data.error || "Something went wrong.", "error");
      removeTypingMessage();
      return;
    }

removeTypingMessage();
await typeAiMessage(data.answer);
questionInput.value = "";
updateWordCount();
scrollToBottom();

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