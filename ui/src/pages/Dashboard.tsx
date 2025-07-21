
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Gift, Users, Sparkles, Award } from 'lucide-react';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';

const Dashboard = () => {
  const { user } = useAuth();

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
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
              className="mx-auto mb-4"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-10 w-10" />
              </div>
            </motion.div>
            <CardTitle className="text-4xl font-bold">
              Welcome back, {user?.fullName}! 🎉
            </CardTitle>
            <p className="text-xl text-white/90 mt-2">
              {user?.role === 'STUDENT' 
                ? "Ready to earn more XP and climb the leaderboard?"
                : "Ready to inspire young developers today?"
              }
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {user?.role === 'STUDENT' ? <StudentDashboard /> : <TeacherDashboard />}
    </motion.div>
  );
};

export default Dashboard;
