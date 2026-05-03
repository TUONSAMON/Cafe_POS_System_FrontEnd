import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { Lock, User, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const { login } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (busy) return;

  setBusy(true);

  const result = await login(username, password); // ✅ fixed

  setBusy(false);

  if (!result?.ok) {
    alert(
      lang === "en"
        ? result?.message || "Invalid Credentials"
        : "ឈ្មោះអ្នកប្រើប្រាស់ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ"
    );
    return;
  }

  navigate("/", { replace: true });
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border dark:border-slate-800 p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-600/30">
            <Coffee size={32} />
          </div>
          <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
            Nexus POS
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {lang === "en"
              ? "Authorized Access Only"
              : "ការចូលប្រើប្រាស់សម្រាប់តែបុគ្គលិកដែលមានសិទ្ធិ"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder={lang === "en" ? "Username" : "ឈ្មោះអ្នកប្រើប្រាស់"}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={busy}
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="password"
              placeholder={lang === "en" ? "Password" : "លេខសម្ងាត់"}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white font-black py-4 rounded-2xl mt-4 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
          >
            {busy
              ? lang === "en"
                ? "SIGNING IN..."
                : "កំពុងចូល..."
              : lang === "en"
              ? "SIGN IN"
              : "ចូលប្រើប្រាស់"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            System Version 2.0.4 • Security Protocol Active
          </p>
        </div>
      </div>
    </div>
  );
}
