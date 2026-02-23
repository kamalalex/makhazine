"use client";

import { Search, Filter, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface StockFiltersProps {
    categories: string[];
}

export function StockFilters({ categories }: StockFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const currentCategory = searchParams.get("category") || "Toutes les catégories";
    const currentStatus = searchParams.get("status") || "Tout le stock";

    useEffect(() => {
        const currentSearch = searchParams.get("search") || "";
        if (debouncedSearch === currentSearch) return;

        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }

        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    }, [debouncedSearch, router, searchParams]);

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "Toutes les catégories" && value !== "Tout le stock") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[28px] border-none shadow-xl shadow-slate-200/50">
            <div className="relative w-full md:w-[400px] group">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${isPending ? "text-orange-500 animate-pulse" : "text-slate-400 group-focus-within:text-orange-500"}`} />
                <Input
                    placeholder="Chercher une référence, un nom, une marque..."
                    className="h-14 pl-12 rounded-2xl border-none bg-slate-50 focus-visible:ring-orange-500 font-bold transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-56">
                    <select
                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none cursor-pointer pr-10"
                        value={currentCategory}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                    >
                        <option>Toutes les catégories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <LayoutGrid className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative flex-1 md:w-56">
                    <select
                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none cursor-pointer pr-10"
                        value={currentStatus}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                    >
                        <option>Tout le stock</option>
                        <option>Stock faible</option>
                        <option>Rupture</option>
                    </select>
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
