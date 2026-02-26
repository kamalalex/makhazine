"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toggleAutoReminders } from "@/actions/crm";

export function AutoReminderToggle({ clientId, initialStatus }: { clientId: string, initialStatus: boolean }) {
    const [enabled, setEnabled] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            await toggleAutoReminders(clientId, !enabled);
            setEnabled(!enabled);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={enabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            className={`rounded-2xl font-black uppercase text-[9px] tracking-widest gap-2 h-10 px-6 transition-all ${enabled
                    ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200"
                    : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                }`}
        >
            {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : enabled ? (
                <Bell className="h-3 w-3" />
            ) : (
                <BellOff className="h-3 w-3" />
            )}
            {enabled ? "Relances Auto: Activées" : "Relances Auto: Désactivées"}
        </Button>
    );
}
