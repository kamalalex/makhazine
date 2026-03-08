import { getSuppliers } from "@/actions/suppliers";
import { getProductsToPurchase } from "@/actions/purchases";
import { PurchaseOrderForm } from "@/components/purchases/PurchaseOrderForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewPurchaseOrderPage() {
    const suppliers = await getSuppliers();
    const products = await getProductsToPurchase();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" className="rounded-2xl h-12 w-12 p-0 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                    <Link href="/dashboard/purchases"><ChevronLeft className="h-6 w-6" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-1">
                        Nouveau <span className="text-emerald-600">Bon de Commande</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Création d'une commande fournisseur.</p>
                </div>
            </div>

            <div className="max-w-4xl">
                <PurchaseOrderForm suppliers={suppliers} products={products} />
            </div>
        </div>
    );
}
