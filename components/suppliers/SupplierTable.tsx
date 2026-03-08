"use client";

import { useState } from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
} from "lucide-react";
import Link from "next/link";

export function SupplierTable({ data }: { data: any[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Fournisseur",
            cell: ({ row }) => {
                const supplier = row.original;
                return (
                    <span className="font-black text-slate-900 uppercase text-xs tracking-tight">{supplier.name}</span>
                );
            },
        },
        {
            accessorKey: "contactName",
            header: "Contact",
            cell: ({ row }) => {
                const supplier = row.original;
                return (
                    <span className="text-[10px] font-bold text-slate-500">
                        {supplier.contactName || "—"}
                    </span>
                );
            },
        },
        {
            accessorKey: "phone",
            header: "Téléphone",
            cell: ({ row }) => {
                const supplier = row.original;
                return (
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                        {supplier.phone || "—"}
                    </span>
                );
            },
        },
        {
            accessorKey: "orders",
            header: () => <div className="text-center">Commandes</div>,
            cell: ({ row }) => {
                const count = row.original.purchaseOrders?.length || 0;
                return (
                    <div className="flex justify-center">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 h-6 font-black uppercase text-[9px] rounded-full tracking-wider">
                            {count} BC
                        </Badge>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Action</div>,
            cell: ({ row }) => {
                const supplier = row.original;
                return (
                    <div className="flex items-center justify-end">
                        <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-emerald-600 hover:text-white transition-all bg-white border border-slate-200 shadow-sm">
                            <Link href={`/dashboard/suppliers/${supplier.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 px-8 pt-4">
                <div className="relative w-full max-w-sm group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <Input
                        placeholder="Rechercher un fournisseur..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="h-12 pl-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500/20 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-10 w-10 p-0 rounded-xl border border-slate-200 bg-white disabled:opacity-30"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-10 w-10 p-0 rounded-xl border border-slate-200 bg-white disabled:opacity-30"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-100">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-14 font-black text-slate-500 uppercase text-[10px] tracking-widest px-8">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-slate-50/50 transition-colors border-slate-100 group h-20"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-8">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-40 text-center text-slate-400 font-bold uppercase text-xs tracking-widest"
                                >
                                    Aucun fournisseur trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-8 pb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Total: {data.length} fournisseurs
                </p>
            </div>
        </div>
    );
}
