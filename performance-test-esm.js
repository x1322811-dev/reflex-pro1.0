#!/usr/bin/env node

/**
 * 腾讯新闻登录功能性能测试脚本 (ES模块版本)
 * 用于测试登录相关API的响应时间并生成性能报告
 */

// 导入Node.js模块
import fs from 'fs';
import path from 'path';
import os from 'os';

// 模拟全局window和document对象，用于非浏览器环境测试
if (typeof window === 'undefined') {
  global.window = {};
  global.document = {
    cookie: ''
  };
}

// 模拟登录服务API
const mockLoginService = {
  async isLogin() {
    // 模拟API延迟 (30-100ms)
    const delay = Math.random() * 70 + 30;
    await new Promise(resolve => setTimeout(resolve, delay));
    return false; // 默认未登录状态
  },

  async getLoginType() {
    // 模拟API延迟 (40-120ms)
    const delay = Math.random() * 80 + 40;
    await new Promise(resolve => setTimeout(resolve, delay));
    return 0; // 默认未登录类型
  },

  async login() {
    // 模拟API延迟 (50-150ms)
    const delay = Math.random() * 100 + 50;
    await new Promise(resolve => setTimeout(resolve, delay));
    return true; // 默认登录成功
  }
};

// 性能测试配置
const TEST_CONFIG = {
  iterations: 10, // 测试迭代次数
  delay: 1000, // 每次测试间隔(ms)
  outputFile: './login-performance-report.md' // 报告输出文件
};

// 运行单个API测试
async function runApiTest(api, iteration) {
  const startTime = Date.now();
  let result = {
    api,
    iteration,
    responseTime: 0,
    success: false,
    timestamp: Date.now()
  };

  try {
    switch (api) {
      case 'isLogin':
        await mockLoginService.isLogin();
        break;
      case 'getLoginType':
        await mockLoginService.getLoginType();
        break;
      case 'login':
        // 注意：在实际环境中，login会弹出登录界面，这里仅用于非腾讯新闻环境测试
        await mockLoginService.login();
        break;
      default:
        throw new Error(`未知API: ${api}`);
    }
    
    const endTime = Date.now();
    result.responseTime = endTime - startTime;
    result.success = true;
    
    console.log(`✅ [${api}] 第${iteration + 1}次测试成功，响应时间: ${Math.round(result.responseTime)}ms`);
  } catch (error) {
    const endTime = Date.now();
    result.responseTime = endTime - startTime;
    result.success = false;
    result.error = error.message || String(error);
    
    console.log(`❌ [${api}] 第${iteration + 1}次测试失败，响应时间: ${Math.round(result.responseTime)}ms，错误: ${result.error}`);
  }

  return result;
}

// 计算性能统计
function calculateStats(results, api) {
  const apiResults = results.filter(r => r.api === api);
  const successfulResults = apiResults.filter(r => r.success);
  const responseTimes = successfulResults.map(r => r.responseTime).sort((a, b) => a - b);

  const stats = {
    api,
    totalTests: apiResults.length,
    successfulTests: successfulResults.length,
    failedTests: apiResults.length - successfulResults.length,
    minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
    maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
    averageResponseTime: responseTimes.length > 0 ? 
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0,
    medianResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0
  };

  // 计算中位数
  if (responseTimes.length > 0) {
    const mid = Math.floor(responseTimes.length / 2);
    stats.medianResponseTime = responseTimes.length % 2 !== 0 ? 
      responseTimes[mid] : (responseTimes[mid - 1] + responseTimes[mid]) / 2;

    // 计算p95和p99
    const p95Index = Math.ceil(responseTimes.length * 0.95) - 1;
    const p99Index = Math.ceil(responseTimes.length * 0.99) - 1;
    
    stats.p95ResponseTime = responseTimes[p95Index] || stats.maxResponseTime;
    stats.p99ResponseTime = responseTimes[p99Index] || stats.maxResponseTime;
  }

  return stats;
}

