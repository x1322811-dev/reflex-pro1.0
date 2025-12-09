# 获取登录用户信息
## isLogin

JSAPI ✔      Hippy ✔      MSApplet ✘      Flutter ✘

参数列表：
参数名	类型	必填	说明
回调列表：
参数名	类型	必填	说明
hasLogin	boolean	是	是否登录

代码示例：

import { isLogin } from '@tencent/qqnews-jsapi';

isLogin().then(({ hasLogin }) => {
  // ...
});