"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createStockMovement } from "@/actions/stock";
import { Loader2, ArrowUpRight, ArrowDownRight, Check, MapPin, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface StockMovementDialogProps {
    product: any;
    type: "IN" | "OUT";
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouses: any[];
}

export function StockMovementDialog({ product, type, open, onOpenChange, warehouses }: StockMovementDialogProps) {
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");
    const [warehouseId, setWarehouseId] = useState<string>("default");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleAction() {
        setLoading(true);
        try {
            await createStockMovement(
                product.id,
                type,
                quantity,
                note,
                warehouseId === "default" ? undefined : warehouseId
            );
            onOpenChange(false);
            setQuantity(1);
            setNote("");
            setWarehouseId("default");
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto rounded-[40px] border-none shadow-2xl p-0 bg-white scrollbar-hide">
                <div className={`h-2 w-full sticky top-0 z-50 ${type === "IN" ? "bg-emerald-500" : "bg-red-500"}`} />
                <DialogHeader className="p-10 pb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${type === "IN" ? "bg-emerald-50" : "bg-red-50"}`}>
                        {type === "IN" ? (
                            <ArrowUpRight className="h-7 w-7 text-emerald-600" />
                        ) : (
                            <ArrowDownRight className="h-7 w-7 text-red-600" />
                        )}
                    </div>
                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                        {type === "IN" ? "Entrée de Stock" : "Sortie de Stock"}
                    </DialogTitle>
                    <DialogDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] mt-3 bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">
                        {product.name} <span className="text-orange-500 ml-1">({product.reference})</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="p-10 pt-0 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Quantité</Label>
                            <Input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="h-16 rounded-[20px] border-slate-200 bg-slate-50/50 focus:bg-white font-black text-center text-2xl transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Site Cible</Label>
                            <Select value={warehouseId} onValueChange={setWarehouseId}>
                                <SelectTrigger className="h-16 rounded-[20px] border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all shadow-inner">
                                    <SelectValue placeholder="Dépôt" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    <SelectItem value="default" className="font-bold text-xs">Inventaire Global</SelectItem>
                                    {warehouses.map((w) => (
                                        <SelectItem key={w.id} value={w.id} className="font-bold text-xs py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                                    <Building2 className="h-4 w-4 text-orange-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{w.name}</span>
                                                    <span className="text-[9px] text-slate-400 uppercase font-black">{w.city}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Motif / Commentaire</Label>
                        <div className="relative">
                            <Input
                                placeholder="Optionnel : ex. Livraison fournisseur, Vente..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white font-medium pl-12 transition-all text-sm placeholder:text-slate-300"
                            />
                            <MapPin className="h-5 w-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2 mt-4 border-t border-slate-50 pt-8">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-16 rounded-2xl font-bold transition-all hover:bg-slate-50">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleAction}
                            className={`flex-1 h-16 rounded-2xl text-white font-black border-none shadow-2xl transition-all hover:scale-[1.02] active:scale-95 ${type === "IN"
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                                : "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                                }`}
                            disabled={loading || (type === "OUT" && quantity > product.stock)}
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                <span className="flex items-center gap-2">
                                    Confirmer <Check className="h-6 w-6" />
                                </span>
                            )}
                        </Button>
                    </div>
                    {type === "OUT" && quantity > product.stock && (
                        <p className="text-red-500 text-[10px] font-black uppercase text-center mt-2 tracking-widest animate-pulse">Attention : Stock global insuffisant !</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
