import './unit-test-prefix'

import add_t01 from '../src/interface/add/t01.test'
import sub_t01 from '../src/interface/sub/t01.test'

it('add_t01', async () => await add_t01.运行())
it('sub_t01', async () => await sub_t01.运行())

it('exit', async () => process.exit(0))
