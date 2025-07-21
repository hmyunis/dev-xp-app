import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/apiClient";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import React from "react";

function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

const PAGE_SIZE = 20;

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

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["students", page, debouncedSearch],
        queryFn: async () => {
            const response = await studentApi.getStudentProfiles({
                page,
                pageSize: PAGE_SIZE,
                search: debouncedSearch,
            });
            return response.data.data;
        },
        keepPreviousData: true,
    });

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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold">Students</h1>
                <Input
                    placeholder="Search by username, name, or email"
                    value={search}
                    onChange={(e) => {
                        setPage(1);
                        setSearch(e.target.value);
                    }}
                    className="w-64"
                />
            </div>
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8">
                            <LoadingSkeleton />
                        </div>
                    ) : isError ? (
                        <div className="p-8 text-center text-red-500">Failed to load students.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Total XP</TableHead>
                                    <TableHead>Available XP</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.items?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.items?.map((profile) => (
                                        <TableRow key={profile.user.id}>
                                            <TableCell>{profile.user.username}</TableCell>
                                            <TableCell>{profile.user.fullName}</TableCell>
                                            <TableCell>{profile.user.email}</TableCell>
                                            <TableCell>{profile.totalXp}</TableCell>
                                            <TableCell>{profile.availableXp}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setAddXpStudent({
                                                            id: profile.user.id,
                                                            username: profile.user.username,
                                                        });
                                                        setXpPoints("");
                                                        setXpReason("");
                                                    }}
                                                >
                                                    Add XP
                                                </Button>
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
            <Dialog open={!!addXpStudent} onOpenChange={() => setAddXpStudent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add XP to {addXpStudent?.username}</DialogTitle>
                    </DialogHeader>
                    <form
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
                            } catch (err) {
                                toast.error("Failed to add XP");
                            } finally {
                                setAddingXp(false);
                            }
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block font-medium mb-1">XP Points</label>
                            <Input
                                type="number"
                                min={1}
                                value={xpPoints}
                                onChange={(e) => setXpPoints(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Reason</label>
                            <Input
                                value={xpReason}
                                onChange={(e) => setXpReason(e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddXpStudent(null)}
                                disabled={addingXp}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addingXp || !xpPoints || !xpReason}>
                                Add XP
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Students;
