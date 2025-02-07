"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as Dialog from '@radix-ui/react-dialog';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleUpload = async () => {
    if (!file || fileType === null) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType.toString());

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.status) {
        toast({
          title: "成功",
          description: "ファイルが正常にアップロードされました",
        });
        router.push('/'); // Redirect to home after upload
      } else {
        toast({
          title: "エラー",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "ファイルのアップロードに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">ファイルアップロード</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />
      <input
        type="number"
        placeholder="ファイルタイプ (1, 2, 3)"
        onChange={(e) => setFileType(Number(e.target.value))}
        className="mb-4"
      />
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button onClick={handleUpload} disabled={isLoading}>
            {isLoading ? "アップロード中..." : "保存"}
          </Button>
        </Dialog.Trigger>
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
    </div>
  );
} 