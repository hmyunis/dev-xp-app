import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Award, ShoppingBag, BookOpen, TrendingUp, Plus } from "lucide-react";
import { studentApi, storeApi, userApi } from "@/lib/apiClient";
import { StudentProfile, StoreItem, User } from "@/types";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const TeacherDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTransactions: 0,
        totalStoreItems: 0,
        topStudent: null as StudentProfile | null,
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [loadingTx, setLoadingTx] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [studentsResponse, storeResponse, usersResponse, transactionsResponse] =
                    await Promise.all([
                        studentApi.getLeaderboard({ pageSize: 1 }),
                        storeApi.getStoreItems({ pageSize: 1 }),
                        userApi.getAllUsers({ pageSize: 1 }),
                        storeApi.getTransactions({ pageSize: 1 }),
                    ]);

                const topStudent = studentsResponse.data.data?.items[0] || null;
                const totalStudents = studentsResponse.data.data?.pagination.count || 0;
                const totalStoreItems = storeResponse.data.data?.pagination.count || 0;
                const totalTransactions = transactionsResponse.data.data?.pagination.count || 0;

                setStats({
                    totalStudents,
                    totalTransactions,
                    totalStoreItems,
                    topStudent,
                });
            } catch (error) {
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    useEffect(() => {
        setLoadingTx(true);
        storeApi
            .getTransactions({ pageSize: 5 })
            .then((res) => setRecentTransactions(res.data.data?.items || []))
            .catch(() => setRecentTransactions([]))
            .finally(() => setLoadingTx(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
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
            {/* Stats Overview */}
            <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">Total Students</CardTitle>
                            <Users className="h-6 w-6" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalStudents}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">Store Items</CardTitle>
                            <ShoppingBag className="h-6 w-6" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalStoreItems}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">Transactions</CardTitle>
                            <Award className="h-6 w-6" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalTransactions}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">Top Student</CardTitle>
                            <TrendingUp className="h-6 w-6" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">
                                {stats.topStudent?.user.fullName || "No students yet"}
                            </div>
                            {stats.topStudent && (
                                <div className="text-sm text-white/90">
                                    {stats.topStudent.totalXp} XP
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-200">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
                            <BookOpen className="h-6 w-6" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigate("/user-management")}
                                className="bg-white rounded-lg p-6 text-center shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer"
                            >
                                <Plus className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800">Add Student</h3>
                                <p className="text-sm text-gray-600">Create new student account</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigate("/students")}
                                className="bg-white rounded-lg p-6 text-center shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer"
                            >
                                <Award className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800">Award XP</h3>
                                <p className="text-sm text-gray-600">Give XP to students</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigate("/store-management")}
                                className="bg-white rounded-lg p-6 text-center shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer"
                            >
                                <ShoppingBag className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800">Manage Store</h3>
                                <p className="text-sm text-gray-600">Add/edit store items</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigate("/students")}
                                className="bg-white rounded-lg p-6 text-center shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer"
                            >
                                <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800">View Students</h3>
                                <p className="text-sm text-gray-600">Manage student profiles</p>
                            </motion.div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Replace Recent Activity section with Recent Store Transactions */}
            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-200">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-orange-800 flex items-center gap-2">
                            <TrendingUp className="h-6 w-6" />
                            Recent Store Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingTx ? (
                            <div className="p-4">Loading...</div>
                        ) : recentTransactions.length === 0 ? (
                            <div className="p-4 text-gray-500">No recent transactions.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2">Student</th>
                                            <th className="text-left p-2">Item</th>
                                            <th className="text-left p-2">XP Cost</th>
                                            <th className="text-left p-2">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.map((tx, i) => (
                                            <tr key={tx.id}>
                                                <td className="p-2">
                                                    {tx.student?.username ||
                                                        tx.student?.fullName ||
                                                        "-"}
                                                </td>
                                                <td className="p-2">{tx.item?.name || "-"}</td>
                                                <td className="p-2">{tx.xpCostAtPurchase}</td>
                                                <td className="p-2">
                                                    {new Date(tx.timestamp).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};
