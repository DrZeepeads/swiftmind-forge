import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Sparkles, 
  Brain, 
  Zap, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Target,
  ListTodo,
  TrendingUp,
  X,
  Download,
  BarChart3,
  Loader2,
  MessageSquare,
  RefreshCw,
  Lightbulb,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Analytics from './Analytics';
import { PlanningChat } from './PlanningChat';
import { AgentSelector } from './AgentSelector';
import { KnowledgePanel } from './KnowledgePanel';
import { SubtaskTree } from './SubtaskTree';
import { TeamCollaboration } from './TeamCollaboration';
import { PerformanceInsights } from './PerformanceInsights';

// Types
export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'executing' | 'completed';
  priority: number;
  createdAt: number;
  completedAt?: number;
  result?: string;
  category?: string;
  estimatedTime?: string;
  parentId?: string;
  depth?: number;
  subtasks?: Task[];
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  aiInsights?: string;
}

interface Store {
  objectives: Objective[];
  currentObjective: Objective | null;
  isProcessing: boolean;
  addObjective: (title: string, description: string) => void;
  setCurrentObjective: (id: string) => void;
  deleteObjective: (id: string) => void;
  startProcessing: () => void;
  pauseProcessing: () => void;
  resetObjective: (id: string) => void;
  completeTask: (taskId: string) => void;
}

// Zustand Store
const useStore = create<Store>()(
  persist(
    (set, get) => ({
      objectives: [],
      currentObjective: null,
      isProcessing: false,
      
      addObjective: (title, description) => {
        const newObjective: Objective = {
          id: Date.now().toString(),
          title,
          description,
          tasks: [],
          status: 'active',
          createdAt: Date.now(),
        };
        set(state => ({
          objectives: [newObjective, ...state.objectives],
          currentObjective: newObjective,
        }));
      },
      
      setCurrentObjective: (id) => {
        const obj = get().objectives.find(o => o.id === id);
        if (obj) set({ currentObjective: obj });
      },
      
      deleteObjective: (id) => {
        set(state => ({
          objectives: state.objectives.filter(o => o.id !== id),
          currentObjective: state.currentObjective?.id === id ? null : state.currentObjective,
        }));
      },
      
      startProcessing: () => set({ isProcessing: true }),
      pauseProcessing: () => set({ isProcessing: false }),
      
      resetObjective: (id) => {
        set(state => ({
          objectives: state.objectives.map(obj => 
            obj.id === id 
              ? { ...obj, tasks: [], status: 'active' as const }
              : obj
          ),
          currentObjective: state.currentObjective?.id === id 
            ? { ...state.currentObjective, tasks: [], status: 'active' as const }
            : state.currentObjective,
        }));
      },
      
      completeTask: (taskId) => {
        set(state => {
          if (!state.currentObjective) return state;
          
          const updatedTasks = state.currentObjective.tasks.map(task =>
            task.id === taskId
              ? { ...task, status: 'completed' as const, completedAt: Date.now() }
              : task
          );
          
          const updatedObjective = { ...state.currentObjective, tasks: updatedTasks };
          
          return {
            currentObjective: updatedObjective,
            objectives: state.objectives.map(obj =>
              obj.id === state.currentObjective?.id ? updatedObjective : obj
            ),
          };
        });
      },
    }),
    {
      name: 'babyagi-storage',
    }
  )
);

// AI-powered Task Generator
const generateTasksWithAI = async (objective: string, description: string, agentId?: string): Promise<{ tasks: Task[], insights?: string }> => {
  try {
    let agentProfile = null;
    if (agentId) {
      const { data } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('id', agentId)
        .single();
      agentProfile = data;
    }

    const { data, error } = await supabase.functions.invoke('generate-tasks', {
      body: { 
        objective, 
        description,
        agentProfile: agentProfile ? {
          systemPrompt: agentProfile.system_prompt,
          model: agentProfile.model_preference
        } : null
      }
    });

    if (error) throw error;

    if (data.error) {
      toast.error(data.error);
      return { tasks: [] };
    }

    const aiTasks: Task[] = data.tasks.map((task: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      title: task.title,
      status: 'pending' as const,
      priority: task.priority,
      category: task.category,
      estimatedTime: task.estimatedTime,
      createdAt: Date.now() + index,
    }));

    return {
      tasks: aiTasks,
      insights: data.insights
    };
  } catch (error) {
    console.error('AI task generation failed:', error);
    toast.error('AI generation failed, using basic tasks');
    
    // Fallback to basic tasks
    const basicTasks: Task[] = [
      { id: `${Date.now()}-0`, title: `Research and gather information for: ${objective}`, status: 'pending', priority: 1, createdAt: Date.now() },
      { id: `${Date.now()}-1`, title: `Define success criteria for: ${objective}`, status: 'pending', priority: 2, createdAt: Date.now() + 1 },
      { id: `${Date.now()}-2`, title: `Create implementation plan for: ${objective}`, status: 'pending', priority: 3, createdAt: Date.now() + 2 },
      { id: `${Date.now()}-3`, title: `Execute core functionality for: ${objective}`, status: 'pending', priority: 4, createdAt: Date.now() + 3 },
      { id: `${Date.now()}-4`, title: `Test and validate: ${objective}`, status: 'pending', priority: 5, createdAt: Date.now() + 4 },
    ];
    
    return { tasks: basicTasks };
  }
};

