"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getWarehouseHistory } from "@/actions/warehouse";
import { History, ArrowUpRight, ArrowDownRight, Calendar, Package, ArrowRightLeft, FileDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { exportMovementsToExcel } from "@/lib/excel-export";
import { useSession } from "next-auth/react";

interface WarehouseHistoryDialogProps {
    warehouse: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WarehouseHistoryDialog({ warehouse, open, onOpenChange }: WarehouseHistoryDialogProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN";

    useEffect(() => {
        if (open && warehouse?.id) {
            setLoading(true);
            getWarehouseHistory(warehouse.id)
                .then(setHistory)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [open, warehouse]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-hidden flex flex-col rounded-[32px] border-none shadow-2xl p-0 bg-white">
                <div className="h-2 bg-orange-500 w-full shrink-0" />
                <DialogHeader className="p-8 pb-4 shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-orange-100/50">
                            <History className="h-6 w-6 text-orange-600" />
                        </div>
                        {isAdmin && history.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-slate-200 font-bold gap-2 hover:bg-emerald-50 hover:text-emerald-600 transition-all h-10 px-4"
                                onClick={() => exportMovementsToExcel(history, `Flux_${warehouse.name}`)}
                            >
                                <FileDown className="h-4 w-4" /> Export Excel
                            </Button>
                        )}
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 leading-none">
                        Activités du dépôt
                    </DialogTitle>
                    <p className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] mt-2">
                        {warehouse.name} <span className="text-slate-900 ml-1">• {warehouse.city}</span>
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4 scrollbar-hide">
                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Récupération des flux...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="py-20 text-center bg-slate-50/50 rounded-[24px]">
                            <Package className="h-16 w-16 text-slate-100 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Aucune opération enregistrée</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((m) => (
                                <div key={m.id} className="group relative flex items-start gap-4 bg-white hover:bg-slate-50/50 transition-all p-5 rounded-2xl border border-slate-100 hover:border-slate-200">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.type === "IN" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                        }`}>
                                        {m.note?.includes("Transfert") ? <ArrowRightLeft className="h-6 w-6" /> : m.type === "IN" ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <p className="font-black text-lg text-slate-900 leading-none">
                                                    {m.product?.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline" className={`text-[9px] font-black uppercase py-0 px-2 h-4 border-none tracking-tighter ${m.type === "IN" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {m.type === "IN" ? "+" : "-"}{m.quantity} unités
                                                    </Badge>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.product?.reference}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {format(new Date(m.createdAt), "dd MMM yyyy", { locale: fr })}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-300 mt-1 uppercase">{format(new Date(m.createdAt), "HH:mm")}</span>
                                                {m.createdByName && (
                                                    <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest mt-1">Par: {m.createdByName}</span>
                                                )}
                                            </div>
                                        </div>
                                        {m.note && (
                                            <div className="mt-3 p-3 bg-slate-50 rounded-xl border-l-4 border-slate-200">
                                                <p className="text-xs text-slate-600 font-medium italic break-words leading-relaxed">"{m.note}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
