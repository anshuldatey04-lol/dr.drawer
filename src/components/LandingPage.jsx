import { useState } from 'react';
import { Users, ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function LandingPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const validatePassword = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pass)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(pass)) return "Password must contain a number";
    if (!/[@#$%^&*!]/.test(pass)) return "Password must contain a special character (@#$%^&*!)";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      const passError = validatePassword(password);
      if (passError) {
        setError(passError);
        return;
      }
    }

    const endpoint = isLogin ? '/api/login' : '/api/signup';
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Generic error message for login if 401
        if (isLogin && res.status === 401) {
           throw new Error('Invalid email or password');
        }
        throw new Error(data.error || 'Something went wrong');
      }

      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508] flex items-center justify-center p-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Left side — Hero text */}
        <div className="flex-1 text-center lg:text-left animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-400 text-xs font-semibold uppercase tracking-wider mb-10">
            <ShieldCheck size={14} className="text-indigo-400" />
            <span>Secure Enterprise Workspace</span>
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
            Dr.<span className="text-indigo-500">Drawer</span>
            <span className="block font-bold text-slate-100 mt-2">Secure</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-md mx-auto lg:mx-0 mb-12 leading-relaxed">
            Protect your productivity with our new security-first architecture. 
            Visual organization meets enterprise-grade data protection.
          </p>

          <div className="flex flex-col gap-6 max-w-sm mx-auto lg:mx-0">
            <div className="flex items-center gap-4 text-slate-300 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:border-indigo-500/50 transition-colors">
                <ShieldCheck size={20} className="text-indigo-400" />
              </div>
              <span className="font-medium">End-to-End Encryption</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:border-indigo-500/50 transition-colors">
                <Zap size={20} className="text-indigo-400" />
              </div>
              <span className="font-medium">Anti-CSRF Protection</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:border-indigo-500/50 transition-colors">
                <Users size={20} className="text-indigo-400" />
              </div>
              <span className="font-medium">User Data Isolation</span>
            </div>
          </div>
        </div>

        {/* Right side — Auth card */}
        <div className="w-full max-w-md animate-zoom-in" style={{ animationDelay: '0.2s' }}>
          <div className="glass-modal p-10 sm:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <Sparkles size={32} className="text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-slate-500 mt-2">{isLogin ? 'Sign in to your secure workspace.' : 'Join the secure organization platform.'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label htmlFor="landing-name" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                    Name
                  </label>
                  <input
                    id="landing-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-slate-700 focus:outline-none transition-all duration-300"
                  />
                </div>
              )}
            
              <div>
                <label htmlFor="landing-email" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                  Email
                </label>
                <input
                  id="landing-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-slate-700 focus:outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label htmlFor="landing-password" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                  Password
                </label>
                <input
                  id="landing-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-slate-700 focus:outline-none transition-all duration-300"
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs text-center bg-red-400/5 py-3 px-4 rounded-xl border border-red-400/10">
                  {error}
                </div>
              )}

              <button
                id="submit-button"
                type="submit"
                className="w-full group flex items-center justify-center gap-3 py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
              >
                {isLogin ? 'Enter Workspace' : 'Get Started'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.05]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0b0b10] px-4 text-slate-600 font-bold tracking-widest">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.location.href = '/api/auth/google'}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] text-white font-bold rounded-2xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/[0.05] text-center">
              <p className="text-slate-500 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="ml-2 text-white font-semibold hover:text-indigo-400 transition-colors"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
