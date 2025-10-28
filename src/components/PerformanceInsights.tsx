import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, AlertCircle, X, Loader2, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Objective } from './BabyAGI';

interface PerformanceInsightsProps {
  currentObjective: Objective | null;
  onClose: () => void;
}

interface Prediction {
  predictedCompletionMinutes: number;
  confidenceScore: number;
  optimizations: Array<{
    type: string;
    description: string;
    expectedImprovement: string;
  }>;
  bottlenecks: string[];
}

export function PerformanceInsights({ currentObjective, onClose }: PerformanceInsightsProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentObjective) {
      loadPrediction();
    }
  }, [currentObjective]);

  const loadPrediction = async () => {
    if (!currentObjective) return;

    setLoading(true);
    const { data, error } = await supabase.functions.invoke('predict-performance', {
      body: {
        objectiveId: currentObjective.id,
        tasks: currentObjective.tasks,
        objective: currentObjective.title
      }
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to load performance insights');
      console.error(error);
    } else {
      setPrediction(data);
    }
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'priority_reorder':
        return <Target className="w-4 h-4" />;
      case 'parallel_execution':
        return <Zap className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-card rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Performance Insights</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : prediction ? (
            <div className="space-y-6">
              {/* Prediction Summary */}
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-6 border border-primary/30">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Completion</p>
                    <p className="text-3xl font-bold">{prediction.predictedCompletionMinutes} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                    <p className={`text-3xl font-bold ${getConfidenceColor(prediction.confidenceScore)}`}>
                      {Math.round(prediction.confidenceScore * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Optimizations */}
              {prediction.optimizations && prediction.optimizations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Recommended Optimizations
                  </h3>
                  <div className="space-y-3">
                    {prediction.optimizations.map((opt, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/20 rounded-lg">
                            {getOptimizationIcon(opt.type)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{opt.description}</p>
                            <p className="text-sm text-primary mt-1">{opt.expectedImprovement}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottlenecks */}
              {prediction.bottlenecks && prediction.bottlenecks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    Potential Bottlenecks
                  </h3>
                  <div className="space-y-2">
                    {prediction.bottlenecks.map((bottleneck, index) => (
                      <div
                        key={index}
                        className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3"
                      >
                        <p className="text-sm">{bottleneck}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <button
                onClick={loadPrediction}
                disabled={loading}
                className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg py-3 font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <TrendingUp className="w-5 h-5" />
                Refresh Analysis
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No predictions available</p>
              <button
                onClick={loadPrediction}
                className="mt-4 px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg font-semibold transition-all"
              >
                Generate Prediction
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}