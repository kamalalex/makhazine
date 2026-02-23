"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    PackageSearch,
    History,
    FileDown,
    Building2,
    Lock,
    ArrowRightLeft
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StockMovementDialog } from "./StockMovementDialog";
import { StockHistoryDialog } from "./StockHistoryDialog";
import { EditProductDialog } from "./EditProductDialog";
import { StockTransferDialog } from "./StockTransferDialog";
import { deleteProduct } from "@/actions/stock";
import { exportToExcel } from "@/lib/excel-export";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductTableProps {
    products: any[];
    warehouses: any[];
    userPlan?: string;
}

export function ProductTable({ products, warehouses, userPlan }: ProductTableProps) {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [movementType, setMovementType] = useState<"IN" | "OUT" | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);

    const isBasic = userPlan === "BASIC";

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) {
            await deleteProduct(id);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {isBasic ? (
                        <Button disabled className="rounded-xl bg-slate-100 text-slate-400 border-none font-bold gap-2 cursor-not-allowed">
                            <Building2 className="h-4 w-4" />
                            Gestion des Dépôts <Lock className="h-3 w-3" />
                        </Button>
                    ) : (
                        <Link href="/dashboard/warehouses">
                            <Button variant="outline" className="rounded-xl border-slate-200 font-bold hover:bg-orange-50 hover:text-orange-600 gap-2 h-11 transition-all">
                                <Building2 className="h-4 w-4" />
                                Gestion des Dépôts
                            </Button>
                        </Link>
                    )}
                </div>
                <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 font-bold hover:bg-slate-50 gap-2 h-11"
                    onClick={() => exportToExcel(products, "Inventaire_Stock")}
                >
                    <FileDown className="h-4 w-4" />
                    Exporter Excel
                </Button>
            </div>

            <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border-none overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                            <TableHead className="pl-8 h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Référence</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Désignation</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Inventaire / Dépôts</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Flux (E/S)</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Stock Global</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Statut</TableHead>
                            <TableHead className="pr-8 h-14 text-right font-black text-[10px] uppercase tracking-widest text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-24 bg-white">
                                    <PackageSearch className="h-16 w-16 text-slate-100 mx-auto mb-4" />
                                    <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucun article trouvé</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => {
                                const isLowStock = product.stock <= product.lowStockAlert && product.stock > 0;
                                const isOutOfStock = product.stock <= 0;

                                return (
                                    <TableRow key={product.id} className="hover:bg-slate-50/80 transition-colors border-slate-50 group">
                                        <TableCell className="pl-8 py-5 font-black text-xs text-orange-600 font-mono">
                                            {product.reference}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-slate-900">{product.name}</div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.brand || "—"}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {product.warehouseStocks?.length > 0 ? (
                                                    <>
                                                        {product.warehouseStocks.map((ws: any) => (
                                                            <Badge key={ws.id} variant="outline" className="text-[8px] h-4 py-0 px-2 bg-slate-50 border-slate-100 font-bold whitespace-nowrap">
                                                                {ws.warehouse.name} ({ws.warehouse.city}): {ws.quantity}
                                                            </Badge>
                                                        ))}
                                                        {(() => {
                                                            const assignedStock = product.warehouseStocks.reduce((acc: number, ws: any) => acc + ws.quantity, 0);
                                                            const unassigned = product.stock - assignedStock;
                                                            return unassigned > 0 ? (
                                                                <Badge variant="outline" className="text-[8px] h-4 py-0 px-2 bg-orange-50 border-orange-100 text-orange-600 font-black whitespace-nowrap border-dashed">
                                                                    Stock non affecté: {unassigned}
                                                                </Badge>
                                                            ) : null;
                                                        })()}
                                                    </>
                                                ) : (
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Stock global non affecté ({product.stock})</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <span className="font-black text-emerald-600 text-[11px]">+{product.totalIn || 0}</span>
                                                <span className="font-black text-red-500 text-[11px]">-{product.totalOut || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <span className={cn(
                                                    "font-black text-lg",
                                                    isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-slate-900"
                                                )}>
                                                    {product.stock}
                                                </span>
                                                {(isLowStock || isOutOfStock) && (
                                                    <AlertCircle className={`h-4 w-4 ml-2 animate-pulse ${isOutOfStock ? "text-red-500" : "text-orange-500"}`} />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {isOutOfStock ? (
                                                <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none px-3 h-6 font-black uppercase text-[9px] rounded-full">Rupture</Badge>
                                            ) : isLowStock ? (
                                                <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-50 border-none px-3 h-6 font-black uppercase text-[9px] rounded-full">Critique</Badge>
                                            ) : (
                                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-3 h-6 font-black uppercase text-[9px] rounded-full">Optimal</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-2xl hover:bg-orange-50 text-orange-600 transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-orange-200"
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setMovementType("IN");
                                                    }}
                                                >
                                                    <ArrowUpRight className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-2xl hover:bg-red-50 text-red-600 transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-red-200"
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setMovementType("OUT");
                                                    }}
                                                >
                                                    <ArrowDownRight className="h-5 w-5" />
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[200px] bg-white">
                                                        <DropdownMenuItem
                                                            className="cursor-pointer rounded-xl font-bold text-xs py-3 gap-3"
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setEditOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4 text-slate-400" /> Modifier l'article
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer rounded-xl font-bold text-xs py-3 gap-3 text-orange-600"
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setHistoryOpen(true);
                                                            }}
                                                        >
                                                            <History className="h-4 w-4" /> Voir l'historique
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer rounded-xl font-bold text-xs py-3 gap-3 text-blue-600"
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setTransferOpen(true);
                                                            }}
                                                        >
                                                            <ArrowRightLeft className="h-4 w-4" /> Transfert Inter-Dépôts
                                                        </DropdownMenuItem>
                                                        <div className="h-[1px] bg-slate-100 my-2" />
                                                        <DropdownMenuItem
                                                            className="text-red-600 cursor-pointer rounded-xl font-bold text-xs py-3 gap-3 hover:bg-red-50"
                                                            onClick={() => handleDelete(product.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Supprimer du catalogue
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedProduct && movementType && (
                <StockMovementDialog
                    product={selectedProduct}
                    type={movementType}
                    open={!!movementType}
                    onOpenChange={(open) => !open && setMovementType(null)}
                    warehouses={warehouses}
                />
            )}

            {selectedProduct && historyOpen && (
                <StockHistoryDialog
                    product={selectedProduct}
                    open={historyOpen}
                    onOpenChange={setHistoryOpen}
                />
            )}

            {selectedProduct && editOpen && (
                <EditProductDialog
                    product={selectedProduct}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    warehouses={warehouses}
                />
            )}

            {selectedProduct && transferOpen && (
                <StockTransferDialog
                    product={selectedProduct}
                    open={transferOpen}
                    onOpenChange={setTransferOpen}
                    warehouses={warehouses}
                />
            )}
        </div>
    );
}
