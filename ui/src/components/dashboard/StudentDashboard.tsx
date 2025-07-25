import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Gift, Zap, Target, Award } from "lucide-react";
import { studentApi, storeApi, userApi } from "@/lib/apiClient";
import { StudentProfile, StoreItem, School } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export const StudentDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [featuredItems, setFeaturedItems] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTx, setLoadingTx] = useState(true);
    const { data: schoolResp } = useQuery({
        queryKey: ["mySchool"],
        queryFn: userApi.getMySchool,
    });
    const school = schoolResp?.data?.data?.school || null;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [leaderboardResponse, storeResponse] = await Promise.all([
                    studentApi.getLeaderboard({ pageSize: 100 }),
                    storeApi.getStoreItems({ pageSize: 6 }),
                ]);

                // Find current user's profile
                const currentProfile = leaderboardResponse.data.data?.items.find(
                    (p) => p.user.id === user?.id
                );

                if (currentProfile) {
                    setProfile(currentProfile);
                }

                if (storeResponse.data.data?.items) {
                    setFeaturedItems(storeResponse.data.data.items);
                }
            } catch (error) {
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    useEffect(() => {
        if (!user) return;
        setLoadingTx(true);
        storeApi
            .getTransactions({ studentId: user.id, pageSize: 10 })
            .then((res) => setTransactions(res.data.data?.items || []))
            .catch(() => setTransactions([]))
            .finally(() => setLoadingTx(false));
    }, [user]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
            className="space-y-8 relative"
        >
            {/* School badge removed, now in header */}
            {/* XP Stats */}
            <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-2xl font-bold">Total XP</CardTitle>
                            <Trophy className="h-8 w-8" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold mb-2">{profile?.totalXp || 0}</div>
                            <p className="text-white/90">Keep up the great work! 🌟</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white border-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-2xl font-bold">Available XP</CardTitle>
                            <Zap className="h-8 w-8" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold mb-2">
                                {profile?.availableXp || 0}
                            </div>
                            <p className="text-white/90">Ready to spend! 💰</p>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            {/* Featured Store Items */}
            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                            <Gift className="h-6 w-6" />
                            Featured Store Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featuredItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white rounded-lg p-4 shadow-md border-2 border-purple-200 hover:border-purple-400 transition-all"
                                >
                                    <div className="w-full h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg mb-3 flex items-center justify-center">
                                        <Gift className="h-12 w-12 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                            {item.xpCost} XP
                                        </Badge>
                                        <span className="text-sm text-gray-500">
                                            {item.stockQuantity} left
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-200">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
                            <Target className="h-6 w-6" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigate("/leaderboard")}
                                className="bg-white rounded-lg p-6 text-center shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer"
                            >
                                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800">View Leaderboard</h3>
                                <p className="text-sm text-gray-600">See where you rank!</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigate("/store")}
                                className="bg-white rounded-lg p-6 text-center shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer"
                            >
                                <Gift className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800">Browse Store</h3>
                                <p className="text-sm text-gray-600">Spend your XP!</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigate("/profile")}
                                className="bg-white rounded-lg p-6 text-center shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer"
                            >
                                <Award className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800">My Profile</h3>
                                <p className="text-sm text-gray-600">Update your info</p>
                            </motion.div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* My Purchase History */}
            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-200">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-orange-800 flex items-center gap-2">
                            <Award className="h-6 w-6" />
                            My Purchase History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingTx ? (
                            <div className="p-4">
                                <LoadingSkeleton />
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-4 text-gray-500">No purchases yet.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="text-left p-2">Item</th>
                                        <th className="text-left p-2">XP Cost</th>
                                        <th className="text-left p-2">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td className="p-2">{tx.item?.name || "-"}</td>
                                            <td className="p-2">{tx.xpCostAtPurchase}</td>
                                            <td className="p-2">
                                                {new Date(tx.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};
