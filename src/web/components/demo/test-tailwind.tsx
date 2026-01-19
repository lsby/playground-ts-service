import { 组件tailwind基类 } from 'src/web/base/base-tailwind'

export class 测试Tailwind组件 extends 组件tailwind基类<{}, {}, {}> {
  static {
    this.注册组件('test-tailwind', this)
  }

  protected override async 当子类加载时(): Promise<void> {
    this.style.display = 'block'
    this.style.padding = '20px'

    let 容器 = (
      <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Tailwind CSS 测试</h2>
        <p className="mb-4">如果您看到蓝色背景、白色的文字、内边距和圆角，则 Tailwind CSS 工作正常。</p>
        <div className="flex space-x-2">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">绿色按钮</button>
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">红色按钮</button>
        </div>
      </div>
    )

    this.shadow.appendChild(容器)
  }
}
