export function randomUUID(): string {
  return globalThis.crypto.randomUUID()
}

export function randomBytes(size: number): { toString: (encoding: string) => string } {
  let bytes = new Uint8Array(size)
  globalThis.crypto.getRandomValues(bytes)
  return {
    toString: (encoding: string): string => {
      if (encoding !== 'hex') throw new Error(`Unsupported randomBytes encoding: ${encoding}`)
      return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
    },
  }
}

export default { randomBytes, randomUUID }
