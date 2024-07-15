import express from 'express'
import { 接口, 正确自定义结果 } from '@lsby/net-core'
import { Global } from '../../global/global.js'
import 接口类型 from './type.js'

export default new 接口(接口类型, async () => {
  return new 正确自定义结果(async (req, res) => {
    var env = await (await Global.getItem('env')).获得环境变量()
    return express.static(env.WEB_PATH)(req, res, () => {
      res.status(404)
      res.send('文件不存在')
    })
  })
})
