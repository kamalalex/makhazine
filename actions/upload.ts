"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function uploadFile(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file || file.size === 0) {
            return { error: "Aucun fichier n'a été sélectionné." };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filename = `${Date.now()}-${safeFilename}`;

        const uploadDir = join(process.cwd(), "public", "uploads");

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const path = join(uploadDir, filename);

        await writeFile(path, buffer);

        return { success: true, url: `/uploads/${filename}` };
    } catch (e: any) {
        console.error("Erreur lors de l'upload: ", e);
        return { error: e.message || "Impossible d'uploader le fichier." };
    }
}
