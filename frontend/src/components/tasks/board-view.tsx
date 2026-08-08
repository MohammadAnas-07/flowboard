'use client';

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { PlusIcon } from '@/components/layout/icons';
import { BOARD_STATUSES, STATUS_LABELS, type Status, type Task } from '@/lib/types';
import { TaskCard } from './task-card';

function DraggableTaskCard({ task, onOpen }: { task: Task; onOpen: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab touch-none active:cursor-grabbing ${isDragging ? 'opacity-40' : ''}`}
    >
      {/* dnd-kit's 4px activation distance means a plain click (no drag)
          still reaches this handler normally. */}
      <TaskCard task={task} onOpen={() => onOpen(task.id)} />
    </div>
  );
}

function QuickAddTask({
  onSubmit,
  onCancel,
}: {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim()) onSubmit(title.trim());
      }}
      className="flex flex-col gap-1.5 rounded-lg border border-black/[.08] bg-white p-2 dark:border-white/[.145] dark:bg-zinc-950"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        onBlur={() => !title && onCancel()}
        placeholder="Task title…"
        className="w-full bg-transparent text-sm text-black outline-none placeholder:text-zinc-400 dark:text-zinc-50"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-accent px-2 py-1 text-xs font-medium text-accent-foreground"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-black/[.04] dark:hover:bg-white/[.08]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Column({
  status,
  tasks,
  onCreateTask,
  onOpenTask,
}: {
  status: Status;
  tasks: Task[];
  onCreateTask: (status: Status, title: string) => void;
  onOpenTask: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-zinc-100 dark:bg-zinc-950/40">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {STATUS_LABELS[status]}
          <span className="rounded-full bg-zinc-200 px-1.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          title="Add task"
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-black/[.06] hover:text-zinc-700 dark:hover:bg-white/[.08] dark:hover:text-zinc-200"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[80px] flex-1 flex-col gap-2 overflow-y-auto rounded-b-lg p-2 pt-0 transition-colors ${
          isOver ? 'bg-black/[.05] dark:bg-white/[.06]' : ''
        }`}
      >
        {adding && (
          <QuickAddTask
            onSubmit={(title) => {
              onCreateTask(status, title);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        )}
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} onOpen={onOpenTask} />
        ))}
      </div>
    </div>
  );
}

export function BoardView({
  tasks,
  onMoveTask,
  onCreateTask,
  onOpenTask,
}: {
  tasks: Task[];
  onMoveTask: (id: string, status: Status) => void;
  onCreateTask: (status: Status, title: string) => void;
  onOpenTask: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as Status;
    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== newStatus) {
      onMoveTask(task.id, newStatus);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 gap-3 overflow-x-auto p-4">
        {BOARD_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onCreateTask={onCreateTask}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
    </DndContext>
  );
}
