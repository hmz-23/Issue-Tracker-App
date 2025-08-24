// pages/api/issues/[id]/comments/[commentId].js
// This file handles API requests for a single comment by its ID.

import { PrismaClient } from '@prisma/client';

// Initialize the Prisma Client
const prisma = new PrismaClient();

/**
 * Main handler function for all requests to this API route.
 * @param {object} req - The incoming request object.
 * @param {object} res - The response object.
 */
export default async function handler(req, res) {
  // Extract the comment ID from the request query parameters.
  const { commentId } = req.query;

  // Use a switch statement to handle different HTTP methods.
  switch (req.method) {
    case 'GET':
      // Handle GET request: Fetch a single comment by its ID.
      try {
        const comment = await prisma.comment.findUnique({
          where: { id: commentId },
          include: {
            author: true,
          },
        });

        if (!comment) {
          return res.status(404).json({ error: 'Comment not found.' });
        }

        return res.status(200).json(comment);
      } catch (error) {
        console.error('Error fetching comment:', error);
        return res.status(500).json({ error: 'Failed to fetch comment.' });
      }

    case 'PUT':
      // Handle PUT request: Update a comment.
      try {
        const updatedComment = await prisma.comment.update({
          where: { id: commentId },
          data: req.body,
        });

        return res.status(200).json(updatedComment);
      } catch (error) {
        console.error('Error updating comment:', error);
        return res.status(500).json({ error: 'Failed to update comment.' });
      }

    case 'DELETE':
      // Handle DELETE request: Delete a comment.
      try {
        await prisma.comment.delete({
          where: { id: commentId },
        });

        return res.status(204).end(); // No content on successful deletion.
      } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ error: 'Failed to delete comment.' });
      }

    default:
      // Handle unsupported methods.
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
