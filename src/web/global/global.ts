import { GlobalItem, GlobalService } from '@lsby/ts-global'
import { Log } from '@lsby/ts-log'

export let GlobalWeb = new GlobalService([new GlobalItem('log', new Log('web'))])
