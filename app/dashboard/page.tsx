import { StatCards } from "@/components/dashboard/StatCards";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileDown } from "lucide-react";

import { RestockNeeds } from "@/components/dashboard/RestockNeeds";

export default async function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 transition-all leading-none underline decoration-orange-500 decoration-4 underline-offset-8 mb-3">Statistiques Vitales</h1>
                    <p className="text-slate-500 font-medium">
                        Optimisez votre flux de trésorerie et gérez vos stocks en temps réel.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="shadow-sm rounded-xl px-6 border-slate-200 font-bold hover:bg-white h-12">
                        <FileDown className="mr-2 h-4 w-4" />
                        Rapport PDF
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-600/20 text-white rounded-xl px-8 font-black border-none h-12">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Nouvelle Facture
                    </Button>
                </div>
            </div>

            <StatCards />

            <div className="grid gap-8">
                <RestockNeeds />
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <OverviewChart />
                <RecentInvoices />
            </div>
        </div>
    );
}
