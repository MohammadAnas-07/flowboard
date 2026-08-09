# Screenshots

Images referenced by the root `README.md`. Filenames are fixed — the README links to these exact names, so save with the name in the left column or the image won't render.

| Filename | Where | What should be visible |
| --- | --- | --- |
| `board.png` | `/tasks`, **Board** toggle (top right) | Four columns — To Do, Doing, Completed, On Hold. Backlog is deliberately absent from the board (`BOARD_STATUSES` in `frontend/src/lib/types.ts`, architecture.md Section 7); it only appears in the list view. Twelve of the fifteen tasks showing is correct, not a cropped capture. |
| `projects.png` | `/projects` | All three projects with priority, lead and due date. |
| `tasks.png` | `/tasks`, **List** toggle | Status groups including Backlog, which the board omits. The list is an inner scroll container, so a full-page capture can slice rows at the stitch boundaries — that's the capture tool, not a layout bug. |
| `task-detail.png` | `/tasks/<id>` | Open **Webhook retry + idempotency handling** — 4 subtasks, 3 comments, 2 labels and a resource link. Other tasks have empty subtask and comment sections. |
| `settings.png` | `/settings` | Profile, Theme or Color tab. |

The Kanban board lives at `/tasks` behind the List/Board toggle, not on the project detail page — `/projects/<id>` renders a list view only.

## Capture notes

- Browser window around 1440px wide. Narrower and the board columns crowd together.
- Hide bookmarks bar and any personal browser extensions before capturing.
- PNG, not JPG — screenshots of UI compress badly as JPG and text goes fuzzy.
- Keep each file under about 500 KB so the README stays quick to load. Resize to 1440px wide if a shot comes out larger.
- Light mode for all five keeps the set consistent. If you want to show dark mode, add it as a sixth image rather than mixing themes across the set.
- Project names appear in several views, so re-capture the affected shots after any rename in the seed data.
