import './unit-test-prefix'

import user_is_login_t01 from '../src/interface/user/is-login/t01.test'
import user_is_login_t02 from '../src/interface/user/is-login/t02.test'

it('user_is_login_t01', async () => await user_is_login_t01.运行())
it('user_is_login_t02', async () => await user_is_login_t02.运行())

it('exit', async () => process.exit(0))
