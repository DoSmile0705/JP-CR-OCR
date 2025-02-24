"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { ChevronDown, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { SpecialZoomLevel, RenderViewer } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Image from 'next/image';
import { zoomPlugin } from '@react-pdf-viewer/zoom';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), { ssr: false });

type Annotation = {
    id?: number;
    target_text: string;
    type: string;
    content: string;
};

type Page = {
    id: number;
    text: string;
    jp_translation: string;
    annotations: Annotation[];
};

type Thumbnail = {
    page_number: number;
    image_path: string;
}

type Document = {
    id: string;
    title: string;
    type: number;
    pages: Page[];
    thumbnails: Thumbnail[];
};

export default function DocumentEdit() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [document, setDocument] = useState<Document | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
    const { token } = useAuth();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const documentId = searchParams.get('id') ?? "1";
    const [pdfCurrentPage, setPdfCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { jumpToPage } = pageNavigationPluginInstance;
    const zoomPluginInstance = zoomPlugin();
    const { ZoomInButton, ZoomOutButton, ZoomPopover } = zoomPluginInstance;

    useEffect(() => {
        if (documentId) {
            fetchDocumentDetail();
        }
    }, [documentId]);

    useEffect(() => {
        if (totalPages == 0) {
            return;
        }
        // When total pages is set or changes, ensure document has enough pages
        console.log("totalPages of current document", totalPages);
        const processedData = {
            id: documentId,
            title: document?.title ?? "Untitled Document", // Provide a default title
            type: document?.type ?? 0, // Provide a default type (e.g., 0 or any meaningful default)
            pages: document?.pages?.length ? document.pages : generateEmptyPages(totalPages),
            thumbnails: document?.thumbnails || []
        };

        // Ensure each page has an annotations array
        processedData.pages = processedData.pages.map((page: Page) => ({
            ...page,
            text: page.text || generateSampleText(page.id),
            jp_translation: page.jp_translation || generateSampleTranslation(page.id),
            annotations: page.annotations?.length ? page.annotations : generateSampleAnnotations()
        }));

        console.log("processedData", processedData);

        setDocument({ ...processedData, id: documentId });
    }, [totalPages]);

    // useEffect(() => {
    // console.log(document);
    // }, [document]);

    useEffect(() => {
        jumpToPage(pdfCurrentPage);
    }, [pdfCurrentPage]);

    const generateEmptyPages = (count: number) => {
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            text: '',
            jp_translation: '',
            annotations: []
        }));
    };

    const generateSampleText = (pageId: number) => {
        return `ページ ${pageId} の本文です。内容を追加してください。`;
    };

    const generateSampleTranslation = (pageId: number) => {
        return `ページ${pageId}の日本語訳です。内容を追加してください。`;
    };

    const generateSampleAnnotations = () => {
        return [{
            target_text: "注釈",
            type: "注釈の種類",
            content: "注釈の内容"
        }];
    };

    const fetchDocumentDetail = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/doc-detail/${documentId}`);
            const data = await response.json();

            // Initialize empty arrays if not present
            console.log("totalPages of current document", totalPages);
            const processedData = {
                ...data,
                pages: data.pages || generateEmptyPages(totalPages),
                thumbnails: data.thumbnails || []
            };

            // Ensure each page has an annotations array and sample content if empty
            processedData.pages = processedData.pages.map((page: Page) => ({
                ...page,
                text: page.text || generateSampleText(page.id),
                jp_translation: page.jp_translation || generateSampleTranslation(page.id),
                annotations: page.annotations?.length ? page.annotations : generateSampleAnnotations()
            }));

            setDocument(processedData);
        } catch (error) {
            toast({
                title: "エラー",
                description: "文書の取得に失敗しました",
                variant: "destructive",
            });
        }
    };

    const handlePageChange = (newPage: number) => {
        if (document && newPage >= 1 && newPage <= document.pages.length) {
            setCurrentPage(newPage);
            setPdfCurrentPage(newPage - 1);
            setSelectedAnnotation(null);
        }
    };

    const handlePdfPageChange = (newPage: number) => {
        setPdfCurrentPage(newPage);
        setCurrentPage(newPage + 1);
        setSelectedAnnotation(null);
    };

    const getCurrentPage = () => {
        // console.log(document);
        return document?.pages[currentPage - 1];
    };

    const handleContentEdit = (type: 'text' | 'jp_translation' | 'annotation', value: string, annotationIndex?: number, annotationField?: 'target_text' | 'content' | 'type') => {
        if (!document) return;

        let updatedPages = [...document.pages].map(page => ({
            id: page.id || 0,
            text: page.text || '',
            jp_translation: page.jp_translation || '',
            annotations: page.annotations || [],
        }));
        const currentPageIndex = currentPage - 1;

        console.log(updatedPages[currentPageIndex]);
        switch (type) {
            case 'text':
                updatedPages[currentPageIndex]!.text = value;
                break;
            case 'jp_translation':
                updatedPages[currentPageIndex]!.jp_translation = value;
                break;
            case 'annotation':
                if (typeof annotationIndex === 'number' && annotationField) {
                    updatedPages[currentPageIndex]!.annotations[annotationIndex][annotationField] = value;
                }
                break;
        }

        console.log(updatedPages);

        setDocument({ ...document, pages: updatedPages });
    };

    const addAnnotation = () => {
        if (!document) return;

        const currentPageData = getCurrentPage();
        if (!currentPageData) return;

        const newAnnotation: Annotation = {
            target_text: "",
            type: "",
            content: ""
        };

        const updatedPages = [...document.pages];
        if (!updatedPages[currentPage - 1].annotations) {
            updatedPages[currentPage - 1].annotations = [];
        }
        updatedPages[currentPage - 1].annotations.push(newAnnotation);

        setDocument({ ...document, pages: updatedPages });
        setSelectedAnnotation(updatedPages[currentPage - 1].annotations.length - 1);
    };

    const deleteAnnotation = (index: number) => {
        if (!document) return;

        const updatedPages = [...document.pages];
        updatedPages[currentPage - 1].annotations.splice(index, 1);

        setDocument({ ...document, pages: updatedPages });
        setSelectedAnnotation(null);
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/doc-edit/${documentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    pages: document?.pages
                }),
            });
            const data = await response.json();
            if (data.message) {
                toast({
                    title: "成功",
                    description: "保存しました",
                });
            }
        } catch (error) {
            toast({
                title: "エラー",
                description: "保存に失敗しました",
                variant: "destructive",
            });
        }
    };

    if (!document) {
        return <div>Loading...</div>;
    }

    const currentPageData = getCurrentPage();

    const isPdf = document.title.toLowerCase().endsWith('.pdf');

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Left side: PDF Viewer */}
            <div className="w-1/2 h-full border-r p-4">
                {isPdf ? (
                    <div className="flex flex-col items-center">
                        <div
                            style={{
                                alignItems: 'center',
                                backgroundColor: '#eeeeee',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '4px',
                            }}
                        >
                            <div style={{ padding: '0px 2px' }}>
                                <ZoomOutButton />
                            </div>
                            <div style={{ padding: '0px 2px' }}>
                                <ZoomPopover />
                            </div>
                            <div style={{ padding: '0px 2px' }}>
                                <ZoomInButton />
                            </div>
                        </div>
                        <div className="h-[80vh] border rounded-lg overflow-hidden w-full">
                            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
                                <Viewer
                                    fileUrl={`${API_BASE_URL}/storage/documents/${document.title}`}
                                    defaultScale={SpecialZoomLevel.PageFit}
                                    onPageChange={(e) => handlePdfPageChange(e.currentPage)}
                                    onDocumentLoad={(e) => setTotalPages(e.doc.numPages)}
                                    initialPage={pdfCurrentPage}
                                    plugins={[pageNavigationPluginInstance, zoomPluginInstance]}
                                />
                            </Worker>
                        </div>

                        {/* PDF Navigation Buttons */}
                        <div className="flex items-center justify-center space-x-4 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => handlePdfPageChange(0)}
                                disabled={pdfCurrentPage === 0}
                                className="w-1/5"
                            >
                                <ChevronsLeft className="h-4 w-4 mr-2" /> 最初のページ
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => handlePdfPageChange(Math.max(pdfCurrentPage - 1, 0))}
                                disabled={pdfCurrentPage === 0}
                                className="w-1/5"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> 前のページ
                            </Button>

                            <span className="text-sm w-1/5 text-center">
                                {pdfCurrentPage + 1} / {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                onClick={() => handlePdfPageChange(Math.min(pdfCurrentPage + 1, totalPages - 1))}
                                disabled={pdfCurrentPage === totalPages - 1}
                                className="w-1/5"
                            >
                                次のページ <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => handlePdfPageChange(totalPages - 1)}
                                disabled={pdfCurrentPage === totalPages - 1}
                                className="w-1/5"
                            >
                                最後のページ <ChevronsRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="relative border rounded-lg overflow-hidden bg-background w-full flex-1">
                        <TransformWrapper>
                            {({ zoomIn, zoomOut, resetTransform }) => (
                                <>
                                    <div className="flex space-x-2 mb-2">
                                        <Button variant="outline" onClick={() => zoomIn()}>+</Button>
                                        <Button variant="outline" onClick={() => zoomOut()}>-</Button>
                                        <Button variant="outline" onClick={() => resetTransform()}>リセット</Button>
                                    </div>
                                    <TransformComponent wrapperStyle={{ width: "100%", height: "calc(100% - 40px)" }}>
                                        <Image
                                            src={`${API_BASE_URL}/storage/documents/${document.title}`}
                                            alt={`Page ${currentPage}`}
                                            className="w-full h-full object-contain"
                                            width={1000}
                                            height={1000}
                                        />
                                    </TransformComponent>
                                </>
                            )}
                        </TransformWrapper>
                    </div>
                )
                }
            </div>

            {/* Right side: Editor */}
            <div className="w-1/2 flex flex-col p-4 overflow-y-auto">
                <div className="space-y-4">
                    {/* Main Text */}
                    <div>
                        <label className="block text-sm font-medium mb-2">原文</label>
                        <Textarea
                            value={currentPageData?.text || ''}
                            onChange={(e) => handleContentEdit('text', e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Japanese Translation */}
                    <div>
                        <label className="block text-sm font-medium mb-2">日本語訳</label>
                        <Textarea
                            value={currentPageData?.jp_translation || ''}
                            onChange={(e) => handleContentEdit('jp_translation', e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Annotations */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium">注釈</label>
                            <Button
                                onClick={addAnnotation}
                                size="sm"
                                variant="outline"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                追加
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {(currentPageData?.annotations || []).map((annotation, index) => (
                                <div key={index} className="border rounded-lg p-2">
                                    <div className="flex justify-between items-center">
                                        <Button
                                            variant="ghost"
                                            className="flex-1 flex justify-between"
                                            onClick={() => setSelectedAnnotation(index === selectedAnnotation ? null : index)}
                                        >
                                            <span>注釈 {index + 1}</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => deleteAnnotation(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {selectedAnnotation === index && (
                                        <div className="mt-2 space-y-2">
                                            <Input
                                                placeholder="対象テキスト"
                                                value={annotation.target_text || ''}
                                                onChange={(e) => handleContentEdit('annotation', e.target.value, index, 'target_text')}
                                            />
                                            <Input
                                                placeholder="注釈タイプ"
                                                value={annotation.type || ''}
                                                onChange={(e) => handleContentEdit('annotation', e.target.value, index, 'type')}
                                            />
                                            <Textarea
                                                placeholder="注釈内容"
                                                value={annotation.content || ''}
                                                onChange={(e) => handleContentEdit('annotation', e.target.value, index, 'content')}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className='flex justify-center w-1/4 max-w-md mx-auto'>
                    <Button
                        onClick={handleSave}
                        className="mt-4"
                    >
                        保存
                    </Button>
                </div>

            </div>
        </div>
    );
}
