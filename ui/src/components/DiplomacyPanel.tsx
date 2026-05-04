import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import '../styles/Diplomacy.css';

interface DiplomaticRelation {
  empireId: string;
  relationship: number; // -100 to 100
  status: 'allied' | 'neutral' | 'hostile';
  alliances: string[];
  embargoes: string[];
}

interface DiplomacyProposal {
  id: string;
  proposedBy: string;
  type: 'alliance' | 'embargo' | 'tribute' | 'cartel';
  targetEmpire: string;
  terms?: string;
  votes: Map<string, boolean>;
  status: 'pending' | 'accepted' | 'rejected';
}

interface DiplomacyPanelProps {
  socket: Socket | null;
}

const DiplomacyPanel: React.FC<DiplomacyPanelProps> = ({ socket }) => {
  const [relations, setRelations] = useState<DiplomaticRelation[]>([]);
  const [proposals, setProposals] = useState<DiplomacyProposal[]>([]);
  const [selectedEmpire, setSelectedEmpire] = useState<DiplomaticRelation | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalType, setProposalType] = useState<'alliance' | 'embargo' | 'tribute'>('alliance');
  const [proposalTarget, setProposalTarget] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    // Fetch diplomatic relations
    socket.emit('get_diplomacy_status', (response: any) => {
      setRelations(response.relations);
      setProposals(response.proposals);
    });

    // Subscribe to diplomacy updates
    socket.on('diplomacy_proposed', (data) => {
      setProposals(prev => [...prev, data.proposal]);
    });

    socket.on('diplomacy_accepted', (data) => {
      setRelations(prev => prev.map(r =>
        r.empireId === data.targetEmpire
          ? {
              ...r,
              status: data.proposalType === 'alliance' ? 'allied' : r.status,
              alliances: data.proposalType === 'alliance' ? [...r.alliances, data.proposedBy] : r.alliances,
              embargoes: data.proposalType === 'embargo' ? [...r.embargoes, data.proposedBy] : r.embargoes,
              relationship: r.relationship + (data.proposalType === 'alliance' ? 20 : -20),
            }
          : r
      ));
    });

    socket.on('diplomacy_rejected', (data) => {
      setProposals(prev => prev.map(p =>
        p.id === data.proposalId ? { ...p, status: 'rejected' } : p
      ));
    });

    return () => {
      socket.off('diplomacy_proposed');
      socket.off('diplomacy_accepted');
      socket.off('diplomacy_rejected');
    };
  }, [socket]);

  const handleProposeAgreement = (type: 'alliance' | 'embargo' | 'tribute', target: string) => {
    socket?.emit('propose_diplomacy', {
      proposedBy: 'current-empire',
      type,
      targetEmpire: target,
      terms: type === 'tribute' ? '100 credits/cycle' : undefined,
    });
    setShowProposalForm(false);
    setProposalTarget('');
  };

  const handleVoteOnProposal = (proposalId: string, vote: boolean) => {
    socket?.emit('vote_on_proposal', {
      proposalId,
      voter: 'current-empire',
      vote,
    });
  };

  const getRelationshipColor = (score: number) => {
    if (score > 50) return '#00ff41';
    if (score > 0) return '#ffff00';
    if (score > -50) return '#ff8800';
    return '#ff0000';
  };

  const getRelationshipLabel = (score: number) => {
    if (score > 50) return 'Allied';
    if (score > 0) return 'Friendly';
    if (score > -50) return 'Tense';
    return 'Hostile';
  };

  return (
    <div className="diplomacy-panel">
      <div className="diplomacy-header">
        <h2>🤝 Diplomatic Corps</h2>
        <p className="subtitle">Manage alliances, embargoes, and treaties across galactic empires</p>
        <button className="propose-btn" onClick={() => setShowProposalForm(true)}>
          ✉️ Propose Agreement
        </button>
      </div>

      <div className="diplomacy-content">
        <div className="relations-panel">
          <h3>Empire Relations ({relations.length})</h3>
          <div className="relations-list">
            {relations.map(relation => (
              <div
                key={relation.empireId}
                className={`relation-item ${selectedEmpire?.empireId === relation.empireId ? 'active' : ''}`}
                onClick={() => setSelectedEmpire(relation)}
                style={{ borderLeftColor: getRelationshipColor(relation.relationship) }}
              >
                <div className="relation-header">
                  <span className="empire-name">🏛️ {relation.empireId}</span>
                  <span className="relation-badge">{getRelationshipLabel(relation.relationship)}</span>
                </div>
                <div className="relation-meter">
                  <div className="meter-bar">
                    <div
                      className="meter-fill"
                      style={{
                        width: `${((relation.relationship + 100) / 200) * 100}%`,
                        backgroundColor: getRelationshipColor(relation.relationship),
                      }}
                    ></div>
                  </div>
                  <span className="meter-value">{relation.relationship}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedEmpire && (
          <div className="relation-detail">
            <h3>Relation Detail: {selectedEmpire.empireId}</h3>

            <div className="detail-section">
              <h4>📋 Status</h4>
              <div className="status-info">
                <p><strong>Relationship:</strong> {selectedEmpire.relationship}/100</p>
                <p><strong>Status:</strong> {selectedEmpire.status.toUpperCase()}</p>
              </div>
            </div>

            {selectedEmpire.alliances.length > 0 && (
              <div className="detail-section">
                <h4>🛡️ Alliances ({selectedEmpire.alliances.length})</h4>
                <ul>
                  {selectedEmpire.alliances.map(alliance => (
                    <li key={alliance}>✅ {alliance}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedEmpire.embargoes.length > 0 && (
              <div className="detail-section">
                <h4>⛔ Embargoes ({selectedEmpire.embargoes.length})</h4>
                <ul>
                  {selectedEmpire.embargoes.map(embargo => (
                    <li key={embargo}>🚫 {embargo}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="detail-section">
              <h4>📜 Actions</h4>
              <div className="action-buttons">
                <button className="action-btn alliance">
                  🤝 Propose Alliance
                </button>
                <button className="action-btn embargo">
                  🚫 Propose Embargo
                </button>
                <button className="action-btn tribute">
                  💰 Demand Tribute
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="proposals-panel">
          <h3>Pending Proposals</h3>
          <div className="proposals-list">
            {proposals.filter(p => p.status === 'pending').map(proposal => (
              <div key={proposal.id} className="proposal-item">
                <div className="proposal-header">
                  <span className="proposal-type">{proposal.type.toUpperCase()}</span>
                  <span className="proposal-from">from {proposal.proposedBy}</span>
                </div>
                <p className="proposal-target">Target: {proposal.targetEmpire}</p>
                <div className="proposal-buttons">
                  <button
                    className="accept"
                    onClick={() => handleVoteOnProposal(proposal.id, true)}
                  >
                    ✅ Accept
                  </button>
                  <button
                    className="reject"
                    onClick={() => handleVoteOnProposal(proposal.id, false)}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showProposalForm && (
        <div className="modal-overlay" onClick={() => setShowProposalForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Propose Agreement</h3>
            <div className="proposal-form">
              <div className="form-group">
                <label>Agreement Type</label>
                <select value={proposalType} onChange={(e) => setProposalType(e.target.value as any)}>
                  <option value="alliance">Alliance</option>
                  <option value="embargo">Embargo</option>
                  <option value="tribute">Tribute Demand</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Empire</label>
                <select value={proposalTarget} onChange={(e) => setProposalTarget(e.target.value)}>
                  <option value="">Select empire...</option>
                  {relations.map(r => (
                    <option key={r.empireId} value={r.empireId}>
                      {r.empireId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button className="cancel" onClick={() => setShowProposalForm(false)}>
                  Cancel
                </button>
                <button
                  className="confirm"
                  onClick={() => handleProposeAgreement(proposalType, proposalTarget)}
                  disabled={!proposalTarget}
                >
                  Send Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiplomacyPanel;
