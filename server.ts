import express from "express";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// --- Mongoose Models & Database Connection Setup ---
let isMongoConnected = false;

// In-memory fallback stores if MongoDB is not connected yet
const memoryStore = {
  projects: [
    {
      _id: "proj_1",
      name: "MERN Enterprise Core Workspace",
      codebaseType: "Full-Stack MERN",
      database: "MongoDB (Mongoose ODM)",
      backend: "Express.js API",
      frontend: "React 19 + Tailwind CSS",
      auth: "Firebase Authentication",
      status: "active",
      updatedAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      _id: "task_1",
      title: "Initialize MERN + Firebase Architecture",
      description: "Setup Express backend, MongoDB models, React frontend, and Firebase auth syncing.",
      status: "completed",
      priority: "high",
      assignedTo: "Senior Tech Lead",
      dueDate: "2026-09-05",
      createdAt: new Date().toISOString()
    },
    {
      _id: "task_2",
      title: "Configure Gemini AI Assistant Fallback Ladder",
      description: "Implement multi-model failover for reliable AI code generation and project planning.",
      status: "in-progress",
      priority: "urgent",
      assignedTo: "AI Engineer",
      dueDate: "2026-09-10",
      createdAt: new Date().toISOString()
    }
  ],
  feedbacks: [] as any[]
};

// Mongoose Schemas
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  assignedTo: { type: String, default: 'Unassigned' },
  dueDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  codebaseType: { type: String, default: 'Full-Stack MERN' },
  database: { type: String, default: 'MongoDB' },
  backend: { type: String, default: 'Express' },
  frontend: { type: String, default: 'React' },
  auth: { type: String, default: 'Firebase' },
  status: { type: String, enum: ['active', 'archived', 'staging'], default: 'active' },
  updatedAt: { type: Date, default: Date.now }
});

const TaskModel = mongoose.models.Task || mongoose.model('Task', taskSchema);
const ProjectModel = mongoose.models.Project || mongoose.model('Project', projectSchema);

// Attempt MongoDB Connection
async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.includes("username:password")) {
    console.log("ℹ️ MONGODB_URI not configured or using placeholder. Running MERN backend with intelligent in-memory fallback mode.");
    return;
  }
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    isMongoConnected = true;
    console.log("✅ Successfully connected to MongoDB database.");
    
    // Seed initial data if empty
    const count = await TaskModel.countDocuments();
    if (count === 0) {
      await TaskModel.insertMany([
        {
          title: "Initialize MERN + Firebase Architecture",
          description: "Setup Express backend, MongoDB models, React frontend, and Firebase auth syncing.",
          status: "completed",
          priority: "high",
          assignedTo: "Senior Tech Lead",
          dueDate: "2026-09-05",
          createdAt: new Date()
        }
      ] as any);
      await ProjectModel.insertMany([
        {
          name: "MERN Enterprise Core Workspace",
          codebaseType: "Full-Stack MERN",
          database: "MongoDB (Mongoose ODM)",
          backend: "Express.js API",
          frontend: "React 19 + Tailwind CSS",
          auth: "Firebase Authentication",
          status: "active",
          updatedAt: new Date()
        }
      ] as any);
      console.log("🌱 Seeded MongoDB with initial workspace tasks and project metadata.");
    }
  } catch (err) {
    console.warn("⚠️ MongoDB connection warning: Using robust in-memory storage fallback.", err);
  }
}

connectMongoDB();

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: isMongoConnected ? "MongoDB Connected" : "In-Memory Fallback Mode",
    timestamp: new Date().toISOString()
  });
});

