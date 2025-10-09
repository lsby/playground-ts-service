# playground-ts-service AI 编码指南

## 架构概览

这是一个具有多个部署目标的全栈 TypeScript 应用程序：

- **Web 服务器**：使用 @lsby/net-core 的 Express-like 服务器
- **Electron 桌面应用**：跨平台桌面应用程序
- **安卓应用**：安卓APP
- **命令行应用**：命令行应用

## 项目架构

### 核心组件

1. **数据库层**
   - 使用 Prisma + Kysely 管理 SQLite 数据库
   - Schema 定义在 `prisma/schema.prisma`

2. **接口层**
   - 位于 `src/interface/` 目录
   - 使用 `@lsby/net-core` 框架自动生成API接口列表和类型
   - 所有业务接口位于 `project` 目录，`demo` 目录仅包含示例代码

3. **Web 前端**
   - 位于 `src/web/` 目录
   - 使用自定义Web组件 (`@lsby/ts-web-component`)
   - 组件自动注册系统 (见 `src/web/components/index.ts`)
   - 所有业务组件位于 `project` 目录，`demo` 目录仅包含示例, `layout` 目录则包含常用布局

4. **Electron应用**
   - 主进程入口: `src/electron.ts`

5. **CLI应用**
   - 命令行入口: `src/cli.ts`

## 开发工作流

### 项目约定

1. **API接口定义**
   - 接口定义放在 `src/interface/` 下对应模块目录
   - 接口示例见 `src/interface/demo/`
   - 自动生成接口列表到 `src/interface/interface-list.ts`
   - 自动生成类型定义到 `src/types/interface-type.ts`

2. **Web组件开发**
   - 组件必须放在 `src/web/components/` 目录下
   - 示例组件见 `src/web/components/demo/`
   - 自动生成组件列表到 `src/web/components/index.ts`

## 重要文件参考

- `prisma/schema.prisma`: 数据库模型定义
- `src/types/interface-type.ts`: 自动生成的后端接口定义

## 代码风格

- 除非指定, 否则默认为ts代码
- 对于变量名, 函数名, 类名, 方法名等, 都尽可能使用中文(没错, 是中文)
- 禁止浮动的 Promise：no-floating-promises
- 必须写函数返回类型：explicit-function-return-type
- 必须写类成员访问修饰符：explicit-member-accessibility
- 禁止非空断言：! → no-non-null-assertion
- 永远使用 let，拒绝 var 和 const
- 条件里必须显式布尔值：strict-boolean-expressions
- 禁止对非布尔值取反：no-negation
- 禁止使用 undefined：no-undefined (值等级上用void 0替代)
- 总是考虑数组通过下标取项时可能出现的越界问题, 并做安全检查 (数组若越界, 则值为void 0)
- 总是使用严格的条件判断, 不省略判断条件等于真, 空, null的情况
- 尽可能不要使用简写
- 尽可能使用style属性赋值, 而不是style的cssText文本或textContent文本, 不要使用Object.assign
- 不要删除已有的空值断言, 注释等
- 如果中文变量名或函数名等能表达含义, 就不需要写同样含义的注释了
