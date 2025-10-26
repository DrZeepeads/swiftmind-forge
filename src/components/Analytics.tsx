import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, CheckCircle2, TrendingUp, Brain, ListChecks, Calendar, Zap } from 'lucide-react';
import { Objective } from './BabyAGI';

interface AnalyticsProps {
  objectives: Objective[];
}

const Analytics: React.FC<AnalyticsProps> = ({ objectives }) => {
  const stats = {
    totalObjectives: objectives.length,
    completedObjectives: objectives.filter(o => 
      o.tasks.length > 0 && o.tasks.every(t => t.status === 'completed')
    ).length,
    totalTasks: objectives.reduce((sum, o) => sum + o.tasks.length, 0),
    completedTasks: objectives.reduce((sum, o) => 
      sum + o.tasks.filter(t => t.status === 'completed').length, 0
    ),
    executingTasks: objectives.reduce((sum, o) => 
      sum + o.tasks.filter(t => t.status === 'executing').length, 0
    ),
    avgTasksPerObjective: objectives.length > 0 
      ? (objectives.reduce((sum, o) => sum + o.tasks.length, 0) / objectives.length).toFixed(1)
      : '0',
  };

  const completionRate = stats.totalTasks > 0 
    ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)
    : '0';

  const recentActivity = objectives
    .flatMap(o => o.tasks.filter(t => t.completedAt))
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
    .slice(0, 5);
  
  // Task category distribution
  const allTasks = objectives.flatMap(obj => obj.tasks);
  const categoryStats = allTasks.reduce((acc, task) => {
    const cat = task.category || 'uncategorized';
    if (!acc[cat]) {
      acc[cat] = { total: 0, completed: 0 };
    }
    acc[cat].total++;
    if (task.status === 'completed') acc[cat].completed++;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);
  
  // Calculate average completion time
  const tasksWithTime = allTasks.filter(t => t.completedAt && t.createdAt);
  const avgCompletionTime = tasksWithTime.length > 0
    ? tasksWithTime.reduce((acc, t) => acc + (t.completedAt! - t.createdAt), 0) / tasksWithTime.length
    : 0;
  const avgMinutes = Math.round(avgCompletionTime / 60000);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Objectives</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalObjectives}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.completedObjectives} completed
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs text-muted-foreground">Tasks Done</span>
          </div>
          <div className="text-2xl font-bold">{stats.completedTasks}</div>
          <div className="text-xs text-muted-foreground mt-1">
            of {stats.totalTasks} total
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Completion</span>
          </div>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            overall rate
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-4 border border-yellow-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-muted-foreground">Avg Time</span>
          </div>
          <div className="text-2xl font-bold">{avgMinutes > 0 ? `${avgMinutes}m` : '-'}</div>
          <div className="text-xs text-muted-foreground mt-1">
            per task
          </div>
        </motion.div>
      </div>
      
      {/* Category Breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            Task Categories
          </h3>
          <div className="space-y-2">
            {Object.entries(categoryStats)
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 5)
              .map(([category, stats]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize">{category}</span>
                    <span className="text-xs text-muted-foreground">
                      {stats.completed}/{stats.total}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Recent Completions
          </h3>
          <div className="space-y-2">
            {recentActivity.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/80 truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.completedAt && new Date(task.completedAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Performance Insights */}
      {stats.totalTasks > 0 && (
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-lg rounded-xl p-4 border border-primary/20">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Performance Insights
          </h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• You're averaging {stats.avgTasksPerObjective} tasks per objective</p>
            <p>• {stats.executingTasks > 0 ? `${stats.executingTasks} task${stats.executingTasks > 1 ? 's' : ''} currently in progress` : 'No tasks currently executing'}</p>
            <p>• Overall completion rate: {completionRate}%</p>
            {avgMinutes > 0 && <p>• Tasks complete in ~{avgMinutes} minutes on average</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
