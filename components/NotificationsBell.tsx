"use client";

import { useState, useEffect } from "react";
import { Bell, CreditCard, Landmark, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getUpcomingCheques } from "@/actions/payments";

export function NotificationsBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const cheques = await getUpcomingCheques();
            setNotifications(cheques);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-slate-100 rounded-xl relative transition-colors group">
                    <Bell className="h-5 w-5 text-slate-600 group-hover:text-orange-600 transition-colors" />
                    {notifications.length > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-600 rounded-full border-2 border-white"></span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px] rounded-[24px] shadow-2xl border-slate-100 bg-white p-2">
                <DropdownMenuLabel className="font-black text-slate-900 px-4 py-3 uppercase text-[10px] tracking-widest flex justify-between items-center">
                    Alertes Échéances
                    {notifications.length > 0 && (
                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[9px]">
                            {notifications.length} Rappel(s)
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-50" />

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                            Chargement...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Clock className="h-8 w-8 text-slate-100 mx-auto mb-2" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucune échéance proche</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <DropdownMenuItem key={notif.id} className="p-4 cursor-default rounded-2xl hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-all block space-y-2">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-xl shrink-0 ${notif.method === 'CHEQUE' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {notif.method === 'CHEQUE' ? <CreditCard className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 truncate">
                                            {notif.invoice?.client?.name || "Client Inconnu"}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {notif.method} n° {notif.reference || "N/A"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-black text-slate-900 leading-none">
                                            {notif.amount.toLocaleString()} DH
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 bg-orange-50/50 p-2 rounded-lg">
                                    <Clock className="h-3.5 w-3.5 text-orange-600" />
                                    <span className="text-[10px] font-black text-orange-700 uppercase">
                                        À encaisser le {format(new Date(notif.dueDate), "dd MMMM yyyy", { locale: fr })}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
