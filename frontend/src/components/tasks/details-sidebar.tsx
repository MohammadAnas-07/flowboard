'use client';

import { Avatar } from '@/components/ui/avatar';
import { ChevronDownIcon } from '@/components/layout/icons';
import { SelectDropdown } from '@/components/shared/select-dropdown';
import {
  ALL_STATUSES,
  PRIORITY_LABELS,
  type Priority,
  STATUS_LABELS,
  type Status,
  type Task,
  type TaskActivity,
} from '@/lib/types';
import { ActivityLog } from './activity-log';
import { DateRangePicker } from './date-range-picker';
import { LabelPicker } from './label-picker';

const PRIORITY_OPTIONS: Priority[] = ['NO_PRIORITY', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];

const STATUS_DOT: Record<Status, string> = {
  BACKLOG: 'bg-zinc-400 dark:bg-zinc-600',
  TODO: 'bg-blue-500',
  DOING: 'bg-yellow-500',
  COMPLETED: 'bg-green-500',
  ON_HOLD: 'bg-red-500',
};

interface DetailsSidebarProps {
  task: Task;
  activity: TaskActivity[];
  onStatusChange: (status: Status) => void;
  onPriorityChange: (priority: Priority) => void;
  onDatesChange: (startDate: string | null, dueDate: string | null) => void;
  onLabelsChange: (labelIds: string[]) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-zinc-500 dark:text-zinc-500">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}

export function DetailsSidebar({
  task,
  activity,
  onStatusChange,
  onPriorityChange,
  onDatesChange,
  onLabelsChange,
}: DetailsSidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 border-t border-black/[.08] p-4 dark:border-white/[.145] lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-black dark:text-zinc-50">Details</h3>
        <div className="flex flex-col gap-3">
          <Field label="Status">
            <SelectDropdown
              value={task.status}
              onChange={(v) => onStatusChange(v as Status)}
              options={ALL_STATUSES.map((s) => ({
                value: s,
                label: STATUS_LABELS[s],
                icon: <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />,
              }))}
              trigger={
                <button
                  type="button"
                  className="ml-auto flex items-center gap-1.5 rounded-md border border-black/[.08] px-2 py-1 text-sm text-zinc-700 hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.08]"
                >
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT[task.status]}`} />
                  {STATUS_LABELS[task.status]}
                  <ChevronDownIcon className="h-3 w-3 text-zinc-400" />
                </button>
              }
            />
          </Field>

          <Field label="Priority">
            <SelectDropdown
              value={task.priority}
              onChange={(v) => onPriorityChange(v as Priority)}
              options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
              trigger={
                <button
                  type="button"
                  className="ml-auto flex items-center gap-1.5 rounded-md border border-black/[.08] px-2 py-1 text-sm text-zinc-700 hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.08]"
                >
                  {PRIORITY_LABELS[task.priority]}
                  <ChevronDownIcon className="h-3 w-3 text-zinc-400" />
                </button>
              }
            />
          </Field>

          <Field label="Members">
            {task.assignees.length ? (
              <div className="flex justify-end -space-x-1.5">
                {task.assignees.map((u) => (
                  <Avatar key={u.id} user={u} size="sm" />
                ))}
              </div>
            ) : (
              <span className="text-sm text-zinc-400">—</span>
            )}
          </Field>

          <Field label="Dates">
            <DateRangePicker
              startDate={task.startDate}
              dueDate={task.dueDate}
              onChange={onDatesChange}
            />
          </Field>

          <Field label="Labels">
            <div className="flex justify-end">
              <LabelPicker selectedLabels={task.labels} onChange={onLabelsChange} />
            </div>
          </Field>

          <Field label="Team">
            {/* No Team model in the data layer yet — the task's project
                stands in as the closest equivalent. See architecture.md
                Known Deviations. */}
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {task.project?.name ?? '—'}
            </span>
          </Field>

          <Field label="Reporter">
            {/* No reporter/createdBy field on Task yet — see architecture.md
                Known Deviations (same gap as the list view's Reporter column). */}
            <span className="text-sm text-zinc-400">—</span>
          </Field>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">Updates</h3>
        <ActivityLog entries={activity} />
      </div>
    </aside>
  );
}
