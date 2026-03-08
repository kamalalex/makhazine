import { z } from "zod";

export const productSchema = z.object({
    reference: z.string().min(1, "Référence requise"),
    name: z.string().min(1, "Nom requis"),
    brand: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Le prix doit être positif"),
    costPrice: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0, "Le stock doit être un entier positif"),
    lowStockAlert: z.coerce.number().int().min(0, "Le seuil doit être un entier positif"),
    category: z.string().optional(),
    taxRate: z.coerce.number().min(0).default(20),
});

export const clientSchema = z.object({
    type: z.enum(["B2B", "B2C"]).default("B2C"),
    name: z.string().min(1, "Nom/Raison sociale requis"),
    ice: z.string().optional().or(z.literal("")),
    if: z.string().optional().or(z.literal("")),
    rc: z.string().optional().or(z.literal("")),
    contactName: z.string().optional().or(z.literal("")),
    contactPosition: z.string().optional().or(z.literal("")),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    phone: z.string().min(1, "Le numéro de téléphone est obligatoire"),
    billingAddress: z.string().optional().or(z.literal("")),
    shippingAddress: z.string().optional().or(z.literal("")),
    paymentTerms: z.coerce.number().min(0).default(0),
    paymentMethod: z.enum(["CHEQUE", "LCN", "VIREMENT", "CASH"]).default("CASH"),
    defaultDiscount: z.coerce.number().min(0).default(0),
    category: z.string().optional().or(z.literal("")),
    tags: z.array(z.string()).default([]),
    creditLimit: z.coerce.number().min(0).default(0),
    isProspect: z.boolean().default(true),
});

export const invoiceSchema = z.object({
    number: z.string().min(1, "Numéro requis"),
    clientId: z.string().min(1, "Client requis"),
    date: z.date().default(() => new Date()),
    dueDate: z.date(),
    items: z.array(z.object({
        reference: z.string().optional(),
        description: z.string().min(1, "Description requise"),
        quantity: z.coerce.number().int().min(1),
        price: z.coerce.number().min(0),
        taxRate: z.coerce.number().min(0).default(20),
    })).min(1, "Au moins un article requis"),
    taxRate: z.coerce.number().default(20),
    discount: z.coerce.number().default(0),
    poNumber: z.string().optional(),
    notes: z.string().optional(),
});

export const paymentSchema = z.object({
    amount: z.coerce.number().min(0.01, "Le montant doit être supérieur à 0"),
    date: z.date().default(() => new Date()),
    method: z.enum(["CASH", "CHEQUE", "VIREMENT", "LCN"]),
    reference: z.string().optional().or(z.literal("")),
    dueDate: z.date().optional().nullable(),
    notes: z.string().optional().or(z.literal("")),
});

export const supplierSchema = z.object({
    name: z.string().min(1, "Nom du fournisseur requis"),
    contactName: z.string().optional().or(z.literal("")),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    ice: z.string().optional().or(z.literal("")),
});

export const purchaseOrderSchema = z.object({
    supplierId: z.string().min(1, "Fournisseur requis"),
    number: z.string().min(1, "Numéro BC requis"),
    date: z.date().default(() => new Date()),
    expectedDate: z.date().optional().nullable(),
    notes: z.string().optional().or(z.literal("")),
    items: z.array(z.object({
        productId: z.string().min(1, "Produit requis"),
        name: z.string().optional(),
        orderedQuantity: z.coerce.number().min(1, "Quantité invalide"),
        unitPrice: z.coerce.number().min(0, "Prix invalide"),
        taxRate: z.coerce.number().min(0).default(20),
        unitOfMeasure: z.string().default("UNIT"),
        conversionFactor: z.coerce.number().min(0.01).default(1),
    })).min(1, "Au moins un article requis"),
});

