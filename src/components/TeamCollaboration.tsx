import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Share2, X, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Objective } from './BabyAGI';

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface TeamCollaborationProps {
  currentObjective: Objective | null;
  onClose: () => void;
}

export function TeamCollaboration({ currentObjective, onClose }: TeamCollaborationProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [sharedObjectives, setSharedObjectives] = useState<any[]>([]);

  useEffect(() => {
    loadTeams();
    loadSharedObjectives();
  }, []);

  const loadTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading teams:', error);
    } else {
      setTeams(data || []);
    }
  };

  const loadSharedObjectives = async () => {
    const { data, error } = await supabase
      .from('shared_objectives')
      .select('*')
      .order('shared_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading shared objectives:', error);
    } else {
      setSharedObjectives(data || []);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: teamName,
        description: teamDescription,
        created_by: 'user'
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error('Failed to create team');
      console.error(error);
    } else {
      toast.success('Team created!');
      setTeamName('');
      setTeamDescription('');
      setShowCreateTeam(false);
      loadTeams();
    }
  };

  const handleShareObjective = async (teamId: string) => {
    if (!currentObjective) return;

    setLoading(true);
    const { data, error } = await supabase.functions.invoke('share-objective', {
      body: {
        teamId,
        objective: currentObjective,
        sharedBy: 'user'
      }
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to share objective');
      console.error(error);
    } else {
      toast.success('Objective shared with team!');
      loadSharedObjectives();
    }
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
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Team Collaboration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          {/* Create Team Section */}
          {showCreateTeam ? (
            <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-4">
              <h3 className="font-semibold">Create New Team</h3>
              <input
                type="text"
                placeholder="Team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Team description (optional)"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateTeam}
                  disabled={loading || !teamName.trim()}
                  className="flex-1 bg-primary hover:bg-primary/80 disabled:opacity-50 px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateTeam(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateTeam(true)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 mb-6 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Create New Team</span>
            </button>
          )}

          {/* Teams List */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Your Teams
            </h3>
            {teams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No teams yet. Create one to start collaborating!</p>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{team.name}</h4>
                        {team.description && (
                          <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
                        )}
                      </div>
                      {currentObjective && (
                        <button
                          onClick={() => handleShareObjective(team.id)}
                          disabled={loading}
                          className="ml-4 px-3 py-1 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shared Objectives */}
          {sharedObjectives.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Recently Shared
              </h3>
              <div className="space-y-2">
                {sharedObjectives.map((shared) => (
                  <div
                    key={shared.id}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <h4 className="font-medium text-sm">{shared.objective_title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>Shared by {shared.shared_by}</span>
                      <span>•</span>
                      <span>{new Date(shared.shared_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}