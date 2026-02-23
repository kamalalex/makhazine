export function exportToExcel(data: any[], filename: string) {
    // CSV headers
    const headers = [
        'Référence',
        'Désignation',
        'Marque',
        'Catégorie',
        'Prix Unitaire (DH)',
        'Stock Actuel',
        'Entrées Totales',
        'Sorties Totales',
        'Seuil Alerte',
        'Statut',
        'Date de création'
    ];

    // Transform data to CSV rows
    const rows = data.map(item => [
        item.reference,
        item.name,
        item.brand || '',
        item.category || 'Général',
        item.price,
        item.stock,
        item.totalIn || 0,
        item.totalOut || 0,
        item.lowStockAlert,
        item.stock <= 0 ? 'Rupture' : (item.stock <= item.lowStockAlert ? 'Stock Faible' : 'Optimal'),
        new Date(item.createdAt).toLocaleDateString('fr-FR')
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(';'), // Using semicolon for Better Excel compatibility in FR regions
        ...rows.map(row => row.join(';'))
    ].join('\n');

    // Create a blob and download
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportMovementsToExcel(data: any[], filename: string) {
    const headers = [
        'Date',
        'Heure',
        'Produit',
        'Référence',
        'Type',
        'Quantité',
        'Note / Motif',
        'Dépôt'
    ];

    const rows = data.map(item => [
        new Date(item.createdAt).toLocaleDateString('fr-FR'),
        new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        item.product?.name || 'N/A',
        item.product?.reference || 'N/A',
        item.type === 'IN' ? 'Entrée' : 'Sortie',
        item.quantity,
        item.note || '',
        item.warehouse?.name || 'Stock Global'
    ]);

    const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
