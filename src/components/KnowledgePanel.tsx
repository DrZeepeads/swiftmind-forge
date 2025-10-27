import { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface SimilarObjective {
  title: string;
  summary: string;
  keyLearnings: string[];
  similarity: number;
  id: string;
}

interface KnowledgePanelProps {
  objective: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgePanel = ({ objective, description, isOpen, onClose }: KnowledgePanelProps) => {
  const [similarObjectives, setSimilarObjectives] = useState<SimilarObjective[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && objective) {
      loadSimilarObjectives();
    }
  }, [isOpen, objective]);

  const loadSimilarObjectives = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('retrieve-context', {
        body: { objective, description }
      });

      if (error) throw error;
      setSimilarObjectives(data.similarObjectives || []);
    } catch (err) {
      console.error('Error loading similar objectives:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="fixed left-4 top-20 w-96 z-40"
      >
        <Card className="bg-background/95 backdrop-blur-lg border-primary/20 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Past Learnings</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Based on {similarObjectives.length} similar objective(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 animate-pulse mx-auto mb-2" />
                <p className="text-sm">Searching knowledge base...</p>
              </div>
            ) : similarObjectives.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-8 w-8 opacity-50 mx-auto mb-2" />
                <p className="text-sm">No similar objectives found</p>
                <p className="text-xs mt-1">This is a new type of objective!</p>
              </div>
            ) : (
              similarObjectives.map((obj, i) => (
                <Card key={i} className="bg-primary/5 border-primary/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium">
                        {obj.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {obj.similarity}% match
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      {obj.summary}
                    </CardDescription>
                  </CardHeader>
                  {obj.keyLearnings.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-primary">Key Learnings:</p>
                        <ul className="text-xs space-y-0.5 text-muted-foreground">
                          {obj.keyLearnings.slice(0, 3).map((learning, j) => (
                            <li key={j} className="flex items-start gap-1">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{learning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};