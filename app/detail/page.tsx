"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic';
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import Image from 'next/image'
import "@react-pdf-viewer/core/lib/styles/index.css";

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), { ssr: false });

type Document = {
  id: string
  title: string
  total_pages: number
}

export default function DocumentDetail() {  
  const [document, setDocument] = useState<Document | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const docId = searchParams.get('id')
  const initialPage = parseInt(searchParams.get('page') || '1')

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  useEffect(() => {
    if (docId) {
      fetchDocumentDetails()
    }
  }, [docId])

  useEffect(() => {
    // Handle initial page from search results
    if (!loading && document) {
      const targetPage = initialPage - 1 // Convert to 0-based index
      if (targetPage >= 0 && targetPage < totalPages) {
        setCurrentPage(targetPage)
        jumpToPage(targetPage)
      }
    }
  }, [loading, document, initialPage, totalPages])

  const fetchDocumentDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/doc-detail/${docId}`)
      const data = await response.json()
      setDocument(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "文献の詳細情報の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">文献を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">文献が見つかりませんでした</p>
      </div>
    )
  }

  const isPdf = document.title.toLowerCase().endsWith('.pdf');

  return (
    <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6">{document.title}</h1>
      
      {isPdf ? (
        <div className="flex-1">
          <div className="h-[80vh] border rounded-lg overflow-hidden w-full">
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
              <Viewer
                fileUrl={`${API_BASE_URL}/storage/documents/${document.title}`}
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
      )}
    </div>
  )
}
