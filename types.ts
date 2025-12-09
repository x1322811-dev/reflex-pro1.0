export enum GameState {
  IDLE = 'IDLE',           // Main menu
  WAITING = 'WAITING',     // User clicked start, waiting for green
  READY = 'READY',         // Green! Click now!
  TOO_EARLY = 'TOO_EARLY', // User clicked on red
  RESULT = 'RESULT',       // Showing time for specific round
  FINISHED = 'FINISHED'    // All rounds done, showing summary
}

export interface ReactionStats {
  average: number;
  fastest: number;
  slowest: number;
  history: number[];
}

export interface AiFeedback {
  rank: string;
  comment: string;
  tips: string;
}

// 登录相关类型
export interface LoginOptions {
  type?: string; // 登录类型 'qqorweixin'/'all'-QQ和微信登录（默认） 'qq'-QQ登录 'weixin'-微信登录 phone huawei
  from?: string; // 登录来源
  userInfo?: Record<string, any>; // 额外数据，传入回调函数参数中
  headerInfo?: {
    iconUrl?: string; // 支持lottie动画
    title?: string; // 富文本主标题
    desc?: string; // 灰字小标题
    headerBg?: string; // 顶部背景
  }; // 登录框顶部展示的信息
  guideWord?: string; // 登录弹窗文案
  isPrivacyAllowed?: number; // 隐私条款、软件许可协议是否已勾选 暂为hippy端参数
}

export interface LoginCallbackParams {
  isLogin: boolean; // 对应账号是否已登录
  userInfo?: Record<string, any>; // 调用接口时传入的userInfo字段
  logintype?: string; // 登录类型（从文档FAQ中推断）
}

export interface IsLoginResult {
  hasLogin: boolean; // 是否登录
}

export interface UserLoginState {
  isLoggedIn: boolean;
  loginType?: string;
  userInfo?: Record<string, any>;
}

// 排行榜相关类型

export interface UserInfo {
  nick: string;      // 用户昵称
  head_url: string;  // 用户头像URL
  suid: string;      // 用户标识
  openid: string;    // OpenID
}

export interface Ranking {
  score: number;     // 分数
  rank: number;      // 排名
}

export interface BestRank {
  score: number;     // 最佳分数
  rank: number;      // 最佳排名
}

export interface RankingBoardItem {
  ranking: Ranking;  // 排名信息
  user_info: UserInfo; // 用户信息
}

export interface RankingData {
  ranking_size: number;        // 总参与人数
  less_score_count: number;    // 分数低于我的人数
  best_rank: BestRank;         // 我的历史最佳成绩
  ranking_board: RankingBoardItem[]; // 排行榜单
}

export interface RankingResponse {
  code: number;       // 状态码：0=成功
  msg: string;        // 消息
  data: RankingData;  // 排行榜数据
}
