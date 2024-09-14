import { 任意接口 } from '@lsby/net-core'
import { 加法 as _src_model_action_base_add_ts_加法 } from '../model/action/base/add'
import { 减法 as _src_model_action_base_sub_ts_减法 } from '../model/action/base/sub'
import { 文件上传 as _src_model_action_base_upload_file_ts_文件上传 } from '../model/action/base/upload-file'
import { 已登录 as _src_model_action_user_is_login_ts_已登录 } from '../model/action/user/is-login'
import { 登录 as _src_model_action_user_login_ts_登录 } from '../model/action/user/login'
import { 注册 as _src_model_action_user_register_ts_注册 } from '../model/action/user/register'

export var interfaceList: 任意接口[] = [
  new _src_model_action_base_add_ts_加法(),
  new _src_model_action_base_sub_ts_减法(),
  new _src_model_action_base_upload_file_ts_文件上传(),
  new _src_model_action_user_is_login_ts_已登录(),
  new _src_model_action_user_login_ts_登录(),
  new _src_model_action_user_register_ts_注册(),
]
