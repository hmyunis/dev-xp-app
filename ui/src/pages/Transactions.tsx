import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { storeApi } from "@/lib/apiClient";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PaginatedResponse, Transaction } from "@/types";

function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

const PAGE_SIZE = 20;

const Transactions = () => {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const { data, isLoading, isError } = useQuery<PaginatedResponse<Transaction>>({
        queryKey: ["transactions", page, debouncedSearch, dateFrom, dateTo],
        queryFn: async () => {
            const params: any = { page, pageSize: PAGE_SIZE };
            if (debouncedSearch) params.search = debouncedSearch;
            if (dateFrom) params.timestamp__gte = dateFrom;
            if (dateTo) params.timestamp__lte = dateTo;
            const response = await storeApi.getTransactions(params);
            return response.data.data;
        },
    });

    if (user?.role !== "TEACHER") {
        return (
            <div className="text-center py-12">
                <Card className="max-w-lg mx-auto">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>Only teachers can view transactions.</CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold">Transactions</h1>
                <Input
                    placeholder="Search transactions"
                    value={search}
                    onChange={(e) => {
                        setPage(1);
                        setSearch(e.target.value);
                    }}
                    className="w-64"
                />
                <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                        setPage(1);
                        setDateFrom(e.target.value);
                    }}
                    className="w-36"
                />
                <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                        setPage(1);
                        setDateTo(e.target.value);
                    }}
                    className="w-36"
                />
            </div>
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8">
                            <LoadingSkeleton />
                        </div>
                    ) : isError ? (
                        <div className="p-8 text-center text-red-500">
                            Failed to load transactions.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>XP Cost</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.items?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.items?.map((t: any) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{t.student?.username || "-"}</TableCell>
                                            <TableCell>{t.item?.name || "-"}</TableCell>
                                            <TableCell>{t.xpCostAtPurchase}</TableCell>
                                            <TableCell>
                                                {new Date(t.timestamp).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            {/* Pagination */}
            {data && (
                <div className="flex justify-between items-center mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span>
                        Page {data.pagination.currentPage} of {data.pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={page === data.pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Transactions;
