"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), { ssr: false });

type Document = {
  id: string
  title: string
  total_pages: number
}

export default function DocumentDetail() {  
  const [document, setDocument] = useState<Document | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const docId = searchParams.get('id')

  useEffect(() => {
    if (docId) {
      fetchDocumentDetails()
    }
  }, [docId])

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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (document && currentPage < document.total_pages) {
      setCurrentPage(prev => prev + 1)
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
          <PdfViewer fileUrl={`${API_BASE_URL}/storage/documents/${document.title}`} />
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
                  <img
                    src={`${API_BASE_URL}/storage/documents/${document.title}`}
                    alt={`Page ${currentPage}`}
                    className="w-full h-full object-contain"
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}

      {/* <div className="flex items-center justify-center mt-4 space-x-4">
        <Button
          variant="outline"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          前のページ
        </Button>
        
        <span className="text-sm">
          {currentPage} / {document.total_pages}
        </span>
        
        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={currentPage === document.total_pages}
        >
          次のページ
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div> */}
    </div>
  )
}
