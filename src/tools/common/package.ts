import { existsSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import { Task } from '@lsby/ts-fp-data'

export class Package {
  private packageJSON: Record<string, any> | null = null

  private findPackageJson(startPath: string): Task<string | null> {
    return new Task(async () => {
      let currentPath = startPath

      while (true) {
        const packageJsonPath = join(currentPath, 'package.json')
        if (existsSync(packageJsonPath)) return packageJsonPath
        const parentPath = resolve(currentPath, '..')
        if (parentPath === currentPath) break
        currentPath = parentPath
      }

      return null
    })
  }

  private getJSON(): Task<Record<string, any>> {
    return new Task(async () => {
      if (this.packageJSON != null) return this.packageJSON
      var packagePath = await this.findPackageJson(import.meta.dirname || __dirname).run()
      if (packagePath == null) throw new Error('无法读取找到package.json文件')
      var jsonStr = readFileSync(packagePath, 'utf-8')
      var json = JSON.parse(jsonStr)
      this.packageJSON = json
      return json
    })
  }

  getName(): Task<string> {
    return new Task(async () => {
      var json = await this.getJSON().run()
      var name = json['name']
      if (name == null) throw new Error('无法读取package.json中的name字段')
      return name
    })
  }
}
