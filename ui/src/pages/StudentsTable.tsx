import React, { useRef, useState } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Trash2, Eye } from "lucide-react";
import { studentApi } from "@/lib/apiClient";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReportCardModal } from "@/components/ui/report-card-modal";

export function StudentsTable({
    data,
    page,
    PAGE_SIZE,
    selectedStudents,
    setSelectedStudents,
    setAddXpStudent,
    setPurchaseStudent,
    sortBy,
    sortOrder,
    onSortChange,
}) {
    const queryClient = useQueryClient();
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const [showReportCardModal, setShowReportCardModal] = useState(false);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<{
        id: number;
        name: string;
        reportCardUrl: string;
    } | null>(null);

    const uploadReportCardMutation = useMutation({
        mutationFn: ({ userId, file }: { userId: number; file: File }) =>
            studentApi.uploadReportCard(userId, file),
        onSuccess: () => {
            toast.success("Report card uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.error || "Failed to upload report card";
            toast.error(msg);
        },
    });

    const deleteReportCardMutation = useMutation({
        mutationFn: (userId: number) => studentApi.deleteReportCard(userId),
        onSuccess: () => {
            toast.success("Report card deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.error || "Failed to delete report card";
            toast.error(msg);
        },
    });

    const handleFileUpload = (userId: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            uploadReportCardMutation.mutate({ userId, file });
        }
    };

    const handleUploadClick = (userId: number) => {
        fileInputRefs.current[userId]?.click();
    };

    const handleViewReportCard = (profile: any) => {
        setSelectedStudentForReport({
            id: profile.user.id,
            name: profile.user.fullName,
            reportCardUrl: profile.reportCard,
        });
        setShowReportCardModal(true);
    };
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <Checkbox
                                checked={
                                    data?.items?.length > 0 &&
                                    selectedStudents.length === data.items.length
                                }
                                // Remove indeterminate for now, or implement with ref if needed
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedStudents(
                                            data.items.map((profile) => profile.user.id)
                                        );
                                    } else {
                                        setSelectedStudents([]);
                                    }
                                }}
                                aria-label="Select all students"
                            />
                        </TableHead>
                        <TableHead>#</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => onSortChange && onSortChange("user__full_name")}
                        >
                            Full Name
                            {sortBy === "user__full_name" && (
                                <span className="ml-1 align-middle">
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                            )}
                        </TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Total XP</TableHead>
                        <TableHead>Available XP</TableHead>
                        <TableHead>Report Card</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.items?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center">
                                No students found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data?.items?.map((profile, idx) => (
                            <TableRow key={profile.user.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedStudents.includes(profile.user.id)}
                                        onCheckedChange={(checked) => {
                                            setSelectedStudents((prev) =>
                                                checked
                                                    ? [...prev, profile.user.id]
                                                    : prev.filter((id) => id !== profile.user.id)
                                            );
                                        }}
                                        aria-label={`Select student ${profile.user.username}`}
                                    />
                                </TableCell>
                                <TableCell>{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                                <TableCell>{profile.user.username}</TableCell>
                                <TableCell>{profile.user.fullName}</TableCell>
                                <TableCell>{profile.user.email}</TableCell>
                                <TableCell>{profile.totalXp}</TableCell>
                                <TableCell>{profile.availableXp}</TableCell>
                                <TableCell>
                                    {profile.reportCard ? (
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-green-600">Uploaded</span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewReportCard(profile)}
                                            >
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    deleteReportCardMutation.mutate(profile.user.id)
                                                }
                                                disabled={deleteReportCardMutation.isPending}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">No file</span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUploadClick(profile.user.id)}
                                                disabled={uploadReportCardMutation.isPending}
                                            >
                                                <Upload className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    <input
                                        ref={(el) => (fileInputRefs.current[profile.user.id] = el)}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(profile.user.id, e)}
                                        className="hidden"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            setAddXpStudent({
                                                id: profile.user.id,
                                                username: profile.user.username,
                                            })
                                        }
                                    >
                                        Add XP
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="ml-2"
                                        onClick={() =>
                                            setPurchaseStudent({
                                                id: profile.user.id,
                                                username: profile.user.username,
                                            })
                                        }
                                    >
                                        Purchase
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {selectedStudentForReport && (
                <ReportCardModal
                    isOpen={showReportCardModal}
                    onClose={() => {
                        setShowReportCardModal(false);
                        setSelectedStudentForReport(null);
                    }}
                    reportCardUrl={selectedStudentForReport.reportCardUrl}
                    studentName={selectedStudentForReport.name}
                />
            )}
        </>
    );
}
