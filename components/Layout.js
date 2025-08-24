import Head from 'next/head';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '@/pages/_app';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const { user, handleLogout, loading } = useContext(AuthContext);
  const router = useRouter();
  const isLoginPage = router.pathname.startsWith('/auth');

  return (
    <>
      <Head>
        <title>Issue Tracker</title>
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
        <header className="w-full max-w-4xl bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Issue Tracker
          </Link>
          <nav className="flex space-x-4 items-center">
            {!loading && user ? (
              <>
                <span className="text-gray-700">Hello, {user.email}!</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              !isLoginPage && (
                <Link href="/auth/login" className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors">
                  Login / Signup
                </Link>
              )
            )}
          </nav>
        </header>
        <main className="w-full max-w-4xl">{children}</main>
      </div>
    </>
  );
}