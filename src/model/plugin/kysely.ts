import { Kysely } from 'kysely'
import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { DB } from '../../types/db'

const Kysely插件Zod = z.object({
  kysely: z.custom<Kysely<DB>>((instance) => instance instanceof Kysely),
})

export class Kysely插件 extends 插件<typeof Kysely插件Zod> {
  constructor(kysely: Kysely<DB>) {
    super(Kysely插件Zod, async (_request, _response) => {
      return { kysely }
    })
  }
}
