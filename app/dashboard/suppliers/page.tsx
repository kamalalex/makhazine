import { getSuppliers } from "@/actions/suppliers";
import { Truck, Package, ShieldCheck } from "lucide-react";
import { AddSupplierDialog } from "@/components/suppliers/AddSupplierDialog";
import { SupplierTable } from "@/components/suppliers/SupplierTable";

export default async function SuppliersPage() {
    const suppliers = await getSuppliers();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">
                        Gestion des <span className="text-emerald-600">Fournisseurs</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-lg">
                        Gérez vos fournisseurs, analysez vos achats et fluidifiez la relation B2B.
                    </p>
                </div>

                <AddSupplierDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                        <Truck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Total Fournisseurs</span>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">{suppliers.length}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Commandes Émises</span>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                            {suppliers.reduce((acc, sum) => acc + sum.purchaseOrders.length, 0)}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl shadow-slate-900/10 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Fournisseurs Actifs</span>
                        <div className="text-3xl font-black text-white tracking-tighter">
                            {suppliers.filter(s => s.purchaseOrders.length > 0).length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900">Annuaire B2B</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Liste complète de vos partenaires</p>
                </div>
                <SupplierTable data={suppliers} />
            </div>
        </div>
    );
}
