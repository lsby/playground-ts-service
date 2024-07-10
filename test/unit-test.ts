import './unit-test-prefix'

import base_add_t01 from '../src/interface/base/add/t01.test'
import base_sub_t01 from '../src/interface/base/sub/t01.test'
import user_register_t01 from '../src/interface/user/register/t01.test'

it('base_add_t01', async () => await base_add_t01.运行())
it('base_sub_t01', async () => await base_sub_t01.运行())
it('user_register_t01', async () => await user_register_t01.运行())

it('exit', async () => process.exit(0))
