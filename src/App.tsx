import React, { useState, useEffect } from 'react';
import { 
  getWeekIndexForDate, 
  getWeekendRange, 
  getAssignmentsForWeek, 
  CHORE_KEYS 
} from './utils/rotation';
import { ChoreKey, Assignment } from './types';
import { 
  Settings, 
  X, 
  Calendar,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  RotateCcw,
  RefreshCw
} from 'lucide-react';

// Chores mapping with icons and description emojis
const CHORES_METADATA: Record<ChoreKey, { title: string; emoji: string; color: string; desc: string }> = {
  brushing: {
    title: "Varrer o Chão",
    emoji: "🧹",
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/20",
    desc: "Varrer a sujidade solta, tirar teias de aranha e limpar os cantos"
  },
  mopping: {
    title: "Lavar o Chão",
    emoji: "🧼",
    color: "text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-950/20",
    desc: "Passar a esfregona nos mosaicos com desinfetante multiusos"
  },
  dusting: {
    title: "Limpar o Pó",
    emoji: "💨",
    color: "text-amber-400 border-amber-500/30 bg-amber-950/20",
    desc: "Limpar a consola da TV, ecrãs, ventiladores e setups"
  },
  vacuuming: {
    title: "Aspirar Tapetes",
    emoji: "⚡️",
    color: "text-green-400 border-green-500/30 bg-green-950/20",
    desc: "Aspirar carpetes, tapetes, dobras do sofá e rodapés"
  }
};

const FAMILY_AVATARS = ["🕶️", "🦁", "🦊", "🍕"];

