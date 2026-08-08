import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

// Pure DTO validation, no DB or Nest module needed to run these — the
// class-validator decorators are what actually rejects bad input before it
// reaches Prisma (see architecture.md Section 3), so this is what's worth
// testing directly.
async function validateDto(input: Record<string, unknown>) {
  const dto = plainToInstance(CreateTaskDto, input);
  return validate(dto);
}

describe('CreateTaskDto', () => {
  it('accepts a minimal valid payload (title only)', async () => {
    const errors = await validateDto({ title: 'Write tests' });
    expect(errors).toHaveLength(0);
  });

  it('accepts a fully-populated valid payload', async () => {
    const errors = await validateDto({
      title: 'Ship feature',
      description: 'Some detail',
      status: 'DOING',
      priority: 'HIGH',
      startDate: '2026-01-01T00:00:00.000Z',
      dueDate: '2026-01-15T00:00:00.000Z',
      resourceUrl: 'https://example.com/doc',
      projectId: '11111111-1111-4111-8111-111111111111',
      assigneeIds: ['22222222-2222-4222-8222-222222222222'],
      labelIds: ['33333333-3333-4333-8333-333333333333'],
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing title', async () => {
    const errors = await validateDto({});
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('rejects a title over 200 characters', async () => {
    const errors = await validateDto({ title: 'x'.repeat(201) });
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('rejects a status value outside the Status enum', async () => {
    const errors = await validateDto({ title: 'Task', status: 'NOT_A_STATUS' });
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('rejects a priority value outside the Priority enum', async () => {
    const errors = await validateDto({ title: 'Task', priority: 'SUPER_URGENT' });
    expect(errors.some((e) => e.property === 'priority')).toBe(true);
  });

  it('rejects a non-UUID projectId', async () => {
    const errors = await validateDto({ title: 'Task', projectId: 'not-a-uuid' });
    expect(errors.some((e) => e.property === 'projectId')).toBe(true);
  });

  it('rejects a non-ISO8601 dueDate', async () => {
    const errors = await validateDto({ title: 'Task', dueDate: '15th of January' });
    expect(errors.some((e) => e.property === 'dueDate')).toBe(true);
  });

  it('rejects a non-UUID entry inside assigneeIds', async () => {
    const errors = await validateDto({ title: 'Task', assigneeIds: ['not-a-uuid'] });
    expect(errors.some((e) => e.property === 'assigneeIds')).toBe(true);
  });
});
