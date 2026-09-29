"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input } from "@/components/ui/field";

import type { ActionResult } from "@/app/actions/action-result";

/** Every master-data row this editor touches is identified by id and name. */
type Row = { id: number; name: string };

type SaveAction = (
  prev: ActionResult<Row> | null,
  formData: FormData,
) => Promise<ActionResult<Row>>;

type DeleteAction = (
  prev: ActionResult<{ deleted: number }> | null,
  formData: FormData,
) => Promise<ActionResult<{ deleted: number }>>;

/**
 * Inline create / rename / delete for a flat master-data list.
 *
 * Departments and positions have exactly this shape — a name and a set of
 * server-guarded mutations — so it is written once and shared, rather than
 * copy-pasted per screen.
 */
export function NamedListEditor({
  title,
  description,
  rows,
  emptyTitle,
  emptyDescription,
  nameLabel,
  namePlaceholder,
  saveAction,
  deleteAction,
}: {
  title: string;
  description: string;
  rows: Row[];
  emptyTitle: string;
  emptyDescription: string;
  nameLabel: string;
  namePlaceholder: string;
  /** Called with no `id` to create, and with one to rename. */
  saveAction: SaveAction;
  deleteAction: DeleteAction;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody className="flex flex-col gap-md">
        <CreateRow action={saveAction} nameLabel={nameLabel} placeholder={namePlaceholder} />

        {rows.length ? (
          <ul className="flex flex-col divide-y divide-outline-variant/15">
            {rows.map((row) => (
              <ListRow
                key={`${row.id}-${row.name}`}
                row={row}
                saveAction={saveAction}
                deleteAction={deleteAction}
                nameLabel={nameLabel}
                placeholder={namePlaceholder}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="inventory_2"
            title={emptyTitle}
            description={emptyDescription}
          />
        )}
      </CardBody>
    </Card>
  );
}

function FormMessage({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1 text-caption text-error" role="alert">
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
        error
      </span>
      {message}
    </p>
  );
}

function CreateRow({
  action,
  nameLabel,
  placeholder,
}: {
  action: SaveAction;
  nameLabel: string;
  placeholder: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null);

  // Uncontrolled, keyed on the created row's id: a successful create remounts
  // the input empty. Clearing it through state would mean a setState inside an
  // effect, and holding it in state would make it controlled on every keystroke
  // for no benefit — the form posts through `formAction`, not on change.
  const inputKey = state?.ok ? state.data.id : 0;

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Field label={nameLabel} htmlFor="new-master-row" className="flex-1">
          <Input
            key={inputKey}
            id="new-master-row"
            name="name"
            placeholder={placeholder}
            invalid={!!state && !state.ok}
            required
          />
        </Field>
        <Button type="submit" icon="add" disabled={pending} className="h-10">
          {pending ? "Menyimpan..." : "Tambah"}
        </Button>
      </div>
      {state && !state.ok ? <FormMessage message={state.message} /> : null}
      {state?.ok ? <p className="text-caption text-success">{state.message}</p> : null}
    </form>
  );
}

function ListRow({
  row,
  saveAction,
  deleteAction,
  nameLabel,
  placeholder,
}: {
  row: Row;
  saveAction: SaveAction;
  deleteAction: DeleteAction;
  nameLabel: string;
  placeholder: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(row.name);

  // The parent keys this row on `id-name`, so a successful rename remounts it
  // with editing already closed and the new name loaded — no state reset in an
  // effect, and the row never shows a name the server has not accepted.
  const [saveState, saveFormAction, saving] = useActionState(saveAction, null);
  const [deleteState, deleteFormAction, deleting] = useActionState(deleteAction, null);

  useEffect(() => {
    if (saveState?.ok || deleteState?.ok) router.refresh();
  }, [saveState, deleteState, router]);

  return (
    <li className="flex flex-wrap items-center gap-2 py-2.5">
      {editing ? (
        <form
          action={saveFormAction}
          className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="id" value={row.id} />
          <Field label={nameLabel} htmlFor={`rename-${row.id}`} className="flex-1">
            <Input
              id={`rename-${row.id}`}
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={placeholder}
              invalid={!!saveState && !saveState.ok}
              required
            />
          </Field>
          <div className="flex gap-1.5">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setName(row.name);
                setEditing(false);
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="w-8 shrink-0 text-caption text-tertiary">{row.id}</span>
          <span className="min-w-0 flex-1 truncate text-body-md text-on-surface">
            {row.name}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon="edit"
            onClick={() => setEditing(true)}
          >
            Ubah
          </Button>
        </div>
      )}

      <form action={deleteFormAction}>
        <input type="hidden" name="id" value={row.id} />
        <Button type="submit" size="sm" variant="danger" icon="delete" disabled={deleting}>
          {deleting ? "Menghapus..." : "Hapus"}
        </Button>
      </form>

      {saveState && !saveState.ok ? <FormMessage message={saveState.message} /> : null}
      {deleteState && !deleteState.ok ? <FormMessage message={deleteState.message} /> : null}
    </li>
  );
}
