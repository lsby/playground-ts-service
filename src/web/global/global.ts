import { GlobalItem, GlobalService } from '@lsby/ts-global'
import { Log } from '@lsby/ts-log'
import { API管理器 } from './api'

export let GlobalWeb = new GlobalService([
  new GlobalItem('API前缀', ''),
  new GlobalItem('log', new Log('web')),
  new GlobalItem('API管理器', new API管理器()),
])
