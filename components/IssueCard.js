import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '@/pages/_app';

export default function IssueCard({ issue }) {
  const { user } = useContext(AuthContext);

  const isAuthor = user && user.id === issue.authorId;
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <Link href={`/issues/${issue.id}`}>
          <h3 className="text-xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors">
            {issue.title}
          </h3>
        </Link>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            issue.status === 'OPEN'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {issue.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-2">
        Posted by {issue.author.email} on {new Date(issue.createdAt).toLocaleDateString()}
      </p>
      <p className="text-gray-600 text-sm line-clamp-3">{issue.body}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          Comments: {issue.comments.length}
        </span>
        {(isAuthor || isAdmin) && (
          <Link
            href={`/issues/${issue.id}`}
            className="text-xs text-indigo-500 hover:underline"
          >
            Edit
          </Link>
        )}
      </div>
    </div>
  );
}