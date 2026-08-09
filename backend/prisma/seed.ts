import { PrismaClient, Priority, Status } from '@prisma/client';

const prisma = new PrismaClient();

const LABELS = ['Research', 'Design', 'Development', 'Testing', 'Deployment'];

// Matches AuthService.GUEST_EMAIL — guest login upserts the same row, so
// seeding it here just means the demo data has an owner before anyone has
// clicked "Continue as Guest" for the first time.
const GUEST_EMAIL = 'guest@flowboard.demo';

/** Date `days` from today, normalised to midday so timezone shifts can't roll it to the wrong day. */
function daysOut(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d;
}

type DemoSubtask = {
  title: string;
  status: Status;
  priority: Priority;
};

type DemoTask = {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  labels: string[];
  startsIn?: number;
  dueIn?: number;
  resourceUrl?: string;
  assignGuest?: boolean;
  subtasks?: DemoSubtask[];
  comments?: string[];
};

type DemoProject = {
  name: string;
  priority: Priority;
  dueIn: number;
  tasks: DemoTask[];
};

// One coherent quarter of work for a plausible product team, rather than
// filler rows. Statuses are spread deliberately so every Kanban column has
// something in it and the status/priority filters have something to filter.
const DEMO_PROJECTS: DemoProject[] = [
  {
    name: 'Mobile App Redesign',
    priority: Priority.HIGH,
    dueIn: 42,
    tasks: [
      {
        title: 'Audit current onboarding drop-off',
        description:
          'Pull the funnel numbers for the last two releases and work out which onboarding step loses the most users. Output is a short written summary, not a deck.',
        status: Status.COMPLETED,
        priority: Priority.HIGH,
        labels: ['Research'],
        startsIn: -28,
        dueIn: -18,
      },
      {
        title: 'Design new navigation shell',
        description:
          'Replace the drawer with a bottom tab bar. Needs states for 3, 4 and 5 tabs, plus the overflow case.',
        status: Status.COMPLETED,
        priority: Priority.MEDIUM,
        labels: ['Design'],
        startsIn: -21,
        dueIn: -10,
      },
      {
        title: 'Rebuild bottom tab bar in React Native',
        description:
          'Implement the approved navigation shell. Keep the existing deep-link routes working — the marketing emails point at them.',
        status: Status.DOING,
        priority: Priority.URGENT,
        labels: ['Development'],
        startsIn: -7,
        dueIn: 5,
        assignGuest: true,
        subtasks: [
          {
            title: 'Tab bar component + icons',
            status: Status.COMPLETED,
            priority: Priority.HIGH,
          },
          {
            title: 'Preserve deep-link route mapping',
            status: Status.DOING,
            priority: Priority.URGENT,
          },
          {
            title: 'Safe-area handling on notched devices',
            status: Status.TODO,
            priority: Priority.MEDIUM,
          },
        ],
      },
      {
        title: 'Dark mode colour tokens',
        description:
          'Define the dark palette as tokens so both the app and the marketing site can share it. No hard-coded hex values in components.',
        status: Status.DOING,
        priority: Priority.MEDIUM,
        labels: ['Design'],
        startsIn: -4,
        dueIn: 9,
      },
      {
        title: 'Accessibility pass on form inputs',
        description:
          'Labels, focus order, and contrast ratios across sign-up and settings. Target WCAG AA.',
        status: Status.TODO,
        priority: Priority.HIGH,
        labels: ['Testing'],
        dueIn: 16,
      },
      {
        title: 'Ship to TestFlight beta',
        description:
          'Cut a build for the internal beta group once navigation and dark mode have both landed.',
        status: Status.BACKLOG,
        priority: Priority.MEDIUM,
        labels: ['Deployment'],
        dueIn: 35,
      },
    ],
  },
  {
    name: 'Payments Integration',
    priority: Priority.URGENT,
    dueIn: 21,
    tasks: [
      {
        title: 'Compare Razorpay vs Stripe fees',
        description:
          'Model both on last quarter’s actual transaction volume, including international cards and refunds.',
        status: Status.COMPLETED,
        priority: Priority.HIGH,
        labels: ['Research'],
        startsIn: -24,
        dueIn: -15,
      },
      {
        title: 'Webhook retry + idempotency handling',
        description:
          'Provider retries webhooks on any non-2xx, so the handler has to be safe to run twice on the same event. Store the provider event id and short-circuit on replay. This is the piece most likely to cause double-charges if we get it wrong.',
        status: Status.DOING,
        priority: Priority.URGENT,
        labels: ['Development', 'Testing'],
        startsIn: -6,
        dueIn: 4,
        resourceUrl: 'https://docs.stripe.com/webhooks#handle-duplicate-events',
        assignGuest: true,
        subtasks: [
          {
            title: 'Persist provider event id with a unique index',
            status: Status.COMPLETED,
            priority: Priority.URGENT,
          },
          {
            title: 'Short-circuit handler on replayed event',
            status: Status.DOING,
            priority: Priority.URGENT,
          },
          {
            title: 'Exponential backoff on our own downstream calls',
            status: Status.TODO,
            priority: Priority.HIGH,
          },
          {
            title: 'Replay a captured webhook payload in staging',
            status: Status.TODO,
            priority: Priority.MEDIUM,
          },
        ],
        comments: [
          'Confirmed with the provider that retries can arrive out of order, so ordering by timestamp alone is not enough — we need the event id check.',
          'Unique index is in and the replay path short-circuits correctly in local testing. Backoff work is still open.',
          'Blocking the sandbox cutover on this one until the staging replay passes.',
        ],
      },
      {
        title: 'PCI compliance checklist review',
        description:
          'Waiting on the provider’s completed SAQ before we can close this out. Parked rather than dropped.',
        status: Status.ON_HOLD,
        priority: Priority.HIGH,
        labels: ['Testing'],
        dueIn: 12,
      },
      {
        title: 'Refund flow edge cases',
        description:
          'Partial refunds, refunds after a chargeback has opened, and refunds on an expired card. Each needs a decided behaviour, not just a caught exception.',
        status: Status.TODO,
        priority: Priority.MEDIUM,
        labels: ['Development'],
        dueIn: 14,
      },
      {
        title: 'Sandbox to production cutover plan',
        description:
          'Written runbook with the rollback step spelled out. Nobody should be improvising on cutover day.',
        status: Status.BACKLOG,
        priority: Priority.LOW,
        labels: ['Deployment'],
        dueIn: 20,
      },
    ],
  },
  {
    name: 'Q3 Marketing Site',
    priority: Priority.MEDIUM,
    dueIn: 56,
    tasks: [
      {
        title: 'Rewrite pricing page copy',
        description:
          'Current copy explains features, not outcomes. Rewrite around what the customer gets, and cut the page to a single screen if possible.',
        status: Status.DOING,
        priority: Priority.MEDIUM,
        labels: ['Design'],
        startsIn: -3,
        dueIn: 11,
      },
      {
        title: 'Lighthouse performance budget',
        description:
          'Set a budget in CI and fail the build when it regresses. Hero image and the font loading strategy are the two known offenders.',
        status: Status.TODO,
        priority: Priority.HIGH,
        labels: ['Testing'],
        dueIn: 24,
      },
      {
        title: 'Blog CMS migration',
        description:
          'Move 40-odd posts off the old CMS. Redirects matter more than the migration itself — the top posts carry most of the organic traffic.',
        status: Status.TODO,
        priority: Priority.LOW,
        labels: ['Development'],
        dueIn: 38,
      },
      {
        title: 'Launch checklist and analytics',
        description:
          'Events, goals and a dashboard that someone will actually open the week after launch.',
        status: Status.BACKLOG,
        priority: Priority.MEDIUM,
        labels: ['Deployment'],
        dueIn: 50,
      },
    ],
  },
];

