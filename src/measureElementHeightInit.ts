import { MutableRefObject } from 'react';
import { API } from '@sasza/react-panzoom';

import { GridElement } from 'types';
import { isLengthAuto } from './helpers/isLengthAuto';

const measureElementHeightInit = (
  panZoomRef: MutableRefObject<API>,
  element: GridElement,
  elementNodes: Record<string | number, HTMLDivElement>,
  rowHeight: number,
): number => {
  if (!panZoomRef.current) return 1;
  if (!isLengthAuto(element.h)) return element.h || 1;

  const zoom = panZoomRef.current.getZoom();
  const node = elementNodes[element.id];
  if (!node) return 1;

  node.style.height = null;

  const { height } = node.getBoundingClientRect();

  const originalHeight = Math.round((height / zoom) * 10) / 10; // px

  return Math.ceil(originalHeight / rowHeight) || 1;
};

export default measureElementHeightInit;
