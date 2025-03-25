"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Link from 'next/link'
import { Search, Upload, User, Moon, Sun, Laptop, LogOut, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const { setTheme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, token, logout } = useAuth()

  // Reset search when auth state changes
  useEffect(() => {
    setSearchQuery('')
  }, [token])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleUserManagement = () => {
    router.push('/admin')
  }

  const handleSignOut = () => {
    logout()
    router.push('/auth/signin')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-[#B3424A] backdrop-blur">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            {/* <Search className="h-6 w-6" /> */}
            <span className="hidden font-bold sm:inline-block text-gray-100">
              中国戯曲日本語注釈データベース
            </span>
          </a>
        </div>

        <div className="flex flex-1 items-center space-x-2">
          <form onSubmit={handleSearch} className="w-full max-w-xl flex flex-row gap-5">
            <div className="relative w-full">
              {/* <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /> */}
              <Input
                placeholder="文献を検索..."
                className="pl-2 pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div>
              <Button
                type="submit"
                className="bg-blue-300 hover:bg-blue-600 text-white"
                variant="default"
              >
                <Search className="left-2 top-2.5 h-4 w-4 text-white" />
              </Button>
            </div>
          </form>
          {/* {token && user?.role === 'researcher' && (
            <>
              <Button className=" bg-[#FFFFFF99] hover:bg-[#FFFFFFCC] text-gray-800" variant="default" onClick={() => router.push('/upload')}>
                <Upload className="mr-2 h-4 w-4" />
                文献登録
              </Button>
            </>
          )} */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">テーマ切替</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                ライト
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                ダーク
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="mr-2 h-4 w-4" />
                システム
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>

        {token ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 text-gray-100 cursor-pointer">
                {/* <Button variant="ghost" size="icon"> */}
                <User className="h-5 w-5 text-gray-100" />

                {/* </Button> */}
                {user?.username || 'マイアカウント'}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.username || 'マイアカウント'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>プロフィール</DropdownMenuItem>
              <DropdownMenuItem>投稿履歴</DropdownMenuItem>
              <DropdownMenuItem>ブックマーク</DropdownMenuItem>
              */}
              {user?.role == 'admin' ?
                <DropdownMenuItem onClick={handleUserManagement}>
                  ユーザー管理</DropdownMenuItem> :
                <></>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Button className="bg-transparent border-none hover:bg-transparent text-gray-100 hover:text-gray-300" variant="outline" onClick={() => router.push('/auth/signin')}>
              ログイン
            </Button>
            <div className="border-l border-gray-300 h-6 self-center" /> {/* Vertical Separator */}
            <Button className="bg-transparent border-none hover:bg-transparent text-gray-100 hover:text-gray-300" variant="outline" onClick={() => router.push('/auth/register')}>
              新規登録
            </Button>
          </div>
        )}


      </div>
      {/* Navigation Menu */}
      <div className="container px-4 pb-2">
        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className="text-gray-100 hover:text-gray-300">
                  本ページについて
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <div className="border-l border-gray-300 h-6 self-center" /> {/* Vertical Separator */}

            <NavigationMenuItem>
              <Link href="/news" legacyBehavior passHref>
                <NavigationMenuLink className="text-gray-100 hover:text-gray-300">
                  お知らせ
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <div className="border-l border-gray-300 h-6 self-center" /> {/* Vertical Separator */}
            <NavigationMenuItem>
              <Link href="/search" legacyBehavior passHref>
                <NavigationMenuLink className="text-gray-100 hover:text-gray-300">
                  資料検索
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <div className="border-l border-gray-300 h-6 self-center" /> {/* Vertical Separator */}

            <NavigationMenuItem>
              <Link href="/documents" legacyBehavior passHref>
                <NavigationMenuLink className="text-gray-100 hover:text-gray-300">
                  報告書、資料等
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <div className="border-l border-gray-300 h-6 self-center" /> {/* Vertical Separator */}
            {token && (user?.role === 'researcher' || user?.role === 'admin') && (
              <>
                <NavigationMenuItem>
                  <Link href="/upload" legacyBehavior passHref>
                    <NavigationMenuLink className="text-gray-100 hover:text-gray-300">
                      文献登録・編集
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                < div className="border-l border-gray-300 h-6 self-center" /> {/* Vertical Separator */}
              </>
            )
            }
            <NavigationMenuItem>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink className="text-gray-100 hover:text-gray-300">
                  お問い合わせ
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  )
}