import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/lib/apiClient";
import { StoreItem } from "@/types";
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
import { Gift } from "lucide-react";

function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

const PAGE_SIZE = 20;

const StoreManagement = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [showEdit, setShowEdit] = useState<StoreItem | null>(null);
    const [showDelete, setShowDelete] = useState<StoreItem | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["storeItems", page, debouncedSearch],
        queryFn: async () => {
            const response = await storeApi.getStoreItems({
                page,
                pageSize: PAGE_SIZE,
                search: debouncedSearch,
            });
            return response.data.data;
        },
        keepPreviousData: true,
    });

    const handleEdit = (item: StoreItem) => {
        setForm({ ...item, imageFile: undefined });
        setShowEdit(item);
    };
    const handleCreate = () => {
        setForm({
            name: "",
            description: "",
            xpCost: "",
            stockQuantity: "",
            isActive: true,
            imageFile: undefined,
        });
        setShowCreate(true);
    };

    const handleFormChange = (e: any) => {
        const { name, value, type, checked, files } = e.target;
        setForm((f: any) => ({
            ...f,
            [name]: type === "checkbox" ? checked : type === "file" ? files : value,
        }));
    };

    const submitEdit = async (e: any) => {
        e.preventDefault();
        if (!showEdit) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("description", form.description);
            formData.append("xp_cost", form.xpCost);
            formData.append("stock_quantity", form.stockQuantity);
            formData.append("is_active", form.isActive);
            if (form.imageFile && form.imageFile[0]) {
                formData.append("image", form.imageFile[0]);
            }
            await storeApi.updateStoreItem(showEdit.id, formData);
            toast.success("Item updated!");
            setShowEdit(null);
            refetch();
        } catch {
            toast.error("Failed to update item");
        } finally {
            setSubmitting(false);
        }
    };
    const submitCreate = async (e: any) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("description", form.description);
            formData.append("xp_cost", form.xpCost);
            formData.append("stock_quantity", form.stockQuantity);
            formData.append("is_active", form.isActive);
            if (form.imageFile && form.imageFile[0]) {
                formData.append("image", form.imageFile[0]);
            }
            await storeApi.createStoreItem(formData);
            toast.success("Item created!");
            setShowCreate(false);
            refetch();
        } catch {
            toast.error("Failed to create item");
        } finally {
            setSubmitting(false);
        }
    };
    const submitDelete = async () => {
        if (!showDelete) return;
        setSubmitting(true);
        try {
            await storeApi.deleteStoreItem(showDelete.id);
            toast.success("Item deleted!");
            setShowDelete(null);
            refetch();
        } catch {
            toast.error("Failed to delete item");
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
                    <CardContent>Only teachers can manage store items.</CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold">Store Management</h1>
                <Input
                    placeholder="Search by name or description"
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
                    + Create Item
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8">
                            <LoadingSkeleton />
                        </div>
                    ) : isError ? (
                        <div className="p-8 text-center text-red-500">Failed to load items.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>XP Cost</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.items?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            No items found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.items?.map((item: StoreItem) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 rounded">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="h-16 object-contain rounded"
                                                        />
                                                    ) : (
                                                        <Gift className="h-8 w-8 text-purple-600" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.xpCost}</TableCell>
                                            <TableCell>{item.stockQuantity}</TableCell>
                                            <TableCell>{item.isActive ? "Yes" : "No"}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => setShowDelete(item)}
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
                        <DialogTitle>Edit Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <Input
                            name="name"
                            value={form.name || ""}
                            onChange={handleFormChange}
                            placeholder="Name"
                            required
                        />
                        <Input
                            name="description"
                            value={form.description || ""}
                            onChange={handleFormChange}
                            placeholder="Description"
                            required
                        />
                        <Input
                            name="xpCost"
                            value={form.xpCost || ""}
                            onChange={handleFormChange}
                            placeholder="XP Cost"
                            type="number"
                            required
                        />
                        <Input
                            name="stockQuantity"
                            value={form.stockQuantity || ""}
                            onChange={handleFormChange}
                            placeholder="Stock"
                            type="number"
                            required
                        />
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={!!form.isActive}
                                onChange={handleFormChange}
                            />{" "}
                            Active
                        </label>
                        <Input
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFormChange}
                        />
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
                        <DialogTitle>Create Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <Input
                            name="name"
                            value={form.name || ""}
                            onChange={handleFormChange}
                            placeholder="Name"
                            required
                        />
                        <Input
                            name="description"
                            value={form.description || ""}
                            onChange={handleFormChange}
                            placeholder="Description"
                            required
                        />
                        <Input
                            name="xpCost"
                            value={form.xpCost || ""}
                            onChange={handleFormChange}
                            placeholder="XP Cost"
                            type="number"
                            required
                        />
                        <Input
                            name="stockQuantity"
                            value={form.stockQuantity || ""}
                            onChange={handleFormChange}
                            placeholder="Stock"
                            type="number"
                            required
                        />
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={!!form.isActive}
                                onChange={handleFormChange}
                            />{" "}
                            Active
                        </label>
                        <Input
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFormChange}
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
                        <DialogTitle>Delete Item</DialogTitle>
                    </DialogHeader>
                    <p>
                        Are you sure you want to delete <b>{showDelete?.name}</b>?
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

export default StoreManagement;
