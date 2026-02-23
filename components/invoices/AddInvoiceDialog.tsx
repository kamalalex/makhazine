"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema } from "@/lib/validations";
import { createInvoice } from "@/actions/invoices";
import { getClients } from "@/actions/crm";
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
import { Plus, Trash2, Loader2, FileText, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddInvoiceDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            number: `FAC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            clientId: "",
            date: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            items: [{ description: "", quantity: 1, price: 0 }],
            taxRate: 20,
            discount: 0,
            notes: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        if (open) {
            getClients().then(setClients).catch(console.error);
        }
    }, [open]);

    async function onSubmit(values: any) {
        setLoading(true);
        try {
            await createInvoice(values);
            setOpen(false);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const watchItems = form.watch("items") as any[];
    const subtotal = watchItems.reduce((acc: number, item: any) => {
        const p = Number(item.price) || 0;
        const q = Number(item.quantity) || 0;
        return acc + (p * q);
    }, 0);
    const tax = subtotal * ((form.watch("taxRate") as number || 0) / 100);
    const total = subtotal + tax - (form.watch("discount") as number || 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-600/20 text-white rounded-xl px-6 font-black border-none h-12">
                    <Plus className="mr-2 h-5 w-5" />
                    Nouvelle Facture
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[32px] border-none shadow-2xl p-0 bg-white">
                <div className="h-2 bg-orange-600 w-full sticky top-0 z-50" />
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <FileText className="h-8 w-8 text-orange-600" />
                        Émission de Facture
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-8 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] ml-1">Numéro de Document</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-black text-orange-600" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="clientId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] ml-1">Sélectionner un Client</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold">
                                                        <SelectValue placeholder="Choisir un partenaire" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                                    {clients.map((c: any) => (
                                                        <SelectItem key={c.id} value={c.id} className="font-bold py-3">{c.name}</SelectItem>
                                                    ))}
                                                    {clients.length === 0 && <p className="p-4 text-center text-xs text-slate-400 font-bold uppercase">Aucun client trouvé</p>}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] ml-1">Date d'Émission</FormLabel>
                                                <FormControl>
                                                    <Input type="date" value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" />
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
                                                <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] ml-1">Échéance</FormLabel>
                                                <FormControl>
                                                    <Input type="date" value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b-4 border-slate-900 pb-2">
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Désignation des Articles</h3>
                                <Button type="button" onClick={() => append({ description: "", quantity: 1, price: 0 })} variant="ghost" size="sm" className="h-8 text-orange-600 font-black text-[10px] uppercase tracking-widest hover:bg-orange-50">
                                    <Plus className="h-3 w-3 mr-1" /> Ajouter une ligne
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-4 items-start group animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex-1">
                                            <Input placeholder="Description du service ou produit..." {...form.register(`items.${index}.description` as const)} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-medium" />
                                        </div>
                                        <div className="w-24">
                                            <Input type="number" placeholder="Qté" {...form.register(`items.${index}.quantity` as const)} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-center" />
                                        </div>
                                        <div className="w-32">
                                            <Input type="number" placeholder="Prix" {...form.register(`items.${index}.price` as const)} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-black text-right pr-4" />
                                        </div>
                                        <Button type="button" onClick={() => remove(index)} variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50" disabled={fields.length === 1}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 justify-between bg-slate-900 text-white rounded-[24px] p-8 mt-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full -mr-32 -mt-32 opacity-20" />
                            <div className="space-y-4 max-w-sm relative z-10">
                                <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] ml-1">Notes Additionnelles</FormLabel>
                                <textarea {...form.register("notes")} className="w-full bg-slate-800 rounded-xl border-none p-4 text-xs font-medium focus:ring-1 focus:ring-orange-500 h-24 placeholder:text-slate-600" placeholder="Coordonnées bancaires, conditions de vente..."></textarea>
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
                                <div className="h-[1px] bg-slate-800 w-full" />
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-black text-orange-500 uppercase text-xs tracking-[0.2em]">Total Net à Payer</span>
                                    <span className="text-3xl font-black">{total.toFixed(2)} DH</span>
                                </div>
                                <Button type="submit" className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black border-none text-base shadow-xl shadow-orange-600/20" disabled={loading}>
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                        <span className="flex items-center gap-2">
                                            Valider la Facture <Check className="h-5 w-5" />
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
