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
import { transferStock } from "@/actions/stock";
import { Loader2, ArrowRightLeft, Check, Building2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface StockTransferDialogProps {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouses: any[];
}

export function StockTransferDialog({ product, open, onOpenChange, warehouses }: StockTransferDialogProps) {
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");
    const [fromWarehouse, setFromWarehouse] = useState<string>("default");
    const [toWarehouse, setToWarehouse] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleTransfer() {
        if (!toWarehouse) return alert("Sélectionnez un dépôt de destination");
        if (fromWarehouse === toWarehouse) return alert("Le dépôt source et destination doivent être différents");

        setLoading(true);
        try {
            await transferStock(
                product.id,
                fromWarehouse,
                toWarehouse,
                quantity,
                note
            );
            onOpenChange(false);
            setQuantity(1);
            setNote("");
            setFromWarehouse("default");
            setToWarehouse("");
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    // Filter available stock for fromWarehouse
    const getAvailableStock = () => {
        if (fromWarehouse === "default") return product.stock;
        const ws = product.warehouseStocks?.find((w: any) => w.warehouseId === fromWarehouse);
        return ws ? ws.quantity : 0;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[40px] border-none shadow-2xl p-0 bg-white scrollbar-hide">
                <div className="h-2 w-full sticky top-0 z-50 bg-blue-500" />
                <DialogHeader className="p-10 pb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm bg-blue-50">
                        <ArrowRightLeft className="h-7 w-7 text-blue-600" />
                    </div>
                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                        Transfert Inter-Dépôts
                    </DialogTitle>
                    <DialogDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] mt-3 bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">
                        {product.name} <span className="text-orange-500 ml-1">({product.reference})</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="p-10 pt-0 space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Dépôt Source</Label>
                            <Select value={fromWarehouse} onValueChange={setFromWarehouse}>
                                <SelectTrigger className="h-16 rounded-[20px] border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all shadow-inner">
                                    <SelectValue placeholder="Dépôt source" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl bg-white">
                                    <SelectItem value="default" className="font-bold text-xs">Stock Global ({product.stock})</SelectItem>
                                    {product.warehouseStocks?.map((ws: any) => (
                                        <SelectItem key={ws.warehouse.id} value={ws.warehouse.id} className="font-bold text-xs py-4">
                                            <div className="flex items-center gap-3">
                                                <Building2 className="h-4 w-4 text-orange-500" />
                                                <span>{ws.warehouse.name} ({ws.quantity})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Disponible : {getAvailableStock()} unités</p>
                        </div>

                        <div className="flex justify-center -my-3 relative z-10">
                            <div className="h-10 w-10 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md">
                                <ArrowRightLeft className="h-4 w-4 text-blue-500 rotate-90" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Dépôt Destination</Label>
                            <Select value={toWarehouse} onValueChange={setToWarehouse}>
                                <SelectTrigger className="h-16 rounded-[20px] border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all shadow-inner">
                                    <SelectValue placeholder="Choisir la destination" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl bg-white">
                                    <SelectItem value="default" className="font-bold text-xs">Stock Global</SelectItem>
                                    {warehouses.filter(w => w.id !== fromWarehouse).map((w) => (
                                        <SelectItem key={w.id} value={w.id} className="font-bold text-xs py-4">
                                            <div className="flex items-center gap-3">
                                                <Building2 className="h-4 w-4 text-emerald-500" />
                                                <span>{w.name} ({w.city})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Quantité à déplacer</Label>
                            <Input
                                type="number"
                                min={1}
                                max={getAvailableStock()}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="h-16 rounded-[20px] border-slate-200 bg-slate-50/50 focus:bg-white font-black text-center text-2xl transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Note (Optionnel)</Label>
                        <div className="relative">
                            <Input
                                placeholder="Motif du transfert..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white font-medium pl-12 transition-all text-sm"
                            />
                            <MapPin className="h-5 w-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2 mt-4 border-t border-slate-50 pt-8">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-16 rounded-2xl font-bold transition-all hover:bg-slate-50">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleTransfer}
                            className={`flex-1 h-16 rounded-2xl text-white font-black border-none shadow-2xl transition-all hover:scale-[1.02] active:scale-95 bg-blue-600 hover:bg-blue-700 shadow-blue-500/20`}
                            disabled={loading || quantity <= 0 || quantity > getAvailableStock() || !toWarehouse}
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                <span className="flex items-center gap-2">
                                    Transférer <Check className="h-6 w-6" />
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