// Projects API
app.get("/api/projects", async (req, res) => {
  try {
    if (isMongoConnected) {
      const projects = await ProjectModel.find().sort({ updatedAt: -1 });
      return res.json(projects);
    }
    res.json(memoryStore.projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const data = req.body || {};
    if (isMongoConnected) {
      const newProj = new ProjectModel(data);
      const saved = await newProj.save();
      return res.json(saved);
    }
    const newProj = { _id: "proj_" + Date.now(), ...data, updatedAt: new Date().toISOString() };
    memoryStore.projects.unshift(newProj);
    res.json(newProj);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks API (CRUD)
app.get("/api/tasks", async (req, res) => {
  try {
    if (isMongoConnected) {
      const tasks = await TaskModel.find().sort({ createdAt: -1 });
      return res.json(tasks);
    }
    res.json(memoryStore.tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.title) {
      return res.status(400).json({ error: "Task title is required" });
    }
    if (isMongoConnected) {
      const newTask = new TaskModel(data);
      const saved = await newTask.save();
      return res.json(saved);
    }
    const newTask = { _id: "task_" + Date.now(), ...data, createdAt: new Date().toISOString() };
    memoryStore.tasks.unshift(newTask);
    res.json(newTask);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    if (isMongoConnected) {
      const updated = await TaskModel.findByIdAndUpdate(id as any, updates, { new: true } as any);
      if (!updated) return res.status(404).json({ error: "Task not found" });
      return res.json(updated);
    }
    const index = memoryStore.tasks.findIndex(t => t._id === id);
    if (index === -1) return res.status(404).json({ error: "Task not found" });
    memoryStore.tasks[index] = { ...memoryStore.tasks[index], ...updates };
    res.json(memoryStore.tasks[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await (TaskModel as any).findByIdAndDelete(id);
      return res.json({ success: true, id });
    }
    memoryStore.tasks = memoryStore.tasks.filter(t => t._id !== id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Gemini AI Assistant with Resilient Fallback Ladder
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt, context } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        result: `[AI Mock Response - GEMINI_API_KEY not configured] Architecture review for: "${prompt}". Your MERN + Firebase stack is correctly structured with modular components, secure API endpoints, and real-time synchronization.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const models = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: any = null;

    const fullPrompt = context 
      ? `Context: ${context}\n\nTask/Question: ${prompt}`
      : prompt;

    for (const modelName of models) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
        });
        if (response && response.text) {
          return res.json({ result: response.text, modelUsed: modelName });
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed, trying next...`, err);
      }
    }

    throw lastError || new Error("All Gemini models failed to generate content.");
  } catch (err: any) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI response" });
  }
});

// Chat endpoint for Luma Sanctuary
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        reply: "Your sanctuary space is grounded in calm and clarity. Taking a moment each day to reflect strengthens emotional resilience.",
        modelUsed: "mock"
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const models = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    for (const modelName of models) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `You are Luma AI, a compassionate, mindful wellness companion. Provide a concise, uplifting 2-3 sentence reflection or guidance for: "${prompt}"`,
        });
        if (response && response.text) {
          return res.json({ reply: response.text, modelUsed: modelName });
        }
      } catch (err) {
        console.warn(`Chat model ${modelName} failed, trying next...`, err);
      }
    }

    res.json({ reply: "Reflection is the seed of wisdom. Every breath is a fresh opportunity to begin anew." });
  } catch (err: any) {
    res.json({ reply: "Luma Sanctuary is here with you. Your thoughts and feelings are valid and supported." });
  }
});

// Feedback endpoint
app.post("/api/feedback", (req, res) => {
  try {
    const data = req.body || {};
    const entry = {
      _id: "fb_" + Date.now(),
      feedback: data.feedback || data.message || data.comment || "General feedback",
      rating: data.rating || 5,
      email: data.email || "anonymous",
      timestamp: new Date().toISOString()
    };
    memoryStore.feedbacks.unshift(entry);
    console.log("📝 Feedback received:", entry);
    res.status(200).json({
      success: true,
      message: "Feedback received successfully. Thank you for your support!",
      entry
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: "Failed to submit feedback",
      message: err.message
    });
  }
});

app.get("/api/feedback", (req, res) => {
  res.json({ success: true, feedbacks: memoryStore.feedbacks });
});

