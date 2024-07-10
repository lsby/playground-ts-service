import fileUpload from 'express-fileupload'
import { z } from 'zod'
import { 插件 } from '@lsby/net-core'
import { Task } from '@lsby/ts-fp-data'

const resultSchema = z.object({
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
          await new Promise((resolve, _reject) =>
            fileUpload({ limits: { fileSize: 50 * 1024 * 104 } })(request, response, () => {
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
