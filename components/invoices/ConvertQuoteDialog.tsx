"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema } from "@/lib/validations";
import { convertQuoteToInvoice } from "@/actions/invoices";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, Check, FileText, PackageSearch, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { getProducts } from "@/actions/stock";

interface ConvertQuoteDialogProps {
    quote: any;
}

export function ConvertQuoteDialog({ quote }: ConvertQuoteDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            getProducts().then(setProducts).catch(console.error);
        }
    }, [open]);

    const form = useForm({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            number: `FAC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            poNumber: "",
            clientId: quote.clientId,
            date: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            items: (quote.items || []).map((item: any) => ({
                reference: item.reference || "",
                description: item.description,
                quantity: item.quantity,
                price: item.price,
            })),
            taxRate: quote.taxRate,
            discount: quote.discount,
            notes: `Faisant suite au devis ${quote.number}`,
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "items",
    });

    async function onSubmit(values: any) {
        setLoading(true);
        try {
            await convertQuoteToInvoice(quote.id, values);
            setOpen(false);
            router.refresh();
        } catch (error: any) {
            alert(error.message || "Erreur lors de la conversion");
        } finally {
            setLoading(false);
        }
    }

    const watchItems = form.watch("items") as any[];
    const subtotal = watchItems.reduce((acc: number, item: any) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
    const tax = subtotal * ((form.watch("taxRate") as number || 0) / 100);
    const total = subtotal + tax - (form.watch("discount") as number || 0);

    const handleProductSelect = (index: number, product: any) => {
        update(index, {
            reference: product.reference || "",
            description: product.name,
            quantity: 1,
            price: product.price,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 group-hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 font-bold text-[10px] uppercase tracking-tighter transition-all">
                    <RefreshCw className="mr-1 h-3 w-3" /> Transformer en Facture
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[950px] max-h-[90vh] overflow-y-auto rounded-[32px] border-none shadow-2xl p-0 bg-white">
                <div className="h-2 bg-emerald-500 w-full sticky top-0 z-50" />
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Check className="h-8 w-8 text-emerald-500" />
                        Conversion Devis → Facture
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-8 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-[24px]">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">N° de la Facture Finale</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-12 rounded-xl border-slate-200 bg-white font-black text-emerald-600" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="poNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Réf. Bon de Commande</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Optionnel" className="h-12 rounded-xl border-slate-200 bg-white font-bold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="text-[10px] font-bold text-slate-400 uppercase bg-white p-3 rounded-xl border border-dashed border-slate-200">
                                    Référence Client : <span className="text-slate-900 font-black">{quote.client?.name}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Date Facturation</FormLabel>
                                            <FormControl>
                                                <Input type="date" value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} className="h-12 rounded-xl border-slate-200 bg-white font-bold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Échéance Paiement</FormLabel>
                                            <FormControl>
                                                <Input type="date" value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} className="h-12 rounded-xl border-slate-200 bg-white font-bold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b-4 border-slate-900 pb-2">
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Articles Facturés (Modifiables)</h3>
                                <Button type="button" onClick={() => append({ reference: "", description: "", quantity: 1, price: 0 })} variant="ghost" size="sm" className="h-8 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50">
                                    <Plus className="h-3 w-3 mr-1" /> Ajouter une ligne
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-4 px-2">
                                    <div className="col-span-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">Référence</div>
                                    <div className="col-span-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Désignation</div>
                                    <div className="col-span-2 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Qté</div>
                                    <div className="col-span-2 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">P.U (DH)</div>
                                    <div className="col-span-1"></div>
                                </div>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-4 items-start animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="col-span-2">
                                            <Input placeholder="Ref..." {...form.register(`items.${index}.reference` as const)} className="h-12 rounded-xl border-slate-100 bg-white font-bold text-[10px]" />
                                        </div>
                                        <div className="col-span-5 flex gap-2">
                                            <div className="flex-1">
                                                <Input placeholder="Désignation..." {...form.register(`items.${index}.description` as const)} className="h-12 rounded-xl border-slate-100 bg-white font-medium text-xs" />
                                            </div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-100 bg-white text-slate-400 hover:text-emerald-600 transition-colors shrink-0">
                                                        <PackageSearch className="h-5 w-5" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[350px] p-0 rounded-2xl border-slate-100 shadow-2xl bg-white overflow-hidden" align="end">
                                                    <Command className="bg-white">
                                                        <CommandInput placeholder="Chercher un produit..." className="h-12 text-[10px] uppercase font-bold tracking-widest border-none" />
                                                        <CommandList className="max-h-[300px] bg-white">
                                                            <CommandEmpty className="py-6 text-center text-xs text-slate-400 font-bold uppercase bg-white">Aucun produit</CommandEmpty>
                                                            <CommandGroup className="p-2 bg-white">
                                                                {products.map((p) => (
                                                                    <CommandItem
                                                                        key={p.id}
                                                                        onSelect={() => handleProductSelect(index, p)}
                                                                        className="rounded-xl py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                                                    >
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="flex flex-col">
                                                                                <span className="font-black text-slate-900 uppercase text-[10px] tracking-tight">{p.name}</span>
                                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{p.reference}</span>
                                                                            </div>
                                                                            <span className="text-[10px] font-black text-emerald-600">{p.price.toLocaleString()} DH</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="col-span-2">
                                            <Input type="number" placeholder="Qté" {...form.register(`items.${index}.quantity` as const)} className="h-12 rounded-xl border-slate-100 bg-white font-black text-center" />
                                        </div>
                                        <div className="col-span-2">
                                            <Input type="number" placeholder="Prix" {...form.register(`items.${index}.price` as const)} className="h-12 rounded-xl border-slate-100 bg-white font-black text-right pr-4" />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <Button type="button" onClick={() => remove(index)} variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50" disabled={fields.length === 1}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 justify-between bg-zinc-900 text-white rounded-[24px] p-8 mt-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full -mr-32 -mt-32 opacity-20" />
                            <div className="space-y-4 max-w-sm relative z-10">
                                <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Notes de Facturation</FormLabel>
                                <textarea {...form.register("notes")} className="w-full bg-zinc-800 rounded-xl border-none p-4 text-xs font-medium focus:ring-1 focus:ring-emerald-500 h-24 placeholder:text-slate-600" placeholder="Commentaires..."></textarea>
                            </div>

                            <div className="space-y-4 min-w-[240px] relative z-10">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Sous-Total HT</span>
                                    <span>{subtotal.toFixed(2)} DH</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>TVA {form.watch("taxRate") as any}%</span>
                                    <span>{tax.toFixed(2)} DH</span>
                                </div>
                                <div className="h-[1px] bg-zinc-800 w-full" />
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-black text-emerald-500 uppercase text-xs tracking-[0.2em]">Total Net Facturé</span>
                                    <span className="text-3xl font-black">{total.toFixed(2)} DH</span>
                                </div>
                                <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black border-none text-base shadow-xl shadow-emerald-600/20" disabled={loading}>
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                        <span className="flex items-center gap-2">
                                            Générer la Facture <Check className="h-5 w-5" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
