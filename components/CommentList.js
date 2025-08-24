import { useState, useContext } from 'react';
import { AuthContext } from '@/pages/_app';

export default function CommentList({ comments, onAddComment }) {
  const [newComment, setNewComment] = useState('');
  const { user } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-inner">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Comments</h3>
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-800">{comment.text}</p>
              <p className="text-xs text-gray-500 mt-2">
                by {comment.author.email} on {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No comments yet. Be the first!</p>
        )}
      </div>
      {user && (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors self-end"
          >
            Submit Comment
          </button>
        </form>
      )}
    </div>
  );
}