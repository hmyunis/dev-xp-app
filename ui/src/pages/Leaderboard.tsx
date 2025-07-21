
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star, Crown } from 'lucide-react';
import { studentApi } from '@/lib/apiClient';
import { StudentProfile } from '@/types';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { toast } from 'sonner';

const Leaderboard = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await studentApi.getLeaderboard({ pageSize: 50 });
        if (response.data.data?.items) {
          setStudents(response.data.data.items);
        }
      } catch (error) {
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🏆 Leaderboard</h1>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-blue-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-orange-500';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-blue-400 to-purple-500';
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
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          🏆 XP Leaderboard
        </h1>
        <p className="text-xl text-gray-600">
          See how you stack up against other amazing developers!
        </p>
      </motion.div>

      {/* Top 3 Podium */}
      {students.length >= 3 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-purple-800 text-center">
                🥇 Top Performers 🥇
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-end space-x-4">
                {/* 2nd Place */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="w-24 h-20 bg-gradient-to-r from-gray-300 to-gray-500 rounded-lg flex items-center justify-center mb-2">
                    <Medal className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md min-w-[120px]">
                    <div className="text-2xl font-bold text-gray-600 mb-1">2nd</div>
                    <div className="font-semibold text-gray-800">{students[1].user.fullName}</div>
                    <div className="text-sm text-gray-600">{students[1].totalXp} XP</div>
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="w-28 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-2">
                    <Crown className="h-10 w-10 text-white" />
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-lg min-w-[140px] border-2 border-yellow-400">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">1st</div>
                    <div className="font-semibold text-gray-800">{students[0].user.fullName}</div>
                    <div className="text-sm text-gray-600">{students[0].totalXp} XP</div>
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="w-24 h-20 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg flex items-center justify-center mb-2">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md min-w-[120px]">
                    <div className="text-2xl font-bold text-amber-600 mb-1">3rd</div>
                    <div className="font-semibold text-gray-800">{students[2].user.fullName}</div>
                    <div className="text-sm text-gray-600">{students[2].totalXp} XP</div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Full Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.map((student, index) => (
                <motion.div
                  key={student.user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md border-2 border-transparent hover:border-indigo-300 transition-all"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(index + 1)} flex items-center justify-center text-white font-bold`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {student.user.fullName}
                      </h3>
                      {getRankIcon(index + 1)}
                    </div>
                    <p className="text-sm text-gray-600">@{student.user.username}</p>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={`bg-gradient-to-r ${getRankColor(index + 1)} text-white text-lg px-3 py-1`}>
                      {student.totalXp} XP
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      {student.availableXp} available
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Leaderboard;
