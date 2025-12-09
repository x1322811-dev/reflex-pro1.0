// 腾讯新闻App登录服务封装
import { LoginOptions, LoginCallbackParams, IsLoginResult } from '../types';

// 检查是否已登录
export const isLogin = async (): Promise<IsLoginResult> => {
  try {
    console.log('[腾讯新闻登录] isLogin API调用开始');
    const startTime = performance.now();
    
    // 检查环境是否为腾讯新闻App
    if (typeof window === 'undefined') {
      console.error('[腾讯新闻登录] 环境错误：window对象未定义');
      return { hasLogin: false };
    }
    
    if (!('TencentNews' in window)) {
      // 非腾讯新闻App环境，返回模拟数据用于开发测试
      console.log('[腾讯新闻登录] 非腾讯新闻App环境，使用模拟数据');
      const mockResult: IsLoginResult = { hasLogin: false };
      const endTime = performance.now();
      logLoginPerformance('isLogin', startTime, endTime, true, 'non-tencent-env');
      return mockResult;
    }
    
    const TencentNews = (window as any).TencentNews;
    
    if (typeof TencentNews.isLogin !== 'function') {
      console.error('[腾讯新闻登录] 错误：TencentNews.isLogin 不是函数');
      return { hasLogin: false };
    }
    
    // 调用isLogin API
    const result = await new Promise<IsLoginResult>((resolve, reject) => {
      try {
        TencentNews.isLogin({
          onCallback: (res: IsLoginResult) => {
            console.log('[腾讯新闻登录] isLogin API回调成功', res);
            resolve(res);
          },
          onError: (error: any) => {
            const errorMsg = `isLogin API回调错误: ${JSON.stringify(error)}`;
            console.error('[腾讯新闻登录]', errorMsg);
            reject(new Error(errorMsg));
          },
          onTimeout: () => {
            const errorMsg = 'isLogin API调用超时';
            console.error('[腾讯新闻登录]', errorMsg);
            reject(new Error(errorMsg));
          }
        });
      } catch (error) {
        const errorMsg = `isLogin API调用异常: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
        console.error('[腾讯新闻登录]', errorMsg);
        reject(new Error(errorMsg));
      }
    });
    
    const endTime = performance.now();
    console.log(`[腾讯新闻登录] isLogin API调用成功，响应时间: ${Math.round(endTime - startTime)}ms`);
    logLoginPerformance('isLogin', startTime, endTime, true);
    return result;
  } catch (error) {
    console.error('[腾讯新闻登录] isLogin调用失败:', error);
    // 出错时返回未登录状态
    return { hasLogin: false };
  }
};

// 执行登录
export const login = async (options?: LoginOptions): Promise<LoginCallbackParams> => {
  try {
    console.log('[腾讯新闻登录] login API调用开始', options);
    const startTime = performance.now();
    
    // 检查环境是否为腾讯新闻App
    if (typeof window === 'undefined') {
      console.error('[腾讯新闻登录] 环境错误：window对象未定义');
      return { isLogin: false };
    }
    
    if (!('TencentNews' in window)) {
      // 非腾讯新闻App环境，返回模拟数据用于开发测试
      console.log('[腾讯新闻登录] 非腾讯新闻App环境，使用模拟数据');
      const mockResult: LoginCallbackParams = {
        isLogin: true,
        userInfo: options?.userInfo,
        logintype: 'qq' // 模拟QQ登录
      };
      const endTime = performance.now();
      logLoginPerformance('login', startTime, endTime, true, 'non-tencent-env');
      return mockResult;
    }
    
    const TencentNews = (window as any).TencentNews;
    
    if (typeof TencentNews.login !== 'function') {
      console.error('[腾讯新闻登录] 错误：TencentNews.login 不是函数');
      return { isLogin: false };
    }
    
    // 调用login API
    const result = await new Promise<LoginCallbackParams>((resolve, reject) => {
      try {
        TencentNews.login({
          ...options,
          onCallback: (res: LoginCallbackParams) => {
            console.log('[腾讯新闻登录] login API回调成功', res);
            resolve(res);
          },
          onError: (error: any) => {
            const errorMsg = `login API回调错误: ${JSON.stringify(error)}`;
            console.error('[腾讯新闻登录]', errorMsg);
            reject(new Error(errorMsg));
          },
          onTimeout: () => {
            const errorMsg = 'login API调用超时';
            console.error('[腾讯新闻登录]', errorMsg);
            reject(new Error(errorMsg));
          },
          onCancel: () => {
            console.log('[腾讯新闻登录] 用户取消了登录');
            resolve({ isLogin: false });
          }
        });
      } catch (error) {
        const errorMsg = `login API调用异常: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
        console.error('[腾讯新闻登录]', errorMsg);
        reject(new Error(errorMsg));
      }
    });
    
    const endTime = performance.now();
    console.log(`[腾讯新闻登录] login API调用成功，响应时间: ${Math.round(endTime - startTime)}ms`);
    logLoginPerformance('login', startTime, endTime, result.isLogin);
    return result;
  } catch (error) {
    const errorMsg = `login调用失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
    console.error('[腾讯新闻登录]', errorMsg);
    logLoginPerformance('login', performance.now() - 100, performance.now(), false, errorMsg);
    // 出错时返回登录失败状态
    return { isLogin: false };
  }
};

// 获取登录类型
export const getLoginType = async (): Promise<string | null> => {
  try {
    console.log('[腾讯新闻登录] 获取登录类型开始');
    const startTime = performance.now();
    
    // 检查是否已登录
    const loginResult = await isLogin();
    if (!loginResult.hasLogin) {
      console.log('[腾讯新闻登录] 未登录，无法获取登录类型');
      logLoginPerformance('getLoginType', startTime, performance.now(), false, 'not-logged-in');
      return null;
    }
    
    // 从cookie中获取logintype（根据文档FAQ）
    if (typeof document !== 'undefined') {
      const cookie = document.cookie;
      const loginTypeMatch = cookie.match(/logintype=([^;]+)/);
      if (loginTypeMatch && loginTypeMatch[1]) {
        const loginType = decodeURIComponent(loginTypeMatch[1]);
        console.log('[腾讯新闻登录] 从cookie获取到登录类型:', loginType);
        logLoginPerformance('getLoginType', startTime, performance.now(), true, 'from-cookie');
        return loginType;
      }
    }
    
    // 尝试通过TencentNews.getUserInfo获取（根据文档FAQ）
    if (typeof window !== 'undefined' && 'TencentNews' in window) {
      const TencentNews = (window as any).TencentNews;
      
      if (typeof TencentNews.getUserInfo === 'function') {
        const userInfo = await new Promise<Record<string, any>>((resolve, reject) => {
          try {
            TencentNews.getUserInfo({
              onCallback: (res: Record<string, any>) => {
                console.log('[腾讯新闻登录] getUserInfo API回调成功', res);
                resolve(res);
              },
              onError: (error: any) => {
                const errorMsg = `getUserInfo API回调错误: ${JSON.stringify(error)}`;
                console.error('[腾讯新闻登录]', errorMsg);
                reject(new Error(errorMsg));
              },
              onTimeout: () => {
                const errorMsg = 'getUserInfo API调用超时';
                console.error('[腾讯新闻登录]', errorMsg);
                reject(new Error(errorMsg));
              }
            });
          } catch (error) {
            const errorMsg = `getUserInfo API调用异常: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
            console.error('[腾讯新闻登录]', errorMsg);
            reject(new Error(errorMsg));
          }
        });
        
        if (userInfo && userInfo.logintype) {
          console.log('[腾讯新闻登录] 从getUserInfo获取到登录类型:', userInfo.logintype);
          logLoginPerformance('getLoginType', startTime, performance.now(), true, 'from-getUserInfo');
          return userInfo.logintype;
        }
      } else {
        console.log('[腾讯新闻登录] TencentNews.getUserInfo 不是函数');
      }
    }
    
    console.log('[腾讯新闻登录] 未获取到登录类型');
    logLoginPerformance('getLoginType', startTime, performance.now(), false, 'not-found');
    return null;
  } catch (error) {
    const errorMsg = `获取登录类型失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
    console.error('[腾讯新闻登录]', errorMsg);
    logLoginPerformance('getLoginType', performance.now() - 100, performance.now(), false, errorMsg);
    return null;
  }
};

// 记录登录相关性能指标
export const logLoginPerformance = (operation: string, startTime: number, endTime: number, success: boolean, error?: string) => {
  const duration = Math.round(endTime - startTime);
  const performanceData = {
    operation,
    duration,
    success,
    error,
    timestamp: new Date().toISOString()
  };
  
  console.log('登录性能日志:', performanceData);
  
  // 这里可以添加更多的性能数据上报逻辑，比如发送到服务器
  // 例如：reportPerformanceData(performanceData);
};
