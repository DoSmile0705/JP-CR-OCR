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
import { Search, BookOpen, PenTool, Languages, FileSearch, ChevronDown, Edit } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '../contexts/AuthContext'
import Image from 'next/image'

type Document = {
  id: string;
  user_id: string;
  title: string;
  type: number;
}

type SearchResult = {
  id: string;
  user_id: string;
  document_title: string;
  total_matches: number;
  matches: {
    title_matches?: { context: string }[];
    page_matches?: {
      page_number: number;
      matches: {
        type: "text" | "translation" | "annotation_name" | "annotation_type" | "annotation_content";
        context: string;
      }[];
    }[];
  };
};


export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [expandedPages, setExpandedPages] = useState<{ [key: number]: boolean }>({})
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, token } = useAuth()
  const searchQuery = searchParams.get('keyword')
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
                  <Image
                    src={`${API_BASE_URL}/storage/thumbnails/${result.document_title.split('.')[0]}/1.jpg`}
                    alt="サムネイル"
                    className="w-20 h-auto object-cover"
                    width={1000}
                    height={1000}
                  />
                </div>
                <div className="w-2/3 p-4 flex flex-col">
                  <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
                    {result.document_title}
                    <ChevronDown className={`transform ${expandedCard === result.id ? 'rotate-180' : ''}`} />
                  </h3>
                  <span>検索結果 {result.total_matches} 件</span>
                </div>
              </div>
              {expandedCard === result.id && (
                <ScrollArea className="h-[400px] overflow-y-auto p-4 border-2 border-gray-300 rounded-lg">
                  {/* Title matches */}
                  {result.matches.title_matches && result.matches.title_matches.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-bold mb-2">タイトルの一致</h4>
                      <ul className="ml-4 list-disc">
                        {result.matches.title_matches.map((match, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {match.context}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Page matches */}
                  {result.matches.page_matches && result.matches.page_matches.map((page) => (
                    <div key={page.page_number} className="mt-2 border-b border-gray-200 pb-2">
                      <p
                        className="font-bold cursor-pointer flex items-center "

                      >
                        <span
                          onClick={() => {
                            navigateToPage(result.id, page.page_number);
                          }}
                          className="underline hover:text-primary"
                        >[ページ {page.page_number}]</span>
                        <ChevronDown className={`ml-2 transform ${expandedPages[page.page_number] ? 'rotate-180' : ''}`} onClick={() => togglePage(page.page_number)} />
                      </p>
                      {expandedPages[page.page_number] && (
                        <ul className="ml-4 list-disc">
                          {page.matches.map((match, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              [{match.type === 'text' ? '本文' :
                                match.type === 'translation' ? '翻訳' :
                                  match.type === 'annotation_name' ? '注釈対象' :
                                    match.type === 'annotation_type' ? '注釈類別' :
                                      match.type === 'annotation_content' ? '注釈内容' :
                                        '不明'}: {match.context}]
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  {/* No matches message */}
                  {(!result.matches.title_matches || result.matches.title_matches.length === 0) &&
                    (!result.matches.page_matches || result.matches.page_matches.length === 0) && (
                      <p className="text-center text-muted-foreground">
                        一致する結果が見つかりませんでした
                      </p>
                    )}
                </ScrollArea>
              )}
              <CardFooter className="flex justify-end space-x-2 p-4 bg-muted/50">
                <Button variant="outline" onClick={() => router.push(`/detail?id=${result.id}`)}>
                  <FileSearch className="mr-2 h-4 w-4" />
                  詳細
                </Button>
                {user?.role === 'researcher' && Number(result.user_id) == user?.id && (
                  <Button
                    variant="default"
                    onClick={() => router.push(`/edit?id=${result.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </Button>
                )}
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
      {/* <section className="mb-12">
        <h1 className="text-3xl font-bold mb-4 text-center">古典籍デジタルアーカイブへようこそ</h1>
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
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"
                  width={1000}
                  height={1000}
                />
              </div>
              <CardHeader>
                <CardTitle>{doc.title}</CardTitle>
                <CardDescription>
                  種類: {doc.type === 1 ? "原文" : doc.type === 2 ? "注釈" : "翻訳"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto flex justify-end space-x-2">
                {user?.role === 'researcher' && Number(doc.user_id) == user?.id && (
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