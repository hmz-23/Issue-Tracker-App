import { authMiddleware, adminAuthMiddleware } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      await handleGetIssue(req, res);
      break;
    case 'PUT':
      await handleUpdateIssue(req, res);
      break;
    case 'DELETE':
      await handleDeleteIssue(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
      break;
  }
}

async function handleGetIssue(req, res) {
  const { id } = req.query;

  try {
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        author: { select: { email: true } },
        comments: {
          include: { author: { select: { email: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch issue' });
  }
}

async function handleUpdateIssue(req, res) {
  const { id } = req.query;
  const { title, body, status } = req.body;

  try {
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const authResult = await new Promise((resolve) => authMiddleware((req, res) => resolve({ req, res }))(req, res));
    if (authResult.res.statusCode !== 200) return authResult.res.json();

    const isAuthor = authResult.req.user.id === issue.authorId;
    const isAdmin = authResult.req.user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedData = {};
    if (title) updatedData.title = title;
    if (body) updatedData.body = body;
    if (status) updatedData.status = status;

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: updatedData,
      include: { author: { select: { email: true } } },
    });
    res.status(200).json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update issue' });
  }
}

async function handleDeleteIssue(req, res) {
  const { id } = req.query;

  try {
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const authResult = await new Promise((resolve) => authMiddleware((req, res) => resolve({ req, res }))(req, res));
    if (authResult.res.statusCode !== 200) return authResult.res.json();

    const isAuthor = authResult.req.user.id === issue.authorId;
    const isAdmin = authResult.req.user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.issue.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete issue' });
  }
}