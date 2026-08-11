import React, { useState } from 'react';
import { Award, Plus, CheckCircle, Eye, Sparkles, AlertTriangle, Lock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';

const HOUSES: { value: HouseId | 'NONE'; label: string }[] = [
  { value: 'NOVA', label: '🔴 NOVA' },
  { value: 'VEGA', label: '🟡 VEGA' },
  { value: 'ORION', label: '🔵 ORION' },
  { value: 'ASTRA', label: '🟢 ASTRA' },
  { value: 'NONE', label: '⚪ No House (Individual)' },
];

interface PlacementRow {
  position: '1st' | '2nd' | '3rd';
  studentName: string;
  studentClass: string;
  houseId: HouseId | 'NONE';
}

export const ResultApprovalQueue: React.FC = () => {
  const { results, resultDrafts, events, publishEventWinners, verifyResult, publishResult, deleteResult, addEvent, cleanupConflictingEvents } = useFestival();
  const [manualOpen] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Custom competition state
  const [addCompOpen, setAddCompOpen] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompCategory, setNewCompCategory] = useState('');
  const [newCompLevel, setNewCompLevel] = useState('');
  const [newCompAddedMsg, setNewCompAddedMsg] = useState('');
  const [isAddingComp, setIsAddingComp] = useState(false);

  const handleAddCustomCompetition = async () => {
    if (!newCompName.trim() || !newCompCategory || !newCompLevel) return;
    setIsAddingComp(true);
    try {
      await addEvent(newCompName.trim(), newCompCategory, newCompLevel);
      setNewCompAddedMsg(`✅ "${newCompName.trim()} (${newCompLevel})" added successfully!`);
      setNewCompName('');
      setNewCompCategory('');
      setNewCompLevel('');
      setTimeout(() => setNewCompAddedMsg(''), 3000);
    } catch (err: any) {
      alert('Failed to add competition: ' + err.message);
    } finally {
      setIsAddingComp(false);
    }
  };

  const allSelectableEvents = events;

  const selectedEvt = allSelectableEvents.find((e) => e.id === selectedEventId);
  const compType = selectedEvt?.competitionType || 'individual';
  const isNonHouse = !selectedEvt?.houseWise;
  
  // Special group competitions with no individual student names
  const isHouseGroupEvent = selectedEvt && [
    'evt-house-groupsong',
    'evt-house-patrioticsong', 
    'evt-house-nationalanthem'
  ].includes(selectedEvt.id);

  // Points based on competition type
  const getPoints = (pos: '1st' | '2nd' | '3rd') => {
    if (compType === 'group') {
      // Large group items (Mime, Group Dance, Group Song): 1st=20, 2nd=15, 3rd=10
      return pos === '1st' ? 20 : pos === '2nd' ? 15 : 10;
    }
    // team (PPT — 2 members) + individual (Anchoring, Turn Coat, Declamation): 1st=10, 2nd=7, 3rd=5
    return pos === '1st' ? 10 : pos === '2nd' ? 7 : 5;
  };

  const defaultHouse = (isNonHouse: boolean): HouseId | 'NONE' => isNonHouse ? 'NONE' : 'NOVA';

  const [placements, setPlacements] = useState<PlacementRow[]>([
    { position: '1st', studentName: '', studentClass: '', houseId: 'NOVA' },
    { position: '2nd', studentName: '', studentClass: '', houseId: 'NOVA' },
    { position: '3rd', studentName: '', studentClass: '', houseId: 'NOVA' },
  ]);

  // Shared position state
  const [shared2nd, setShared2nd] = useState<PlacementRow>({ position: '2nd', studentName: '', studentClass: '', houseId: 'NOVA' });
  const [shared3rd, setShared3rd] = useState<PlacementRow>({ position: '3rd', studentName: '', studentClass: '', houseId: 'NOVA' });
  const [show2nd, setShow2nd] = useState(false);
  const [show3rd, setShow3rd] = useState(false);

  const handleEventChange = (evtId: string) => {
    setSelectedEventId(evtId);
    const evt = allSelectableEvents.find((e) => e.id === evtId);
    const nonHouse = !evt?.houseWise;
    const h = defaultHouse(nonHouse);
    setPlacements([
      { position: '1st', studentName: '', studentClass: '', houseId: h },
      { position: '2nd', studentName: '', studentClass: '', houseId: h },
      { position: '3rd', studentName: '', studentClass: '', houseId: h },
    ]);
    setShared2nd({ position: '2nd', studentName: '', studentClass: '', houseId: h });
    setShared3rd({ position: '3rd', studentName: '', studentClass: '', houseId: h });
    setShow2nd(false);
    setShow3rd(false);
  };

  const updatePlacement = (idx: number, field: keyof PlacementRow, value: string) => {
    setPlacements((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvt) return;

    let filled: PlacementRow[];
    
    if (isHouseGroupEvent) {
      // For house group events, we only need house selection (no student names)
      filled = placements.filter((p) => p.houseId && p.houseId !== 'NONE');
      // Add shared positions if enabled and have house selected
      if (show2nd && shared2nd.houseId && shared2nd.houseId !== 'NONE') filled.push(shared2nd);
      if (show3rd && shared3rd.houseId && shared3rd.houseId !== 'NONE') filled.push(shared3rd);
    } else {
      // For regular events, we need student names
      filled = placements.filter((p) => p.studentName.trim());
      // Add shared positions if enabled and filled
      if (show2nd && shared2nd.studentName.trim()) filled.push(shared2nd);
      if (show3rd && shared3rd.studentName.trim()) filled.push(shared3rd);
    }
    
    if (filled.length === 0) return;

    setSubmitting(true);
    try {
      await publishEventWinners(
        selectedEvt.id,
        '',
        filled.map((p) => ({
          position: p.position,
          studentName: isHouseGroupEvent ? `${p.houseId} House Team` : p.studentName.trim(),
          studentClass: isHouseGroupEvent ? 'Group' : p.studentClass.trim(),
          houseId: p.houseId as HouseId,
          points: getPoints(p.position),
        }))
      );
      setSuccessMsg(`✅ Results published for ${selectedEvt.eventName}!`);
      setSelectedEventId('');
      setPlacements([
        { position: '1st', studentName: '', studentClass: '', houseId: 'NOVA' },
        { position: '2nd', studentName: '', studentClass: '', houseId: 'NOVA' },
        { position: '3rd', studentName: '', studentClass: '', houseId: 'NOVA' },
      ]);
      setShared2nd({ position: '2nd', studentName: '', studentClass: '', houseId: 'NOVA' });
      setShared3rd({ position: '3rd', studentName: '', studentClass: '', houseId: 'NOVA' });
      setShow2nd(false);
      setShow3rd(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert('Submit failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const MEDAL: Record<string, string> = { '1st': '🥇', '2nd': '🥈', '3rd': '🥉' };

  return (
    <div className="space-y-5 text-left">

      {/* ── PRIMARY: Manual Result Entry — always open ── */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-2xs overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-black/6 bg-[#FAF8F5]">
          <Plus className="w-4 h-4 text-[#F59E0B]" />
          <span className="font-sans-manrope font-extrabold text-sm text-[#111111]">Manual Result Entry</span>
        </div>

        {manualOpen && (
          <div className="px-5 pb-5 border-t border-black/6">

            {/* ── Add New Competition ── */}
            <div className="mt-4 rounded-xl border border-dashed border-[#F59E0B]/50 bg-amber-50/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setAddCompOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#F59E0B]" />
                  <span className="font-sans-manrope font-extrabold text-xs text-[#111111]">Add New Competition / Category</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Connected to Database
                  </span>
                </div>
                {addCompOpen ? <ChevronUp className="w-4 h-4 text-[#5F5F5F]" /> : <ChevronDown className="w-4 h-4 text-[#5F5F5F]" />}
              </button>

              {addCompOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-amber-100">
                  <p className="text-[11px] text-amber-800 font-sans-manrope mt-3">
                    Add a competition not in the list. It will be saved to the database and appear in the dropdown below for result entry.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Competition Name</label>
                      <input
                        type="text"
                        value={newCompName}
                        onChange={(e) => setNewCompName(e.target.value)}
                        placeholder="e.g. Hindi Story Writing"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope text-[#111111]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Category</label>
                      <select
                        value={newCompCategory}
                        onChange={(e) => setNewCompCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope text-[#111111]"
                      >
                        <option value="">Select Arts Type...</option>
                        <option value="Dance">Dance</option>
                        <option value="Music">Music</option>
                        <option value="Drama">Drama / Theatre</option>
                        <option value="Literary">Literary</option>
                        <option value="Art">Fine Arts</option>
                        <option value="House Item">House Item</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Level / Section</label>
                      <select
                        value={newCompLevel}
                        onChange={(e) => setNewCompLevel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope text-[#111111]"
                      >
                        <option value="">Select Level...</option>
                        <option value="Cat I">Cat I (LP)</option>
                        <option value="Cat II">Cat II (UP)</option>
                        <option value="Cat III">Cat III (HS)</option>
                        <option value="Cat IV">Cat IV (HSS)</option>
                        <option value="General">General (All)</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomCompetition}
                    disabled={!newCompName.trim() || !newCompCategory || !newCompLevel || isAddingComp}
                    className="px-5 py-2 rounded-xl bg-[#F59E0B] hover:bg-amber-500 text-white font-sans-manrope font-bold text-xs cursor-pointer transition-colors disabled:opacity-40"
                  >
                    {isAddingComp ? 'Adding...' : '+ Add to List'}
                  </button>
                  <button
                    type="button"
                    onClick={cleanupConflictingEvents}
                    className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-sans-manrope font-bold text-xs cursor-pointer transition-colors"
                    title="Remove custom competitions that conflict with house events"
                  >
                    🧹 Cleanup Conflicts
                  </button>
                  {newCompAddedMsg && (
                    <p className="text-[11px] font-bold text-emerald-700">{newCompAddedMsg}</p>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">

              {/* Competition selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-[#5F5F5F] uppercase tracking-wider">Competition</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-black/10 text-xs font-sans-manrope text-[#111111]"
                  style={{ colorScheme: 'light' }}
                  required
                >
                  <option value="" disabled className="bg-white text-[#111111]">-- Select Competition --</option>
                  {allSelectableEvents.map((e) => (
                    <option key={e.id} value={e.id} className="bg-white text-[#111111]">{e.eventName}</option>
                  ))}
                </select>
                {selectedEvt && (
                  <p className="text-[10px] text-[#5F5F5F] mt-1">
                    <span className="font-bold text-blue-600">Event ID: {selectedEvt.id}</span>
                    <span className="ml-2">{selectedEvt.category}</span>
                    {selectedEvt.competitionType && (
                      <span className="ml-2 text-[#FF5E84] font-bold">
                        ({compType === 'group' ? 'Group: 20/15/10 pts' : compType === 'team' ? 'Team (PPT): 10/7/5 pts' : 'Individual: 10/7/5 pts'})
                      </span>
                    )}
                    <span className="ml-2 text-blue-600 font-bold">
                      · {selectedEvt.houseWise ? 'House Competition' : 'Individual Competition'}
                    </span>
                    {isHouseGroupEvent && <span className="ml-2 text-purple-600 font-bold">· House Group Event (No student names)</span>}
                    {isNonHouse && <span className="ml-2 text-amber-600 font-bold">· Non-house event</span>}
                  </p>
                )}
              </div>

              {/* 3-position rows */}
              <div className="space-y-3">
                {placements.map((row, idx) => (
                  <div key={row.position} className="space-y-2">
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-black/8 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{MEDAL[row.position]}</span>
                        <span className="font-sans-manrope font-extrabold text-xs text-[#111111]">
                          {row.position === '1st' ? '1st Place' : row.position === '2nd' ? '2nd Place' : '3rd Place'}
                        </span>
                        <span className="ml-auto text-[10px] font-bold text-[#FF5E84]">
                          <Lock className="w-2.5 h-2.5 inline mr-0.5" />+{getPoints(row.position)} pts
                        </span>
                        {/* Shared toggle for 2nd and 3rd */}
                        {row.position === '2nd' && (
                          <button type="button" onClick={() => setShow2nd(v => !v)}
                            className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold border cursor-pointer transition-all ${show2nd ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-[#5F5F5F] border-black/10 hover:bg-blue-50 hover:text-blue-700'}`}>
                            {show2nd ? '✓ Shared 2nd' : '+ Shared 2nd'}
                          </button>
                        )}
                        {row.position === '3rd' && (
                          <button type="button" onClick={() => setShow3rd(v => !v)}
                            className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold border cursor-pointer transition-all ${show3rd ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-white text-[#5F5F5F] border-black/10 hover:bg-orange-50 hover:text-orange-700'}`}>
                            {show3rd ? '✓ Shared 3rd' : '+ Shared 3rd'}
                          </button>
                        )}
                      </div>
                      <div className={`grid ${isHouseGroupEvent ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-2`}>
                        {!isHouseGroupEvent && (
                          <>
                            <input type="text" placeholder="Student Name" value={row.studentName}
                              onChange={(e) => updatePlacement(idx, 'studentName', e.target.value)}
                              className="px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope text-[#111111]" />
                            <input type="text" placeholder="Class (e.g. 9A)" value={row.studentClass}
                              onChange={(e) => updatePlacement(idx, 'studentClass', e.target.value.toUpperCase())}
                              className="px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope text-[#111111]" />
                          </>
                        )}
                        <select value={row.houseId} onChange={(e) => updatePlacement(idx, 'houseId', e.target.value)}
                          style={{ colorScheme: 'light' }}
                          className="px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-sans-manrope font-bold text-[#111111]">
                          {isNonHouse ? 
                            [{ value: 'NONE', label: '⚪ No House (Individual)' }].map((h) => (
                              <option key={h.value} value={h.value} className="bg-white text-[#111111]">{h.label}</option>
                            )) :
                            HOUSES.filter(h => h.value !== 'NONE').map((h) => (
                              <option key={h.value} value={h.value} className="bg-white text-[#111111]">{h.label}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>

                    {/* Shared 2nd row */}
                    {row.position === '2nd' && show2nd && (
                      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🥈</span>
                          <span className="font-sans-manrope font-extrabold text-xs text-blue-800">Shared 2nd Place — Second Student</span>
                        </div>
                        <div className={`grid ${isHouseGroupEvent ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-2`}>
                          {!isHouseGroupEvent && (
                            <>
                              <input type="text" placeholder="Student Name" value={shared2nd.studentName}
                                onChange={(e) => setShared2nd(p => ({ ...p, studentName: e.target.value }))}
                                className="px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-sans-manrope text-[#111111]" />
                              <input type="text" placeholder="Class (e.g. 9A)" value={shared2nd.studentClass}
                                onChange={(e) => setShared2nd(p => ({ ...p, studentClass: e.target.value.toUpperCase() }))}
                                className="px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-sans-manrope text-[#111111]" />
                            </>
                          )}
                          <select value={shared2nd.houseId} onChange={(e) => setShared2nd(p => ({ ...p, houseId: e.target.value as HouseId }))}
                            style={{ colorScheme: 'light' }}
                            className="px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-sans-manrope font-bold text-[#111111]">
                            {isNonHouse ? 
                              [{ value: 'NONE', label: '⚪ No House (Individual)' }].map((h) => (
                                <option key={h.value} value={h.value} className="bg-white text-[#111111]">{h.label}</option>
                              )) :
                              HOUSES.filter(h => h.value !== 'NONE').map((h) => (
                                <option key={h.value} value={h.value} className="bg-white text-[#111111]">{h.label}</option>
                              ))
                            }
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Shared 3rd row */}
                    {row.position === '3rd' && show3rd && (
                      <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🥉</span>
                          <span className="font-sans-manrope font-extrabold text-xs text-orange-800">Shared 3rd Place — Second Student</span>
                        </div>
                        <div className={`grid ${isHouseGroupEvent ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-2`}>
                          {!isHouseGroupEvent && (
                            <>
                              <input type="text" placeholder="Student Name" value={shared3rd.studentName}
                                onChange={(e) => setShared3rd(p => ({ ...p, studentName: e.target.value }))}
                                className="px-3 py-2 rounded-xl bg-white border border-orange-200 text-xs font-sans-manrope text-[#111111]" />
                              <input type="text" placeholder="Class (e.g. 9A)" value={shared3rd.studentClass}
                                onChange={(e) => setShared3rd(p => ({ ...p, studentClass: e.target.value.toUpperCase() }))}
                                className="px-3 py-2 rounded-xl bg-white border border-orange-200 text-xs font-sans-manrope text-[#111111]" />
                            </>
                          )}
                          <select value={shared3rd.houseId} onChange={(e) => setShared3rd(p => ({ ...p, houseId: e.target.value as HouseId }))}
                            style={{ colorScheme: 'light' }}
                            className="px-3 py-2 rounded-xl bg-white border border-orange-200 text-xs font-sans-manrope font-bold text-[#111111]">
                            {isNonHouse ? 
                              [{ value: 'NONE', label: '⚪ No House (Individual)' }].map((h) => (
                                <option key={h.value} value={h.value} className="bg-white text-[#111111]">{h.label}</option>
                              )) :
                              HOUSES.filter(h => h.value !== 'NONE').map((h) => (
                                <option key={h.value} value={h.value} className="bg-white text-[#111111]">{h.label}</option>
                              ))
                            }
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  {successMsg}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!selectedEventId || submitting}
                  className="px-6 py-2.5 rounded-xl gradient-btn-primary text-white font-sans-manrope font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish All Results →'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── OCR Drafts Queue ── */}
      {resultDrafts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-amber-400/30 shadow-2xs space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-500" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">OCR Drafts Awaiting Review</h4>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">{resultDrafts.length} pending</span>
          </div>
          <div className="space-y-2">
            {resultDrafts.map((draft) => {
              const hasLowConf = draft.results.some(r => r.confidence === 'low' || r.confidence === 'medium');
              return (
                <div key={draft.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-black/6">
                  <div className="min-w-0">
                    <p className="font-sans-manrope font-bold text-xs text-[#111111] truncate">{draft.eventName}</p>
                    <p className="text-[11px] text-[#5F5F5F] mt-0.5">{draft.results.length} placement{draft.results.length !== 1 ? 's' : ''} extracted</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasLowConf ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Needs Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Ready
                      </span>
                    )}
                    <button
                      className="px-3.5 py-1.5 rounded-xl bg-[#111111] text-white font-bold text-[11px] cursor-pointer hover:bg-black transition-colors"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-ocr-review', { detail: { draftId: draft.id } }))}
                    >Review →</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Results Queue ── */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/6">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#F59E0B]" />
            <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">Results Queue</h4>
          </div>
          <span className="text-xs text-[#5F5F5F] font-bold">{results.length} total</span>
        </div>
        {results.length === 0 ? (
          <div className="px-5 py-10 text-center text-[#5F5F5F] font-sans-manrope text-xs">
            No results submitted yet. Use the OCR scanner or manual entry above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans-manrope border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#5F5F5F] uppercase text-[10px] font-extrabold">
                  <th className="py-2.5 px-4">Event</th>
                  <th className="py-2.5 px-4">Participant</th>
                  <th className="py-2.5 px-4">House</th>
                  <th className="py-2.5 px-4">Position</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {results.map((r) => {
                  const hInfo = houseColors[r.houseId as HouseId];
                  return (
                    <tr key={r.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-bold text-[#111111]">{r.eventTitle}</td>
                      <td className="py-3 px-4 text-[#333]">{r.participantName}</td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: hInfo?.lightBg, color: hInfo?.text }}>
                          {r.houseId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold">{r.position} {r.houseId !== 'NONE' && r.points > 0 && <span className="text-[#FF5E84]">+{r.points}pts</span>}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'Verified' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{r.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {r.status === 'Pending Review' && (
                          <button onClick={() => verifyResult(r.id)}
                            className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] cursor-pointer">
                            <Eye className="w-3 h-3 inline mr-1" />Verify
                          </button>
                        )}
                        {r.status !== 'Published' && (
                          <button onClick={() => publishResult(r.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] cursor-pointer">
                            <CheckCircle className="w-3 h-3 inline mr-1" />Publish
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete result for ${r.participantName} (${r.position} in ${r.eventTitle})?\n\nThis will retract the result and post a live notice to attendees.`)) {
                              await deleteResult(r.id);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] cursor-pointer"
                          title="Delete & retract result"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