async function seedLabels() {
  for (const name of LABELS) {
    await prisma.label.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`Seeded ${LABELS.length} labels.`);
}

async function seedDemoData() {
  const guest = await prisma.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {},
    create: { email: GUEST_EMAIL, name: 'Guest', isGuest: true },
  });

  let createdProjects = 0;
  let createdTasks = 0;

  for (const demoProject of DEMO_PROJECTS) {
    // Project.name isn't unique in the schema, so upsert isn't available —
    // look it up by name instead. This is what keeps a second run from
    // duplicating the whole board.
    let project = await prisma.project.findFirst({
      where: { name: demoProject.name },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: demoProject.name,
          priority: demoProject.priority,
          dueDate: daysOut(demoProject.dueIn),
          leadId: guest.id,
        },
      });
      createdProjects++;
    }

    for (const demoTask of demoProject.tasks) {
      const existing = await prisma.task.findFirst({
        where: { title: demoTask.title, projectId: project.id },
      });
      if (existing) continue;

      const task = await prisma.task.create({
        data: {
          title: demoTask.title,
          description: demoTask.description,
          status: demoTask.status,
          priority: demoTask.priority,
          startDate:
            demoTask.startsIn === undefined
              ? null
              : daysOut(demoTask.startsIn),
          dueDate:
            demoTask.dueIn === undefined ? null : daysOut(demoTask.dueIn),
          resourceUrl: demoTask.resourceUrl ?? null,
          projectId: project.id,
          labels: {
            connect: demoTask.labels.map((name) => ({ name })),
          },
          assignees: demoTask.assignGuest
            ? { connect: { id: guest.id } }
            : undefined,
        },
      });
      createdTasks++;

      for (const subtask of demoTask.subtasks ?? []) {
        await prisma.subtask.create({
          data: {
            title: subtask.title,
            status: subtask.status,
            priority: subtask.priority,
            parentTaskId: task.id,
          },
        });
      }

      for (const body of demoTask.comments ?? []) {
        await prisma.comment.create({
          data: { body, taskId: task.id, authorId: guest.id },
        });
      }
    }
  }

  console.log(
    `Seeded ${createdProjects} project(s) and ${createdTasks} task(s). ` +
      `Existing rows were left untouched.`,
  );
}

async function main() {
  await seedLabels();
  await seedDemoData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
