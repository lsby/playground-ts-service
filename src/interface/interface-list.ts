import { 任意接口 } from '@lsby/net-core'
import * as base_add_index from '../../src/interface/base/add/index'
import * as base_sub_index from '../../src/interface/base/sub/index'
import * as base_upload_file_index from '../../src/interface/base/upload-file/index'
import * as user_is_login_index from '../../src/interface/user/is-login/index'
import * as user_login_index from '../../src/interface/user/login/index'
import * as user_register_index from '../../src/interface/user/register/index'

export var interfaceList: 任意接口[] = [
  base_sub_index.default,
  base_add_index.default,
  user_register_index.default,
  user_login_index.default,
  user_is_login_index.default,
  base_upload_file_index.default,
]
