"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Mail, MessageCircle } from "lucide-react";
import { getInvoiceById, getQuoteById } from "@/actions/invoices";
import { generateDocumentPDF } from "@/lib/pdf-generator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shareDocumentAction } from "@/actions/communications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ShareDocumentBtn({
    documentId,
    type,
    documentNumber,
    clientEmail = "",
    clientPhone = ""
}: {
    documentId: string;
    type: "INVOICE" | "QUOTE";
    documentNumber: string;
    clientEmail?: string;
    clientPhone?: string;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // State for inputs
    const [emailTo, setEmailTo] = useState(clientEmail || "");
    const [emailSubject, setEmailSubject] = useState(`Votre ${type === "INVOICE" ? "Facture" : "Devis"} ${documentNumber}`);
    const [emailMessage, setEmailMessage] = useState(`Bonjour,\n\nVeuillez trouver ci-joint votre ${type === "INVOICE" ? "facture" : "devis"} ${documentNumber}.\n\nRestant à votre entière disposition pour toute information complémentaire.\n\nCordialement.`);

    const [waPhone, setWaPhone] = useState(clientPhone || "");
    const [waMessage, setWaMessage] = useState(`Bonjour,\n\nVoici votre ${type === "INVOICE" ? "facture" : "devis"} ${documentNumber}.`);

    const prepareDocument = async () => {
        let fullDocument = type === "INVOICE"
            ? await getInvoiceById(documentId)
            : await getQuoteById(documentId);

        if (!fullDocument || !fullDocument.user.company) {
            throw new Error("Données de la société manquantes. Veuillez les configurer dans les réglages.");
        }

        return fullDocument;
    };

    const handleSendEmail = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!emailTo) {
            alert("Veuillez saisir une adresse email");
            return;
        }

        setLoading(true);
        try {
            const fullDocument = await prepareDocument();
            const pdfBase64 = await generateDocumentPDF({
                ...fullDocument,
                company: fullDocument.user.company
            }, type, true) as string;

            await shareDocumentAction(
                emailTo,
                emailSubject,
                emailMessage,
                `${type === "INVOICE" ? "Facture" : "Devis"}_${documentNumber}.pdf`,
                pdfBase64
            );

            alert("Email envoyé avec succès !");
            setOpen(false);
        } catch (error: any) {
            console.error("Erreur Envoi Email:", error);
            alert(error.message || "Erreur lors de l'envoi de l'email");
        } finally {
            setLoading(false);
        }
    };

    const handleSendWa = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!waPhone) {
            alert("Veuillez saisir un numéro de téléphone");
            return;
        }

        setLoading(true);
        try {
            // WhatsApp can't take an attachment automatically via web URL, 
            // so we generate and download it for the user before opening WhatsApp
            const fullDocument = await prepareDocument();
            await generateDocumentPDF({
                ...fullDocument,
                company: fullDocument.user.company
            }, type, false); // generate and download the file

            // Clean phone number (remove spaces, specific signs if necessary except +)
            const cleanPhone = waPhone.replace(/[^\d+]/g, '');
            const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage + "\n\n(Le document PDF vient d'être téléchargé sur votre appareil, merci de l'attacher manuellement à la conversation)")}`;
            window.open(waLink, "_blank");

            setOpen(false);
        } catch (error: any) {
            console.error("Erreur Envoi WhatsApp:", error);
            alert(error.message || "Erreur lors de la préparation pour WhatsApp");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg group-hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        type="button"
                        onClick={() => {
                            setEmailTo(clientEmail || "");
                            setWaPhone(clientPhone || "");
                        }}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[32px] p-8" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-black mb-1 flex items-center gap-2">
                        <Send className="h-5 w-5 text-slate-400" /> Partager le Document
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="email" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="email" className="font-bold flex items-center gap-2 text-xs">
                            <Mail className="h-3 w-3" /> Email
                        </TabsTrigger>
                        <TabsTrigger value="whatsapp" className="font-bold flex items-center gap-2 text-xs text-green-600 data-[state=active]:text-green-700">
                            <MessageCircle className="h-3 w-3" /> WhatsApp
                        </TabsTrigger>
                    </TabsList>

                    {/* EMAIL TAB */}
                    <TabsContent value="email" className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Destinataire (Email)</Label>
                            <Input
                                value={emailTo}
                                onChange={(e) => setEmailTo(e.target.value)}
                                placeholder="client@exemple.com"
                                className="h-10 bg-slate-50 rounded-xl font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Objet</Label>
                            <Input
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                className="h-10 bg-slate-50 rounded-xl font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Message</Label>
                            <textarea
                                value={emailMessage}
                                onChange={(e: any) => setEmailMessage(e.target.value)}
                                rows={6}
                                className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                            />
                        </div>
                        <Button
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold flex items-center gap-2 shadow-lg"
                            onClick={handleSendEmail}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                            Envoyer l'Email avec le PDF
                        </Button>
                    </TabsContent>

                    {/* WHATSAPP TAB */}
                    <TabsContent value="whatsapp" className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Numéro WhatsApp</Label>
                            <Input
                                value={waPhone}
                                onChange={(e) => setWaPhone(e.target.value)}
                                placeholder="+212600000000"
                                className="h-10 bg-slate-50 rounded-xl font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Message WhatsApp</Label>
                            <textarea
                                value={waMessage}
                                onChange={(e: any) => setWaMessage(e.target.value)}
                                rows={4}
                                className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                            />
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl flex items-start gap-3">
                            <MessageCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-green-800 font-medium leading-relaxed">
                                Le lien direct WhatsApp ne permet pas d'attacher automatiquement un fichier depuis le site web. <br />
                                <strong className="font-bold">Le fichier PDF va se télécharger sur votre appareil</strong>, vous pourrez ensuite simplement le glisser-déposer dans la conversation WhatsApp qui s'ouvrira.
                            </p>
                        </div>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 font-bold flex items-center gap-2 shadow-lg shadow-green-600/20"
                            onClick={handleSendWa}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Télécharger le PDF et Ouvrir WhatsApp
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
