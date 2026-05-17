import { NetCoreExportType } from '@lsby/net-core'

export type 菜单项类型 = { title: string; path: string; children?: 菜单项类型[] | undefined }

type 导出 = NetCoreExportType<'菜单项类型', 菜单项类型>
export default 导出
