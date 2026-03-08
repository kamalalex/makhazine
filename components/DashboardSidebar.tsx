"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    Package,
    Building2,
    Users,
    FileText,
    Settings,
    LogOut,
    ShieldCheck,
    X,
    ShoppingCart,
    Truck,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { MakhazineLogo } from "@/components/MakhazineLogo";

const navigation = [
    { name: "Tableau de Bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Gestion de Stock", href: "/dashboard/stock", icon: Package },
    { name: "Mes Dépôts", href: "/dashboard/warehouses", icon: Building2 },
    { name: "CRM / Clients", href: "/dashboard/crm", icon: Users },
    { name: "Fournisseurs", href: "/dashboard/suppliers", icon: Truck },
    { name: "Achats", href: "/dashboard/purchases", icon: ShoppingCart },
    { name: "Devis & Factures", href: "/dashboard/invoices", icon: FileText },
    { name: "Trésorerie", href: "/dashboard/treasury", icon: Wallet },
    { name: "Productivité", href: "/dashboard/productivity", icon: TrendingUp },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

interface DashboardSidebarProps {
    className?: string;
    onClose?: () => void;
}

export function DashboardSidebar({ className, onClose }: DashboardSidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN";
    const isCommercial = session?.user?.role === "COMMERCIAL";
    const isStorekeeper = session?.user?.role === "MAGASINIER";
    const rolePermissions = (session?.user as any)?.rolePermissions;

    let filteredNavigation = navigation.filter(item => {
        if (isAdmin) return true;

        if (rolePermissions) {
            const role = session?.user?.role;
            if (role && rolePermissions[role]) {
                const allowed = rolePermissions[role] as string[];
                const moduleMap: Record<string, string> = {
                    "/dashboard/stock": "STOCK",
                    "/dashboard/warehouses": "STOCK",
                    "/dashboard/crm": "CRM",
                    "/dashboard/suppliers": "PURCHASES",
                    "/dashboard/purchases": "PURCHASES",
                    "/dashboard/invoices": "INVOICES",
                    "/dashboard/treasury": "TREASURY",
                };
                const module = moduleMap[item.href];
                if (module) return allowed.includes(module);
            }
        }

        // Hardcoded defaults for fallback or if no permissions set
        if (isCommercial) {
            // A commercial should not see Stock, Warehouses, Purchases, Suppliers, Treasury
            if (["/dashboard/stock", "/dashboard/warehouses", "/dashboard/purchases", "/dashboard/suppliers", "/dashboard/treasury"].includes(item.href)) {
                return false;
            }
        }
        if (isStorekeeper) {
            // A storekeeper should only see Stock, Warehouses
            if (["/dashboard/crm", "/dashboard/invoices", "/dashboard/purchases", "/dashboard/suppliers", "/dashboard/treasury"].includes(item.href)) {
                return false;
            }
        }
        // Admin only items
        if (item.href === "/dashboard/productivity" && !isAdmin) return false;

        return true;
    });

    if (isAdmin) {
        filteredNavigation.push({ name: "Espace Admin", href: "/admin", icon: ShieldCheck });
    }

    return (
        <div className={cn("flex h-full w-64 flex-col bg-slate-900 text-white shadow-2xl transition-all duration-300", className)}>
            <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800 bg-slate-900">
                <MakhazineLogo className="h-8 w-8" textClassName="text-xl text-white font-black" />
                {onClose && (
                    <Button variant="ghost" size="icon" className="md:hidden text-slate-400" onClick={onClose}>
                        <X className="h-6 w-6" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-1 px-4">
                    {filteredNavigation.map((item) => {
                        const isActive = item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300",
                                    isActive
                                        ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-slate-800 p-6 sticky bottom-0 bg-slate-900">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl px-4 py-6 font-bold"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Déconnexion
                </Button>
            </div>
        </div>
    );
}
