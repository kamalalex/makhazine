import { getPurchaseOrders } from "@/actions/purchases";
import { Package, Link as LinkIcon, AlertCircle, ShoppingCart } from "lucide-react";
import { PurchaseTable } from "@/components/purchases/PurchaseTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PurchasesPage() {
    const orders = await getPurchaseOrders();

    const pendingOrders = orders.filter((o: any) => o.status === "DRAFT" || o.status === "ORDERED" || o.status === "PARTIAL");
    const receivedOrders = orders.filter((o: any) => o.status === "RECEIVED");

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">
                        Achats & <span className="text-emerald-600">Approvisionnement</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-lg">
                        Gérez vos bons de commande, suivez les réceptions et analysez les écarts de prix.
                    </p>
                </div>

                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 text-white rounded-xl px-6 font-black border-none h-12 transition-all">
                    <Link href="/dashboard/purchases/new">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Nouveau Bon de Commande
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">En cours d'acheminement</span>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">{pendingOrders.length}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                        <Package className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Réceptionnés (Attente Facture)</span>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">{receivedOrders.length}</div>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl shadow-slate-900/10 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                        <LinkIcon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Total Bons Emis</span>
                        <div className="text-3xl font-black text-white tracking-tighter">
                            {orders.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900">Registre des Commandes</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Historique complet de vos achats B2B</p>
                </div>
                <PurchaseTable data={orders} />
            </div>
        </div>
    );
}
