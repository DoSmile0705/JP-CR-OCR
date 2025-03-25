"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, BookOpen, PenTool, Languages, FileSearch, ChevronDown, Edit, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '../contexts/AuthContext'
import Image from 'next/image'

// Document type definition
type Document = {
  id: string
  user_id: string
  title: string
  type: number
}

// SearchResult type definition
type SearchResult = {
  id: string
  user_id: string
  document_title: string
  total_matches: number
  matches: {
    title_matches?: { context: string }[]
    page_matches?: {
      page_number: number
      matches: {
        type: "text" | "translation" | "annotation_name" | "annotation_type" | "annotation_content"
        context: string
      }[]
    }[]
  }
}

export default function SearchPage() {
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('keyword')
  const [query, setQuery] = useState(searchQuery)
  const router = useRouter()
  const { toast } = useToast()
  const { user, token } = useAuth()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // Use the base URL from .env

  const [documents, setDocuments] = useState<Document[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const [isResultsExpanded, setIsResultsExpanded] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [expandedDocuments, setExpandedDocuments] = useState<Record<string, boolean>>({})
  const documentsPerPage = 10

  const [resultsCountPerPage, setResultsCountPerPage] = useState(5)

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(searchQuery)
    } else {
      fetchDocuments()
    }
  }, [searchQuery])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/doc-list?type=search`)
      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "文献リストの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSearchResults = async (keyword: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`)
      const data = await response.json()
      setSearchResults(data)
      console.log(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "検索結果の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  const navigateToPage = (documentId: string, pageNumber: number) => {
    router.push(`/detail?id=${documentId}&page=${pageNumber}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">
            {searchQuery ? "検索結果を取得中..." : "文献リストを読み込み中..."}
          </p>
        </div>
      </div>
    )
  }

  // Filter results if a specific document is selected
  const filteredResults = selectedDocument
    ? searchResults.filter((doc) => doc.id === selectedDocument)
    : searchResults

  // Calculate total number of documents
  const totalDocuments = filteredResults.length

  // Calculate total page matches across all documents
  const totalPageMatches = filteredResults.reduce((sum, doc) => {
    let count = 0
    if (doc.matches.page_matches) {
      doc.matches.page_matches.forEach((page) => {
        count += page.matches.length
      })
    }
    return sum + count
  }, 0)

  // Calculate pagination for documents
  const totalPages = Math.ceil(totalDocuments / documentsPerPage)
  const startIndex = (currentPage - 1) * documentsPerPage
  const endIndex = Math.min(startIndex + documentsPerPage, totalDocuments)

  // Get current page documents
  const currentDocuments = filteredResults.slice(startIndex, endIndex)

  // Toggle document expansion
  const toggleDocumentExpansion = (docId: string) => {
    setExpandedDocuments((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }))
  }

  // Handle document selection for "View All"
  const handleShowAllResults = (documentId: string) => {
    setSelectedDocument(documentId)
    setCurrentPage(1)
  }

  // Reset document filter
  const handleResetFilter = () => {
    setSelectedDocument(null)
    setCurrentPage(1)
  }

  // Get match type label in Japanese
  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "本文"
      case "translation":
        return "翻訳"
      case "annotation_name":
        return "注釈名"
      case "annotation_type":
        return "注釈種別"
      case "annotation_content":
        return "注釈内容"
      default:
        return ""
    }
  }

  // Function to render page matches for a document
  const renderPageMatches = (doc: SearchResult, showAll = false) => {
    if (!doc.matches.page_matches) return null

    // const resultsCountPerPage = 5

    // Get all page matches for this document
    const allPageMatches = doc.matches.page_matches

    // Determine how many to show
    const pagesToShow = allPageMatches
    const hasMorePages = allPageMatches.length > 5
    console.log(doc.matches.page_matches)

    return (
      <div className="space-y-3 ml-4 mt-2">
        {(() => {
          let count = 0;
          return pagesToShow.map((page, pageIndex) => {
            if (selectedDocument) return null;

            return (
              <div
                key={`${doc.id}-page-${page.page_number}`}
                className={pageIndex < pagesToShow.length - 1 ? "pb-3 border-b border-dashed border-gray-200" : ""}
              >
                {page.matches.map((match, matchIndex) => {
                  if (expandedDocuments[doc.id] != true && count >= resultsCountPerPage) return null;
                  count++;

                  return (
                    <div key={`${doc.id}-page-${page.page_number}-match-${matchIndex}`} className="flex items-start mt-1">
                      <div className="flex flex-col mr-2 min-w-[80px]">
                        <span
                          className="hover:underline cursor-pointer"
                          onClick={() => {
                            navigateToPage(doc.id, page.page_number);
                          }}>
                          ページ {page.page_number}:
                        </span>
                      </div>
                      <p className="text-sm">
                        {match.context}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          });
        })()}


        {hasMorePages && !showAll && !selectedDocument && (
          <div className="text-right">
            <Button variant="link" size="sm" className="h-5 p-0" onClick={() => handleShowAllResults(doc.id)}>
              全検索結果を表示
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = []

    // Always show first page
    pages.push(1)

    // Current page neighborhood
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (pages[pages.length - 1] !== i - 1) {
        pages.push(-1) // Ellipsis
      }
      pages.push(i)
    }

    // Last page
    if (totalPages > 1) {
      if (pages[pages.length - 1] !== totalPages - 1) {
        pages.push(-1) // Ellipsis
      }
      pages.push(totalPages)
    }

    return pages
  }

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null

    const paginationNumbers = getPaginationNumbers()

    return (
      <div className="flex items-center justify-center space-x-1 my-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {paginationNumbers.map((page, index) =>
          page === -1 ? (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          ) : (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="w-8 h-8"
            >
              {page}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (searchQuery) {

    return (
      <div className="container mx-auto py-8">
        {/* <h1 className="text-2xl font-bold mb-6">検索</h1>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="検索キーワードを入力"
            />
            <Button>検索</Button>
          </div>
        </div> */}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">「{searchQuery}」の検索結果</h2>
                <div className="ml-4 flex items-center">
                  <span className="text-sm text-muted-foreground">
                    {selectedDocument
                      ? `検索結果 ${totalPageMatches} 件`
                      : `検索結果 ${totalDocuments} 件中 ${startIndex + 1}-${endIndex} 件を表示`}
                  </span>
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-6 w-6 p-0"
                    onClick={() => setIsResultsExpanded(!isResultsExpanded)}
                    aria-label={isResultsExpanded ? "結果を折りたたむ" : "結果を展開する"}
                  >
                    {isResultsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button> */}
                </div>
              </div>

              {selectedDocument && (
                <Button variant="outline" size="sm" onClick={handleResetFilter}>
                  すべての資料を表示
                </Button>
              )}
            </div>

            {totalPages > 1 && <PaginationControls />}

            {isResultsExpanded && (
              <div className="space-y-6">
                {currentDocuments.length > 0 ? (
                  currentDocuments.map((doc) => {
                    // Calculate total matches for this document
                    let docMatchCount = 0
                    if (doc.matches.page_matches) {
                      doc.matches.page_matches.forEach((page) => {
                        docMatchCount += page.matches.length
                      })
                    }

                    const isExpanded = expandedDocuments[doc.id] || false
                    const hasMoreThan10Pages = doc.matches.page_matches && docMatchCount > 5

                    return (
                      <div key={doc.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <h3
                              className="font-medium hover:underline cursor-pointer"
                              onClick={() => router.push(`/edit?id=${doc.id}`)}>
                              {doc.document_title}
                            </h3>
                            <span className="ml-2 text-sm text-muted-foreground">({docMatchCount}件)</span>
                            {user?.role === 'researcher' && Number(doc.user_id) == user?.id && (

                              <span
                                className="ml-2 flex flex-row items-center hover:underline cursor-pointer"
                                onClick={() => router.push(`/edit?id=${doc.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                編集
                              </span>
                            )}
                          </div>


                        </div>
                        <div>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-6 w-6 p-0"
                            onClick={() => toggleDocumentExpansion(doc.id)}
                            aria-label={isExpanded ? "結果を折りたたむ" : "結果を展開する"}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button> */}
                          {!selectedDocument && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-5 p-0"
                              onClick={() => {
                                // handleShowAllResults(doc.id);
                                toggleDocumentExpansion(doc.id);
                                // setResultsCountPerPage(100);
                              }}
                            >
                              {isExpanded ? `検索結果 ${docMatchCount}件中 ${resultsCountPerPage}件まで表示 します` : `全検索結果 ${docMatchCount}件表示`}
                            </Button>
                          )}
                        </div>
                        {renderPageMatches(doc, selectedDocument === doc.id)}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">検索結果がありません</div>
                )}
              </div>
            )}

            {totalPages > 1 && <PaginationControls />}
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      {/* <section className="mb-12">
        <h1 className="text-3xl font-bold mb-4 text-center">中国戯曲日本語注釈データベース</h1>
        <p className="text-lg text-muted-foreground text-center">
          日本・中国の古典籍をデジタル化し、検索・閲覧できるプラットフォームです。
        </p>
      </section> */}

      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents?.map((doc) => (
            <Card key={doc.id} className="flex flex-col">
              <div className="relative pt-[56.25%]">
                <Image
                  src={`${API_BASE_URL}/storage/thumbnails/${doc.title.split('.')[0]}/1.jpg`}
                  alt={doc.title.split('.')[0]}
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg hover:underline cursor-pointer"
                  onClick={() => router.push(`/detail?id=${doc.id}`)}
                  width={1000}
                  height={1000}
                />
              </div>
              <CardHeader>
                <CardTitle  onClick={() => router.push(`/detail?id=${doc.id}`)} className='hover:underline cursor-pointer'>{doc.title}</CardTitle>
                <CardDescription>
                  種類: {doc.type === 1 ? "原文" : doc.type === 2 ? "注釈" : "翻訳"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto flex justify-end space-x-2">
                {(user?.role === 'researcher' && Number(doc.user_id) == user?.id) || (user?.role === 'admin') && (
                  <Button
                    variant="default"
                    onClick={() => router.push(`/edit?id=${doc.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push(`/detail?id=${doc.id}`)}
                >
                  <FileSearch className="mr-2 h-4 w-4" />
                  詳細
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

