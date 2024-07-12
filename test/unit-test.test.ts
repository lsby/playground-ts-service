import { test } from 'vitest'
import './unit-test-prefix'

import base_add_t01 from '../src/interface/base/add/t01.test'
import base_sub_t01 from '../src/interface/base/sub/t01.test'
import base_upload_file_t01 from '../src/interface/base/upload-file/t01.test'
import user_is_login_t01 from '../src/interface/user/is-login/t01.test'
import user_is_login_t02 from '../src/interface/user/is-login/t02.test'
import user_is_login_t03 from '../src/interface/user/is-login/t03.test'
import user_login_t01 from '../src/interface/user/login/t01.test'
import user_login_t02 from '../src/interface/user/login/t02.test'
import user_register_t01 from '../src/interface/user/register/t01.test'
import user_register_t02 from '../src/interface/user/register/t02.test'

test('base_add_t01', async () => await base_add_t01.运行())
test('base_sub_t01', async () => await base_sub_t01.运行())
test('base_upload_file_t01', async () => await base_upload_file_t01.运行())
test('user_is_login_t01', async () => await user_is_login_t01.运行())
test('user_is_login_t02', async () => await user_is_login_t02.运行())
test('user_is_login_t03', async () => await user_is_login_t03.运行())
test('user_login_t01', async () => await user_login_t01.运行())
test('user_login_t02', async () => await user_login_t02.运行())
test('user_register_t01', async () => await user_register_t01.运行())
test('user_register_t02', async () => await user_register_t02.运行())
