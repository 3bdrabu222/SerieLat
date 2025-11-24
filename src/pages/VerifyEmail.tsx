import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, Clock } from 'lucide-react';
import axiosClient from '../api/axiosClient';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setError('');
    setLoading(true);

    try {
      const { data } = await axiosClient.post('/auth/verify-email', {
        email,
        code
      });

      setSuccess(true);
      setError('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Verification error:', err);
      const errorMessage = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resending || !email) return;

    setResending(true);
    setError('');

    try {
      const { data } = await axiosClient.post('/auth/resend-code', { email });
      setError('');
      setSuccess(false);
      setTimeLeft(600); // Reset timer
      alert(data.message || 'Verification code sent! Please check your email.');
    } catch (err: any) {
      console.error('Resend error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to resend code. Please try again.';
      setError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Email Verified! 🎉</h2>
          <p className="text-gray-300 mb-6">
            Your email has been successfully verified. Redirecting you to login...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Mail size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Verify Your Email</h2>
          <p className="text-gray-400 mt-2">
            Enter the 4-digit code sent to your email
          </p>
        </div>

        {/* Timer */}
        {timeLeft > 0 ? (
          <div className="flex items-center justify-center gap-2 mb-6 text-gray-300">
            <Clock size={18} />
            <span>Code expires in: <strong className="text-blue-400">{formatTime(timeLeft)}</strong></span>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-center">
            ⚠️ Code expired! Please request a new one.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setCode(value);
              }}
              required
              maxLength={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl font-bold tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1234"
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Enter the 4-digit code from your email
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 4}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResendCode}
            disabled={resending}
            className="text-blue-500 hover:text-blue-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Sending...' : "Didn't receive the code? Resend"}
          </button>
        </div>

        <p className="text-center text-gray-400 mt-6">
          Already verified?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-400 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
