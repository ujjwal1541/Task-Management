import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const dexter = await prisma.user.create({
    data: {
      email: 'dexter@gmail.com',
      name: 'Dexter',
      username: 'Dexuser',
      title: 'Designer',
      avatarUrl: '',
    },
  });
  const chris = await prisma.user.create({
    data: { email: 'chris@gmail.com', name: 'Chris Newman', username: 'CN', title: 'Engineer' },
  });

  const project = await prisma.project.create({
    data: { name: 'Design Homepage', priority: 'high', leadId: dexter.id, dueDate: new Date('2026-09-12') },
  });
  await prisma.project.create({
    data: { name: 'Develop Login Feature', priority: 'low', leadId: chris.id, dueDate: new Date('2026-09-15') },
  });
  await prisma.project.create({
    data: { name: 'Test Payment Gateway', priority: 'medium', dueDate: new Date('2026-09-18') },
  });

  const board: Array<[string, string[]]> = [
    ['To Do', ['Write API Documentation', 'Implement Search Function', 'Deploy to Production']],
    ['Doing', ['Code Review Completed', 'Design Mockups Finalized']],
    ['Completed', ['Feature Testing Passed', 'UI Design Updated', 'Security Audit Scheduled']],
    ['On Hold', ['UI Review Pending', 'Backend Integration', 'User Feedback Review', 'Performance Tuning']],
  ];

  const priorities = ['high', 'low', 'medium', 'urgent'];
  let seq = 0;
  for (const [status, titles] of board) {
    for (const [i, title] of titles.entries()) {
      const task = await prisma.task.create({
        data: {
          title,
          description:
            'Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.',
          status,
          priority: priorities[seq % priorities.length],
          dueDate: new Date(2026, 8, 12 + (seq % 8)),
          labels: 'Research,Design,Development,Testing,Deployment',
          order: i,
          assigneeId: seq % 2 === 0 ? dexter.id : chris.id,
          projectId: project.id,
        },
      });
      if (seq === 0) {
        for (let s = 1; s <= 3; s++) {
          await prisma.task.create({
            data: {
              title: `Subtask ${s}`,
              status,
              priority: ['high', 'low', 'medium'][s - 1],
              dueDate: new Date(2026, 8, 12 + s * 3),
              parentId: task.id,
              assigneeId: s % 2 === 0 ? chris.id : dexter.id,
            },
          });
        }
        await prisma.comment.create({ data: { body: 'Looks good, ready for review.', taskId: task.id, authorId: dexter.id } });
      }
      seq++;
    }
  }
  console.log('Seed complete.');
}

main().finally(() => prisma.$disconnect());
