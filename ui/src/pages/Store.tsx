import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, ShoppingCart, Star, Sparkles } from "lucide-react";
import { storeApi } from "@/lib/apiClient";
import { StoreItem } from "@/types";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Store = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const purchaseMutation = useMutation({
        mutationFn: async (item: StoreItem) => {
            if (!user) throw new Error("Not logged in");
            return storeApi.createTransaction(user.id, item.id);
        },
        onSuccess: () => {
            toast.success("🎉 Item purchased and added to your inventory!");
            queryClient.invalidateQueries({ queryKey: ["storeItems"] });
        },
        onError: (error: any) => {
            let msg = error?.response?.data?.error || "Failed to purchase item";
            if (typeof msg === "object") {
                msg = msg.message || JSON.stringify(msg);
            }
            toast.error(msg);
        },
    });

    // Query: fetch store items
    const { data: items = [], isLoading } = useQuery({
        queryKey: ["storeItems"],
        queryFn: async () => {
            const response = await storeApi.getStoreItems({ pageSize: 50 });
            return response.data.data?.items || [];
        },
    });

    // CRUD state
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState<StoreItem | null>(null);
    const [showDelete, setShowDelete] = useState<StoreItem | null>(null);

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("xp_cost", data.xpCost);
            formData.append("stock_quantity", data.stockQuantity);
            formData.append("is_active", data.isActive);
            if (data.imageFile && data.imageFile[0]) {
                formData.append("image", data.imageFile[0]);
            }
            await storeApi.createStoreItem(formData);
        },
        onSuccess: () => {
            toast.success("Item created!");
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ["storeItems"] });
        },
        onError: () => toast.error("Failed to create item"),
    });
    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            if (!showEdit) return;
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("xp_cost", data.xpCost);
            formData.append("stock_quantity", data.stockQuantity);
            formData.append("is_active", data.isActive);
            if (data.imageFile && data.imageFile[0]) {
                formData.append("image", data.imageFile[0]);
            }
            await storeApi.updateStoreItem(showEdit.id, formData);
        },
        onSuccess: () => {
            toast.success("Item updated!");
            setShowEdit(null);
            queryClient.invalidateQueries({ queryKey: ["storeItems"] });
        },
        onError: () => toast.error("Failed to update item"),
    });
    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!showDelete) return;
            await storeApi.deleteStoreItem(showDelete.id);
        },
        onSuccess: () => {
            toast.success("Item deleted!");
            setShowDelete(null);
            queryClient.invalidateQueries({ queryKey: ["storeItems"] });
        },
        onError: () => toast.error("Failed to delete item"),
    });

    const handleCreate = (data: any) => createMutation.mutate(data);
    const handleEdit = (data: any) => updateMutation.mutate(data);
    const handleDelete = () => deleteMutation.mutate();

    // Move handlePurchase above the return statement
    const handlePurchase = (item: StoreItem) => {
        purchaseMutation.mutate(item);
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">🛍️ XP Store</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <motion.div variants={itemVariants} className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    🛍️ XP Store
                </h1>
                <p className="text-xl text-gray-600">
                    Spend your hard-earned XP on amazing rewards!
                </p>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-0 shadow-2xl">
                    <CardHeader className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
                            className="mx-auto mb-4"
                        >
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles className="h-8 w-8" />
                            </div>
                        </motion.div>
                        <CardTitle className="text-2xl font-bold">
                            Exclusive Dev Rewards Await! 🌟
                        </CardTitle>
                        <p className="text-lg text-white/90 mt-2">
                            From stickers to gadgets, turn your XP into awesome prizes!
                        </p>
                    </CardHeader>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Card className="h-full bg-gradient-to-br from-white to-gray-50 border-2 border-purple-200 hover:border-purple-400 transition-all shadow-lg hover:shadow-xl">
                                <CardHeader className="pb-4">
                                    <div className="w-full h-48 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 rounded-lg flex items-center justify-center mb-4">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="h-32 object-contain rounded"
                                            />
                                        ) : (
                                            <Gift className="h-16 w-16 text-purple-600" />
                                        )}
                                    </div>
                                    <CardTitle className="text-xl font-bold text-gray-800 text-center">
                                        {item.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gray-600 text-center min-h-[3rem]">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg px-3 py-1">
                                            {item.xpCost} XP
                                        </Badge>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Star className="h-4 w-4" />
                                            {item.stockQuantity} left
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handlePurchase(item)}
                                        disabled={
                                            item.stockQuantity === 0 ||
                                            (purchaseMutation.isPending &&
                                                purchaseMutation.variables?.id === item.id)
                                        }
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        {purchaseMutation.isPending &&
                                        purchaseMutation.variables?.id === item.id
                                            ? "Purchasing..."
                                            : item.stockQuantity === 0
                                            ? "Out of Stock"
                                            : "Purchase"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {items.length === 0 && (
                <motion.div variants={itemVariants}>
                    <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-200">
                        <CardContent className="text-center py-12">
                            <Gift className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-yellow-800 mb-2">
                                Store Coming Soon!
                            </h3>
                            <p className="text-lg text-yellow-700">
                                Amazing rewards are being prepared for you. Check back soon! 🎁
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {user?.role === "TEACHER" && (
                <div className="flex justify-end mb-4">
                    <Button
                        onClick={() => setShowCreate(true)}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl"
                    >
                        + Add Item
                    </Button>
                </div>
            )}

            {user?.role === "TEACHER" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Card className="h-full bg-gradient-to-br from-white to-gray-50 border-2 border-purple-200 hover:border-purple-400 transition-all shadow-lg hover:shadow-xl">
                                <CardHeader className="pb-4">
                                    <div className="w-full h-48 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 rounded-lg flex items-center justify-center mb-4">
                                        <Gift className="h-16 w-16 text-purple-600" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-gray-800 text-center">
                                        {item.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gray-600 text-center min-h-[3rem]">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg px-3 py-1">
                                            {item.xpCost} XP
                                        </Badge>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Star className="h-4 w-4" />
                                            {item.stockQuantity} left
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowEdit(item)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => setShowDelete(item)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {user?.role === "TEACHER" && (
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Store Item</DialogTitle>
                        </DialogHeader>
                        <StoreItemForm
                            onSubmit={handleCreate}
                            submitting={createMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            )}
            <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Store Item</DialogTitle>
                    </DialogHeader>
                    <StoreItemForm
                        initial={showEdit}
                        onSubmit={handleEdit}
                        submitting={updateMutation.isPending}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Store Item</DialogTitle>
                    </DialogHeader>
                    <p>
                        Are you sure you want to delete <b>{showDelete?.name}</b>?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDelete(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default Store;

function StoreItemForm({
    initial,
    onSubmit,
    submitting,
}: {
    initial?: StoreItem | null;
    onSubmit: (data: any) => void;
    submitting: boolean;
}) {
    const { register, handleSubmit, reset } = useForm({
        defaultValues: initial
            ? {
                  name: initial.name,
                  description: initial.description,
                  xpCost: initial.xpCost,
                  stockQuantity: initial.stockQuantity,
                  isActive: initial.isActive,
                  imageFile: undefined,
              }
            : {},
    });
    useEffect(() => {
        reset(
            initial
                ? {
                      name: initial.name,
                      description: initial.description,
                      xpCost: initial.xpCost,
                      stockQuantity: initial.stockQuantity,
                      isActive: initial.isActive,
                      imageFile: undefined,
                  }
                : {}
        );
    }, [initial, reset]);
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label>Name</Label>
                <Input {...register("name", { required: true })} />
            </div>
            <div>
                <Label>Description</Label>
                <Textarea {...register("description", { required: true })} />
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <Label>XP Cost</Label>
                    <Input type="number" {...register("xpCost", { required: true })} />
                </div>
                <div className="flex-1">
                    <Label>Stock</Label>
                    <Input type="number" {...register("stockQuantity", { required: true })} />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Switch {...register("isActive")} defaultChecked={!!initial?.isActive} />
                <Label>Active</Label>
            </div>
            <div>
                <Label>Image</Label>
                <Input type="file" accept="image/*" {...register("imageFile")} />
            </div>
            <DialogFooter>
                <Button type="submit" disabled={submitting}>
                    {initial ? "Update" : "Create"}
                </Button>
            </DialogFooter>
        </form>
    );
}
