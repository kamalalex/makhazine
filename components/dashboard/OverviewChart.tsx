"use client";

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const data = [
    { name: "Jan", total: 4200 },
    { name: "Fév", total: 3800 },
    { name: "Mar", total: 5100 },
    { name: "Avr", total: 4700 },
    { name: "Mai", total: 6300 },
    { name: "Juin", total: 5900 },
    { name: "Juil", total: 7200 },
    { name: "Août", total: 6800 },
    { name: "Sept", total: 8100 },
    { name: "Oct", total: 7500 },
    { name: "Nov", total: 9200 },
    { name: "Déc", total: 10500 },
];

export function OverviewChart() {
    return (
        <Card className="col-span-4 shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Performance Flux de Trésorerie</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400">Croissance mensuelle brute en Dirhams.</CardDescription>
            </CardHeader>
            <CardContent className="pl-6 pr-6 pb-8">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            stroke="#cbd5e1"
                            fontSize={10}
                            fontWeight={800}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#cbd5e1"
                            fontSize={10}
                            fontWeight={800}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: '#fff7ed', opacity: 0.4 }}
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                padding: '12px 16px',
                                fontWeight: '900'
                            }}
                            itemStyle={{ color: '#ea580c' }}
                            formatter={(value: any) => [`${value ?? 0} DH`, 'Revenu']}
                        />
                        <Bar
                            dataKey="total"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                            fill="#f97316"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === data.length - 1 ? "#ea580c" : "#f97316"}
                                    fillOpacity={0.7 + (index / data.length) * 0.3}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
