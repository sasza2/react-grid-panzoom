import { useEffect, useRef } from 'react';

import { useGrid } from './useGrid';
import useUpdateWithPanZoomApi from './useUpdateWithPanZoomApi';

const useDragSafetyNet = () => {
  const grid = useGrid();
  const updateWithPanZoomApi = useUpdateWithPanZoomApi();

  // always read the latest grid + snapper (colWidth etc. are only known after
  // the container is measured, so a stale closure would snap everything to 0)
  const latest = useRef({ grid, updateWithPanZoomApi });
  latest.current = { grid, updateWithPanZoomApi };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onPointerUp = () => {
      // Defer so the regular commit (react-panzoom mouseup -> onElementMouseUp)
      // can run first and clear the flag on a normal drop.
      requestAnimationFrame(() => {
        const { grid: g, updateWithPanZoomApi: snap } = latest.current;
        if (!g.dragActiveRef.current) return;

        // Drain any pending throttled onElementsChange first, otherwise it
        // fires later (~250ms) and re-drifts the DOM after we revert it.
        if (g.flushElementsChangeRef.current) g.flushElementsChangeRef.current();

        g.elements.forEach((element) => snap(element));

        g.currentElements.current = [];
        g.elementsHeightRef.current = {};
        g.hasCollision.current = false;
        g.dragActiveRef.current = false;
        g.setSelectedElements([]);
      });
    };

    window.addEventListener('pointerup', onPointerUp);
    return () => window.removeEventListener('pointerup', onPointerUp);
  }, []);
};

export default useDragSafetyNet;
