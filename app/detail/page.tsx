"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { fetchWithAuth } from '@/app/utils/api';

type Document = {
    id: string;
    title: string;
    type: number;
    text: string[];
};

const DocumentDetail = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [document, setDocument] = useState<Document | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const documentId = searchParams.get('id');
    const { token } = useAuth();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        if (documentId) {
            fetchDocumentDetail(documentId);
        }
    }, [documentId, token, router]);

    const fetchDocumentDetail = async (id: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/doc-detail?id=${id}`);
        const data = await response.json();
        setDocument(data);
    };

    // Fix: Enforce valid page boundaries
    const handlePageChange = (page: number) => {
        if (document) {
            if (page >= 1 && page <= document.text.length) {
                setCurrentPage(page);
            }
        }
    };

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        setIsEditing(!isEditing);
    };

    const handleAllSave = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/doc-edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                text: document?.text,
                id: documentId,
            }),
        });
        const data = await response.json();
        if (data.status) {
            toast({
                title: "成功",
                description: data.message,
            })
            router.push('/');
        }
        console.log(data);
    }

    if (!document) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">ローディング中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="w-full p-10 flex flex-row h-full">
                {/* Left Section: PDF Viewer */}
                <div className="w-1/2 flex flex-col">
                    <object
                        data={`${API_BASE_URL}/storage/documents/${document.title}`}
                        type="application/pdf"
                        className="w-full h-full"
                    >
                        <p>
                            PDFプラグインがインストールされていません。
                            <a href={`${API_BASE_URL}/storage/documents/${document.title}`}>
                                PDFをダウンロード
                            </a>
                        </p>
                    </object>
                </div>

                {/* Right Section: Text Viewer/Editor */}
                <div className="w-1/2 flex flex-col">
                    <div className="overflow-y-auto h-full p-4 border-l">
                        {isEditing ? (
                            <textarea
                                value={document.text[currentPage - 1]}
                                onChange={(e) =>
                                    setDocument({
                                        ...document,
                                        text: document.text.map((page, index) =>
                                            index === currentPage - 1 ? e.target.value : page
                                        ),
                                    })
                                }
                                className="w-full h-full p-2 border"
                            />
                        ) : (
                            <div className="whitespace-pre-wrap">{document.text[currentPage - 1]}</div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-between mt-4 px-6">
                        <div className="flex items-center gap-4">
                            <Button
                                className="w-20"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                前へ
                            </Button>
                            <Input
                                className="w-20 text-center"
                                type="number"
                                value={currentPage}
                                onChange={(e) => {
                                    const newPage = Number(e.target.value);
                                    if (!isNaN(newPage)) {
                                        handlePageChange(newPage);
                                    }
                                }}
                                min={1}
                                max={document.text.length}
                            />
                            <Button
                                className="w-20"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= document.text.length}
                            >
                                次へ
                            </Button>
                        </div>

                        {/* Edit and Save Buttons */}
                        <div className="flex items-center gap-4">
                            {isEditing ? (
                                <Button onClick={handleSave} className="bg-green-500 text-white">
                                    保存
                                </Button>
                            ) : (
                                <Button onClick={handleEdit} className="bg-blue-500 text-white">
                                    編集
                                </Button>
                            )}
                            <Button onClick={handleAllSave} className="bg-blue-500 text-white">
                                全体保存
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentDetail;
