// pages/api/issues/index.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const { status, include } = req.query;
        let where = {};
        let includeRelations = {};

        // Add filter by status if it exists.
        if (status) {
          where = { status };
        }

        // Check if related data should be included.
        if (include) {
          const relations = include.split(',');
          relations.forEach(relation => {
            if (relation === 'author') {
              includeRelations.author = true;
            }
            if (relation === 'comments') {
              includeRelations.comments = {
                include: {
                  author: true // Also include the author of the comment
                }
              };
            }
          });
        }

        const issues = await prisma.issue.findMany({
          where,
          include: Object.keys(includeRelations).length > 0 ? includeRelations : undefined,
          orderBy: { createdAt: 'desc' },
        });

        res.status(200).json(issues);
      } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ error: 'Failed to fetch issues.' });
      }
      break;

    case 'POST':
      try {
        const { title, body, authorId } = req.body;
        const newIssue = await prisma.issue.create({
          data: {
            title,
            body,
            status: 'OPEN',
            authorId,
          },
        });
        res.status(201).json(newIssue);
      } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({ error: 'Failed to create issue.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
