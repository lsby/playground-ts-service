import { 有效的接口 } from '@lsby/net-core'

import {加法 as _src_interface_base_add_index_ts_加法} from './base/add/index'
import {减法 as _src_interface_base_sub_index_ts_减法} from './base/sub/index'
import {文件上传 as _src_interface_base_upload_file_index_ts_文件上传} from './base/upload-file/index'
import {已登录 as _src_interface_user_is_login_is_login_ts_已登录} from './user/is-login/is-login'
import {登录 as _src_interface_user_login_login_ts_登录} from './user/login/login'
import {注册 as _src_interface_user_register_register_ts_注册} from './user/register/register'

export var interfaceList: 有效的接口[] = [
  new _src_interface_base_add_index_ts_加法(),
  new _src_interface_base_sub_index_ts_减法(),
  new _src_interface_base_upload_file_index_ts_文件上传(),
  new _src_interface_user_is_login_is_login_ts_已登录(),
  new _src_interface_user_login_login_ts_登录(),
  new _src_interface_user_register_register_ts_注册(),
]
