import { useLayoutEffect, useState } from 'react';

import { Pixels } from 'types';

type UseInternalWidth = (
  width: number,
  gridRef: React.MutableRefObject<HTMLDivElement>,
) => Pixels | 'auto'

const useInternalWidth: UseInternalWidth = (width, gridRef) => {
  const [internalWidth, setInternalWidth] = useState<Pixels | 'auto'>(width || 'auto');

  useLayoutEffect(() => {
    if (!gridRef.current || width) return;

    const onResize = () => {
      const rect = gridRef.current.getBoundingClientRect();
      setInternalWidth(rect.width);
    };

    onResize();

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [gridRef.current, width]);

  return internalWidth;
};

export default useInternalWidth;