export default function App() {
  // --- BROTHERS NAME STATE ---
  const [brotherNames, setBrotherNames] = useState<string[]>(() => {
    const saved = localStorage.getItem('weekend_cleaning_brothers');
    return saved ? JSON.parse(saved) : ['Liam', 'Noah', 'Oliver', 'Elijah'];
  });

  // --- PRESENT REGISTER COUNT ---
  const [presentCount, setPresentCount] = useState<number>(() => {
    const saved = localStorage.getItem('weekend_cleaning_present_count');
    return saved ? parseInt(saved, 10) : 4;
  });

  // --- ABSENT BROTHER INDEX ---
  const [absentBrotherIndex, setAbsentBrotherIndex] = useState<number>(() => {
    const saved = localStorage.getItem('weekend_cleaning_absent_index');
    return saved ? parseInt(saved, 10) : 3;
  });

  // --- CALENDAR CONTROL ---
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const currentRealWeekIndex = getWeekIndexForDate(new Date());
  const activeWeekIndex = currentRealWeekIndex + weekOffset;

  // --- OVERLAYS TRIGGER STATE ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Settings temporary input buffer
  const [tempNames, setTempNames] = useState<string[]>([...brotherNames]);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Local storage effects
  useEffect(() => {
    localStorage.setItem('weekend_cleaning_present_count', presentCount.toString());
  }, [presentCount]);

  useEffect(() => {
    localStorage.setItem('weekend_cleaning_absent_index', absentBrotherIndex.toString());
  }, [absentBrotherIndex]);

  const activeWeekendRange = getWeekendRange(activeWeekIndex);
  const activeAssignments = getAssignmentsForWeek(
    activeWeekIndex,
    brotherNames,
    presentCount,
    absentBrotherIndex
  );

  // Date range formatted nicely
  const getFormattedDate = () => {
    const sat = activeWeekendRange.sat;
    const sun = activeWeekendRange.sun;
    const satM = sat.toLocaleString('pt-PT', { month: 'short' });
    const sunM = sun.toLocaleString('pt-PT', { month: 'short' });
    const satD = sat.getDate();
    const sunD = sun.getDate();
    const year = sat.getFullYear();

    if (satM === sunM) {
      return `Fim de semana de ${satD} a ${sunD} de ${satM}, ${year}`;
    }
    return `Fim de semana de ${satD} de ${satM} a ${sunD} de ${sunM}, ${year}`;
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempNames.some(n => !n.trim())) {
      setSettingsError("Tens de preencher os 4 nomes para que a rotação funcione! ⚠️");
      return;
    }
    const unique = Array.from(new Set(tempNames.map(n => n.trim().toLowerCase())));
    if (unique.length !== 4) {
      setSettingsError("Cada irmão tem de ter um nome único! 💎");
      return;
    }
    const validated = tempNames.map(n => n.trim());
    setBrotherNames(validated);
    localStorage.setItem('weekend_cleaning_brothers', JSON.stringify(validated));
    setSettingsError(null);
    setIsSettingsOpen(false);
  };

  // Open settings with current names sync
  const handleOpenSettings = () => {
    setTempNames([...brotherNames]);
    setSettingsError(null);
    setIsSettingsOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#05070f] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200 overflow-x-hidden flex flex-col justify-between">
      
      {/* Cyber Grid Background lines */}
      <div className="absolute inset-0 cyber-grid-overlay pointer-events-none z-0 opacity-40" />

      {/* Radiant ambient lights blur background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-[100px] pointer-events-none z-0" />

      {/* HEADER BAR */}
      <header className="relative z-10 max-w-lg mx-auto w-full px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">⚡️</span>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase text-glow-cyan">
              CYBER NEON
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
              🧹 ROTAÇÃO DE LIMPEZA
            </p>
          </div>
        </div>

        {/* Glowing settings cog */}
        <button
          id="neon-settings-btn"
          onClick={handleOpenSettings}
          className="relative group p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:border-cyan-400 active:scale-95 shadow-[0_0_10px_rgba(0,243,255,0.15)]"
          title="Configurar nomes dos irmãos"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        </button>
      </header>

      {/* MAIN LAYOUT */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-6 py-6">
        
        {/* NEON CONTROL PANEL */}
        <div className="w-full bg-[#0b0e1b]/90 border border-slate-800 rounded-3xl p-6 shadow-[2px_4px_30px_rgba(0,0,0,0.4)] relative">
          
          {/* Glowing cyber strip corner */}
          <div className="absolute top-0 right-10 transform -translate-y-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest bg-cyan-500 text-slate-950 uppercase shadow-[0_0_15px_#00f3ff]">
            SISTEMA ATIVO
          </div>

          <h2 className="text-lg font-bold text-white text-center tracking-tight mb-5 flex items-center justify-center gap-1.5">
            👾 <span>ROTAÇÃO DE FIM DE SEMANA</span>
          </h2>

          {/* Sibling names marquee summary */}
          <div className="grid grid-cols-4 gap-1.5 mb-6">
            {brotherNames.map((name, idx) => {
              const isAbsent = presentCount === 3 && absentBrotherIndex === idx;
              return (
                <div 
                  key={idx}
                  className={`py-2 px-1 text-center rounded-xl border text-[11px] font-mono transition-all ${
                    isAbsent 
                      ? 'border-red-500/20 bg-red-950/20 text-red-400/60 line-through' 
                      : 'border-slate-800 bg-[#0e1225] text-slate-300 font-semibold'
                  }`}
                >
                  <div className="text-sm mb-0.5">{FAMILY_AVATARS[idx]}</div>
                  <div className="truncate px-0.5">{name}</div>
                </div>
              );
            })}
          </div>

          {/* SWITCH CONTROLLER: 3 vs 4 Brothers */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-mono tracking-wider font-semibold text-slate-400">
                ⚡️ IRMÃOS ATIVOS
              </span>
              <span className="text-xs font-mono font-bold text-glow-cyan text-cyan-400">
                {presentCount} PRESENTES
              </span>
            </div>

            {/* Glowing Custom Switch Track */}
            <div className="flex p-1 bg-[#05070e] border border-slate-800 rounded-xl">
              <button
                id="toggle-mode-3"
                type="button"
                onClick={() => setPresentCount(3)}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                  presentCount === 3 
                    ? 'bg-gradient-to-r from-red-600/20 to-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🍿 Modo 3 Irmãos
              </button>
              <button
                id="toggle-mode-4"
                type="button"
                onClick={() => setPresentCount(4)}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                  presentCount === 4 
                    ? 'bg-gradient-to-r from-cyan-600/20 to-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🦁 Modo 4 Irmãos
              </button>
            </div>

            {/* Select who is absent when in 3 brother mode */}
            {presentCount === 3 && (
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 animate-fadeIn">
                <span className="block text-[10px] font-mono tracking-wider text-rose-500 font-bold mb-2">
                  🏖️ ESCOLHE QUEM ESTÁ DE QUARENTENA/FOLGA:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {brotherNames.map((name, idx) => (
                    <button
                      key={idx}
                      id={`absent-btn-${idx}`}
                      type="button"
                      onClick={() => setAbsentBrotherIndex(idx)}
                      className={`py-1.5 px-0.5 text-center rounded-xl text-xs font-bold transition-all border ${
                        absentBrotherIndex === idx
                          ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE DATE PICKER FOR THE ROTATION */}
          <div className="flex items-center justify-between bg-[#05070e] border border-slate-800 p-3.5 rounded-2xl mb-8">
            <button
              id="date-prev"
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-850 hover:border-cyan-500/50 text-slate-400 hover:text-white transition-all active:scale-90"
              title="Semana Anterior"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>

            <div className="text-center">
              <span className="block text-[9px] font-mono font-bold tracking-widest text-cyan-400 uppercase text-glow-cyan">
                COBERTURA DA LIMPEZA
              </span>
              <span className="text-xs font-bold text-slate-100 flex items-center justify-center gap-1.5 mt-0.5">
                📅 {getFormattedDate()}
              </span>
            </div>

            <button
              id="date-next"
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-850 hover:border-cyan-500/50 text-slate-400 hover:text-white transition-all active:scale-90"
              title="Semana Seguinte"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* REVEAL BUTTON */}
          <button
            id="reveal-duties-btn"
            onClick={() => setIsPopupOpen(true)}
            className="w-full relative py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 text-slate-950 font-black tracking-wider text-sm md:text-base uppercase transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_25px_rgba(244,63,94,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] hover:text-white group overflow-hidden"
          >
            {/* Gloss shine reflection effect */}
            <div className="absolute inset-0 w-1/2 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shine_0.75s_ease-in-out_forwards]" />
            ✨ REVELAR TAREFAS DESTE FIM DE SEMANA ✨
          </button>

          {/* Go Back to Current Week helper */}
          {weekOffset !== 0 && (
            <button
              id="reset-to-now-btn"
              onClick={() => setWeekOffset(0)}
              className="w-full text-center text-[10px] font-mono tracking-widest text-pink-400 hover:text-pink-300 hover:underline mt-4 uppercase block"
            >
              ↩ Voltar ao Fim de Semana Atual
            </button>
          )}

        </div>
      </main>

      {/* FOOTER METRIC */}
      <footer className="relative z-10 mt-auto text-center py-6 text-[10px] font-mono text-slate-500 tracking-wider">
        <p>RELAÇÃO DA ROTAÇÃO EM CADEIA • ATUALIZAÇÃO SEMANAL AUTOMÁTICA</p>
        <p className="text-slate-600 mt-1">Módulo do Ciclo: {((activeWeekIndex % 4) + 4) % 4}</p>
      </footer>

      {/* RENDER POPUP SCHEDULE DIALOG */}
      {isPopupOpen && (
        <div id="schedule-popup-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div 
            id="schedule-popup"
            className="w-full max-w-md rounded-3xl bg-[#0b0e1b] border-2 border-fuchsia-500/80 p-6 md:p-8 shadow-[0_0_40px_rgba(217,70,239,0.35)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-fuchsia-400 font-bold uppercase text-glow-pink">
                  REVELAR ESCALA
                </span>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                  🧹 ESCALA DO FIM DE SEMANA
                </h3>
              </div>
              <button
                id="close-popup-btn"
                onClick={() => setIsPopupOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all duration-200 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Date range callout */}
            <div className="mb-5 p-3.5 rounded-2xl bg-fuchsia-950/20 border border-fuchsia-500/20 text-center font-mono text-xs text-fuchsia-300">
              📅 {getFormattedDate()}
            </div>

            {/* Chore list assignments */}
            <div className="space-y-3.5">
              {CHORE_KEYS.map((key) => {
                const metadata = CHORES_METADATA[key];
                const assignment = activeAssignments[key];
                const siblingIndex = assignment.brotherIndex;
                const avatar = FAMILY_AVATARS[siblingIndex];
                
                return (
                  <div 
                    key={key}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${metadata.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0 leading-none">{metadata.emoji}</span>
                      <div className="min-w-0">
                        <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                          {key === 'brushing' ? 'varrer' : key === 'mopping' ? 'lavar' : key === 'dusting' ? 'pó' : 'aspirar'}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate">
                          {metadata.title}
                        </h4>
                        <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                          {metadata.desc}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-xl shadow-inner">
                        <span className="text-xs">{avatar}</span>
                        <span className="text-xs font-black tracking-wide text-white">
                          {assignment.brotherName}
                        </span>
                      </div>
                      {assignment.isCombined && (
                        <span className="block text-[8px] font-mono font-bold text-amber-400 uppercase mt-1 tracking-wider">
                          ⚔️ SERVIÇO DUPLO
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stable Cycle Note */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-400 leading-relaxed flex gap-2">
              <span className="text-xs shrink-0">⛓️</span>
              <p>
                Este ciclo estável atualiza-se automaticamente todas as segundas-feiras. Para manter a integridade semanal, as tarefas rotativas voltarão ao estado inicial ao fim de exatamente <strong>4 semanas</strong>.
              </p>
            </div>

            {/* Quick Next Week shift view insider trigger */}
            <div className="mt-5 flex gap-2.5">
              <button
                id="popup-prev-week"
                onClick={() => setWeekOffset(p => p - 1)}
                className="flex-1 py-2 text-center text-xs font-mono font-bold rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-900 text-slate-350 hover:text-white transition-all"
              >
                ◀ Sem. Anterior
              </button>
              <button
                id="popup-next-week"
                onClick={() => setWeekOffset(p => p + 1)}
                className="flex-1 py-2 text-center text-xs font-mono font-bold rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-900 text-slate-350 hover:text-white transition-all"
              >
                Sem. Seguinte ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER POPUP SETTINS SETUP */}
      {isSettingsOpen && (
        <div id="settings-popup-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <form 
            onSubmit={saveSettings}
            className="w-full max-w-sm rounded-3xl bg-[#0b0e1b] border-2 border-cyan-500/80 p-6 md:p-8 shadow-[0_0_40px_rgba(0,243,255,0.3)] animate-fadeIn"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase text-glow-cyan">
                  CONFIGURAÇÕES
                </span>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                  📝 EDITAR IRMÃOS
                </h3>
              </div>
              <button
                id="close-settings-btn"
                type="button"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all duration-200 active:scale-90"
                onClick={() => setIsSettingsOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instructions */}
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Atualizar estes campos associa novos nomes aos mesmos turnos de rotação para não quebrar a ordem estabelecida.
            </p>

            <div className="space-y-3.5">
              {tempNames.map((name, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xl font-mono shrink-0 w-6 text-center">
                    {FAMILY_AVATARS[index]}
                  </span>
                  
                  <div className="relative flex-1">
                    <input
                      id={`brother-input-${index}`}
                      type="text"
                      className="w-full rounded-2xl border border-slate-800 bg-[#05070e] py-2.5 px-4 text-xs font-semibold text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                      value={name}
                      maxLength={16}
                      onChange={(e) => {
                        const updated = [...tempNames];
                        updated[index] = e.target.value;
                        setTempNames(updated);
                        setSettingsError(null);
                      }}
                      placeholder={`Irmão ${index + 1}`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-mono font-medium text-slate-500">
                      TURNO {index}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {settingsError && (
              <p className="text-[11px] text-rose-500 font-semibold mt-3">
                {settingsError}
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-end mt-6 border-t border-slate-800/80 pt-4">
              <button
                id="cancel-settings-btn"
                type="button"
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
                onClick={() => setIsSettingsOpen(false)}
              >
                Cancelar
              </button>
              <button
                id="save-settings-btn"
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-xl hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                GRAVAR APARATO
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
