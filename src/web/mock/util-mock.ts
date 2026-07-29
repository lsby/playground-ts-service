export function format(...args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === 'object' && a !== null) {
        try {
          return JSON.stringify(a)
        } catch {
          return String(a)
        }
      }
      return String(a)
    })
    .join(' ')
}

export function inherits(
  ctor: { super_?: unknown; prototype: object } | null | undefined,
  superCtor: { prototype: object } | null | undefined,
): void {
  if (ctor !== null && ctor !== undefined && superCtor !== null && superCtor !== undefined) {
    ctor.super_ = superCtor
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype)
  }
}

export function promisify<T = unknown>(fn: (...args: any[]) => void): (...args: any[]) => Promise<T> {
  return function (...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      fn(...args, (err: unknown, res: T) => {
        if (err !== null && err !== undefined) reject(err)
        else resolve(res)
      })
    })
  }
}
