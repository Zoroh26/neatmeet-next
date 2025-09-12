import React from "react";
import { useReactTable, ColumnDef, flexRender, getCoreRowModel } from "@tanstack/react-table";
import { Employee } from "../types";
import { FaEdit, FaTrash } from "react-icons/fa";


interface EmployeeTableProps {
  employees: Employee[];
  loading?: boolean;
  error?: string | null;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, loading, error, onEdit, onDelete, pageIndex, pageSize, pageCount, onPageChange, globalFilter, onGlobalFilterChange }) => {
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: info => <span className="font-bold text-lg">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: info => <span className="text-gray-600">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: info => <span className="italic">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: info => {
        const role = info.getValue() as string;
        const roleClasses = role === 'admin' 
          ? 'bg-red-500 text-white font-black uppercase px-3 py-1 text-xs rounded-full shadow-md'
          : 'bg-gray-200 text-gray-800 font-bold uppercase px-3 py-1 text-xs rounded-full';
        return <span className={roleClasses}>{role}</span>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-3 justify-end">
          <button 
            onClick={() => onEdit(row.original)} 
            className="bg-blue-500 hover:bg-blue-600 border-2 border-black text-white p-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
          >
            <FaEdit size={16} />
          </button>
          <button 
            onClick={() => onDelete(row.original)} 
            className="bg-red-500 hover:bg-red-600 border-2 border-black text-white p-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: employees || [],
    columns,
    state: {
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onGlobalFilterChange: onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: undefined,
    getPaginationRowModel: undefined,
    manualPagination: true,
    pageCount,
  });

  if (loading) {
    return <div className="text-center p-12 font-black text-2xl uppercase tracking-widest">Loading...</div>;
  }
  if (error) {
    return <div className="bg-red-100 border-4 border-red-500 text-red-700 px-6 py-4 font-black uppercase tracking-wide mb-6 shadow-[4px_4px_0px_0px_#ef4444]">Error: {error}</div>;
  }
  if (!employees || employees.length === 0) {
    return <div className="text-center p-12 font-black text-2xl uppercase tracking-widest">No Employees Found</div>;
  }

  return (
    <div className="overflow-x-auto bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000]">
      {/* Filter UI */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          value={globalFilter}
          onChange={e => onGlobalFilterChange(e.target.value)}
          placeholder="Search employees..."
          className="border-2 border-black px-3 py-2 rounded font-bold"
        />
      </div>
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
      {/* Pagination Controls */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
          className="px-3 py-1 border-2 border-black bg-gray-200 font-bold disabled:opacity-50"
        >
          Previous
        </button>
        <span className="font-bold">Page {pageIndex + 1} of {pageCount}</span>
        <button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex + 1 >= pageCount}
          className="px-3 py-1 border-2 border-black bg-gray-200 font-bold disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeeTable;   