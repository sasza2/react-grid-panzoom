/* eslint-disable */
import React from 'react';
import { vi } from 'vitest';

import { GridContext, IGridContext } from '@/hooks/useGrid';
import { defaultOrganizeGridElements } from '@/helpers/organizeGridElements';
import { createPanZoomApi } from './panzoomMock';

export const ref = <T, >(current: T) => ({ current });

export type GridContextOverrides = Partial<IGridContext> & Record<string, unknown>

export const createGridContext = (overrides: GridContextOverrides = {}): IGridContext => {
  const value = {
    cols: 4,
    colWidth: 50,
    elements: [],
    gapHorizontal: 10,
    gapVertical: 10,
    internalWidth: 230,
    isMousePressed: false,
    paddingLeft: 0,
    paddingRight: 0,
    rows: 10,
    rowHeight: 20,
    gridRef: ref<HTMLDivElement>(null),
    hasCollision: ref(false),
    panZoomRef: ref(createPanZoomApi()),
    currentElements: ref([]),
    dragActiveRef: ref(false),
    flushElementsChangeRef: ref(null),
    selectedElements: [],
    setSelectedElements: vi.fn(),
    setElements: vi.fn(),
    elementRef: ref<HTMLDivElement>(null),
    elementsNodes: ref({}),
    elementsHeightRef: ref({}),
    forwardRef: ref(null),
    organizeGridElements: defaultOrganizeGridElements,
    onElementsMeasureUpdateRef: ref(undefined),
    ...overrides,
  } as unknown as IGridContext;

  return value;
};

export const createWrapper = (overrides: GridContextOverrides = {}) => {
  const value = createGridContext(overrides);

  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <GridContext.Provider value={value}>{children}</GridContext.Provider>
  );

  return { wrapper, value };
};

export const createNode = (height = 40, width = 100): HTMLDivElement => {
  const parent = document.createElement('div');
  const node = document.createElement('div');
  parent.appendChild(node);
  document.body.appendChild(parent);

  node.getBoundingClientRect = () => ({
    width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0, toJSON: () => ({}),
  }) as DOMRect;
  parent.getBoundingClientRect = () => ({
    width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0, toJSON: () => ({}),
  }) as DOMRect;

  return node;
};
