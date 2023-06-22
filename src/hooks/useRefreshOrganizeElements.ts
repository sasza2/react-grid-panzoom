import { useEffect, useRef } from 'react';

import { WATCH_ELEMENTS_NOT_ORGANIZED_DELAY } from '@/consts';
import { useGrid } from './useGrid';
import useOrganizeElements from './useOrganizeElements';
import useMemoRef from './useMemoRef';
import { useElementsChecksum } from './useElementsChecksum';

const useRefreshOrganizeElements = () => {
  const { autoOrganizeElements, selectedElements } = useGrid();
  const organizeElements = useOrganizeElements();
  const organizeElementsMemo = useMemoRef(organizeElements);
  const elementsChecksum = useElementsChecksum();
  const lastChecksumRef = useRef<string>(null);

  useEffect(() => {
    if (!autoOrganizeElements
        || lastChecksumRef.current === elementsChecksum
        || selectedElements.length
    ) return;

    const timer = setTimeout(() => {
      lastChecksumRef.current = elementsChecksum;
      organizeElementsMemo([]);
    }, WATCH_ELEMENTS_NOT_ORGANIZED_DELAY);

    return () => {
      clearTimeout(timer);
    };
  }, [autoOrganizeElements, elementsChecksum, selectedElements.length]);
};

export default useRefreshOrganizeElements;
