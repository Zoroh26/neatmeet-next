
import React from "react";
import { useReactTable, ColumnDef, flexRender, getCoreRowModel, RowData } from "@tanstack/react-table";

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    onEdit?: (data: TData) => void;
    onDelete?: (data: TData) => void;
  }
}

interface GenericTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (data: T) => void;
  onDelete?: (data: T) => void;
}

export function GenericTable<T extends object>({ data, columns, loading, error, onEdit, onDelete }: GenericTableProps<T>) {
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onEdit,
      onDelete,
    },
  });

  if (loading) {
    return <div className="text-center p-12 font-black text-2xl uppercase tracking-widest">Loading...</div>;
  }
  if (error) {
    return <div className="bg-red-100 border-4 border-red-500 text-red-700 px-6 py-4 font-black uppercase tracking-wide mb-6 shadow-[4px_4px_0px_0px_#ef4444]">Error: {error}</div>;
  }
  if (!data || data.length === 0) {
    return <div className="text-center p-12 font-black text-2xl uppercase tracking-widest">No Data Found</div>;
  }

  return (
    <div className="overflow-x-auto bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-800 text-white uppercase tracking-widest text-sm">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="p-5 border-b-4 border-black font-black">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y-4 divide-gray-300">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-red-50 transition-colors duration-200">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-5 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
