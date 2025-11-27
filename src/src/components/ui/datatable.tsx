type Column<T, K extends keyof T = keyof T> = {
  header: string;
  accessor?: K;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
};

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
  return (
    <div className="hidden md:block overflow-auto rounded-lg border shadow-lg">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={`px-4 py-3 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((col, colIndex) => {
                const value = col.accessor ? row[col.accessor] : null;
                const content = col.render
                  ? col.render(row)
                  : value !== null && value !== undefined
                    ? String(value)
                    : null;

                return (
                  <td key={colIndex} className="px-4 py-3">
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
