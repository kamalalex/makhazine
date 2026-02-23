"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validations";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2, Save, Building2 } from "lucide-react";
import { updateProduct } from "@/actions/stock";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditProductDialogProps {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warehouses: any[];
}

export function EditProductDialog({ product, open, onOpenChange, warehouses }: EditProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>("default");
    const router = useRouter();

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            reference: product?.reference || "",
            name: product?.name || "",
            brand: product?.brand || "",
            description: product?.description || "",
            price: Number(product?.price) || 0,
            stock: Number(product?.stock) || 0,
            lowStockAlert: Number(product?.lowStockAlert) || 5,
            category: product?.category || "",
        },
    });

    useEffect(() => {
        if (product && open) {
            form.reset({
                reference: product.reference,
                name: product.name,
                brand: product.brand || "",
                description: product.description || "",
                price: Number(product.price),
                stock: Number(product.stock),
                lowStockAlert: Number(product.lowStockAlert),
                category: product.category || "",
            });

            if (product.warehouseStocks && product.warehouseStocks.length > 0) {
                setSelectedWarehouse(product.warehouseStocks[0].warehouseId);
            } else {
                setSelectedWarehouse("default");
            }
        }
    }, [product, open, form]);

    async function onSubmit(values: z.infer<typeof productSchema>) {
        setLoading(true);
        try {
            await updateProduct(product.id, values, selectedWarehouse);
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-[40px] border-none shadow-2xl p-0 bg-white scrollbar-hide">
                <div className="h-2 bg-slate-900 w-full sticky top-0 z-50" />
                <DialogHeader className="p-10 pb-6">
                    <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100/50">
                        <Edit className="h-7 w-7 text-slate-600" />
                    </div>
                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-none">Modifier l'Article</DialogTitle>
                    <DialogDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] mt-3">
                        Mise à jour de la fiche technique <span className="text-slate-900">{product?.reference}</span>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-10 pt-0">
                        <div className="grid grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Référence SKU</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: PRD-001" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all placeholder:text-slate-300" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Marque</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Samsung" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all placeholder:text-slate-300" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Désignation</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nom du produit" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all placeholder:text-slate-300" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Catégorie</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Famille d'article" {...field} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all placeholder:text-slate-300" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-3">
                                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Réaffectation Dépôt</Label>
                                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all shadow-inner">
                                        <SelectValue placeholder="Choisir un dépôt" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="default" className="font-bold text-xs">Stock Global (Non affecté)</SelectItem>
                                        {warehouses.map((w) => (
                                            <SelectItem key={w.id} value={w.id} className="font-bold text-xs py-4">
                                                <div className="flex items-center gap-3">
                                                    <Building2 className="h-4 w-4 text-orange-500" />
                                                    <span>{w.name} ({w.city})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-50 pt-8">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Prix (DH)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(Number(e.target.value))} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-black text-right transition-all shadow-inner" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Quantité Totale</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(Number(e.target.value))} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-center transition-all underline decoration-orange-500/20 underline-offset-4" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lowStockAlert"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Alerte</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(Number(e.target.value))} className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-center transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-4 pt-6 sticky bottom-0 bg-white pb-2 mt-8 border-t border-slate-50">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-16 rounded-2xl font-bold border-2 transition-all hover:bg-slate-50">
                                Annuler
                            </Button>
                            <Button type="submit" className="flex-1 h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black border-none shadow-2xl shadow-slate-900/40 transition-all hover:scale-[1.02] active:scale-95" disabled={loading}>
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Sauvegarder <Save className="h-6 w-6" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
