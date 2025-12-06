# lsby-playground-ts-service AI 编码指南

## 架构概览

这是一个具有多个部署目标的全栈 TypeScript 应用程序:

- **Web 服务器**: Express-like 服务器
- **桌面应用**: 使用 Electron 编译的桌面应用
- **安卓应用**: 使用 Capacitor 编译的安卓应用
- **命令行应用**: 命令行应用

## 项目架构

1. **数据库层**

- 使用 Prisma + Kysely 管理数据库
- Schema 定义在 `prisma/schema.prisma`
- 应用 Prisma 时会生成 Kysely 使用的类型: `src/types/db.ts`

2. **接口层**

- 接口: `src/interface/`
  - 接口示例: `src/interface/demo`
- 通用接口抽象: `src/interface-logic`
- 系统会自动生成接口列表: `src/interface/interface-list.ts`
- 系统会自动生成接口类型: `src/types/interface-type.ts`
- 接口可以在内部被调用, 参考 `src/interface/demo/base/sub/index.ts` 对 `src/interface/demo/base/add/index.ts` 的调用

3. **任务系统**

- 即时任务: `src/job/instant-job/`
  - 抽象类: `src/model/instant-job/instant-job.ts`
  - 管理器: `src/model/instant-job/instant-job-manager.ts`
  - 支持优先级、重试机制和并发控制
- 定时任务: `src/job/scheduled-job/`
  - 抽象类: `src/model/scheduled-job/scheduled-job.ts`
  - 管理器: `src/model/scheduled-job/scheduled-job-manager.ts`
  - 使用cron表达式进行调度

4. **Web 前端**

- 前端代码: `src/web/`
- 前端使用自封装的 Web Components 框架: `src/web/base/base.ts`
- 前端组件: `src/web/components`
  - 示例组件: `src/web/components/demo`
  - 通用组件: `src/web/components/general`
  - 基础通用组件: `src/web/components/general/base`
  - 基础表单组件: `src/web/components/general/form`
  - 常用布局: `src/web/components/layout`
  - 机制组件: `src/web/components/mechanics`
  - 流程控制: `src/web/components/process`
  - 项目组件: `src/web/components/project`
- 前端全局样式: `src/web/global/style`
- 前端全局管理器: `src/web/global/manager`
  - 包含提示框管理器, 对话框管理器, 吐司消息管理器, API 管理器, 日志管理器等
- 前端页面入口: `src/web/page`
  - 包含多个 html 入口, 每个 html 文件对应一个 url
  - 演示页面: `src/web/page/demo.html`
- 系统会自动生成组件列表: `src/web/components/index.ts`

4. **Electron应用**

- 主进程入口: `src/electron.ts`
- 相关功能函数和类型: `src/electron`

5. **CLI应用**

- 命令行入口: `src/cli.ts`

## 开发工作流

### 项目约定

1. **API接口定义**

- 接口的输入和返回值不要使用中文
- 尽可能写 post 接口而不是 get 接口

2. **Web组件开发**

- 组件的注册名不要使用中文
- 尽可能复用通用组件: `src/web/components/general`, 便于统一样式和行为
- 尽可能复用基础通用组件: `src/web/components/general/base`, 便于统一样式和行为
- 尽可能复用基础表单组件: `src/web/components/general/form`, 便于统一样式和行为
- 尽可能复用常用布局: `src/web/components/layout`
- 尽可能使用工厂函数创建元素: `src/web/global/tools/create-element.ts`
- 不要直接使用`document.createElement`, 这会丢失类型信息, 对于自定义组件, 可以直接new出来
- 支持黑暗模式: `src/web/global/style/global.css` 内定义了相关 CSS 变量
- 使用路由机制处理兄弟组件通信:
  - 路由模型: `src/web/components/mechanics/route.ts`
  - 示例组件: `src/web/components/demo/pong.ts`, `src/web/components/demo/pong.ts`
  - 在html层组合: `src/web/page/demo.html`
- 使用 `src/web/global/api-manager.ts` 来请求后端
  这是一个包装过的http请求, 第三个参数是一个回调, 可以直接获得后端ws的推送信息

3. **其他**

- 使用 pnpm 安装依赖
- 使用 `npm run _check:type` 进行类型检查, 而不是 `_持续类型检查`

## 重要文件参考

- `prisma/schema.prisma`: 数据库模型定义
- `src/types/interface-type.ts`: 自动生成的后端接口类型

## 代码风格

- 除非指定, 否则默认为ts代码
- 对于变量名, 函数名, 类名, 方法名等, 都尽可能使用中文(没错, 是中文)
- 禁止浮动的 Promise: no-floating-promises, 不要使用 void 忽略悬空的 promise
- 必须写函数返回类型: explicit-function-return-type
- 必须写类成员访问修饰符: explicit-member-accessibility
- 禁止非空断言: ! → no-non-null-assertion
- 永远使用 let, 拒绝 var 和 const
- 条件里必须显式布尔值: strict-boolean-expressions
- 禁止对非布尔值取反: no-negation
- 禁止使用 undefined: no-undefined (若必须使用 undefined, 则在值等级上用 void 0 替代)
- 总是考虑数组通过下标取项时可能出现的越界问题, 并做安全检查 (数组若越界, 则值为 void 0)
- 总是使用严格的条件判断, 不省略判断条件等于真, 空, null的情况
- 尽可能不要使用简写
- 尽可能使用style属性赋值, 而不是 cssText 文本或 textContent 文本
- 不要删除已有的空值断言, 注释等
- 如果中文变量名或函数名等能表达含义, 就不需要写同样含义的注释了
- 在不影响逻辑的情况下, 将代码写的尽可能短, 尽量减少不必要的换行
- 写出完整的类型, 尽可能不要使用 any
- 写类型时, 尽可能写 type 而不是 interface
- 尽可能不要用 addEventListener, 而是用 onxxx, 避免回调函数被一直持有造成内存泄漏
