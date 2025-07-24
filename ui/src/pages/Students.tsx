import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import React from "react";
import { StoreItem } from "@/types";
import { storeApi } from "@/lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StudentsTable } from "./StudentsTable";
import { XpHistoryTable } from "./XpHistoryTable";
import { AddXpDialog } from "./AddXpDialog";
import { BulkXpDialog } from "./BulkXpDialog";
import { PurchaseDialog } from "./PurchaseDialog";

function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

const PAGE_SIZE = 20;

const COMMON_REASONS = ["attendance", "quiz", "good question", "assignment"];
const COMMON_XP_VALUES = [5, 10, 15, 20];

const Students = () => {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [addXpStudent, setAddXpStudent] = useState(
        null as null | { id: number; username: string }
    );
    const [xpPoints, setXpPoints] = useState("");
    const [xpReason, setXpReason] = useState("");
    const [addingXp, setAddingXp] = useState(false);
    const [xpReasonPopoverOpen, setXpReasonPopoverOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [multiXpDialogOpen, setMultiXpDialogOpen] = useState(false);
    const [multiXpPoints, setMultiXpPoints] = useState("");
    const [multiXpReason, setMultiXpReason] = useState("");
    const [multiXpLoading, setMultiXpLoading] = useState(false);
    const [multiXpReasonPopoverOpen, setMultiXpReasonPopoverOpen] = useState(false);
    const [tab, setTab] = useState("students");
    const [sortBy, setSortBy] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const queryClient = useQueryClient();
    // State for purchase dialog
    const [purchaseStudent, setPurchaseStudent] = useState<null | { id: number; username: string }>(
        null
    );
    const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
    const [purchaseError, setPurchaseError] = useState<string>("");
    // Fetch store items for the dialog
    const { data: storeItems = [], isLoading: isLoadingItems } = useQuery({
        queryKey: ["storeItems"],
        queryFn: async () => {
            const response = await storeApi.getStoreItems({ pageSize: 50 });
            return response.data.data?.items || [];
        },
    });
    // Purchase mutation
    const purchaseMutation = useMutation({
        mutationFn: async ({ studentId, itemId }: { studentId: number; itemId: number }) => {
            return storeApi.createTransaction(studentId, itemId);
        },
        onSuccess: () => {
            toast.success("Purchase successful!");
            setPurchaseStudent(null);
            setSelectedItem(null);
            setPurchaseError("");
            queryClient.invalidateQueries({ queryKey: ["students"] });
            queryClient.invalidateQueries({ queryKey: ["storeItems"] });
        },
        onError: (error: any) => {
            let msg = error?.response?.data?.error || "Failed to make purchase";
            if (typeof msg === "object") {
                msg = msg.message || JSON.stringify(msg);
            }
            setPurchaseError(msg);
            toast.error(msg);
        },
    });

    const { data, isLoading, isError, refetch } = useQuery<{
        items: any[];
        pagination: { currentPage: number; totalPages: number };
    }>({
        queryKey: ["students", page, debouncedSearch, sortBy, sortOrder],
        queryFn: async () => {
            const ordering = sortBy ? (sortOrder === "asc" ? sortBy : `-${sortBy}`) : undefined;
            const response = await studentApi.getStudentProfiles({
                page,
                pageSize: PAGE_SIZE,
                search: debouncedSearch,
                ordering,
            });
            return response.data.data;
        },
    });

    const [xpHistoryPage, setXpHistoryPage] = useState(1);
    const {
        data: xpHistoryResp,
        isLoading: isLoadingXpHistory,
        isError: isErrorXpHistory,
    } = useQuery({
        queryKey: ["xpHistory", xpHistoryPage],
        queryFn: async () => {
            const response = await studentApi.getXpHistory({
                page: xpHistoryPage,
                pageSize: PAGE_SIZE,
            });
            return response.data.data;
        },
    });
    const xpHistoryData = xpHistoryResp?.items || [];
    const xpHistoryPagination = xpHistoryResp?.pagination;

    if (user?.role !== "TEACHER") {
        return (
            <div className="text-center py-12">
                <Card className="max-w-lg mx-auto">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>Only teachers can view the students list.</CardContent>
                </Card>
            </div>
        );
    }

    return (
        <Tabs value={tab} onValueChange={setTab} className="space-y-8">
            <TabsList className="mb-4">
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="xp-history">XP History</TabsTrigger>
            </TabsList>
            <TabsContent value="students">
                <Card>
                    <CardContent className="p-4">
                        {/* Bulk XP Button */}
                        {selectedStudents.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2 items-center">
                                <span className="text-sm">{selectedStudents.length} selected</span>
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => setMultiXpDialogOpen(true)}
                                >
                                    Grant XP to Selected
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedStudents([])}
                                >
                                    Clear Selection
                                </Button>
                            </div>
                        )}
                        <StudentsTable
                            data={data}
                            page={page}
                            PAGE_SIZE={PAGE_SIZE}
                            selectedStudents={selectedStudents}
                            setSelectedStudents={setSelectedStudents}
                            setAddXpStudent={setAddXpStudent}
                            setPurchaseStudent={setPurchaseStudent}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSortChange={(col: string) => {
                                if (sortBy === col) {
                                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                } else {
                                    setSortBy(col);
                                    setSortOrder("asc");
                                }
                            }}
                        />
                        {/* Pagination */}
                        {data?.pagination && (
                            <div className="flex justify-between items-center mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span>
                                    Page {data.pagination.currentPage} of{" "}
                                    {data.pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                                    }
                                    disabled={page === data.pagination.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                        <AddXpDialog
                            open={!!addXpStudent}
                            onOpenChange={() => setAddXpStudent(null)}
                            student={addXpStudent}
                            xpPoints={xpPoints}
                            setXpPoints={setXpPoints}
                            xpReason={xpReason}
                            setXpReason={setXpReason}
                            addingXp={addingXp}
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!addXpStudent) return;
                                setAddingXp(true);
                                try {
                                    await studentApi.addXpToStudent(
                                        addXpStudent.id,
                                        Number(xpPoints),
                                        xpReason
                                    );
                                    toast.success("XP added!");
                                    setAddXpStudent(null);
                                    refetch();
                                    queryClient.invalidateQueries({ queryKey: ["xpHistory"] });
                                } catch (err) {
                                    toast.error("Failed to add XP");
                                } finally {
                                    setAddingXp(false);
                                }
                            }}
                            commonXpValues={COMMON_XP_VALUES}
                            commonReasons={COMMON_REASONS}
                            popoverOpen={xpReasonPopoverOpen}
                            setPopoverOpen={setXpReasonPopoverOpen}
                        />
                        <BulkXpDialog
                            open={multiXpDialogOpen}
                            onOpenChange={setMultiXpDialogOpen}
                            selectedCount={selectedStudents.length}
                            xpPoints={multiXpPoints}
                            setXpPoints={setMultiXpPoints}
                            xpReason={multiXpReason}
                            setXpReason={setMultiXpReason}
                            loading={multiXpLoading}
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setMultiXpLoading(true);
                                try {
                                    await Promise.all(
                                        selectedStudents.map((id) =>
                                            studentApi.addXpToStudent(
                                                id,
                                                Number(multiXpPoints),
                                                multiXpReason
                                            )
                                        )
                                    );
                                    toast.success("XP granted to selected students!");
                                    setMultiXpDialogOpen(false);
                                    setSelectedStudents([]);
                                    setMultiXpPoints("");
                                    setMultiXpReason("");
                                    refetch();
                                    queryClient.invalidateQueries({ queryKey: ["xpHistory"] });
                                } catch {
                                    toast.error("Failed to grant XP to all students");
                                } finally {
                                    setMultiXpLoading(false);
                                }
                            }}
                            commonXpValues={COMMON_XP_VALUES}
                            commonReasons={COMMON_REASONS}
                            popoverOpen={multiXpReasonPopoverOpen}
                            setPopoverOpen={setMultiXpReasonPopoverOpen}
                        />
                        <PurchaseDialog
                            open={!!purchaseStudent}
                            onOpenChange={() => setPurchaseStudent(null)}
                            student={purchaseStudent}
                            storeItems={storeItems}
                            isLoadingItems={isLoadingItems}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            purchaseError={purchaseError}
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!purchaseStudent || !selectedItem) return;
                                purchaseMutation.mutate({
                                    studentId: purchaseStudent.id,
                                    itemId: selectedItem.id,
                                });
                            }}
                            isPending={purchaseMutation.isPending}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="xp-history">
                <Card>
                    <CardContent className="p-4">
                        <XpHistoryTable
                            data={xpHistoryData}
                            loading={isLoadingXpHistory}
                            error={isErrorXpHistory}
                        />
                        {xpHistoryPagination && (
                            <div className="flex justify-between items-center mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setXpHistoryPage((p) => Math.max(1, p - 1))}
                                    disabled={xpHistoryPage === 1}
                                >
                                    Previous
                                </Button>
                                <span>
                                    Page {xpHistoryPagination.currentPage} of{" "}
                                    {xpHistoryPagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setXpHistoryPage((p) =>
                                            Math.min(xpHistoryPagination.totalPages, p + 1)
                                        )
                                    }
                                    disabled={xpHistoryPage === xpHistoryPagination.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};

export default Students;
