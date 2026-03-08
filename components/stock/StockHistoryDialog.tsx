"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getProductHistory } from "@/actions/stock";
import { History, ArrowUpRight, ArrowDownRight, Calendar, Package, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface StockHistoryDialogProps {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StockHistoryDialog({ product, open, onOpenChange }: StockHistoryDialogProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && product?.id) {
            setLoading(true);
            getProductHistory(product.id)
                .then(setHistory)
                .finally(() => setLoading(false));
        }
    }, [open, product]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden flex flex-col rounded-[32px] border-none shadow-2xl p-0 bg-white">
                <div className="h-2 bg-slate-900 w-full shrink-0" />
                <DialogHeader className="p-8 pb-4 shrink-0">
                    <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-slate-100/50">
                        <History className="h-6 w-6 text-slate-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 leading-none">
                        Traçabilité des flux
                    </DialogTitle>
                    <p className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] mt-2">
                        {product.name} <span className="text-orange-500 font-mono ml-2">[{product.reference}]</span>
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4 scrollbar-hide">
                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Récupération des données...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="py-20 text-center bg-slate-50/50 rounded-[24px]">
                            <Package className="h-16 w-16 text-slate-100 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Aucun mouvement en base</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((m) => (
                                <div key={m.id} className="group relative flex items-start gap-4 bg-white hover:bg-slate-50/50 transition-all p-5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/20">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.type === "IN" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                        }`}>
                                        {m.type === "IN" ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <p className="font-black text-lg text-slate-900 leading-none">
                                                    {m.type === "IN" ? "+" : "-"}{m.quantity}
                                                    <span className="text-[10px] text-slate-400 ml-1 font-bold uppercase">Unités</span>
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <MapPin className="h-3 w-3 text-slate-300" />
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase py-0 px-2 h-4 border-slate-100 bg-white text-slate-500 tracking-tighter">
                                                        {m.warehouse?.name || "Stock Global"}
                                                    </Badge>
                                                    {m.warehouse?.city && (
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{m.warehouse.city}</span>
                                                    )}
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
                                            <div className="mt-3 p-3 bg-slate-50 rounded-xl relative overflow-hidden">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200" />
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
