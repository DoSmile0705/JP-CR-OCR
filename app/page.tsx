"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Bell, ArrowUpRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type NewsItem = {
    id: string
    date: string // YYYY-MM-DD format
    title: string
    description: string
    url: string
    isNew: boolean
}

export default function Home() {
    const [news, setNews] = useState<NewsItem[]>([])
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
    const [loading, setLoading] = useState(true)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
    const searchParams = useSearchParams()
    const newsId = searchParams.get('id')


    useEffect(() => {
        fetchNews()
    }, [])

    useEffect(() => {
        console.log(news)
    }, [news])

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
            const response = await fetch(`${API_BASE_URL}/news`)
            const data = await response.json()
            setNews(data)
        } catch (error) {
            console.error('Failed to fetch news:', error)
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

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Section */}
            <section className="mb-12">
                <h1 className="text-3xl font-bold mb-4 text-center">中国戯曲日本語注釈データベース</h1>
                <p className="text-lg text-muted-foreground text-center">
                    日本・中国の古典籍をデジタル化し、検索・閲覧できるプラットフォームです。
                </p>
            </section>

            {/* News Section */}
            <section className="mb-12">
                {selectedNews ? (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedNews(null)}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                戻る
                            </Button>
                            <h2 className="text-2xl font-bold">{selectedNews.title}</h2>
                        </div>
                        <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: selectedNews.description }} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                <h2 className="text-2xl font-bold">お知らせ</h2>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/news">すべて見る</Link>
                            </Button>
                        </div>

                        {/* News List */}
                        <div className="grid gap-2 mb-6">
                            {news.slice(0, 5).map((item) => (
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
                    </>
                )}
            </section>
        </div>
    )
}
