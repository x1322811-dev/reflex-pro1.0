import React from 'react';
import { GameState } from '../types';
import { RotateCcw, Zap, MousePointer2, LogIn, User } from 'lucide-react';

interface GameBlockProps {
  gameState: GameState;
  onClick: () => void;
  lastTime?: number;
  currentRound: number;
  totalRounds: number;
  onLogin?: () => void; // 登录回调函数
  isLoggedIn?: boolean; // 是否已登录
  loginType?: string; // 登录类型
}

export const GameBlock: React.FC<GameBlockProps> = ({ 
  gameState, 
  onClick, 
  lastTime, 
  currentRound, 
  totalRounds,
  onLogin,
  isLoggedIn,
  loginType
}) => {
  
  const getContent = () => {
    switch (gameState) {
      case GameState.IDLE:
        return (
          <div className="text-center animate-fade-in px-6">
            <Zap className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-6 text-yellow-400 drop-shadow-lg" />
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">Reflex Pro</h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-sm md:max-w-md mx-auto leading-relaxed">
              测试你的反应速度 屏幕变绿时立即点击
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center space-x-3 text-blue-200 bg-white/10 py-3 px-6 rounded-full mx-auto w-fit backdrop-blur-md border border-white/10 shadow-lg">
                 <MousePointer2 size={18} /> <span className="font-semibold">点击开始</span>
              </div>
              
              {/* 登录状态和登录按钮 */}
              {onLogin && (
                <div className="mt-4">
                  {isLoggedIn ? (
                    <div className="flex items-center gap-2 text-sm text-blue-300">
                      <User className="w-4 h-4" />
                      <span>已登录: {loginType?.toUpperCase()}</span>
                    </div>
                  ) : (
                    <button
                      onClick={onLogin}
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-black/20 py-2 px-4 rounded-full backdrop-blur-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>登录保存成绩</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case GameState.WAITING:
        return (
          <div className="text-center px-4">
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">等待变绿...</h2>
             <p className="text-white/60 text-lg md:text-xl">稳住...</p>
          </div>
        );
      case GameState.READY:
        return (
          <div className="text-center scale-110 transition-transform duration-75 px-4">
             <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-widest drop-shadow-xl">点!!!</h2>
          </div>
        );
      case GameState.TOO_EARLY:
        return (
          <div className="text-center animate-shake px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">太早了</h2>
            <p className="text-white/80 text-lg mb-8">屏幕变绿再点</p>
            <div className="text-white/70 text-base bg-black/20 py-3 px-6 rounded-full inline-flex items-center justify-center gap-2 backdrop-blur-sm">
              <RotateCcw size={18}/>点击重试
            </div>
          </div>
        );
      case GameState.RESULT:
        return (
          <div className="text-center px-4">
            <div className="flex items-baseline justify-center mb-2">
              <span className="text-7xl md:text-9xl font-mono font-bold text-white tracking-tighter">{lastTime}</span>
              <span className="text-3xl md:text-5xl text-white/60 ml-2 font-medium">ms</span>
            </div>
            <p className="text-blue-100 text-lg md:text-2xl mb-12 font-medium opacity-80">
               第 {currentRound} 轮 / 共 {totalRounds} 轮
            </p>
            <div className="text-white/50 text-sm md:text-base animate-pulse uppercase tracking-widest font-semibold">点击继续</div>
          </div>
        );
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (gameState) {
      case GameState.IDLE: return 'bg-slate-900';
      case GameState.WAITING: return 'bg-red-600';
      case GameState.READY: return 'bg-emerald-500 active:bg-emerald-400'; // Add active state for touch feedback
      case GameState.TOO_EARLY: return 'bg-blue-600';
      case GameState.RESULT: return 'bg-slate-800';
      default: return 'bg-slate-900';
    }
  };

  return (
    <div 
      onPointerDown={onClick} // Replaces onMouseDown/onClick for faster mobile response
      className={`
        w-full h-[100dvh] flex items-center justify-center flex-col
        transition-colors duration-100 ease-in-out select-none
        ${getBgColor()} 
        cursor-pointer
        touch-manipulation
      `}
    >
      {getContent()}
    </div>
  );
};