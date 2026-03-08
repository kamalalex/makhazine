"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { AlertTriangle, TrendingDown, TrendingUp, Wallet, Banknote, ShieldAlert, BarChart3, Clock } from "lucide-react";

interface TreasuryDashboardProps {
    data: {
        currentBalance: number;
        chequesInSafe: number;
        availabilityJ7: number;
        top5Suppliers: any[];
        dso: number;
        deadStockValue: number;
        rotationRate: number;
        taxProvision: number;
        expensesDistribution: any;
        chartData: any[];
        widgetCheques: any[];
    };
}

const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE'];

export function TreasuryDashboard({ data }: TreasuryDashboardProps) {

    // Formatting Pie Chart Data
    const pieData = Object.keys(data.expensesDistribution).map(key => ({
        name: key,
        value: data.expensesDistribution[key]
    })).filter(item => item.value > 0);

    // Alert Logic
    const plannedOutflows = data.chartData
        .filter(d => d.forecast !== null && new Date(d.date) > new Date())
        .reduce((sum, d, i, arr) => {
            // simplified: if forecast drops, it means outflow
            if (i > 0 && d.forecast < arr[i - 1].forecast) {
                return sum + (arr[i - 1].forecast - d.forecast);
            }
            return sum;
        }, 0);

    const isRedAlert = plannedOutflows > data.currentBalance;
    // Note: To calculate accurate CA mensuel delay requires more data, using a placeholder for orange:
    const isOrangeAlert = data.dso > 45; // if clients take more than 45 days average, warn.

    // Calculate Burn Rate (avg monthly spend based on historical outflows)
    const totalHistoricalExpenses = pieData.reduce((sum, i) => sum + i.value, 0);
    const burnRate = totalHistoricalExpenses; // over last 30 days

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* ALERT BADGES */}
            <div className="flex flex-wrap gap-4">
                {isRedAlert && (
                    <Badge variant="destructive" className="py-2 px-4 shadow-lg text-sm bg-red-600">
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        Danger: Sorties prévues &gt; Solde actuel ! Risque de découvert.
                    </Badge>
                )}
                {isOrangeAlert && (
                    <Badge variant="secondary" className="py-2 px-4 shadow-lg text-sm bg-orange-500 text-white">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Attention: Retards paiements clients (DSO = {data.dso} jours).
                    </Badge>
                )}
            </div>

            {/* TOP KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Solde Réel (Banque + Caisse)</CardTitle>
                        <Wallet className="h-5 w-5 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{formatCurrency(data.currentBalance)}</div>
                        <p className="text-xs text-slate-400 mt-1">Liquidité immédiate</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Disponibilité à J+7</CardTitle>
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(data.availabilityJ7)}</div>
                        <p className="text-xs text-slate-500 mt-1">Inclut encaissements / décaissements prévus</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Burn Rate (Dépenses / mois)</CardTitle>
                        <TrendingDown className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(burnRate)}</div>
                        <p className="text-xs text-slate-500 mt-1">Dépenses moyennes mensuelles</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Provision TVA (Est.)</CardTitle>
                        <Banknote className="h-5 w-5 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(data.taxProvision)}</div>
                        <p className="text-xs text-slate-500 mt-1">Risque fiscal de fin de mois</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* CASH FLOW CHART */}
                <Card className="md:col-span-5 shadow-xl border-slate-100 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="flex items-center text-lg font-bold">
                            <BarChart3 className="mr-2 h-5 w-5 text-slate-500" />
                            Cash-Flow Historique & Prévisionnel (30 jours)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => new Date(value).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short' })}
                                        stroke="#94A3B8"
                                        fontSize={12}
                                    />
                                    <YAxis tickFormatter={(val) => `${val / 1000}k`} stroke="#94A3B8" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        labelFormatter={(val) => new Date(val).toLocaleDateString("fr-FR")}
                                        formatter={(val: any) => [formatCurrency(val), "CASH"]}
                                    />
                                    <ReferenceLine x={new Date().toISOString().split('T')[0]} stroke="red" strokeDasharray="3 3" label="Aujourd'hui" />

                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#0F172A"
                                        strokeWidth={3}
                                        dot={false}
                                        name="Solde Historique"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="forecast"
                                        stroke="#8B5CF6"
                                        strokeWidth={3}
                                        strokeDasharray="5 5"
                                        dot={false}
                                        name="Prévision"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* EXPENSES PIE CHART */}
                <Card className="md:col-span-2 shadow-xl border-slate-100">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Répartition Dépenses</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: any) => formatCurrency(val)} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
                {/* PENDING CHEQUES WIDGET */}
                <Card className="shadow-lg border-slate-100 h-full">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-md font-bold flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-orange-500" />
                            Chèques en attente
                        </CardTitle>
                        <Badge variant="outline" className="font-bold bg-white text-orange-600 border-orange-200">
                            Coffre : {formatCurrency(data.chequesInSafe)}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data.widgetCheques.length === 0 ? (
                            <div className="p-6 text-center text-slate-500">Aucun chèque en attente</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {data.widgetCheques.map((t, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50">
                                        <div>
                                            <div className="font-semibold text-sm">{t.reference || "N/A"}</div>
                                            <div className="text-xs text-slate-500">{t.client?.name || t.supplier?.name || t.description}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm">{formatCurrency(t.amount)}</div>
                                            <div className="text-xs text-slate-500">{t.realDate ? new Date(t.realDate).toLocaleDateString('fr-FR') : "N/A"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* DEBT WALL */}
                <Card className="shadow-lg border-slate-100 h-full">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-md font-bold flex items-center text-red-600">
                            Mur de Dette (Fournisseurs - 15j)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data.top5Suppliers.length === 0 ? (
                            <div className="p-6 text-center text-slate-500">Aucune échéance urgente</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {data.top5Suppliers.map((s, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 hover:bg-red-50/50">
                                        <div>
                                            <div className="font-semibold text-sm">{s.supplier}</div>
                                            <div className="text-xs text-slate-500 text-red-500">
                                                Échéance : {new Date(s.date).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm text-red-600">
                                            - {formatCurrency(s.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
                {/* STOCK HEALTH WIDGET */}
                <Card className="col-span-1 shadow-lg border-slate-100 bg-amber-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700">Santé du Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-2xl font-black text-amber-900">{formatCurrency(data.deadStockValue)}</div>
                                <p className="text-xs text-amber-600 mt-1">Valeur du Stock Mort (&gt; 90 jours)</p>
                            </div>
                            <div className="text-right">
                                <Badge className="bg-amber-200 text-amber-800 hover:bg-amber-300">
                                    Rotation: {data.rotationRate}x
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
