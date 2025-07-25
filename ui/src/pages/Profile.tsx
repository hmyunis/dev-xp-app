import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Save, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/apiClient";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { authApi } from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge";
import { School } from "@/types";
import { useQuery } from "@tanstack/react-query";

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
    });
    const [loading, setLoading] = useState(false);
    const [showChangePw, setShowChangePw] = useState(false);
    const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [pwLoading, setPwLoading] = useState(false);
    const { data: schoolResp } = useQuery({
        queryKey: ["mySchool"],
        queryFn: userApi.getMySchool,
    });
    const school = schoolResp?.data?.data?.school || null;

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await userApi.updateCurrentUser(formData);
            await refreshUser();
            toast.success("🎉 Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPwForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePwSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwLoading(true);
        try {
            await authApi.changePassword(
                pwForm.oldPassword,
                pwForm.newPassword,
                pwForm.confirmPassword
            );
            toast.success("Password updated successfully!");
            setShowChangePw(false);
            setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            let msg = error?.response?.data?.error || "Failed to change password";
            if (typeof msg === "object") msg = msg.message || JSON.stringify(msg);
            toast.error(msg);
        } finally {
            setPwLoading(false);
        }
    };

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
            className="space-y-8 max-w-2xl mx-auto"
        >
            {/* School badge moved into profile info card */}
            <motion.div variants={itemVariants} className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    👤 My Profile
                </h1>
                <p className="text-xl text-gray-600">
                    Update your information and keep your account secure!
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
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="h-10 w-10" />
                            </div>
                        </motion.div>
                        <CardTitle className="text-2xl font-bold">
                            Welcome, {user?.fullName}! 👋
                        </CardTitle>
                        <p className="text-lg text-white/90 mt-2">
                            Role: {user?.role === "STUDENT" ? "🎓 Student" : "👨‍🏫 Teacher"}
                        </p>
                        {school && (
                            <div className="flex flex-col md:flex-row items-center justify-center gap-2 mt-4">
                                <span className="text-sm text-white/80 mb-1">School:</span>
                                <Badge variant="default" className="text-sm px-4 py-1">
                                    {school.name}
                                </Badge>
                            </div>
                        )}
                    </CardHeader>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                            <User className="h-6 w-6" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="username"
                                        className="text-lg font-semibold text-gray-700"
                                    >
                                        Username
                                    </Label>
                                    <Input
                                        id="username"
                                        value={user?.username || ""}
                                        disabled
                                        className="h-12 text-lg bg-gray-100 border-2 border-gray-300 rounded-lg"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Username cannot be changed
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="fullName"
                                        className="text-lg font-semibold text-gray-700"
                                    >
                                        Full Name
                                    </Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-lg"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-lg font-semibold text-gray-700"
                                    >
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-lg"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="phoneNumber"
                                        className="text-lg font-semibold text-gray-700"
                                    >
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-lg"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-200">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-orange-800 flex items-center gap-2">
                            <Key className="h-6 w-6" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Keep your account secure by changing your password regularly.
                            </p>
                            <Button
                                variant="outline"
                                className="bg-white border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                                onClick={() => setShowChangePw(true)}
                            >
                                <Key className="mr-2 h-4 w-4" />
                                Change Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePwSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="oldPassword">Current Password</Label>
                            <Input
                                id="oldPassword"
                                name="oldPassword"
                                type="password"
                                value={pwForm.oldPassword}
                                onChange={handlePwChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={pwForm.newPassword}
                                onChange={handlePwChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={pwForm.confirmPassword}
                                onChange={handlePwChange}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowChangePw(false)}
                                disabled={pwLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={pwLoading}>
                                {pwLoading ? "Saving..." : "Change Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default Profile;
