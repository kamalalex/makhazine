import { getProducts, getCategories } from "@/actions/stock";
import { getWarehouses } from "@/actions/warehouse";
import { ProductTable } from "@/components/stock/ProductTable";
import { AddProductDialog } from "@/components/stock/AddProductDialog";
import { StockFilters } from "@/components/stock/StockFilters";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function StockPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string | string[]; category?: string | string[]; status?: string | string[] }>;
}) {
    const session = await getServerSession(authOptions);
    const resolvedSearchParams = await searchParams;
    const search = Array.isArray(resolvedSearchParams.search) ? resolvedSearchParams.search[0] : resolvedSearchParams.search;
    const category = Array.isArray(resolvedSearchParams.category) ? resolvedSearchParams.category[0] : resolvedSearchParams.category;
    const status = Array.isArray(resolvedSearchParams.status) ? resolvedSearchParams.status[0] : resolvedSearchParams.status;

    const products = await getProducts(search, category, status);
    const categories = await getCategories();
    const warehouses = await getWarehouses();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-3 underline decoration-orange-500 decoration-4 underline-offset-8">Gestion des Stocks</h1>
                    <p className="text-slate-500 font-medium">
                        Optimisez vos niveaux de réserve et suivez vos mouvements d'articles en temps réduit.
                    </p>
                </div>
                <div className="flex gap-4">
                    <AddProductDialog warehouses={warehouses} />
                </div>
            </div>

            <StockFilters categories={categories} />

            <div className="mt-8">
                <ProductTable
                    products={products}
                    warehouses={warehouses}
                    userPlan={session?.user?.subscriptionType}
                />
            </div>
        </div>
    );
}
