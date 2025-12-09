import type { RankingResponse } from '../types';

// 开发环境接口地址
const RANKING_API_URL = 'https://dev.inews.qq.com/activity/ranking';

// 反应速度测试的activity_id
const ACTIVITY_ID = 'activity_reflex_test';

/**
 * 从Cookie中获取指定名称的值
 */
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

/**
 * 计算bkn_sign签名
 * 注意：这里需要实际的bkn计算逻辑，但根据文档说明，我们可以直接使用news_token作为演示
 */
const calculateBknSign = (seed: string): number => {
  // 实际项目中需要使用真实的bkn计算逻辑
  // 这里为了演示，我们使用一个简单的哈希算法
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) + seed.charCodeAt(i);
  }
  return Math.abs(hash);
};

/**
 * 根据反应时间计算得分
 * 时间越短，得分越高
 * 公式：100000 - 反应时间（ms）
 */
export const calculateScore = (reactionTime: number): number => {
  // 确保得分不为负数
  return Math.max(0, 100000 - reactionTime);
};

/**
 * 提交分数并获取排行榜数据
 */
export const submitScoreAndGetRanking = async (reactionTime: number, rankingSize: number = 10): Promise<RankingResponse | null> => {
  try {
    // 获取用户的news_token
    const newsToken = getCookie('news_token');
    if (!newsToken) {
      console.error('无法获取news_token');
      return null;
    }

    // 计算得分
    const score = calculateScore(reactionTime);

    // 计算bkn_sign
    const bknSign = calculateBknSign(newsToken);

    // 构建请求参数
    const requestBody = {
      activity_id: ACTIVITY_ID,
      ranking_size: rankingSize,
      score,
      bkn_sign: bknSign
    };

    // 发送请求
    const response = await fetch(RANKING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 确保请求携带完整Cookie
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const data: RankingResponse = await response.json();
    return data;
  } catch (error) {
    console.error('排行榜接口调用失败:', error);
    return null;
  }
};

/**
 * 保存用户的历史最好成绩到本地存储
 */
export const saveBestScore = (reactionTime: number): void => {
  try {
    const bestScoreStr = localStorage.getItem('bestReactionTime');
    const bestScore = bestScoreStr ? parseInt(bestScoreStr, 10) : Infinity;

    if (reactionTime < bestScore) {
      localStorage.setItem('bestReactionTime', reactionTime.toString());
    }
  } catch (error) {
    console.error('保存最佳成绩失败:', error);
  }
};

/**
 * 获取用户的历史最好成绩
 */
export const getBestScore = (): number | null => {
  try {
    const bestScoreStr = localStorage.getItem('bestReactionTime');
    return bestScoreStr ? parseInt(bestScoreStr, 10) : null;
  } catch (error) {
    console.error('获取最佳成绩失败:', error);
    return null;
  }
};
