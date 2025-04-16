import { Suspense } from 'react'

export const LazyLoader = ({ children }) => (
  <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
)
