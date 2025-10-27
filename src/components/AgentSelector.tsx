import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface AgentProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  color_theme: string;
  is_default: boolean;
}

interface AgentSelectorProps {
  value?: string;
  onChange: (agentId: string) => void;
  className?: string;
}

export const AgentSelector = ({ value, onChange, className }: AgentSelectorProps) => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_profiles')
        .select('*')
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      setAgents(data || []);
      
      // Set default if no value
      if (!value && data && data.length > 0) {
        const defaultAgent = data.find(a => a.is_default) || data[0];
        onChange(defaultAgent.id);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedAgent = agents.find(a => a.id === value);

  if (loading) {
    return <div className="h-10 bg-muted animate-pulse rounded" />;
  }

  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue>
            {selectedAgent ? (
              <div className="flex items-center gap-2">
                <span>{selectedAgent.icon}</span>
                <span>{selectedAgent.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {selectedAgent.role}
                </Badge>
              </div>
            ) : (
              'Select AI Agent'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              <div className="flex items-center gap-2 py-1">
                <span className="text-lg">{agent.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{agent.name}</span>
                    {agent.is_default && (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {agent.description}
                  </p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};