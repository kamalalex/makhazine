"use client";

import { useEffect, useState } from "react";
import { getUserProductivity } from "@/actions/users";
import {
    Users,
    TrendingUp,
    FileText,
    Package,
    UserCircle,
    Target,
    ArrowRight,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProductivityPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserProductivity()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">
                    Dashboard <span className="text-orange-600">Productivité</span>
                </h1>
                <p className="text-slate-500 font-medium">
                    Suivez la performance et l'activité de vos équipes en temps réel.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {data.map((user) => (
                    <Card key={user.id} className="shadow-2xl border-none rounded-[40px] bg-white overflow-hidden group hover:shadow-orange-200/50 transition-all duration-500">
                        <div className={`h-2 w-full ${user.role === 'ADMIN' ? 'bg-slate-900' : user.role === 'COMMERCIAL' ? 'bg-blue-600' : 'bg-orange-600'}`} />
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100/50 overflow-hidden relative">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle className="h-8 w-8 text-slate-300" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{user.name}</h3>
                                        <Badge className={`border-none px-2 h-5 font-black uppercase text-[8px] rounded-full ${user.role === 'ADMIN' ? 'bg-slate-900 text-white' :
                                                user.role === 'COMMERCIAL' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-orange-100 text-orange-600'
                                            }`}>
                                            {user.role}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 transition-colors group-hover:bg-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4 text-orange-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clients</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900">{user.stats.clients}</div>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 transition-colors group-hover:bg-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Factures</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900">{user.stats.invoices}</div>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 transition-colors group-hover:bg-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="h-4 w-4 text-purple-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Devis</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900">{user.stats.quotes}</div>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 transition-colors group-hover:bg-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="h-4 w-4 text-emerald-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stocks</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900">{user.stats.movements}</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score d'activité globale</span>
                                    <span className="text-xs font-black text-slate-900">
                                        {Math.round((user.stats.clients * 5 + user.stats.invoices * 10 + user.stats.quotes * 2 + user.stats.movements * 3) / 1)} pts
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${user.role === 'ADMIN' ? 'bg-slate-900' : 'bg-orange-500'
                                            }`}
                                        style={{ width: `${Math.min(100, (user.stats.clients * 5 + user.stats.invoices * 10) / 2)}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
