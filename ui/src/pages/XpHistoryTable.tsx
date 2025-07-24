import React from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export function XpHistoryTable({ data, loading, error }) {
    if (loading)
        return (
            <Card className="my-8">
                <CardContent className="p-8 text-center">Loading...</CardContent>
            </Card>
        );
    if (error)
        return (
            <Card className="my-8">
                <CardContent className="p-8 text-center text-red-500">
                    Failed to load XP history.
                </CardContent>
            </Card>
        );
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Teacher</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data?.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center">
                            No XP history found.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((entry, idx) => (
                        <TableRow key={entry.id}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                                {entry.student?.username || entry.student?.fullName || "-"}
                            </TableCell>
                            <TableCell>{entry.amount}</TableCell>
                            <TableCell>{entry.reason}</TableCell>
                            <TableCell>{new Date(entry.date).toLocaleString()}</TableCell>
                            <TableCell>
                                {entry.teacher?.username || entry.teacher?.fullName || "-"}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
