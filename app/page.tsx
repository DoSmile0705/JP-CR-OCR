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
import { Search, BookOpen, PenTool, Languages, Trash2, FileSearch } from "lucide-react"
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

type Document = {
  id: string;
  title: string;
  type: number;
}

type SearchResult = {
  id: string;
  thumbnail_src: string;
  line_text: string[];
  page: number[];
}

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const searchQuery = searchParams.get('search')

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(searchQuery)
    } else {
      fetchDocuments()
    }
  }, [searchQuery])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/doc-list')
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
      const response = await fetch(`/search-keyword?keyword=${encodeURIComponent(keyword)}`)
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
      const response = await fetch(`/doc-delete?id=${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.status) {
        toast({
          title: "成功",
          description: "文献を削除しました",
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
              <div className="flex">
                <div className="w-1/3">
                  <img
                    src={result.thumbnail_src}
                    alt="サムネイル"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="w-2/3 p-4">
                  <h3 className="text-lg font-semibold mb-2">{result.title}</h3>
                  <div className="space-y-2">
                    {result.line_text.map((line, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {line} (ページ: {result.page[index]})
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <CardFooter className="flex justify-end space-x-2 p-4 bg-muted/50">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/document/${result.id}`)}
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
                        onClick={() => handleDelete(result.id)}
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
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="flex flex-col">
            <div className="relative pt-[56.25%]">
              <img
                src={`/thumbnails/${doc.id}.jpg`}
                alt={doc.title}
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
                onClick={() => router.push(`/document/${doc.id}`)}
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
  )
}