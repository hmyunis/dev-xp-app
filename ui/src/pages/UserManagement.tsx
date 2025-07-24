import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/apiClient";
import { User } from "@/types";
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
import { BulkCreateUsersDialog } from "./BulkCreateUsersDialog";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

const PAGE_SIZE = 20;

const UserManagement = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [showEdit, setShowEdit] = useState<User | null>(null);
    const [showDelete, setShowDelete] = useState<User | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

    const { data, isLoading, isError, refetch } = useQuery<{
        items: User[];
        pagination: { currentPage: number; totalPages: number };
    }>({
        queryKey: ["users", page, debouncedSearch],
        queryFn: async () => {
            const response = await userApi.getAllUsers({
                page,
                pageSize: PAGE_SIZE,
                search: debouncedSearch,
            });
            return response.data.data;
        },
    });

    const handleEdit = (user: User) => {
        setForm({ ...user, password: "" });
        setShowEdit(user);
    };
    const handleCreate = () => {
        setForm({
            username: "",
            fullName: "",
            email: "",
            phoneNumber: "",
            role: "STUDENT",
            password: "",
        });
        setShowCreate(true);
    };

    const handleFormChange = (e: any) => {
        setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const submitEdit = async (e: any) => {
        e.preventDefault();
        if (!showEdit) return;
        setSubmitting(true);
        try {
            await userApi.updateUser(showEdit.id, form);
            toast.success("User updated!");
            setShowEdit(null);
            refetch();
        } catch {
            toast.error("Failed to update user");
        } finally {
            setSubmitting(false);
        }
    };
    const submitCreate = async (e: any) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await userApi.createUser(form);
            toast.success("User created!");
            setShowCreate(false);
            refetch();
        } catch {
            toast.error("Failed to create user");
        } finally {
            setSubmitting(false);
        }
    };
    const submitDelete = async () => {
        if (!showDelete) return;
        setSubmitting(true);
        try {
            await userApi.deleteUser(showDelete.id);
            toast.success("User deleted!");
            setShowDelete(null);
            refetch();
        } catch {
            toast.error("Failed to delete user");
        } finally {
            setSubmitting(false);
        }
    };

    if (user?.role !== "TEACHER") {
        return (
            <div className="text-center py-12">
                <Card className="max-w-lg mx-auto">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>Only teachers can manage users.</CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Input
                    placeholder="Search by username, name, or email"
                    value={search}
                    onChange={(e) => {
                        setPage(1);
                        setSearch(e.target.value);
                    }}
                    className="w-64"
                />
                <Button
                    onClick={handleCreate}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl"
                >
                    + Create User
                </Button>
                <Button
                    onClick={() => setBulkDialogOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl"
                >
                    ✨ Bulk Create
                </Button>
                <BulkCreateUsersDialog
                    open={bulkDialogOpen}
                    onOpenChange={setBulkDialogOpen}
                    onComplete={refetch}
                />
            </div>
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8">
                            <LoadingSkeleton />
                        </div>
                    ) : isError ? (
                        <div className="p-8 text-center text-red-500">Failed to load users.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Date Joined</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.items?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.items?.map((u: User, idx: number) => (
                                        <TableRow
                                            key={u.id}
                                            className={u.role === "TEACHER" ? "bg-emerald-50" : ""}
                                        >
                                            <TableCell>
                                                {(page - 1) * PAGE_SIZE + idx + 1}
                                            </TableCell>
                                            <TableCell>{u.username}</TableCell>
                                            <TableCell>{u.fullName}</TableCell>
                                            <TableCell>{u.phoneNumber}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>{u.role}</TableCell>
                                            <TableCell>
                                                {new Date(u.dateJoined).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {u.lastLogin
                                                    ? new Date(u.lastLogin).toLocaleString()
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(u)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => setShowDelete(u)}
                                                    className="ml-2"
                                                >
                                                    Delete
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
            {/* Edit Dialog */}
            <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <Input
                            name="username"
                            value={form.username || ""}
                            onChange={handleFormChange}
                            placeholder="Username"
                            required
                        />
                        <Input
                            name="fullName"
                            value={form.fullName || ""}
                            onChange={handleFormChange}
                            placeholder="Full Name"
                            required
                        />
                        <Input
                            name="email"
                            value={form.email || ""}
                            onChange={handleFormChange}
                            placeholder="Email"
                            type="email"
                        />
                        <Input
                            name="phoneNumber"
                            value={form.phoneNumber || ""}
                            onChange={handleFormChange}
                            placeholder="Phone Number"
                        />
                        <select
                            name="role"
                            value={form.role || "STUDENT"}
                            onChange={handleFormChange}
                            className="w-full border rounded p-2"
                        >
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                        </select>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowEdit(null)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={() => setShowCreate(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <Input
                            name="username"
                            value={form.username || ""}
                            onChange={handleFormChange}
                            placeholder="Username"
                            required
                        />
                        <Input
                            name="fullName"
                            value={form.fullName || ""}
                            onChange={handleFormChange}
                            placeholder="Full Name"
                            required
                        />
                        <Input
                            name="email"
                            value={form.email || ""}
                            onChange={handleFormChange}
                            placeholder="Email"
                            type="email"
                        />
                        <Input
                            name="phoneNumber"
                            value={form.phoneNumber || ""}
                            onChange={handleFormChange}
                            placeholder="Phone Number"
                        />
                        <Select
                            value={form.role || "STUDENT"}
                            onValueChange={(val) => setForm((f) => ({ ...f, role: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STUDENT">Student</SelectItem>
                                <SelectItem value="TEACHER">Teacher</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            name="password"
                            value={form.password || ""}
                            onChange={handleFormChange}
                            placeholder="Password"
                            type="password"
                            required
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreate(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                    </DialogHeader>
                    <p>
                        Are you sure you want to delete <b>{showDelete?.username}</b>?
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDelete(null)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={submitDelete} disabled={submitting}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
