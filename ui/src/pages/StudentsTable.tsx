import React from "react";
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
    return (
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
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data?.items?.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center">
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
    );
}
