// components/AuthForm.js
import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../pages/_app';

// This component handles both login and signup forms based on the `type` prop.
// It uses the same layout as the other pages for a consistent look and feel.
const AuthForm = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useContext(AuthContext);

  const isLogin = type === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Choose the correct API endpoint based on the form type
      // NOTE: You must use the full URL to the Express server since it's on a different port.
      const endpoint = isLogin ? 'http://localhost:3000/api/auth/login' : 'http://localhost:3000/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          // Store the JWT token in local storage on successful login
          localStorage.setItem('token', data.token);
          // Update the user state in the AuthContext
          // NOTE: In a real app, you would decode the token to get the user data
          // For this demo, we'll just set a dummy user.
          // Your _app.js should handle the actual token verification.
          setUser({ email: data.email });
          router.push('/');
        } else {
          // After a successful registration, redirect to the login page
          router.push('/auth/login');
        }
      } else {
        // Handle server-side errors
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('API call failed:', err);
      setError('Failed to connect to the server. Please ensure the server is running on http://localhost:3000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          {isLogin ? 'Login' : 'Signup'}
        </h1>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${
              loading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
          </button>
        </form>
        <div className="mt-4 text-center">
          {isLogin ? (
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/auth/signup" className="text-indigo-600 hover:underline">
                Sign up
              </a>
            </p>
          ) : (
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/auth/login" className="text-indigo-600 hover:underline">
                Login
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
