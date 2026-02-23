import { getWarehouses } from "@/actions/warehouse";
import { AddWarehouseDialog } from "@/components/stock/AddWarehouseDialog";
import { WarehouseList } from "@/components/stock/WarehouseList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WarehousesPage() {
    const warehouses = await getWarehouses();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/stock">
                        <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-100 h-12 w-12 text-slate-400 transition-all">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-3 underline decoration-orange-500 decoration-4 underline-offset-8 font-sans">Mes Dépôts</h1>
                        <p className="text-slate-500 font-medium font-sans">
                            Gérez vos sites de stockage et la répartition géographique de vos produits.
                        </p>
                    </div>
                </div>
                <AddWarehouseDialog />
            </div>

            <WarehouseList warehouses={warehouses} />
        </div>
    );
}
