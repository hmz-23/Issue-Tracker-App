import { authMiddleware } from '@/lib/auth';
import prisma from '@/lib/prisma';

// The main handler function for the API route.
export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      // Publicly available to get all comments for an issue.
      await handleGetComments(req, res);
      break;
    case 'POST':
      // The auth middleware ensures only logged-in users can post comments.
      await authMiddleware(handleCreateComment)(req, res);
      break;
    default:
      // Return a 405 error for any other HTTP methods.
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
      break;
  }
}

// Function to handle GET requests for comments.
async function handleGetComments(req, res) {
  const { id } = req.query;

  try {
    const comments = await prisma.comment.findMany({
      where: { issueId: parseInt(id) }, // Convert the id to an integer.
      include: {
        author: { select: { email: true } }, // Select only the email from the author.
      },
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
}

// Function to handle POST requests for creating a new comment.
async function handleCreateComment(req, res) {
  const { id } = req.query;
  // Use 'body' to match the frontend payload.
  const { body } = req.body;
  if (!body) {
    return res.status(400).json({ message: 'Comment body is required' });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        body,
        authorId: req.user.id, // Use the authenticated user's ID.
        issueId: parseInt(id), // Convert the issue ID to an integer.
      },
      include: {
        author: { select: { email: true } },
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
}
