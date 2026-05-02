import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/api/auth";
import { setToken } from "@/lib/token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import ukekiLogo from "@/assets/ukeki_logo.svg";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { accessToken } = await login(email, password);
      setToken(accessToken);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — white with logo + decorative patterns */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Dot grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #0f7c6d18 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand-50 opacity-80" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-brand-100 opacity-60" />
        <div className="absolute top-1/2 -right-10 w-40 h-40 rounded-full bg-brand-50 opacity-50" />
        <div className="absolute bottom-32 left-10 w-20 h-20 rounded-full bg-brand-100 opacity-40" />

        {/* Decorative rings */}
        <div className="absolute top-16 right-16 w-32 h-32 rounded-full border-2 border-brand-100 opacity-50" />
        <div className="absolute bottom-16 left-16 w-24 h-24 rounded-full border-2 border-brand-100 opacity-40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <img src={ukekiLogo} alt="Ukekis" className="h-24 mb-8 drop-shadow-sm" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Ukekis Admin</h1>
          <p className="text-gray-500 max-w-xs leading-relaxed">
            Manage your marketplace — users, orders, bookings, and content — all in one place.
          </p>
        </div>
      </div>

      {/* Right panel — brand-green with white form card */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-brand-600 relative overflow-hidden">
        {/* Subtle pattern on green side */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-700 opacity-40" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-brand-700 opacity-30" />

        {/* Form card */}
        <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <img src={ukekiLogo} alt="Ukekis" className="h-10 mb-2" />
            <span className="text-base font-semibold text-gray-800">Ukekis Admin</span>
          </div>

          <div className="mb-7">
            <h2 className="text-xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
