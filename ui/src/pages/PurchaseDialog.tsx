import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { StoreItem } from "@/types";

export function PurchaseDialog({
    open,
    onOpenChange,
    student,
    storeItems,
    isLoadingItems,
    selectedItem,
    setSelectedItem,
    purchaseError,
    onSubmit,
    isPending,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Purchase for {student?.username}</DialogTitle>
                </DialogHeader>
                {isLoadingItems ? (
                    <div className="p-4">Loading store items...</div>
                ) : storeItems.length === 0 ? (
                    <div className="p-4 text-gray-500">No store items available.</div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Select Item</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        {selectedItem
                                            ? `${selectedItem.name} (${selectedItem.xpCost} XP)`
                                            : "Select an item..."}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                                    <DropdownMenuLabel>Store Items</DropdownMenuLabel>
                                    {storeItems.map((item: StoreItem) => (
                                        <DropdownMenuItem
                                            key={item.id}
                                            onSelect={() => setSelectedItem(item)}
                                            disabled={item.stockQuantity === 0}
                                        >
                                            {item.name} ({item.xpCost} XP)
                                            {item.stockQuantity === 0 ? " - Out of stock" : ""}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {purchaseError && (
                            <div className="text-red-500 text-sm">{purchaseError}</div>
                        )}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending || !selectedItem}>
                                {isPending ? "Purchasing..." : "Purchase"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
