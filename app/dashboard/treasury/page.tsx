import { getTreasuryDashboardData } from "@/actions/treasury";
import { TreasuryDashboard } from "@/components/treasury/TreasuryDashboard";

export default async function TreasuryPage() {
    const data = await getTreasuryDashboardData();

    return (
        <div className="space-y-8 p-4 md:p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-none underline decoration-blue-500 decoration-4 underline-offset-8 mb-3">
                    Tableau de Bord Trésorerie
                </h2>
                <p className="text-slate-500 font-medium">
                    Suivi du flux de trésorerie, alertes et prévisions.
                </p>
            </div>

            <TreasuryDashboard data={data} />
        </div>
    );
}
