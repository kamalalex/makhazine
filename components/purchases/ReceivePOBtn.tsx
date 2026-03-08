"use client";

import { useState } from "react";
import { processPurchaseOrder } from "@/actions/purchases";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function ReceivePOBtn({ po }: { po: any }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<{ id: string, receivedQuantity: number }[]>(
        po.items.map((item: any) => ({
            id: item.id,
            receivedQuantity: item.quantity
        }))
    );
    const [additionalCosts, setAdditionalCosts] = useState<number>(po.additionalCosts || 0);
    const router = useRouter();

    async function handleReceive() {
        setLoading(true);
        try {
            await processPurchaseOrder(po.id, "RECEIVED", {
                items,
                additionalCosts
            });
            setOpen(false);
            router.refresh();
        } catch (error: any) {
            alert(error.message || "Erreur lors de la réception");
        } finally {
            setLoading(false);
        }
    }

    const handleQtyChange = (id: string, qty: number) => {
        setItems(items.map(i => i.id === id ? { ...i, receivedQuantity: qty } : i));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 text-white rounded-xl font-black border-none h-12 transition-all">
                    <Package className="mr-2 h-5 w-5" />
                    Réceptionner la Machandise
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
                <div className="h-2 bg-emerald-600 w-full shrink-0" />
                <DialogHeader className="p-8 pb-4 shrink-0">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-xl">
                            <Package className="h-6 w-6 text-emerald-600" />
                        </div>
                        Bon de Réception (BC#{po.number})
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-8 pt-0 space-y-6">
                        <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-xs font-bold border border-orange-200">
                            Attention: La validation des quantités reçues mettra automatiquement à jour votre stock physique et recalculera le Prix Moyen Pondéré (PMP) de vos articles.
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b-4 border-slate-900 pb-2">
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Contrôle des Quantités</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-3 px-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                    <div className="col-span-6">Produit</div>
                                    <div className="col-span-3 text-center">Qté Commandée</div>
                                    <div className="col-span-3 text-center text-emerald-600">Qté Reçue</div>
                                </div>

                                {po.items.map((item: any, index: number) => {
                                    const currentQty = items.find(i => i.id === item.id)?.receivedQuantity ?? 0;
                                    return (
                                        <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                                            <div className="col-span-6">
                                                <div className="h-12 flex items-center px-3 rounded-xl border border-slate-100 bg-slate-50 font-bold text-xs text-slate-700">
                                                    {item.product?.name}
                                                </div>
                                            </div>
                                            <div className="col-span-3">
                                                <div className="h-12 flex items-center justify-center rounded-xl border border-slate-100 bg-slate-50 font-black text-xs text-slate-500">
                                                    {item.quantity} {item.unitOfMeasure}
                                                </div>
                                            </div>
                                            <div className="col-span-3">
                                                <Input
                                                    type="number"
                                                    value={currentQty}
                                                    onChange={e => handleQtyChange(item.id, Number(e.target.value))}
                                                    className={`h-12 rounded-xl font-black text-center text-xs ${currentQty !== item.quantity ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-emerald-500 bg-emerald-50 text-emerald-700'}`}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div>
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Frais d'approche (Landed Cost)</h3>
                                <p className="text-[10px] font-bold text-slate-500 mb-4">Saisissez les frais annexes (transport, douane, transitaire) pour qu'ils soient répartis proportionnellement sur le PMP des articles réceptionnés.</p>

                                <div className="flex items-center gap-4">
                                    <div className="w-1/2">
                                        <label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest ml-1 mb-1 block">Montant des frais additionnels (DH)</label>
                                        <Input
                                            type="number"
                                            value={additionalCosts}
                                            onChange={e => setAdditionalCosts(Number(e.target.value))}
                                            className="h-12 rounded-xl border-slate-200 bg-slate-50 font-black"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-4 flex gap-3 bg-white border-t border-slate-50 shrink-0">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2">
                        Annuler
                    </Button>
                    <Button onClick={handleReceive} className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest border-none shadow-xl shadow-emerald-500/20" disabled={loading}>
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <span className="flex items-center gap-2">
                                Valider la Réception <Check className="h-4 w-4" />
                            </span>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
