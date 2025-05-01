import { 任意接口 } from '@lsby/net-core'

import _src_interface_base_add_index_ts from './base/add/index'
import _src_interface_base_sub_index_ts from './base/sub/index'
import _src_interface_base_upload_file_index_ts from './base/upload-file/index'
import _src_interface_base_ws_test_index_ts from './base/ws-test/index'
import _src_interface_user_is_login_index_ts from './user/is-login/index'
import _src_interface_user_login_index_ts from './user/login/index'
import _src_interface_user_register_index_ts from './user/register/index'

export let interfaceApiList: 任意接口[] = [
  _src_interface_base_add_index_ts,
  _src_interface_base_sub_index_ts,
  _src_interface_base_upload_file_index_ts,
  _src_interface_base_ws_test_index_ts,
  _src_interface_user_is_login_index_ts,
  _src_interface_user_login_index_ts,
  _src_interface_user_register_index_ts,
]
