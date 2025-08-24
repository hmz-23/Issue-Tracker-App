// pages/index.js
import { useState, useContext } from 'react';
import useSWR from 'swr';
import IssueCard from '@/components/IssueCard';
import { AuthContext } from './_app';
import { useRouter } from 'next/router';
// The Layout import is now removed because it's handled by _app.js.
// import Layout from '@/components/Layout';

export default function Home() {
  const [statusFilter, setStatusFilter] = useState('');
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  // The key change is here: we now include a query parameter to fetch related data.
  const {
    data: issues,
    error,
    isLoading,
    mutate,
  } = useSWR(`/api/issues?status=${statusFilter}&include=author,comments`);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const body = e.target.body.value;
    const authorId = user?.id; // Get the author ID from the user context

    if (!title || !body || !authorId) return;

    // Optimistically update the UI
    const newIssue = {
      id: Date.now().toString(), // Temp ID
      title,
      body,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      author: { email: user.email }, // Add the author object for optimistic UI
      comments: [],
    };
    const newIssues = [newIssue, ...(issues || [])];
    mutate(newIssues, false);

    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, authorId }),
    });

    if (res.ok) {
      const createdIssue = await res.json();
      // Revalidate the data with the actual issue from the backend
      mutate();
    } else {
      // Revert the UI on error
      mutate(issues, false);
      // Instead of an alert, we can show an error message in the UI
      console.error('Failed to create issue.');
    }

    e.target.reset();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    router.push('/auth/login');
  };

  if (isLoading || loading) return (
    // The Layout component is now removed from here.
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl font-semibold text-gray-700">Loading...</p>
    </div>
  );
  if (error) return (
    // The Layout component is now removed from here.
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl font-semibold text-red-500">Failed to load issues.</p>
    </div>
  );

  return (
    // The Layout component is now removed from here.
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Issue List</h1>

      {!user && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md" role="alert">
          <p>You are not logged in. <a href="/auth/login" className="font-bold underline hover:text-yellow-900">Login to create issues.</a></p>
        </div>
      )}

      {user && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Issue</h2>
          <form onSubmit={handleCreateIssue} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-gray-700 font-medium">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="body" className="block text-gray-700 font-medium">Description</label>
              <textarea
                id="body"
                name="body"
                required
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              ></textarea>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors"
            >
              Create Issue
            </button>
          </form>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        ) : (
          <p className="text-center text-gray-500 text-lg">No issues found.</p>
        )}
      </div>
    </div>
  );
}
