import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import { Leaf, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (normalizedUserKey: string) => void;
}

const AUTH_IMAGE_PATH = '/src/assets/images/hero_sunlit_eucalyptus_1795501565969.jpg';

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [identifier, setIdentifier] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = identifier.trim().toLowerCase();
    if (!normalized) {
      setErrorMsg('Please enter your name or email to open your list.');
      return;
    }
    setErrorMsg(null);
    onLogin(normalized);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#242B28] flex flex-col justify-center items-center px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[840px] rounded-[24px] bg-white border border-[#E2E7E4] shadow-[0_14px_40px_rgba(36,43,40,0.06)] overflow-hidden grid grid-cols-1 md:grid-cols-12"
      >
        {/* Left Visual Sanctuary Panel */}
        <div className="relative md:col-span-5 min-h-[210px] md:min-h-[440px] bg-gradient-to-br from-[#E8F1F5] via-[#FAF9F6] to-[#E3EDE8] flex flex-col justify-between p-7 sm:p-8 overflow-hidden">
          {!imgFailed ? (
            <img
              src={AUTH_IMAGE_PATH}
              alt="Sunlit pale sage eucalyptus leaves over calm morning water ripples"
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgFailed(true)}
              className={`absolute inset-0 h-full w-full object-cover object-center pointer-events-none select-none transition-opacity duration-700 ease-out ${
                imgLoaded ? 'opacity-45' : 'opacity-0'
              }`}
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-end justify-end p-6 opacity-50"
            >
              <Leaf className="w-24 h-24 text-[#9BB5A8]" />
            </div>
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/85 via-[#FAF9F6]/55 to-[#E3EDE8]/85"
          />

          <div className="relative z-10">
            <span className="font-display text-2xl font-medium tracking-tight text-[#1E2522]">
              Stillwater
            </span>
          </div>

          <div className="relative z-10 space-y-2.5 mt-8 md:mt-0">
            <h1 className="font-display text-2xl sm:text-[28px] leading-[1.2] font-medium text-[#1E2522] [text-wrap:balance]">
              A quiet place for what matters today.
            </h1>
            <p className="text-sm leading-relaxed text-[#4E5A55]">
              Enter your name or email to open your personal task list—calm, unhurried, and ready when you are.
            </p>
          </div>
        </div>

        {/* Right Zero-Friction Login Panel */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-medium text-[#1E2522]">
              Open your space
            </h2>
            <p className="text-sm leading-relaxed text-[#5A6560]">
              Each name or email keeps its own separate list across reloads. No password required.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mt-5 rounded-2xl bg-[#F9ECEA] border border-[#EBCBC7] p-3.5 flex items-start gap-2.5 text-sm text-[#7A3730]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-semibold text-[#4E5A55] mb-1.5">
                Name or Email
              </label>
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                autoFocus
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. Elena or elena@example.com"
                className="w-full min-h-[46px] rounded-xl bg-[#FAF9F6] border border-[#DCE2DE] px-4 py-2.5 text-[15px] text-[#1E2522] placeholder:text-[#86918C] focus:outline-none focus:bg-white focus:border-[#8B7EB8] focus:ring-2 focus:ring-[#8B7EB8]/20"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#344E44] hover:bg-[#283E35] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7EB8] focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>Continue to My List</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
