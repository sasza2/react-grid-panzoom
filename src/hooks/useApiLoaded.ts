import { useEffect, useState } from 'react';

import { useGrid } from './useGrid';

const useApiLoaded = () => {
  const { panZoomRef } = useGrid();
  const [apiLoaded, setApiLoaded] = useState(false);

  useEffect(() => {
    if (apiLoaded) return;

    const checkAPI = () => {
      if (panZoomRef.current) setApiLoaded(true);
    }

    checkAPI()

    const waitForAPI = setInterval(checkAPI, 10)

    return () => {
      clearInterval(waitForAPI)
    }
  }, [apiLoaded]);

  return apiLoaded;
};

export default useApiLoaded;