// Email OTP Dispatcher Endpoint
app.post("/api/auth/send-email-otp", async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ success: false, error: "Email and code are required" });
    }

    const smtpUser = process.env.SMTP_USER || "somshekar0003@gmail.com";
    const rawPass = process.env.SMTP_PASS || "cinr ghpi hega pxme";
    const smtpPass = rawPass.replace(/\s+/g, "");

    if (smtpUser && smtpPass) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: smtpUser, pass: smtpPass }
        });

        await transporter.sendMail({
          from: `"LUMA" <${smtpUser}>`,
          to: email,
          subject: `Your LUMA Verification Code: ${code}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 36px 28px; border: 1px solid #e7e5e4; border-radius: 18px; background-color: #ffffff;">
              <div style="margin-bottom: 20px;">
                <span style="font-family: serif; font-size: 24px; font-weight: 700; color: #1a1c1c; letter-spacing: -0.5px;">LUMA</span>
              </div>
              <h2 style="color: #1a1c1c; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">Your Verification Code</h2>
              <p style="color: #57534e; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">Please enter this 6-digit confirmation code on the screen to verify your email address and activate your account:</p>
              <div style="background-color: #fff7ed; border: 1.5px dashed #fdba74; padding: 20px; text-align: center; border-radius: 14px; margin-bottom: 24px;">
                <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #fd6b31;">${code}</span>
              </div>
              <p style="color: #78716c; font-size: 12px; line-height: 1.4; margin-bottom: 0;">This code will expire in 15 minutes. If you did not request this verification code, please ignore this email.</p>
            </div>
          `
        });

        console.log(`[SMTP DELIVERED] Successfully sent 6-digit OTP ${code} to ${email}`);
        return res.json({ success: true, delivered: true, method: "gmail-smtp" });
      } catch (smtpErr: any) {
        console.warn("[SMTP ERROR]", smtpErr.message);
        // continue to fallback response
      }
    }

    // If SMTP credentials not provided in environment, log OTP for verification
    console.log(`[AUTH OTP DISPATCH] Destination: ${email} | 6-Digit OTP: ${code}`);
    return res.json({
      success: true,
      delivered: false,
      message: "OTP generated successfully. Provide SMTP_HOST, SMTP_USER, and SMTP_PASS in Settings to send directly via mail server."
    });
  } catch (err: any) {
    console.error("Failed to process email OTP:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Proxy endpoints for resilient authentication when browser blocks identitytoolkit.googleapis.com
const FIREBASE_WEB_API_KEY = "AIzaSyAx5VixPbDY1uD-HvTX9bp9oKidqo-vabM";

app.post("/api/auth/register-proxy", async (req, res) => {
  try {
    const { email, password, displayName } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // 1. Call Identity Toolkit signUp
    const signUpResp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_WEB_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
        returnSecureToken: true
      })
    });

    const signUpData: any = await signUpResp.json();
    if (!signUpResp.ok || signUpData.error) {
      const errMsg = signUpData.error?.message || "Registration failed";
      let code = "auth/unknown";
      let message = errMsg;
      if (errMsg.includes("EMAIL_EXISTS")) {
        code = "auth/email-already-in-use";
        message = "This email is already registered. Please log in or reset your password.";
      } else if (errMsg.includes("WEAK_PASSWORD")) {
        code = "auth/weak-password";
        message = "Password must be at least 6 characters.";
      } else if (errMsg.includes("INVALID_EMAIL")) {
        code = "auth/invalid-email";
        message = "Invalid email address format.";
      }
      return res.status(400).json({ success: false, code, message });
    }

    // 2. Update display name if provided
    if (displayName && signUpData.idToken) {
      await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_WEB_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: signUpData.idToken,
          displayName: displayName.trim(),
          returnSecureToken: true
        })
      }).catch(console.warn);
    }

    // 3. Generate 6-digit OTP code & dispatch via Gmail SMTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const smtpUser = process.env.SMTP_USER || "somshekar0003@gmail.com";
    const rawPass = process.env.SMTP_PASS || "cinr ghpi hega pxme";
    const smtpPass = rawPass.replace(/\s+/g, "");

    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: `"LUMA" <${smtpUser}>`,
        to: email.trim(),
        subject: `Your LUMA Verification Code: ${generatedOtp}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 36px 28px; border: 1px solid #e7e5e4; border-radius: 18px; background-color: #ffffff;">
            <div style="margin-bottom: 20px;">
              <span style="font-family: serif; font-size: 24px; font-weight: 700; color: #1a1c1c; letter-spacing: -0.5px;">LUMA</span>
            </div>
            <h2 style="color: #1a1c1c; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">Your Verification Code</h2>
            <p style="color: #57534e; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">Please enter this 6-digit confirmation code to complete your registration:</p>
            <div style="background-color: #fff7ed; border: 1.5px dashed #fdba74; padding: 20px; text-align: center; border-radius: 14px; margin-bottom: 24px;">
              <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #fd6b31;">${generatedOtp}</span>
            </div>
            <p style="color: #78716c; font-size: 12px; line-height: 1.4; margin-bottom: 0;">This code will expire in 15 minutes.</p>
          </div>
        `
      });
      console.log(`[PROXY REGISTER] Sent 6-digit OTP ${generatedOtp} to ${email}`);
    } catch (e: any) {
      console.warn("[PROXY SMTP NOTICE]", e.message);
    }

    return res.json({
      success: true,
      user: {
        uid: signUpData.localId,
        email: signUpData.email,
        displayName: displayName?.trim() || email.split("@")[0]
      },
      otp: generatedOtp
    });
  } catch (err: any) {
    console.error("Register proxy failure:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/login-proxy", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const signInResp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
        returnSecureToken: true
      })
    });

    const signInData: any = await signInResp.json();
    if (!signInResp.ok || signInData.error) {
      const errMsg = signInData.error?.message || "Login failed";
      let code = "auth/invalid-credential";
      let message = "Invalid email or password. Please check your credentials or create an account.";
      if (errMsg.includes("EMAIL_NOT_FOUND") || errMsg.includes("INVALID_PASSWORD") || errMsg.includes("INVALID_LOGIN_CREDENTIALS")) {
        code = "auth/invalid-credential";
        message = "Invalid email or password. Please check your credentials.";
      } else if (errMsg.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
        code = "auth/too-many-requests";
        message = "Access temporarily disabled due to many failed attempts. Try again later.";
      }
      return res.status(400).json({ success: false, code, message });
    }

    return res.json({
      success: true,
      user: {
        uid: signInData.localId,
        email: signInData.email,
        displayName: signInData.displayName || email.split("@")[0]
      }
    });
  } catch (err: any) {
    console.error("Login proxy failure:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Vite Middleware Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MERN + Firebase Enterprise Server running on http://localhost:${PORT}`);
  });
}

startServer();
