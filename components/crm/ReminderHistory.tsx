"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function ReminderHistory({ invoices }: { invoices: any[] }) {
    // Extract and flatten all reminders from all invoices
    const allReminders = invoices.flatMap(inv =>
        (inv.reminderHistory || []).map((entry: string) => {
            const [type, dateStr] = entry.split('|');
            return {
                type,
                date: new Date(dateStr || inv.lastReminderAt),
                invoiceNumber: inv.number,
                invoiceId: inv.id
            };
        })
    ).sort((a, b) => b.date.getTime() - a.date.getTime());

    const getStatusLabel = (type: string) => {
        if (type.startsWith("PRE")) return "Avant échéance";
        if (type.startsWith("POST_J1")) return "Relance J+1";
        if (type.startsWith("POST_J7")) return "Relance J+7";
        if (type.startsWith("POST_J14")) return "Relance J+14";
        if (type.startsWith("POST_J30")) return "Relance J+30";
        if (type.startsWith("PERIODIC")) return "Relance Périodique";
        return type;
    };

    const getUrgencyColor = (type: string) => {
        if (type.startsWith("PRE")) return "bg-blue-50 text-blue-600";
        if (type.startsWith("POST_J1")) return "bg-amber-50 text-amber-600";
        if (type.startsWith("POST_J14")) return "bg-orange-50 text-orange-600";
        if (type.startsWith("POST_J30") || type.startsWith("PERIODIC")) return "bg-red-50 text-red-600";
        return "bg-slate-50 text-slate-600";
    };

    return (
        <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white mt-8">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Journal des Relances</CardTitle>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Historique des communications automatisées</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-xl">
                    <Send className="h-5 w-5 text-orange-600" />
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
                <div className="space-y-6">
                    {allReminders.length > 0 ? (
                        <div className="relative border-l-2 border-slate-100 ml-3 pl-8 space-y-8">
                            {allReminders.map((reminder, idx) => (
                                <div key={idx} className="relative">
                                    <div className={`absolute -left-[41px] top-0 h-5 w-5 rounded-full border-4 border-white shadow-sm ${getUrgencyColor(reminder.type).split(' ')[0]}`} />
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white transition-all">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-black text-slate-900 text-sm">{getStatusLabel(reminder.type)}</span>
                                                <Badge className={`${getUrgencyColor(reminder.type)} border-none px-2 h-4 font-black uppercase text-[8px] rounded-full`}>
                                                    Facture {reminder.invoiceNumber}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                Le {format(reminder.date, "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 h-6 font-black uppercase text-[9px] rounded-full flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Envoyé avec succès
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Clock className="h-10 w-10 text-slate-100 mx-auto mb-3" />
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Aucune relance effectuée pour le moment</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
