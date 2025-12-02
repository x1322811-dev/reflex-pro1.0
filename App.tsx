import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameState, AiFeedback } from './types';
import { GameBlock } from './components/GameBlock';
import { StatsChart } from './components/StatsChart';
import { analyzePerformance } from './services/geminiService';
import { Loader2, RotateCw, Trophy } from 'lucide-react';

const MAX_ROUNDS = 5;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [times, setTimes] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [startTime, setStartTime] = useState(0);
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to get random wait time between 2s and 5s
  const getRandomDelay = () => Math.floor(Math.random() * 3000) + 2000;

  const startRound = useCallback(() => {
    setGameState(GameState.WAITING);
    const delay = getRandomDelay();
    
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setGameState(GameState.READY);
      setStartTime(Date.now());
    }, delay);
  }, []);

  const handleInteraction = () => {
    if (gameState === GameState.IDLE) {
      setTimes([]);
      setRound(1);
      setFeedback(null);
      startRound();
    } 
    else if (gameState === GameState.WAITING) {
      // User clicked too early
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState(GameState.TOO_EARLY);
    } 
    else if (gameState === GameState.TOO_EARLY) {
      // Retry the current round
      startRound();
    } 
    else if (gameState === GameState.READY) {
      // Successful click
      const endTime = Date.now();
      const reactionTime = endTime - startTime;
      const newTimes = [...times, reactionTime];
      setTimes(newTimes);

      if (newTimes.length >= MAX_ROUNDS) {
        setGameState(GameState.FINISHED);
        generateFeedback(newTimes);
      } else {
        setGameState(GameState.RESULT);
        setRound(r => r + 1);
      }
    } 
    else if (gameState === GameState.RESULT) {
      startRound();
    }
  };

  const generateFeedback = async (finalTimes: number[]) => {
    setLoadingAnalysis(true);
    const data = await analyzePerformance(finalTimes);
    setFeedback(data);
    setLoadingAnalysis(false);
  };

  const resetGame = () => {
    setGameState(GameState.IDLE);
    setTimes([]);
    setRound(1);
    setFeedback(null);
  };

  // Keyboard support (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState !== GameState.FINISHED) {
        e.preventDefault(); // Prevent scrolling
        handleInteraction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  if (gameState === GameState.FINISHED) {
    const average = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const best = Math.min(...times);

    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col">
          <div className="text-center mb-6">
            <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">测试结果</h1>
            
            <div className="flex justify-center gap-4 md:gap-8 mt-6">
               <div className="text-center bg-slate-800/50 p-3 rounded-xl min-w-[110px] md:min-w-[140px] md:bg-transparent md:p-0">
                 <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mb-1 font-semibold">平均值</div>
                 <div className="text-3xl md:text-5xl font-mono font-bold text-emerald-400">{average}<span className="text-lg md:text-xl text-emerald-500/70 ml-1">ms</span></div>
               </div>
               <div className="text-center bg-slate-800/50 p-3 rounded-xl min-w-[110px] md:min-w-[140px] md:bg-transparent md:p-0 md:border-l md:border-slate-700 md:pl-8">
                 <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mb-1 font-semibold">最佳</div>
                 <div className="text-3xl md:text-5xl font-mono font-bold text-blue-400">{best}<span className="text-lg md:text-xl text-blue-500/70 ml-1">ms</span></div>
               </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 md:p-6 mb-4 md:mb-6 min-h-[160px] flex flex-col justify-center relative overflow-hidden border border-white/5">
            {loadingAnalysis ? (
              <div className="flex items-center justify-center gap-3 text-slate-400 animate-pulse">
                <Loader2 className="animate-spin w-5 h-5" /> 分析中...
              </div>
            ) : feedback ? (
              <div className="animate-fade-in mb-0">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-purple-400 text-xs md:text-sm font-bold uppercase tracking-wider bg-purple-400/10 px-2 py-1 rounded">段位</span>
                   <span className="text-xl md:text-2xl font-bold text-white">{feedback.rank}</span>
                </div>
                <p className="text-slate-300 italic text-base md:text-lg leading-relaxed">"{feedback.comment}"</p>
              </div>
            ) : null}
          </div>

          <StatsChart data={times} />

          <button 
            onClick={resetGame}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 md:py-4 px-6 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-900/20"
          >
            <RotateCw className="w-5 h-5 md:w-6 md:h-6" /> 再测一次
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden touch-none">
      <GameBlock 
        gameState={gameState} 
        onClick={handleInteraction}
        lastTime={times[times.length - 1]}
        currentRound={round}
        totalRounds={MAX_ROUNDS}
      />
      
      {/* Floating Indicators for non-idle states */}
      {gameState !== GameState.IDLE && (
         <div className="absolute top-8 md:top-12 left-0 w-full flex justify-center pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md text-white/90 px-5 py-2 rounded-full text-sm md:text-base font-semibold border border-white/10 shadow-lg">
               第 {round} / {MAX_ROUNDS} 轮
            </div>
         </div>
      )}
    </div>
  );
};

export default App;