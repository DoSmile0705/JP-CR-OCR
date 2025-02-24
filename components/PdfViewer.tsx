"use client";

import { useEffect, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { SpecialZoomLevel, RenderViewer } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { Button } from "@/components/ui/button";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DownArrowIcon, NextIcon, PreviousIcon, UpArrowIcon } from '@react-pdf-viewer/page-navigation';

type PdfViewerProps = {
    fileUrl: string;
};


export default function PdfViewer({ fileUrl }: PdfViewerProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { jumpToPage } = pageNavigationPluginInstance;
    useEffect(() => {
        jumpToPage(currentPage);
    }, [currentPage])

    return (
        <div className="flex flex-col items-center">
            {/* PDF Viewer */}
            <div className="h-[80vh] border rounded-lg overflow-hidden w-full">
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
                    <Viewer
                        fileUrl={fileUrl}
                        defaultScale={SpecialZoomLevel.PageFit}
                        onPageChange={(e) => setCurrentPage(e.currentPage)}
                        onDocumentLoad={(e) => setTotalPages(e.doc.numPages)}
                        initialPage={currentPage}
                        plugins={[pageNavigationPluginInstance]}
                    />
                </Worker>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center space-x-4 mt-4">
                <Button variant="outline" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}>
                    <ChevronsLeft className="h-4 w-4 mr-2" /> 最初のページ
                </Button>

                <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
                    <ChevronLeft className="h-4 w-4 mr-2" /> 前のページ
                </Button>

                <span className="text-sm">
                    {currentPage + 1} / {totalPages}
                </span>

                <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))} disabled={currentPage === totalPages - 1}>
                    次のページ <ChevronRight className="h-4 w-4 ml-2" />
                </Button>

                <Button variant="outline" onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage === totalPages - 1}>
                    最後のページ <ChevronsRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
