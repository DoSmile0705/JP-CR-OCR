"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Pencil, Trash2, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type User = {
    id: number
    username: string
    email: string
    role: string
    is_active: boolean
    created_at: string
}

export default function AdminPage() {
    const { toast } = useToast()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("register")
    const [editUser, setEditUser] = useState<User | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

    // フォームの状態
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        role: "reader",
    })

    // 編集フォームの状態
    const [editFormData, setEditFormData] = useState({
        username: "",
        email: "",
        role: "",
        is_active: false,
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                toast({
                    title: "エラー",
                    description: "ログインが必要です",
                    variant: "destructive",
                })
                return
            }

            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("ユーザー情報の取得に失敗しました")
            }

            const data = await response.json()
            setUsers(data)
        } catch (error) {
            console.error("Failed to fetch users:", error)
            toast({
                title: "エラー",
                description: "ユーザー情報の取得に失敗しました",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleRoleChange = (value: string) => {
        setFormData((prev) => ({ ...prev, role: value }))
    }

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setEditFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleEditRoleChange = (value: string) => {
        setEditFormData((prev) => ({ ...prev, role: value }))
    }

    const handleEditActiveChange = (value: string) => {
        setEditFormData((prev) => ({ ...prev, is_active: value === "true" }))
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const token = localStorage.getItem("token")
            if (!token) {
                toast({
                    title: "エラー",
                    description: "ログインが必要です",
                    variant: "destructive",
                })
                return
            }

            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "ユーザー登録に失敗しました")
            }

            toast({
                title: "成功",
                description: "ユーザーが登録されました",
            })

            // フォームをリセット
            setFormData({
                username: "",
                email: "",
                password: "",
                confirm_password: "",
                role: "reader",
            })

            // ユーザーリストを更新
            fetchUsers()

            // ユーザー管理タブに切り替え
            setActiveTab("manage")
        } catch (error: any) {
            console.error("Registration error:", error)
            toast({
                title: "エラー",
                description: error.message || "ユーザー登録に失敗しました",
                variant: "destructive",
            })
        }
    }

    const openEditDialog = (user: User) => {
        setEditUser(user)
        setEditFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdateUser = async () => {
        if (!editUser) return

        try {
            const token = localStorage.getItem("token")
            if (!token) {
                toast({
                    title: "エラー",
                    description: "ログインが必要です",
                    variant: "destructive",
                })
                return
            }

            const response = await fetch(`${API_BASE_URL}/admin/users/${editUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editFormData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "ユーザー更新に失敗しました")
            }

            toast({
                title: "成功",
                description: "ユーザー情報が更新されました",
            })

            // ダイアログを閉じる
            setIsEditDialogOpen(false)

            // ユーザーリストを更新
            fetchUsers()
        } catch (error: any) {
            console.error("Update error:", error)
            toast({
                title: "エラー",
                description: error.message || "ユーザー更新に失敗しました",
                variant: "destructive",
            })
        }
    }

    const openDeleteDialog = (userId: number) => {
        setDeleteUserId(userId)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteUser = async () => {
        if (!deleteUserId) return

        try {
            const token = localStorage.getItem("token")
            if (!token) {
                toast({
                    title: "エラー",
                    description: "ログインが必要です",
                    variant: "destructive",
                })
                return
            }

            const response = await fetch(`${API_BASE_URL}/admin/users/${deleteUserId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || "ユーザー削除に失敗しました")
            }

            toast({
                title: "成功",
                description: "ユーザーが削除されました",
            })

            // ダイアログを閉じる
            setIsDeleteDialogOpen(false)

            // ユーザーリストを更新
            fetchUsers()
        } catch (error: any) {
            console.error("Delete error:", error)
            toast({
                title: "エラー",
                description: error.message || "ユーザー削除に失敗しました",
                variant: "destructive",
            })
        }
    }

    const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                toast({
                    title: "エラー",
                    description: "ログインが必要です",
                    variant: "destructive",
                })
                return
            }

            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_active: !currentStatus }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "ステータス更新に失敗しました")
            }

            toast({
                title: "成功",
                description: `ユーザーが${!currentStatus ? "有効" : "無効"}になりました`,
            })

            // ユーザーリストを更新
            fetchUsers()
        } catch (error: any) {
            console.error("Status update error:", error)
            toast({
                title: "エラー",
                description: error.message || "ステータス更新に失敗しました",
                variant: "destructive",
            })
        }
    }

    // 日付フォーマット関数
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="relative flex items-center justify-center mb-6">
                <Button variant="ghost" asChild className="absolute left-0 flex items-center gap-2">
                    <Link href="/">
                        <ChevronLeft className="h-4 w-4" />
                        ホームに戻る
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">管理者ページ</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="register" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        ユーザー登録
                    </TabsTrigger>
                    <TabsTrigger value="manage" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        ユーザー管理
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="register">
                    <Card>
                        <CardHeader>
                            <CardTitle>新規ユーザー登録</CardTitle>
                            <CardDescription>システムに新しいユーザーを直接登録します</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleRegister}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">ユーザー名</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="ユーザー名を入力"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">メールアドレス</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="メールアドレスを入力"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">パスワード</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="パスワードを入力"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password">パスワード（確認）</Label>
                                    <Input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type="password"
                                        value={formData.confirm_password}
                                        onChange={handleInputChange}
                                        placeholder="パスワードを再入力"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">ロール</Label>
                                    <Select value={formData.role} onValueChange={handleRoleChange}>
                                        <SelectTrigger id="role">
                                            <SelectValue placeholder="ロールを選択" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">管理者</SelectItem>
                                            <SelectItem value="reader">閲覧者</SelectItem>
                                            <SelectItem value="researcher">研究者</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="ml-auto">
                                    登録する
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="manage">
                    <Card>
                        <CardHeader>
                            <CardTitle>ユーザー管理</CardTitle>
                            <CardDescription>登録されたユーザーの確認、編集、削除ができます</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-4">読み込み中...</div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-4">ユーザーが見つかりません</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>ユーザー名</TableHead>
                                                <TableHead>メールアドレス</TableHead>
                                                <TableHead>ロール</TableHead>
                                                <TableHead>ステータス</TableHead>
                                                <TableHead>登録日</TableHead>
                                                <TableHead>操作</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>{user.id}</TableCell>
                                                    <TableCell>{user.username}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        {user.role === "admin" ? "管理者" : user.role === "reader" ? "閲覧者" : "研究者"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs ${user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                                }`}
                                                        >
                                                            {user.is_active ? "有効" : "無効"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{formatDate(user.created_at)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                                            >
                                                                {user.is_active ? "無効化" : "有効化"}
                                                            </Button>
                                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(user)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-red-500"
                                                                onClick={() => openDeleteDialog(user.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* 編集ダイアログ */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ユーザー編集</DialogTitle>
                        <DialogDescription>ユーザー情報を編集します</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-username">ユーザー名</Label>
                            <Input
                                id="edit-username"
                                name="username"
                                value={editFormData.username}
                                onChange={handleEditInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-email">メールアドレス</Label>
                            <Input
                                id="edit-email"
                                name="email"
                                type="email"
                                value={editFormData.email}
                                onChange={handleEditInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-role">ロール</Label>
                            <Select value={editFormData.role} onValueChange={handleEditRoleChange}>
                                <SelectTrigger id="edit-role">
                                    <SelectValue placeholder="ロールを選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">管理者</SelectItem>
                                    <SelectItem value="reader">閲覧者</SelectItem>
                                    <SelectItem value="researcher">研究者</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-status">ステータス</Label>
                            <Select value={editFormData.is_active ? "true" : "false"} onValueChange={handleEditActiveChange}>
                                <SelectTrigger id="edit-status">
                                    <SelectValue placeholder="ステータスを選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">有効</SelectItem>
                                    <SelectItem value="false">無効</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            キャンセル
                        </Button>
                        <Button onClick={handleUpdateUser}>更新する</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 削除確認ダイアログ */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ユーザーを削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            この操作は元に戻せません。このユーザーに関連するすべてのデータが削除されます。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
                            削除する
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