// 生成Markdown报告
function generateMarkdownReport(results) {
  const apis = Array.from(new Set(results.map(r => r.api)));
  const stats = apis.map(api => calculateStats(results, api));
  
  const reportDate = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  let report = `# 腾讯新闻登录功能性能测试报告

**测试日期**: ${reportDate}
**测试环境**: ${typeof window !== 'undefined' && 'TencentNews' in window ? '腾讯新闻App' : '开发环境(模拟数据)'}
**测试配置**:
- 迭代次数: ${TEST_CONFIG.iterations}
- 测试间隔: ${TEST_CONFIG.delay}ms

## 性能统计摘要

| API名称 | 测试总数 | 成功数 | 失败数 | 最小响应时间(ms) | 最大响应时间(ms) | 平均响应时间(ms) | 中位数响应时间(ms) | P95响应时间(ms) | P99响应时间(ms) |
|---------|---------|-------|-------|-----------------|-----------------|-----------------|-------------------|----------------|----------------|`;

  stats.forEach(stat => {
    report += `
| ${stat.api} | ${stat.totalTests} | ${stat.successfulTests} | ${stat.failedTests} | ${stat.minResponseTime.toFixed(2)} | ${stat.maxResponseTime.toFixed(2)} | ${stat.averageResponseTime.toFixed(2)} | ${stat.medianResponseTime.toFixed(2)} | ${stat.p95ResponseTime.toFixed(2)} | ${stat.p99ResponseTime.toFixed(2)} |`;
  });

  report += `

## 详细测试结果

`;

  apis.forEach(api => {
    report += `### ${api} API测试结果

| 迭代次数 | 响应时间(ms) | 状态 | 错误信息 | 时间戳 |
|---------|-------------|------|---------|--------|`;

    const apiResults = results.filter(r => r.api === api);
    apiResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      report += `
| ${result.iteration + 1} | ${result.responseTime.toFixed(2)} | ${status} | ${result.error || '-'} | ${new Date(result.timestamp).toLocaleTimeString()} |`;
    });

    report += `

`;
  });

  // 添加环境信息
  report += `## 环境信息

- Node.js版本: ${process.version}
- 操作系统: ${process.platform} ${process.arch}
- 系统内存: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB

## 性能分析

`;

  stats.forEach(stat => {
    const successRate = (stat.successfulTests / stat.totalTests * 100).toFixed(2);
    report += `### ${stat.api} API分析
- 成功率: ${successRate}%
- 平均响应时间: ${stat.averageResponseTime.toFixed(2)}ms
- 响应时间分布: ${stat.minResponseTime.toFixed(2)}ms ~ ${stat.maxResponseTime.toFixed(2)}ms
`;

    // 添加性能建议
    if (stat.averageResponseTime > 500) {
      report += `- ⚠️  注意：平均响应时间超过500ms，可能需要优化
`;
    } else if (stat.averageResponseTime > 200) {
      report += `- ⚠️  提示：平均响应时间超过200ms，可以考虑优化
`;
    } else {
      report += `- ✅  良好：平均响应时间在可接受范围内
`;
    }

    if (stat.failedTests > 0) {
      report += `- ❌  失败率: ${(stat.failedTests / stat.totalTests * 100).toFixed(2)}%，需要检查错误原因
`;
    } else {
      report += `- ✅  无失败测试
`;
    }

    report += `
`;
  });

  return report;
}

// 主测试函数
async function runPerformanceTests() {
  console.log('🚀 开始腾讯新闻登录功能性能测试...');
  console.log(`📋 测试配置: 迭代${TEST_CONFIG.iterations}次，间隔${TEST_CONFIG.delay}ms`);
  console.log('='.repeat(60));

  const results = [];
  const apis = ['isLogin', 'getLoginType'];

  for (const api of apis) {
    console.log(`\n📡 测试API: ${api}`);
    console.log('-'.repeat(40));

    for (let i = 0; i < TEST_CONFIG.iterations; i++) {
      const result = await runApiTest(api, i);
      results.push(result);
      
      // 最后一次迭代不需要延迟
      if (i < TEST_CONFIG.iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delay));
      }
    }
  }

  console.log('\n'.repeat(2));
  console.log('='.repeat(60));
  console.log('📊 性能测试完成！');
  console.log('='.repeat(60));

  // 生成并保存报告
  try {
    const report = generateMarkdownReport(results);
    const outputPath = path.resolve(TEST_CONFIG.outputFile);
    
    fs.writeFileSync(outputPath, report, 'utf8');
    console.log(`📄 性能测试报告已生成: ${outputPath}`);
    
    // 输出控制台摘要
    console.log('\n📈 测试摘要:');
    const stats = apis.map(api => calculateStats(results, api));
    stats.forEach(stat => {
      const successRate = (stat.successfulTests / stat.totalTests * 100).toFixed(2);
      console.log(`- ${stat.api}: ${successRate}% 成功率，平均响应时间 ${stat.averageResponseTime.toFixed(2)}ms`);
    });

  } catch (error) {
    console.error('❌ 生成报告失败:', error);
    // 直接在控制台输出报告
    console.log('\n--- 性能测试报告 ---');
    console.log(generateMarkdownReport(results));
  }
}

// 运行测试
runPerformanceTests().catch(error => {
  console.error('❌ 性能测试失败:', error);
  process.exit(1);
});
