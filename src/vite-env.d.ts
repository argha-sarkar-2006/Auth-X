/// <reference types="vite/client" />

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '*.jsx' {
  import type { ComponentType } from 'react'
  const Component: ComponentType<any>
  export default Component
}
