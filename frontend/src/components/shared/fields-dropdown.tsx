'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, FunnelIcon, SlidersIcon } from '@/components/layout/icons';
import type { MultiSelectOption } from './multi-select-dropdown';

export type FieldOption = MultiSelectOption;

/** A field with a fixed set of discrete values (Status, Priority) — rendered
 * as a nested submenu of its values instead of a checkbox. */
export interface FilterField {
  key: string;
  label: string;
  values: FieldOption[];
}

interface FieldsDropdownProps {
  /** Plain fields (Members, Due Date, Labels, Reporter) — checkbox toggling
   * column visibility. */
  fields?: FieldOption[];
  visible?: Set<string>;
  onToggle?: (key: string) => void;
  /** Status/Priority-style fields — opens a submenu of values with a
   * checkmark on the active filter; selecting one filters visible rows to
   * that value, re-selecting the active value clears it. */
  filterFields?: FilterField[];
  /** Current filter value per filterField key (or null/absent = no filter). */
  activeFilters?: Record<string, string | null>;
  onFilterChange?: (fieldKey: string, valueKey: string | null) => void;
}

const ITEM_CLASS =
  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 outline-none data-[highlighted]:bg-black/[.04] dark:text-zinc-300 dark:data-[highlighted]:bg-white/[.08]';

const CONTENT_CLASS =
  'z-50 min-w-[180px] rounded-lg border border-black/[.08] bg-white p-1 shadow-lg dark:border-white/[.145] dark:bg-zinc-900';

/**
 * Column-visibility + value-filter dropdown for the task/project list
 * toolbars. Two distinct interactions per the Figma, not combined on a
 * single row: plain fields are checkboxes (unchanged, built for the task
 * list view); Status/Priority-style fields are submenu triggers listing
 * their actual values — picking one filters rows client-side instead of
 * toggling a column. That's why filterable fields don't also appear in
 * `fields`/`visible`: once a field is filterable it's always shown, since
 * there's no longer a checkbox to hide it with.
 */
export function FieldsDropdown({
  fields = [],
  visible = new Set(),
  onToggle,
  filterFields = [],
  activeFilters = {},
  onFilterChange,
}: FieldsDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-black/[.08] px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.08]"
          >
            <SlidersIcon className="h-3.5 w-3.5" />
            Fields
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" sideOffset={6} className={CONTENT_CLASS}>
            {filterFields.map((field) => {
              const active = activeFilters[field.key] ?? null;
              return (
                <DropdownMenu.Sub key={field.key}>
                  <DropdownMenu.SubTrigger className={`${ITEM_CLASS} justify-between`}>
                    {field.label}
                    <ChevronRightIcon className="h-3.5 w-3.5 text-zinc-400" />
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent sideOffset={4} className={CONTENT_CLASS}>
                      {field.values.map((value) => (
                        <DropdownMenu.Item
                          key={value.key}
                          onSelect={() =>
                            onFilterChange?.(field.key, active === value.key ? null : value.key)
                          }
                          className={ITEM_CLASS}
                        >
                          <span className="flex h-4 w-4 items-center justify-center">
                            {active === value.key && <CheckIcon className="h-3.5 w-3.5" />}
                          </span>
                          {value.label}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
              );
            })}
  
            {filterFields.length > 0 && fields.length > 0 && (
              <DropdownMenu.Separator className="my-1 h-px bg-black/[.06] dark:bg-white/[.08]" />
            )}
  
            {fields.map((field) => (
              <DropdownMenu.CheckboxItem
                key={field.key}
                checked={visible.has(field.key)}
                onCheckedChange={() => onToggle?.(field.key)}
                onSelect={(e) => e.preventDefault()}
                className={ITEM_CLASS}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded border border-black/[.15] dark:border-white/[.2]">
                  <DropdownMenu.ItemIndicator>
                    <CheckIcon className="h-3 w-3" />
                  </DropdownMenu.ItemIndicator>
                </span>
                {field.label}
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Present in the Figma toolbar next to "Fields", but the source file
          defines no click behavior or panel for it, so it's rendered purely
          decorative: aria-hidden, no handler, no pointer events. Filtering
          lives in the Fields dropdown's Status/Priority submenus. See
          architecture.md Known Deviations. */}
      <FunnelIcon
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-600"
      />
    </div>
  );
}
