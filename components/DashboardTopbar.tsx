"use client";

import { Bell, Search, User, LifeBuoy, Building2, Menu } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "./ui/button";
import { NotificationsBell } from "./NotificationsBell";

interface DashboardTopbarProps {
    onMenuClick?: () => void;
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
    const { data: session } = useSession();

    return (
        <header className="h-20 border-b bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/80">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                    <Menu className="h-6 w-6" />
                </Button>
                <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-64 lg:w-96 border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/50 transition-all">
                    <Search className="h-4 w-4 text-slate-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Chercher..."
                        className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors">
                    <LifeBuoy className="h-4 w-4" />
                    Support
                </button>

                <NotificationsBell />

                <div className="h-8 w-[1px] bg-slate-200"></div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-xl transition-all">
                            <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                                <AvatarImage src={session?.user?.image || ""} />
                                <AvatarFallback className="bg-orange-600 text-white font-bold">{session?.user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left hidden lg:flex">
                                <span className="text-sm font-bold text-slate-900 leading-none">{session?.user?.name || "Utilisateur"}</span>
                                <Badge variant="secondary" className="mt-1 text-[9px] bg-slate-100 text-slate-500 uppercase h-4 px-1">{session?.user?.role || "USER"}</Badge>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-[24px] shadow-2xl border-slate-100 bg-white p-2">
                        <DropdownMenuLabel className="font-black text-slate-900 px-4 py-3 uppercase text-[10px] tracking-widest">Mon Compte</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-50" />
                        <Link href="/dashboard/settings">
                            <DropdownMenuItem className="py-3 px-4 cursor-pointer rounded-xl hover:bg-slate-50 font-bold transition-all gap-3">
                                <User className="h-4 w-4 text-slate-400" /> Mon Profil
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/dashboard/settings">
                            <DropdownMenuItem className="py-3 px-4 cursor-pointer rounded-xl hover:bg-slate-50 font-bold transition-all gap-3">
                                <Building2 className="h-4 w-4 text-slate-400" /> Paramètres société
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 py-2.5 cursor-pointer rounded-lg mx-1 font-bold"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            Déconnexion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
