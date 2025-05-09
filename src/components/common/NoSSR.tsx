'use client';

import { useState, useEffect, ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
}

/**
 * A component that prevents its children from being rendered during server-side rendering.
 * Use this for components that rely on browser-only APIs like localStorage or Firebase Auth.
 */
const NoSSR = ({ children }: NoSSRProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
};

export default NoSSR;
