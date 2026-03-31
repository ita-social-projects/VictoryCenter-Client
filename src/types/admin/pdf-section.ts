export interface PdfSection {
    title: string;
    description: string;
}

export interface PdfReportDto {
    id: number;
    name: string;
    blobName: string;
    fileSizeBytes: number;
    createdAt: string;
    priority: number;
}
