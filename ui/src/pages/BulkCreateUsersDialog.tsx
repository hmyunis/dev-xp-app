import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { userApi } from "@/lib/apiClient";

function generateUniqueUsernames(users) {
    const seen = new Map();
    return users.map((u) => {
        let base = (u.firstName || u.fullName?.split(" ")[0] || "student").toLowerCase();
        let username = base;
        while (seen.has(username)) {
            username = base + Math.floor(1000 + Math.random() * 9000);
        }
        seen.set(username, true);
        return { ...u, username };
    });
}

export function BulkCreateUsersDialog({ open, onOpenChange, onComplete }) {
    const [step, setStep] = useState(1);
    const [jsonInput, setJsonInput] = useState("");
    const [parseError, setParseError] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [creating, setCreating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<{ username: string; status: string; error?: string }[]>(
        []
    );

    const reset = () => {
        setStep(1);
        setJsonInput("");
        setParseError("");
        setUsers([]);
        setCreating(false);
        setProgress(0);
        setResults([]);
    };

    const handleParse = () => {
        setParseError("");
        try {
            const arr = JSON.parse(jsonInput);
            if (!Array.isArray(arr)) throw new Error("JSON must be an array of users");
            // Validate fields
            for (const u of arr) {
                if (!u.fullName && !u.firstName)
                    throw new Error("Each user must have fullName or firstName");
            }
            // Generate usernames and preset role
            const withUsernames = generateUniqueUsernames(arr).map((u) => {
                const username = u.username;
                return {
                    ...u,
                    role: "STUDENT",
                    password: username + "123",
                };
            });
            setUsers(withUsernames);
            setStep(2);
        } catch (err: any) {
            setParseError(err.message || "Invalid JSON");
        }
    };

    const handleCreate = async () => {
        setCreating(true);
        setProgress(0);
        setResults([]);
        let done = 0;
        const total = users.length;
        const newResults: { username: string; status: string; error?: string }[] = [];
        for (const user of users) {
            try {
                await userApi.createUser(user);
                newResults.push({ username: user.username, status: "success" });
            } catch (err: any) {
                let errorMsg = "Failed";
                const apiError = err?.response?.data?.error;
                if (apiError) {
                    if (typeof apiError === "string") {
                        errorMsg = apiError;
                    } else if (typeof apiError === "object") {
                        errorMsg = apiError.message || "";
                        if (apiError.details) {
                            if (typeof apiError.details === "object") {
                                errorMsg +=
                                    ": " +
                                    Object.entries(apiError.details)
                                        .map(
                                            ([field, msgs]) =>
                                                `${field}: ${
                                                    Array.isArray(msgs) ? msgs.join(", ") : msgs
                                                }`
                                        )
                                        .join("; ");
                            } else {
                                errorMsg += ": " + String(apiError.details);
                            }
                        }
                    }
                }
                newResults.push({
                    username: user.username,
                    status: "error",
                    error: errorMsg,
                });
            }
            done++;
            setProgress(Math.round((done / total) * 100));
            setResults([...newResults]);
        }
        setCreating(false);
        toast.success("Bulk user creation complete");
        if (onComplete) onComplete();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    onOpenChange(false);
                    reset();
                }
            }}
            modal={true}
        >
            <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Bulk Create Students</DialogTitle>
                </DialogHeader>
                <div className="mb-4">
                    <Progress value={step === 1 ? 0 : step === 2 ? 50 : 100} className="h-2" />
                    <div className="flex justify-between text-xs mt-1">
                        <span className={step === 1 ? "font-bold" : "text-muted-foreground"}>
                            Paste JSON
                        </span>
                        <span className={step === 2 ? "font-bold" : "text-muted-foreground"}>
                            Preview
                        </span>
                        <span className={step === 3 ? "font-bold" : "text-muted-foreground"}>
                            Create
                        </span>
                    </div>
                </div>
                {step === 1 && (
                    <div className="space-y-4">
                        <label className="block font-medium mb-1">
                            Paste JSON array of students
                        </label>
                        <textarea
                            className="w-full min-h-[120px] border rounded p-2 font-mono text-sm"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder={`[
  { "fullName": "Alice Smith", "phoneNumber": "5551112222" },
  { "fullName": "Bob Brown", "phoneNumber": "5552223333" }
]`}
                        />
                        {parseError && <div className="text-red-500 text-sm">{parseError}</div>}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false);
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleParse} disabled={!jsonInput.trim()}>
                                Next
                            </Button>
                        </DialogFooter>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="p-0">
                                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Username</TableHead>
                                                <TableHead>Full Name</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Role</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((u, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{u.username}</TableCell>
                                                    <TableCell>{u.fullName}</TableCell>
                                                    <TableCell>
                                                        {u.phoneNumber || (
                                                            <span className="text-muted-foreground italic">
                                                                (none)
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{u.role}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep(1)}>
                                Back
                            </Button>
                            <Button onClick={() => setStep(3)}>Create Students</Button>
                        </DialogFooter>
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="mb-2">Creating students...</div>
                        <Progress value={progress} className="h-2" />
                        <Card>
                            <CardContent className="p-0">
                                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Username</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Error</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((u, i) => {
                                                const res = results.find(
                                                    (r) => r.username === u.username
                                                );
                                                return (
                                                    <TableRow key={i}>
                                                        <TableCell>{u.username}</TableCell>
                                                        <TableCell>
                                                            {res ? (
                                                                res.status === "success" ? (
                                                                    <span className="text-green-600">
                                                                        Success
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-red-600">
                                                                        Error
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {typeof res?.error === "object"
                                                                ? JSON.stringify(res.error)
                                                                : res?.error || ""}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false);
                                    reset();
                                }}
                                disabled={creating}
                            >
                                Close
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={creating || results.length === users.length}
                            >
                                Start
                            </Button>
                        </DialogFooter>
                    </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                    <span>* Each student's password will be their username followed by '123'.</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
