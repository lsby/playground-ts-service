import fileUpload from 'express-fileupload'
import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { GlobalEnv } from '../global/global'

var 类型描述 = z.object({
  files: z
    .object({
      name: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      data: z.instanceof(Buffer),
      tempFilePath: z.string(),
      truncated: z.boolean(),
      size: z.number(),
      md5: z.string(),
    })
    .array(),
})

export class 文件上传插件 extends 插件<typeof 类型描述> {
  constructor() {
    super(类型描述, async (req, res) => {
      var env = await GlobalEnv.getInstance()

      await new Promise((resP, _rej) =>
        fileUpload({ limits: { fileSize: env.UPLOAD_MAX_FILE_SIZE * 1024 * 1024 } })(req, res, () => {
          resP(null)
        }),
      )

      return {
        files: Object.values(req.files as unknown as fileUpload.UploadedFile[]),
      }
    })
  }
}
