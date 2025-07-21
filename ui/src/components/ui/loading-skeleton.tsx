
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const LoadingSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <Skeleton className="h-12 w-full bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 animate-pulse" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[80%] bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 animate-pulse" />
        <Skeleton className="h-4 w-[60%] bg-gradient-to-r from-pink-200 via-red-200 to-orange-200 animate-pulse" />
        <Skeleton className="h-4 w-[70%] bg-gradient-to-r from-green-200 via-blue-200 to-indigo-200 animate-pulse" />
      </div>
    </motion.div>
  );
};

export const CardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 border rounded-lg space-y-4"
    >
      <Skeleton className="h-6 w-[40%] bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 animate-pulse" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-gradient-to-r from-orange-200 via-yellow-200 to-green-200 animate-pulse" />
        <Skeleton className="h-4 w-[80%] bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 animate-pulse" />
      </div>
      <Skeleton className="h-8 w-[30%] bg-gradient-to-r from-violet-200 via-purple-200 to-pink-200 animate-pulse" />
    </motion.div>
  );
};

export const TableSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full bg-gradient-to-r from-red-200 via-orange-200 to-yellow-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[60%] bg-gradient-to-r from-green-200 via-blue-200 to-indigo-200 animate-pulse" />
            <Skeleton className="h-4 w-[40%] bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 animate-pulse" />
          </div>
          <Skeleton className="h-8 w-[20%] bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 animate-pulse" />
        </div>
      ))}
    </motion.div>
  );
};
