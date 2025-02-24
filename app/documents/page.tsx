"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '../contexts/AuthContext'
import { FileText, Edit, BookOpen, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

type Document = {
  id: string;
  title: string;
  user_id: string;
}

export default function DocumentViewer() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth() // Assuming userRole is available in AuthContext
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    fetchDocuments()
  }, [])

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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/doc-delete/${id}`, {
        method: 'DELETE',
      })  
      if (response.ok) {
        toast({
          title: "成功",
          description: "文献を削除しました",
        })
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
          <p className="text-muted-foreground">文献リストを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">文献閲覧</h1>
        <p className="text-muted-foreground">
          利用可能な文献の一覧です。閲覧したい文献を選択してください。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="flex flex-col">
            <div className="relative pt-[56.25%]">
              <Image
                src={`${API_BASE_URL}/storage/thumbnails/${doc.title.split('.')[0]}/1.jpg`}
                alt={doc.title}
                className="absolute top-0 left-0 w-full h-full object-contain rounded-t-lg" 
                width={1000}
                height={1000}
              />
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
            </CardHeader>
            <CardFooter className="mt-auto flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/detail?id=${doc.id}`)}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                閲覧
              </Button>
              
              {user?.role === 'researcher' && Number(doc.user_id) == user?.id && (
                <Button
                  variant="default"
                  onClick={() => router.push(`/edit?id=${doc.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </Button>
              )}
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

      {documents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">
            文献が見つかりませんでした
          </p>
        </div>
      )}
    </div>
  )
} 