import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";

export function AddXpDialog({
    open,
    onOpenChange,
    student,
    xpPoints,
    setXpPoints,
    xpReason,
    setXpReason,
    addingXp,
    onSubmit,
    commonXpValues,
    commonReasons,
    popoverOpen,
    setPopoverOpen,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add XP to {student?.username}</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">XP Points</label>
                        <div className="flex flex-wrap gap-2 items-center">
                            <Input
                                type="number"
                                min={1}
                                value={xpPoints}
                                onChange={(e) => setXpPoints(e.target.value)}
                                required
                                className="w-24"
                            />
                            <div className="flex gap-1 flex-wrap">
                                {commonXpValues.map((val) => (
                                    <Button
                                        key={val}
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="px-2 py-1 text-xs"
                                        onClick={() => setXpPoints(val.toString())}
                                    >
                                        +{val}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Reason</label>
                        <Popover open={!!popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Input
                                    value={xpReason}
                                    onChange={(e) => {
                                        setXpReason(e.target.value);
                                        setPopoverOpen(true);
                                    }}
                                    placeholder="Type or pick a reason..."
                                    className="w-full pr-10"
                                    autoComplete="off"
                                    onFocus={() => setPopoverOpen(true)}
                                    required
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput
                                        value={xpReason}
                                        onValueChange={setXpReason}
                                        placeholder="Search or pick a reason..."
                                    />
                                    <CommandList>
                                        <CommandEmpty>No reason found.</CommandEmpty>
                                        <CommandGroup heading="Common Reasons">
                                            {commonReasons
                                                .filter(
                                                    (r) =>
                                                        !xpReason ||
                                                        r
                                                            .toLowerCase()
                                                            .includes(xpReason.toLowerCase())
                                                )
                                                .map((reason) => (
                                                    <CommandItem
                                                        key={reason}
                                                        value={reason}
                                                        onSelect={() => {
                                                            setXpReason(reason);
                                                            setPopoverOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={
                                                                xpReason === reason
                                                                    ? "mr-2 opacity-100"
                                                                    : "mr-2 opacity-0"
                                                            }
                                                        />
                                                        {reason}
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
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
    );
}
