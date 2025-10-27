import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedAction?: any;
}

interface PlanningChatProps {
  objectiveId: string;
  objective: string;
  tasks: any[];
  isOpen: boolean;
  onClose: () => void;
  onApplyAction: (action: any) => void;
}

export const PlanningChat = ({ 
  objectiveId, 
  objective, 
  tasks, 
  isOpen, 
  onClose,
  onApplyAction 
}: PlanningChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen, objectiveId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    const { data } = await supabase
      .from('objective_chat_history')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('planning-chat', {
        body: {
          objectiveId,
          message: userMessage,
          tasks,
          objective
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        suggestedAction: data.suggestedAction
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Planning Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Ask me anything about your objective!</p>
            <p className="text-xs mt-2">Try: "Add testing tasks" or "Reorder by priority"</p>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Card className={`max-w-[85%] p-3 ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                
                {msg.suggestedAction && msg.suggestedAction.action !== 'none' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() => onApplyAction(msg.suggestedAction)}
                  >
                    Apply Suggestion
                  </Button>
                )}
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-muted p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your objective..."
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};