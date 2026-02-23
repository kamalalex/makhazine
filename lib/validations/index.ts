import { z } from "zod";

export const productSchema = z.object({
    reference: z.string().min(1, "Référence requise"),
    name: z.string().min(1, "Nom requis"),
    brand: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Le prix doit être positif"),
    stock: z.coerce.number().int().min(0, "Le stock doit être un entier positif"),
    lowStockAlert: z.coerce.number().int().min(0, "Le seuil doit être un entier positif"),
    category: z.string().optional(),
});

export const clientSchema = z.object({
    name: z.string().min(1, "Nom requis"),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    isProspect: z.boolean().default(true),
});

export const invoiceSchema = z.object({
    number: z.string().min(1, "Numéro requis"),
    clientId: z.string().min(1, "Client requis"),
    date: z.date().default(() => new Date()),
    dueDate: z.date(),
    items: z.array(z.object({
        description: z.string().min(1, "Description requise"),
        quantity: z.coerce.number().int().min(1),
        price: z.coerce.number().min(0),
    })).min(1, "Au moins un article requis"),
    taxRate: z.coerce.number().default(20),
    discount: z.coerce.number().default(0),
    notes: z.string().optional(),
});
