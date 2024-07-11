import fileUpload from 'express-fileupload'
import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'
import { GlobalEnv } from '../global/global'

var resultSchema = z.object({
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

export class 上传文件插件 extends 插件<typeof resultSchema> {
  constructor() {
    super(
      resultSchema,
      (request, response) =>
        new Task(async () => {
          var env = await GlobalEnv.getInstance().run()

          await new Promise((resolve, _reject) =>
            fileUpload({ limits: { fileSize: env.UPLOAD_MAX_FILE_SIZE * 1024 * 1024 } })(request, response, () => {
              resolve(null)
            }),
          )

          return {
            files: Object.values(request.files as unknown as fileUpload.UploadedFile[]),
          }
        }),
    )
  }
}
