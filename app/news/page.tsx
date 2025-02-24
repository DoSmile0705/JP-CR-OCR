"use client"

import { useEffect, useState } from 'react'
import { Bell, ArrowUpRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"

type NewsItem = {
  id: string
  date: string // YYYY-MM-DD format
  title: string
  description: string
  isNew: boolean
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const searchParams = useSearchParams()
  const newsId = searchParams.get('id')

  useEffect(() => {
    fetchNews()
  }, [])

  useEffect(() => {
    if (newsId && news.length > 0) {
        // Search for news item with matching ID
        console.log("newsId", newsId)
        const selectedNewsItem = news.find(item => { 
          console.log(item.id)
          return item.id == newsId 
        })

        // Update selected news if found
        if (selectedNewsItem) {
            setSelectedNews(selectedNewsItem)
        } else {
            setSelectedNews(null) // Reset if not found
        }
    }
}, [newsId, news])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/news`)
      const data = await response.json()
      setNews(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "お知らせの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to truncate title if it's too long
  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">お知らせを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (selectedNews) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedNews(null)}
            className="flex items-center gap-2 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            戻る
          </Button>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{selectedNews.title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {formatDate(selectedNews.date)}
              </span>
              {selectedNews.isNew && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                  NEW
                </span>
              )}
            </div>
            <div className="prose max-w-none mt-8">
              <div dangerouslySetInnerHTML={{ __html: selectedNews.description }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Bell className="h-5 w-5" />
        <h1 className="text-3xl font-bold">お知らせ</h1>
      </div>

      <div className="grid gap-2">
        {news.map((item) => (
          <Link 
            key={item.id} 
            href={`/news?id=${item.id}`}
            className="flex items-center justify-between p-4 hover:bg-accent rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <span className="text-muted-foreground whitespace-nowrap">
                {formatDate(item.date)}
              </span>
              <span className="truncate">
                {truncateTitle(item.title)}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {item.isNew && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  NEW
                </span>
              )}
              <ArrowUpRight className="h-4 w-4 flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
