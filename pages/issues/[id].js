// pages/issues/[id].js
import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Layout from '@/components/Layout';
import { AuthContext } from '@/pages/_app';

// The fetcher function for useSWR, which fetches data from the API.
const fetcher = (url) => fetch(url).then((res) => res.json());

// This component displays a single issue and its comments.
export default function IssueDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: userLoading } = useContext(AuthContext);

  // Fetch the issue details and its related data (author and comments).
  const {
    data: issue,
    error,
    isLoading,
    mutate,
  } = useSWR(id ? `/api/issues/${id}?include=author,comments` : null, fetcher);

  const [isEditing, setIsEditing] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedBody, setUpdatedBody] = useState('');
  const [newComment, setNewComment] = useState('');

  // Handle updating an issue.
  const handleUpdateIssue = async (e) => {
    e.preventDefault();

    if (!updatedTitle && !updatedBody) return;

    // Build the data payload.
    const updateData = {};
    if (updatedTitle) updateData.title = updatedTitle;
    if (updatedBody) updateData.body = updatedBody;

    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        // Revalidate the data to show the updated issue.
        mutate();
        setIsEditing(false); // Exit editing mode.
      } else {
        console.error('Failed to update issue.');
      }
    } catch (err) {
      console.error('Error updating issue:', err);
    }
  };

  // Handle adding a new comment.
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const res = await fetch(`/api/issues/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: newComment,
        authorId: user?.id,
      }),
    });

    if (res.ok) {
      setNewComment('');
      // Revalidate to show the new comment.
      mutate();
    } else {
      console.error('Failed to add comment.');
    }
  };

  // Conditional rendering based on the data fetching state.
  if (isLoading || userLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error || !issue) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl font-semibold text-red-500">Issue not found.</p>
        </div>
      </Layout>
    );
  }

  // Check if the current user is the author or an admin to allow editing.
  const isAuthor = user && user.id === issue.authorId;
  const isAdmin = user && user.role === 'ADMIN';
  const canEdit = isAuthor || isAdmin;

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto p-4">
        {/* Issue Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{issue.title}</h1>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                issue.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {issue.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Posted by {issue.author.email} on {new Date(issue.createdAt).toLocaleDateString()}
          </p>
          <p className="text-gray-700">{issue.body}</p>

          {/* Edit/Update Section */}
          {canEdit && (
            <div className="mt-6 border-t pt-4">
              {isEditing ? (
                <form onSubmit={handleUpdateIssue}>
                  <h2 className="text-xl font-semibold mb-2">Edit Issue</h2>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700">Title</label>
                    <input
                      type="text"
                      id="title"
                      value={updatedTitle}
                      onChange={(e) => setUpdatedTitle(e.target.value)}
                      placeholder={issue.title}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="body" className="block text-gray-700">Body</label>
                    <textarea
                      id="body"
                      value={updatedBody}
                      onChange={(e) => setUpdatedBody(e.target.value)}
                      placeholder={issue.body}
                      rows="4"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    ></textarea>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setUpdatedTitle(issue.title);
                    setUpdatedBody(issue.body);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Issue
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Comments ({issue.comments.length})
          </h2>
          <div className="space-y-4 mb-6">
            {issue.comments.length > 0 ? (
              issue.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-2 last:border-b-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {comment.author.email}
                  </p>
                  <p className="text-gray-700 text-sm">{comment.body}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            )}
          </div>

          {user && (
            <form onSubmit={handleAddComment}>
              <h3 className="text-lg font-semibold mb-2">Add a Comment</h3>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="3"
                placeholder="Write your comment here..."
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 mb-2"
                required
              ></textarea>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Post Comment
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