// Main App Component
export default function BabyAGI() {
  const {
    objectives,
    currentObjective,
    isProcessing,
    addObjective,
    setCurrentObjective,
    deleteObjective,
    startProcessing,
    pauseProcessing,
    resetObjective,
    completeTask,
  } = useStore();
  
  const [showNewObjective, setShowNewObjective] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [expandedStats, setExpandedStats] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [loopMode, setLoopMode] = useState<'off' | 'timed'>('off');
  const [loopInterval, setLoopInterval] = useState(10);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [lastEvaluation, setLastEvaluation] = useState<number>(Date.now());
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [teamCollabOpen, setTeamCollabOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);

  // Loop mode evaluation
  useEffect(() => {
    if (loopMode === 'off' || !currentObjective || currentObjective.tasks.length === 0) return;

    const intervalMs = loopInterval * 60 * 1000;
    const timeSinceLastEval = Date.now() - lastEvaluation;
    
    if (timeSinceLastEval < intervalMs) {
      const timeout = setTimeout(() => {
        evaluateProgress();
      }, intervalMs - timeSinceLastEval);
      
      return () => clearTimeout(timeout);
    }
  }, [loopMode, loopInterval, lastEvaluation, currentObjective]);

  const evaluateProgress = async () => {
    if (!currentObjective) return;

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-progress', {
        body: {
          objectiveId: currentObjective.id,
          tasks: currentObjective.tasks,
          objective: currentObjective.title
        }
      });

      if (error) throw error;

      if (data.recommendations && data.recommendations.length > 0) {
        const highPriority = data.recommendations.filter((r: any) => r.priority === 'high');
        if (highPriority.length > 0) {
          toast.warning(`${highPriority.length} high priority recommendation(s)`, {
            description: highPriority[0].message
          });
        }
      }

      setLastEvaluation(Date.now());
    } catch (err) {
      console.error('Evaluation error:', err);
    }
  };

  // Auto-processing effect
  useEffect(() => {
    if (!isProcessing || !currentObjective) return;
    
    const pendingTasks = currentObjective.tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) {
      pauseProcessing();
      
      // Trigger reflection when all tasks are completed
      if (currentObjective.tasks.length > 0 && currentObjective.tasks.every(t => t.status === 'completed')) {
        handleReflection(currentObjective);
      }
      return;
    }
    
    const nextTask = pendingTasks[0];
    const taskIndex = currentObjective.tasks.findIndex(t => t.id === nextTask.id);
    
    // Update task to executing
    useStore.setState(state => {
      if (!state.currentObjective) return state;
      const updatedTasks = [...state.currentObjective.tasks];
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: 'executing' };
      const updatedObjective = { ...state.currentObjective, tasks: updatedTasks };
      return {
        currentObjective: updatedObjective,
        objectives: state.objectives.map(obj =>
          obj.id === state.currentObjective?.id ? updatedObjective : obj
        ),
      };
    });
    
    // Simulate task execution
    const timer = setTimeout(() => {
      completeTask(nextTask.id);
    }, 2000 + Math.random() * 2000);
    
    return () => clearTimeout(timer);
  }, [isProcessing, currentObjective, completeTask, pauseProcessing]);

  const handleCreateObjective = async () => {
    if (!newTitle.trim()) return;
    
    setIsGenerating(true);
    addObjective(newTitle, newDescription);
    
    // Generate tasks with AI
    const current = useStore.getState().currentObjective;
    if (current) {
      const { tasks, insights } = await generateTasksWithAI(newTitle, newDescription, selectedAgentId);
      
      useStore.setState(state => ({
        currentObjective: { ...current, tasks, aiInsights: insights },
        objectives: state.objectives.map(obj =>
          obj.id === current.id ? { ...obj, tasks, aiInsights: insights } : obj
        ),
      }));
      
      if (insights) {
        toast.success('AI generated smart task breakdown!');
      }

      // Auto-start processing after task generation
      if (tasks.length > 0) {
        startProcessing();
      }
    }
    
    setIsGenerating(false);
    setNewTitle('');
    setNewDescription('');
    setShowNewObjective(false);
  };
  
  const handleReflection = async (objective: Objective) => {
    try {
      // Store reflection
      const { data: reflectionData, error: reflectionError } = await supabase.functions.invoke('reflect-on-objective', {
        body: {
          objectiveId: objective.id,
          objectiveTitle: objective.title,
          tasks: objective.tasks
        }
      });
      
      if (reflectionError) {
        console.error('Reflection failed:', reflectionError);
      } else if (reflectionData?.reflection) {
        toast.success('Objective completed! Learning captured.');
      }

      // Store knowledge embeddings for future reference
      const { error: knowledgeError } = await supabase.functions.invoke('store-knowledge', {
        body: {
          objectiveId: objective.id,
          objectiveTitle: objective.title,
          objectiveDescription: objective.description,
          tasks: objective.tasks
        }
      });
      
      if (knowledgeError) {
        console.error('Knowledge storage failed:', knowledgeError);
      } else {
        toast.success('Knowledge stored for future use!');
      }
    } catch (error) {
      console.error('Error during reflection:', error);
    }
  };

  const handleSubtasksGenerated = (parentId: string, subtasks: Task[]) => {
    if (!currentObjective) return;

    const addSubtasksToTask = (tasks: Task[]): Task[] => {
      return tasks.map(task => {
        if (task.id === parentId) {
          return {
            ...task,
            subtasks: subtasks,
            hasSubtasks: true,
            subtaskCount: subtasks.length
          };
        }
        if (task.subtasks) {
          return {
            ...task,
            subtasks: addSubtasksToTask(task.subtasks)
          };
        }
        return task;
      });
    };

    const updatedTasks = addSubtasksToTask(currentObjective.tasks);
    const updatedObjective = { ...currentObjective, tasks: updatedTasks };

    useStore.setState(state => ({
      currentObjective: updatedObjective,
      objectives: state.objectives.map(obj =>
        obj.id === currentObjective.id ? updatedObjective : obj
      ),
    }));
  };

  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      objectives: objectives.map(obj => ({
        ...obj,
        tasks: obj.tasks.map(t => ({
          ...t,
          statusText: t.status,
          completedDate: t.completedAt ? new Date(t.completedAt).toISOString() : null
        }))
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `babyagi-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const handleChatAction = (action: any) => {
    toast.info('Action applied: ' + action.action);
    // TODO: Implement action handlers
  };

  const stats = currentObjective ? {
    total: currentObjective.tasks.length,
    completed: currentObjective.tasks.filter(t => t.status === 'completed').length,
    executing: currentObjective.tasks.filter(t => t.status === 'executing').length,
    pending: currentObjective.tasks.filter(t => t.status === 'pending').length,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Brain className="w-8 h-8 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">BabyAGI</h1>
                <p className="text-xs text-primary/70">Autonomous Task Agent</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
                title="Analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleExport}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
                title="Export Data"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => setChatOpen(true)}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
                title="AI Assistant"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => setKnowledgeOpen(!knowledgeOpen)}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
                title="Past Learnings"
              >
                <Lightbulb className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTeamCollabOpen(true)}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
                title="Team Collaboration"
              >
                <Users className="w-4 h-4" />
              </button>

              <button
                onClick={() => setPerformanceOpen(true)}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
                title="Performance Insights"
              >
                <TrendingUp className="w-4 h-4" />
              </button>

              {loopMode === 'timed' && currentObjective && (
                <button
                  onClick={evaluateProgress}
                  className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
                  title="Evaluate Now"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => setShowNewObjective(true)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                New Goal
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Analytics Panel */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Analytics objectives={objectives} />
          </motion.div>
        )}

        {/* Stats Panel */}
        {currentObjective && stats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
          >
            <button
              onClick={() => setExpandedStats(!expandedStats)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-semibold">Current Objective</span>
              </div>
              {expandedStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            <AnimatePresence>
              {expandedStats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10"
                >
                  <div className="p-4 space-y-3">
                    <h3 className="text-lg font-bold">{currentObjective.title}</h3>
                    {currentObjective.description && (
                      <p className="text-sm text-muted-foreground">{currentObjective.description}</p>
                    )}
                    {currentObjective.aiInsights && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-2">
                        <p className="text-xs text-primary/80 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{currentObjective.aiInsights}</span>
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div className="bg-green-500/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{stats.completed}</div>
                        <div className="text-xs text-muted-foreground">Done</div>
                      </div>
                      <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{stats.executing}</div>
                        <div className="text-xs text-muted-foreground">Running</div>
                      </div>
                      <div className="bg-muted/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    
                    {/* Controls */}
                    <div className="flex gap-2 mt-4">
                      {!isProcessing ? (
                        <button
                          onClick={startProcessing}
                          disabled={stats.pending === 0}
                          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-muted disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                          <Play className="w-4 h-4" />
                          Start
                        </button>
                      ) : (
                        <button
                          onClick={pauseProcessing}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                      )}
                      <button
                        onClick={() => resetObjective(currentObjective.id)}
                        className="bg-destructive/20 hover:bg-destructive/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Task List */}
        {currentObjective && currentObjective.tasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Task Queue</h2>
            </div>
            
            <AnimatePresence mode="popLayout">
              {currentObjective.tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    bg-white/5 backdrop-blur-lg rounded-xl p-4 border transition-all
                    ${task.status === 'completed' ? 'border-green-500/30' : 
                      task.status === 'executing' ? 'border-yellow-500/30' : 
                      'border-white/10'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : task.status === 'executing' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Zap className="w-5 h-5 text-yellow-400" />
                        </motion.div>
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <SubtaskTree
                        task={task}
                        depth={0}
                        objective={currentObjective.title}
                        onSubtasksGenerated={handleSubtasksGenerated}
                      />
                      {(task.category || task.estimatedTime) && (
                        <div className="flex items-center gap-2 mt-2">
                          {task.category && (
                            <span className="text-xs bg-white/5 px-2 py-0.5 rounded">
                              {task.category}
                            </span>
                          )}
                          {task.estimatedTime && (
                            <span className="text-xs text-muted-foreground">
                              ~{task.estimatedTime}
                            </span>
                          )}
                          <span className="text-xs bg-primary/20 px-2 py-1 rounded-full">
                            P{task.priority}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!currentObjective && objectives.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Brain className="w-20 h-20 mx-auto mb-4 text-primary/50" />
            <h2 className="text-2xl font-bold mb-2">No Active Objectives</h2>
            <p className="text-muted-foreground mb-6">Create your first objective to get started</p>
            <button
              onClick={() => setShowNewObjective(true)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Create Objective
            </button>
          </motion.div>
        )}

        {/* All Objectives List */}
        {objectives.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">All Objectives</h2>
            </div>
            
            <div className="space-y-2">
              {objectives.map(obj => (
                <motion.div
                  key={obj.id}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    bg-white/5 backdrop-blur-lg rounded-xl p-4 border cursor-pointer transition-all hover:bg-white/10
                    ${currentObjective?.id === obj.id ? 'border-primary/50' : 'border-white/10'}
                  `}
                  onClick={() => setCurrentObjective(obj.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{obj.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {obj.tasks.filter(t => t.status === 'completed').length}/{obj.tasks.length} tasks
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteObjective(obj.id);
                      }}
                      className="ml-2 p-2 hover:bg-destructive/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* New Objective Modal */}
      <AnimatePresence>
        {showNewObjective && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowNewObjective(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card backdrop-blur-xl rounded-2xl border border-white/10 p-6 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  New Objective
                </h2>
                <button
                  onClick={() => setShowNewObjective(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Build a landing page"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Optional: Add more context about your objective"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">AI Agent Style</label>
                  <AgentSelector
                    value={selectedAgentId}
                    onChange={setSelectedAgentId}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Loop Mode</label>
                    <select
                      value={loopMode}
                      onChange={(e) => setLoopMode(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="off">Off</option>
                      <option value="timed">Timed Auto-Evaluation</option>
                    </select>
                  </div>

                  {loopMode === 'timed' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Interval (min)</label>
                      <select
                        value={loopInterval}
                        onChange={(e) => setLoopInterval(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="5">5 minutes</option>
                        <option value="10">10 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateObjective}
                    disabled={!newTitle.trim() || isGenerating}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating AI Tasks...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Create with AI
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowNewObjective(false)}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PlanningChat
        objectiveId={currentObjective?.id || ''}
        objective={currentObjective?.title || ''}
        tasks={currentObjective?.tasks || []}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onApplyAction={handleChatAction}
      />

      <KnowledgePanel
        objective={newTitle}
        description={newDescription}
        isOpen={knowledgeOpen && showNewObjective}
        onClose={() => setKnowledgeOpen(false)}
      />

      {teamCollabOpen && (
        <TeamCollaboration
          currentObjective={currentObjective}
          onClose={() => setTeamCollabOpen(false)}
        />
      )}

      {performanceOpen && (
        <PerformanceInsights
          currentObjective={currentObjective}
          onClose={() => setPerformanceOpen(false)}
        />
      )}
    </div>
  );
}
