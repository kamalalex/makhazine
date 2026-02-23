"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    MapPin,
    User,
    Mail,
    Package,
    Phone,
    Edit,
    Trash2,
    MoreHorizontal,
    History
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteWarehouse } from "@/actions/warehouse";
import { EditWarehouseDialog } from "@/components/stock/EditWarehouseDialog";
import { WarehouseHistoryDialog } from "@/components/stock/WarehouseHistoryDialog";
import { useRouter } from "next/navigation";

interface WarehouseListProps {
    warehouses: any[];
}

export function WarehouseList({ warehouses }: WarehouseListProps) {
    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce dépôt ? Cette action est irréversible.")) {
            try {
                await deleteWarehouse(id);
                router.refresh();
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    if (warehouses.length === 0) {
        return (
            <div className="col-span-full py-20 text-center bg-white rounded-[32px] shadow-sm border border-slate-50">
                <Building2 className="h-20 w-20 text-slate-100 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-2">Aucun dépôt configuré</h3>
                <p className="text-slate-400 font-medium max-w-md mx-auto">
                    Commencez par ajouter un dépôt pour gérer votre stock par emplacement géographique.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((w) => (
                    <div key={w.id} className="bg-white rounded-[40px] p-8 shadow-2xl shadow-slate-200/40 border border-slate-50 hover:border-orange-100 hover:shadow-orange-200/20 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8">
                            <Building2 className="h-16 w-16 text-slate-50/50 group-hover:text-orange-50 transition-colors -rotate-12 translate-x-4 -translate-y-4" />
                        </div>

                        <div className="flex flex-col h-full space-y-6 relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-3 h-6 font-black uppercase text-[8px] rounded-full mb-3 tracking-[0.2em]">Site Opérationnel</Badge>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">{w.name}</h2>
                                    <div className="flex items-center text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 gap-2">
                                        <MapPin className="h-3 w-3 text-orange-400" />
                                        {w.city}, {w.address}
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 hover:bg-slate-50 transition-all">
                                            <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[180px] bg-white">
                                        <DropdownMenuItem
                                            className="font-bold text-xs py-3 rounded-xl gap-3 cursor-pointer"
                                            onClick={() => {
                                                setSelectedWarehouse(w);
                                                setEditOpen(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4 text-slate-400" /> Modifier le dépôt
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="font-bold text-xs py-3 rounded-xl gap-3 cursor-pointer text-orange-600"
                                            onClick={() => {
                                                setSelectedWarehouse(w);
                                                setHistoryOpen(true);
                                            }}
                                        >
                                            <History className="h-4 w-4" /> Voir activités & flux
                                        </DropdownMenuItem>
                                        <div className="h-[1px] bg-slate-50 my-2" />
                                        <DropdownMenuItem
                                            className="font-bold text-xs py-3 rounded-xl gap-3 text-red-600 hover:bg-red-50 cursor-pointer"
                                            onClick={() => handleDelete(w.id)}
                                        >
                                            <Trash2 className="h-4 w-4" /> Supprimer définitiv.
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-4 group/item">
                                    <div className="h-11 w-11 rounded-2xl bg-slate-50 flex items-center justify-center group-hover/item:bg-orange-50 transition-all shadow-sm">
                                        <User className="h-5 w-5 text-slate-400 group-hover/item:text-orange-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Responsable</p>
                                        <p className="font-bold text-slate-900 text-sm">{w.contactName || "—"}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="h-11 w-11 rounded-2xl bg-slate-50 flex items-center justify-center group-hover/item:bg-orange-50 transition-all shadow-sm">
                                            <Mail className="h-5 w-5 text-slate-400 group-hover/item:text-orange-500" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Email</p>
                                            <p className="font-bold text-slate-900 text-sm truncate">{w.contactEmail || "—"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="h-11 w-11 rounded-2xl bg-slate-50 flex items-center justify-center group-hover/item:bg-orange-50 transition-all shadow-sm">
                                            <Phone className="h-5 w-5 text-slate-400 group-hover/item:text-orange-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Téléphone</p>
                                            <p className="font-bold text-slate-900 text-sm">{w.contactPhone || "—"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="h-11 w-11 rounded-2xl bg-slate-50/50 flex items-center justify-center group-hover/item:bg-orange-50 transition-all shadow-sm">
                                        <Package className="h-5 w-5 text-slate-400 group-hover/item:text-orange-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Inventaire</p>
                                        <p className="font-bold text-slate-900 text-sm">{w.stocks?.length || 0} références en stock</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-auto border-t border-slate-50 flex flex-wrap gap-2">
                                {w.allowedCategories && w.allowedCategories.length > 0 ? (
                                    w.allowedCategories.map((cat: string) => (
                                        <Badge key={cat} variant="outline" className="rounded-xl text-[9px] py-1 px-3 border-slate-100 text-slate-500 font-bold bg-slate-50/50">{cat}</Badge>
                                    ))
                                ) : (
                                    <Badge variant="outline" className="rounded-xl text-[9px] py-1 px-3 border-slate-100 text-slate-400 font-bold italic bg-slate-50/50">Toutes catégories</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedWarehouse && (
                <EditWarehouseDialog
                    warehouse={selectedWarehouse}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                />
            )}

            {selectedWarehouse && (
                <WarehouseHistoryDialog
                    warehouse={selectedWarehouse}
                    open={historyOpen}
                    onOpenChange={setHistoryOpen}
                />
            )}
        </>
    );
}
