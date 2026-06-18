import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft,
  CheckCircle2, Layers, ShieldCheck, RefreshCw, Copy
} from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

/* ── Step indicator ────────────────────────────────── */
function StepBar({ step }) {
  const steps = ['Enter Email', 'Verify OTP', 'New Password'];
  return (
    <div className="flex items-center gap-0 mb-7">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300
                ${done ? 'bg-gradient-to-br from-violet-600 to-blue-500 border-violet-500 text-white shadow-md shadow-violet-500/30'
                  : active ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                  : 'bg-white/[0.04] border-white/[0.1] text-slate-600'}`}>
                {done ? <CheckCircle2 size={14} /> : idx}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap hidden sm:block
                ${active ? 'text-violet-300' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-all duration-500 ${done ? 'bg-violet-500/60' : 'bg-white/[0.07]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── OTP Display box (demo) ────────────────────────── */
function OTPBox({ otp, onCopy }) {
  return (
    <div className="bg-amber-500/[0.07] border border-amber-500/[0.2] rounded-xl p-4 mb-5">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck size={14} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-amber-300 text-xs font-semibold mb-0.5">Demo Mode — OTP Generated</p>
          <p className="text-amber-400/70 text-xs mb-3">
            In production, this would be sent to your email. For now, use this code:
          </p>
          <div className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-2.5 border border-amber-500/20">
            <span className="text-amber-300 font-mono text-2xl font-bold tracking-[0.3em]">{otp}</span>
            <button
              onClick={onCopy}
              className="text-amber-400 hover:text-amber-300 transition-colors ml-2"
              title="Copy OTP"
            >
              <Copy size={15} />
            </button>
          </div>
          <p className="text-amber-500/60 text-xs mt-2">⏱ Expires in 15 minutes</p>
        </div>
      </div>
    </div>
  );
}

/* ── OTP Input boxes ───────────────────────────────── */
function OTPInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (e, i) => {
    const key = e.key;
    if (key === 'Backspace') {
      const next = [...digits];
      if (next[i]) {
        next[i] = '';
        onChange(next.join(''));
      } else if (i > 0) {
        next[i - 1] = '';
        onChange(next.join(''));
        refs.current[i - 1]?.focus();
      }
      return;
    }
    if (key === 'ArrowLeft' && i > 0) { refs.current[i - 1]?.focus(); return; }
    if (key === 'ArrowRight' && i < 5) { refs.current[i + 1]?.focus(); return; }
    if (/^\d$/.test(key)) {
      const next = [...digits];
      next[i] = key;
      onChange(next.join(''));
      if (i < 5) refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center mb-5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={() => {}}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-13 text-center text-xl font-bold bg-white/[0.05] border rounded-xl text-slate-100 transition-all duration-200 caret-transparent
            ${d ? 'border-violet-500 bg-violet-500/10 shadow-sm shadow-violet-500/20' : 'border-white/[0.1]'}`}
          style={{ height: '52px' }}
        />
      ))}
    </div>
  );
}

/* ── Main component ────────────────────────────────── */
export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  /* Step 1 — Request OTP */
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/users/forgot-password', { email });
      setDemoOtp(res.data.otp);
      toast.success('OTP generated! Check the code below.');
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 — Verify OTP */
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    setStep(3);
  };

  /* Step 3 — Reset Password */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/reset-password', { email, otp, newPassword });
      setSuccess(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed');
      if (err?.response?.data?.message?.includes('expired')) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const copyOtp = () => {
    navigator.clipboard.writeText(demoOtp);
    toast.success('OTP copied!');
  };

  /* ── Success screen ──────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center px-4 relative overflow-hidden">
        <div className="orb-1" /><div className="orb-2" />
        <div className="relative z-10 w-full max-w-md text-center animate-fade-up">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-10 shadow-2xl shadow-black/40">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={38} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Password Reset!</h2>
            <p className="text-slate-400 text-sm mb-7">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30"
            >
              Go to Login →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="orb-1" /><div className="orb-2" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Layers size={22} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            AdminPanel
          </span>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
              <KeyRound size={22} className="text-violet-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mb-1">Forgot Password</h1>
            <p className="text-slate-400 text-sm">
              {step === 1 && "Enter your email to receive a reset code"}
              {step === 2 && "Enter the 6-digit code sent to your email"}
              {step === 3 && "Set your new secure password"}
            </p>
          </div>

          {/* Step bar */}
          <StepBar step={step} />

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 pl-11 text-slate-100 placeholder-slate-600 text-sm transition-all"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><span className="spinner" /> Sending OTP...</> : 'Send OTP →'}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              {/* Demo OTP box */}
              {demoOtp && <OTPBox otp={demoOtp} onCopy={copyOtp} />}

              <p className="text-center text-xs text-slate-500 mb-4">
                Sent to <span className="text-violet-400 font-medium">{email}</span>
              </p>

              <OTPInput value={otp} onChange={setOtp} />

              <button
                type="submit"
                disabled={otp.length < 6}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Verify OTP →
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setDemoOtp(''); }}
                className="w-full mt-2 py-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RefreshCw size={13} /> Resend OTP
              </button>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 pl-11 pr-11 text-slate-100 placeholder-slate-600 text-sm transition-all"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          newPassword.length >= i * 2 + 4
                            ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-amber-500' : i <= 3 ? 'bg-blue-500' : 'bg-green-500'
                            : 'bg-white/[0.08]'
                        }`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600">
                      {newPassword.length < 6 ? '🔴 Weak' : newPassword.length < 10 ? '🟡 Fair' : newPassword.length < 14 ? '🔵 Good' : '🟢 Strong'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showCPw ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 pl-11 pr-11 text-slate-100 placeholder-slate-600 text-sm transition-all
                      ${confirmPassword && (confirmPassword === newPassword ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5')}`}
                    style={{ borderColor: !confirmPassword ? undefined : undefined }}
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <button type="button" onClick={() => setShowCPw(!showCPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showCPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === newPassword && (
                  <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <><span className="spinner" /> Resetting...</> : 'Reset Password →'}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft size={13} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
