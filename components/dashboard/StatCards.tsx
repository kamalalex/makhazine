import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    Users,
    Package,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";

export function StatCards() {
    // Stats normally come from the database
    const stats = [
        {
            title: "Trésorerie / Revenu",
            value: "45.230 DH",
            change: "+12.5%",
            trend: "up",
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100"
        },
        {
            title: "Clients Actifs",
            value: "142",
            change: "+4 nouveaux",
            trend: "up",
            icon: Users,
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-100"
        },
        {
            title: "Valeur du Stock",
            value: "89.400 DH",
            change: "-2% dépense",
            trend: "down",
            icon: Package,
            color: "text-slate-600",
            bg: "bg-slate-100",
            border: "border-slate-200"
        },
        {
            title: "Alerte Rupture",
            value: "3 Produits",
            change: "Action requise",
            trend: "neutral",
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-100"
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title} className={`shadow-xl shadow-slate-200/50 border-none rounded-[24px] hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}>
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-500`} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none pt-1">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2.5 rounded-xl ${stat.bg} shadow-sm`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-2">
                        <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                        <div className="flex items-center text-[10px] font-bold mt-2 uppercase tracking-tighter">
                            {stat.trend === "up" ? (
                                <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                            ) : stat.trend === "down" ? (
                                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                            ) : null}
                            <span className={stat.trend === "up" ? "text-emerald-500" : stat.trend === "down" ? "text-red-500" : "text-slate-500"}>
                                {stat.change}
                            </span>
                            <span className="text-slate-400 ml-1.5">vs mois précédent</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
