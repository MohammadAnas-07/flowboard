import { Avatar } from '@/components/ui/avatar';
import type { Task } from '@/lib/types';
import { DueDateBadge, LabelPill } from './status-priority-badges';

export function TaskCard({ task, onOpen }: { task: Task; onOpen?: () => void }) {
  return (
    <div
      onClick={onOpen}
      className={`flex flex-col gap-2 rounded-lg border border-black/[.08] bg-white p-3 text-sm shadow-sm dark:border-white/[.145] dark:bg-zinc-950 ${
        onOpen ? 'cursor-pointer' : ''
      }`}
    >
      <p className="font-medium text-black dark:text-zinc-50">{task.title}</p>

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <LabelPill key={label.id} name={label.name} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <DueDateBadge dueDate={task.dueDate} />
        {task.assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 3).map((user) => (
              <Avatar key={user.id} user={user} size="sm" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
