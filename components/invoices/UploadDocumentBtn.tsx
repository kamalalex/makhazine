"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Paperclip, Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { addInvoiceAttachment, removeInvoiceAttachment } from "@/actions/attachments";
import { Input } from "@/components/ui/input";

export function UploadDocumentBtn({
    invoiceId,
    attachments = [],
    quoteNumber,
    poNumber
}: {
    invoiceId: string,
    attachments?: string[],
    quoteNumber?: string | null,
    poNumber?: string | null
}) {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentCategory, setDocumentCategory] = useState<string>("Bon de Livraison");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) {
            alert("Le fichier est trop grand. Limite: 1 MB");
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = async () => {
                try {
                    const base64 = reader.result as string;
                    // Bundle category and image data together
                    const payload = JSON.stringify({ category: documentCategory, data: base64 });
                    await addInvoiceAttachment(invoiceId, payload);
                    setSelectedFile(null); // Reset after upload
                    setDocumentCategory("Bon de Livraison");
                } catch (err: any) {
                    console.error(err);
                    alert("Erreur lors de l'enregistrement de l'image (peut être trop volumineuse).");
                } finally {
                    setUploading(false);
                }
            };
        } catch (err) {
            console.error(err);
            setUploading(false);
        }
    };

    const handleDelete = async (base64: string) => {
        setDeleting(base64);
        try {
            await removeInvoiceAttachment(invoiceId, base64);
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 group-hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors font-bold text-[10px] uppercase tracking-tighter transition-all px-2"
                        type="button"
                    >
                        <Paperclip className="h-3 w-3 mr-1" />Pièces
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[32px] p-8 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black mb-1">Dossier de la Facture</DialogTitle>
                    <p className="text-xs text-slate-400 font-bold uppercase">Regroupez les documents liés à cette transaction (Devis, BC, Chèque, etc.)</p>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {(quoteNumber || poNumber) && (
                        <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-100 flex flex-col gap-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">Références du Dossier</h4>
                            {quoteNumber && (
                                <div className="text-sm font-bold text-slate-900 border-b border-orange-200/50 pb-2">
                                    <span className="text-slate-500 font-medium mr-2">Devis Associé :</span> {quoteNumber}
                                </div>
                            )}
                            {poNumber && (
                                <div className="text-sm font-bold text-slate-900 pt-1">
                                    <span className="text-slate-500 font-medium mr-2">Bon de Commande :</span> {poNumber}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col items-center justify-center w-full gap-3">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative">
                            {selectedFile ? (
                                <div className="flex flex-col items-center">
                                    <ImageIcon className="h-8 w-8 text-orange-500 mb-2" />
                                    <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase">Prêt à être inséré</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                    <p className="mb-2 text-sm text-slate-500 font-bold"><span className="font-semibold">Cliquez</span> pour sélectionner une image</p>
                                    <p className="text-xs text-slate-400 font-medium">JPEG, PNG ou WEBP (Max: 1MB)</p>
                                </div>
                            )}
                            <Input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} disabled={uploading} />
                        </label>

                        {selectedFile && (
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nature du document</label>
                                <select
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    value={documentCategory}
                                    onChange={(e) => setDocumentCategory(e.target.value)}
                                >
                                    <option value="Bon de Livraison">Bon de Livraison (BL)</option>
                                    <option value="Bon de Commande">Bon de Commande (BC)</option>
                                    <option value="Preuve de Paiement">Preuve de Paiement (Virement/Chèque)</option>
                                    <option value="Pièce d'Identité">Pièce d'Identité / RC / ICE</option>
                                    <option value="Autre Document">Autre Document</option>
                                </select>
                            </div>
                        )}

                        <Button
                            className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                        >
                            {uploading ? (
                                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Insertion en cours...</>
                            ) : (
                                "Insérer le Document"
                            )}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        {attachments.map((docString, idx) => {
                            let docData = docString;
                            let docCategory = "Document Sans Nom";

                            if (docString.startsWith('{')) {
                                try {
                                    const parsed = JSON.parse(docString);
                                    docData = parsed.data;
                                    docCategory = parsed.category || "Autre Document";
                                } catch (e) { }
                            }

                            return (
                                <div key={idx} className="relative group border rounded-xl overflow-hidden bg-slate-50 h-36 flex flex-col items-center justify-between border-slate-200">
                                    <div className="absolute top-0 w-full bg-slate-900/80 backdrop-blur-md px-2 py-1.5 z-10 flex justify-between items-center transition-all">
                                        <span className="text-[9px] font-black text-white uppercase tracking-wider truncate mr-2">
                                            {docCategory}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <a href={docData} download={`piece_jointe_${idx + 1}`} className="text-white hover:text-green-400 cursor-pointer bg-white/10 p-1.5 rounded-md" title="Télécharger">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                            </a>
                                            <button
                                                className="text-white hover:text-red-400 cursor-pointer bg-white/10 p-1.5 rounded-md disabled:opacity-50"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(docString); }}
                                                disabled={deleting === docString}
                                                title="Supprimer"
                                            >
                                                {deleting === docString ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-full w-full flex items-center justify-center p-2 pt-8">
                                        {docData.startsWith("data:image") ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={docData} alt={docCategory} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-slate-300" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
