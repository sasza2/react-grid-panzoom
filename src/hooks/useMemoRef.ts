import { useCallback, useRef } from 'react';

type MemoFunction = (...args: unknown[]) => unknown

const useMemoRef = <T extends MemoFunction, >(cb: T): T => {
  const ref = useRef<T>();
  ref.current = cb;

  const cbMemo = useCallback((...props: unknown[]) => {
    if (ref.current) return ref.current(...props);
  }, []);

  return cbMemo as unknown as T;
};

export default useMemoRef;
