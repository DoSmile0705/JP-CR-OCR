"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from '@/app/contexts/AuthContext';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { token } = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!token) {
      router.push('/auth/signin');
    }
  }, [token, router]);

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "エラー",
        description: "ファイルを選択してください",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "search");
    console.log(formData);
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();

      if (result.status) {
        toast({
          title: "成功",
          description: "ファイルが正常にアップロードされました",
        });
        router.push("/"); // Redirect to home after upload
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "ファイルのアップロードに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">ファイルアップロード</h2>
      <div className="flex gap-4 flex-col">
        <Label>文献資料（PDFもしくは画像）をアップロードしてください。</Label>
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="mb-4"
        />

        <div className="flex justify-center">
          <Button onClick={handleUpload} disabled={isLoading} className="w-20">
            {isLoading ? "アップロード中..." : "保存"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <Dialog.Root open={isLoading}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg">
              <Dialog.Title>アップロード中</Dialog.Title>
              <Dialog.Description>
                ファイルをアップロード中です...
              </Dialog.Description>
              <div className="flex justify-center mt-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}
