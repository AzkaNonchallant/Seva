import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  /** Right-align numeric cells. */
  align?: "left" | "right";
  className?: string;
  cell: (row: T) => React.ReactNode;
};

const ALIGN = { left: "text-left", right: "text-right" } as const;

/**
 * Wraps the table in its own scroll container so wide columns never push the
 * page sideways on narrow viewports.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
}: {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
}) {
  if (!rows.length && empty) return <>{empty}</>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant/20">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "p-4 text-label-md font-medium text-on-surface-variant",
                  ALIGN[column.align ?? "left"],
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "transition-colors hover:bg-surface-container-lowest",
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "p-4 text-body-md text-on-surface",
                    ALIGN[column.align ?? "left"],
                    column.className,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableFooter({
  from,
  to,
  total,
}: {
  from: number;
  to: number;
  total: number;
}) {
  return (
    <div className="border-t border-outline-variant/20 p-4">
      <span className="text-caption text-on-surface-variant">
        {total === 0
          ? "Tidak ada data"
          : `Menampilkan ${from}–${to} dari ${total} data`}
      </span>
    </div>
  );
}
