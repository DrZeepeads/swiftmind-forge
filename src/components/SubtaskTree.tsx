import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubtaskTreeProps {
  task: any;
  depth: number;
  objective: string;
  onSubtasksGenerated: (parentId: string, subtasks: any[]) => void;
}

export const SubtaskTree = ({ task, depth, objective, onSubtasksGenerated }: SubtaskTreeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSubtasks = async () => {
    if (depth >= 3) {
      toast.error('Maximum subtask depth reached (3 levels)');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-subtasks', {
        body: {
          parentTask: task,
          objective,
          currentDepth: depth
        }
      });

      if (error) throw error;

      if (data.subtasks) {
        const newSubtasks = data.subtasks.map((st: any, i: number) => ({
          id: `${task.id}-sub-${i}`,
          title: st.title,
          status: 'pending' as const,
          priority: st.priority,
          estimatedTime: st.estimatedTime,
          parentId: task.id,
          depth: depth + 1,
          createdAt: Date.now() + i
        }));

        onSubtasksGenerated(task.id, newSubtasks);
        setIsExpanded(true);
        toast.success(`Generated ${newSubtasks.length} subtasks`);
      }
    } catch (err) {
      console.error('Subtask generation error:', err);
      toast.error('Failed to generate subtasks');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const indentClass = `ml-${Math.min(depth * 4, 12)}`;

  return (
    <div className={depth > 0 ? indentClass : ''}>
      <div className="flex items-center gap-2 group">
        {hasSubtasks && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        
        <div className="flex-1 flex items-center gap-2">
          <Badge variant={depth === 0 ? 'default' : 'secondary'} className="text-xs">
            L{depth}
          </Badge>
          
          <span className="text-sm">{task.title}</span>
          
          {task.status === 'executing' && depth < 3 && !hasSubtasks && (
            <Button
              size="sm"
              variant="ghost"
              onClick={generateSubtasks}
              disabled={isGenerating}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              <span className="text-xs ml-1">Break Down</span>
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasSubtasks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-1"
          >
            {task.subtasks.map((subtask: any) => (
              <SubtaskTree
                key={subtask.id}
                task={subtask}
                depth={depth + 1}
                objective={objective}
                onSubtasksGenerated={onSubtasksGenerated}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};