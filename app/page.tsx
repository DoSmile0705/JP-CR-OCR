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
import { Search, BookOpen, PenTool, Languages, Trash2, FileSearch, ChevronDown } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from './contexts/AuthContext'

type Document = {
  id: string;
  title: string;
  type: number;
}

type SearchResult = {
  id: string;
  document_title: string;
  pages: { page_number: number, lines: string[] }[]
}

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [expandedPages, setExpandedPages] = useState<{ [key: number]: boolean }>({})
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { token } = useAuth()
  const searchQuery = searchParams.get('search')
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // Use the base URL from .env

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(searchQuery)
    } else {
      fetchDocuments()
    }
  }, [searchQuery])

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  const togglePage = (pageNumber: number) => {
    setExpandedPages((prev) => ({ ...prev, [pageNumber]: !prev[pageNumber] }))
  }


  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/doc-list`)
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
      const response = await fetch(`${API_BASE_URL}/search-keyword?keyword=${encodeURIComponent(keyword)}`)
      const data = await response.json()
      setSearchResults(data)

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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/doc-delete?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.status) {
        toast({
          title: "成功",
          description: data.message,
        })
        if (searchQuery) {
          fetchSearchResults(searchQuery)
        } else {
          fetchDocuments()
        }
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "文献の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

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

  if (searchQuery) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">「{searchQuery}」の検索結果</h2>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {searchResults.map((result) => (
            <Card key={result.id} className="overflow-hidden">
              <div>{result.id}</div>

              <div className="flex cursor-pointer" onClick={() => toggleCard(result.id)}>
                <div className="w-1/3 py-3 bg-gray-200 flex justify-center">
                  <img
                    src={`${API_BASE_URL}/storage/thumbnails/${result.document_title.split('.')[0]}/1.jpg`}
                    alt="サムネイル"
                    className="w-20 h-auto object-cover"
                  />
                </div>
                <div className="w-2/3 p-4 flex flex-col">
                  <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
                    {result.document_title}
                    <ChevronDown className={`transform ${expandedCard === result.id ? 'rotate-180' : ''}`} />
                  </h3>
                  <span>検索結果 {result.pages.reduce((total, page) => total + page.lines.length, 0)} 件</span>
                </div>
              </div>
              {expandedCard === result.id && (
                <ScrollArea className="h-[400px] overflow-y-auto p-4 border-2 border-gray-300 rounded-lg">
                  {result.pages.map((page) => (
                    <div key={page.page_number} className="mt-2 border-b border-gray-200 pb-2">
                      <p className="font-bold cursor-pointer flex items-center" onClick={() => togglePage(page.page_number)}>
                        [ページ {page.page_number}]
                        <ChevronDown className={`ml-2 transform ${expandedPages[page.page_number] ? 'rotate-180' : ''}`} />
                      </p>
                      {expandedPages[page.page_number] && (
                        <ul className="ml-4 list-disc">
                          {page.lines.map((line, index) => (
                            <li key={index} className="text-sm text-muted-foreground">{line}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              )}
              <CardFooter className="flex justify-end space-x-2 p-4 bg-muted/50">
                <Button variant="outline" onClick={() => router.push(`/detail?id=${result.id}`)}>
                  <FileSearch className="mr-2 h-4 w-4" />
                  詳細
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-4">古典籍デジタルアーカイブへようこそ</h1>
        <p className="text-lg text-muted-foreground">
          日本・中国の古典籍をデジタル化し、検索・閲覧できるプラットフォームです。
        </p>
      </section>

      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents?.map((doc) => (
            <Card key={doc.id} className="flex flex-col">
              <div className="relative pt-[56.25%]">
                <img
                  src={`${API_BASE_URL}/storage/thumbnails/${doc.title.split('.')[0]}/1.jpg`}
                  alt={doc.title.split('.')[0]}
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"
                />
              </div>
              <CardHeader>
                <CardTitle>{doc.title}</CardTitle>
                <CardDescription>
                  種類: {doc.type === 1 ? "原文" : doc.type === 2 ? "注釈" : "翻訳"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/detail?id=${doc.id}`)}
                >
                  <FileSearch className="mr-2 h-4 w-4" />
                  詳細
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>文献を削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消すことができません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(doc.id)}
                      >
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}