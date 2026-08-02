import { act, render, renderHook } from '@testing-library/react';
import React from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import { GridElement } from 'types';
import { createWrapper, ref } from '../test/gridContext';
import { state as panZoomState, resetPanZoomMock } from '../test/panzoomMock';
import Lines, { LINES_CONTAINER, LinesContainer } from './Lines';

const el = (props: Partial<GridElement>): GridElement => ({
  x: 0, y: 0, w: 1, h: 1, render: () => null, ...props,
} as GridElement);

const createElementNode = () => {
  const node = document.createElement('div');
  const container = document.createElement('div');
  container.setAttribute('data-id', LINES_CONTAINER);
  node.appendChild(container);
  document.body.appendChild(node);
  return { node, container };
};

const selected = el({ id: 'selected', x: 1, y: 2, w: 1 });

const tick = () => act(() => { vi.advanceTimersByTime(100); });

const setup = (overrides = {}) => {
  const { node, container } = createElementNode();

  panZoomState.elements.selected = {
    node: { current: node },
    position: { x: 60, y: 60 },
  };

  const neighbours = [
    el({ id: 'top', x: 1, y: 0, w: 1, h: 1 }),
    el({ id: 'bottom', x: 1, y: 5, w: 1, h: 1 }),
    el({ id: 'left', x: 0, y: 2, w: 1, h: 1 }),
    el({ id: 'right', x: 3, y: 2, w: 1, h: 1 }),
  ];

  const context = createWrapper({
    cols: 4,
    colWidth: 50,
    gapHorizontal: 10,
    gapVertical: 10,
    internalWidth: 230,
    paddingLeft: 0,
    paddingRight: 0,
    rowHeight: 20,
    rows: 10,
    selectedElements: [selected],
    currentElements: ref([selected, ...neighbours]),
    elementsNodes: ref({ selected: node }),
    ...overrides,
  });

  return { ...context, node, container };
};

beforeEach(() => {
  vi.useFakeTimers();
  resetPanZoomMock();
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('LinesContainer', () => {
  it('renders the container for an interactive element', () => {
    const { container } = render(<LinesContainer />);
    expect(container.querySelector(`[data-id="${LINES_CONTAINER}"]`)).not.toBeNull();
  });

  it('renders nothing for a disabled element', () => {
    expect(render(<LinesContainer disabled />).container.innerHTML).toBe('');
    expect(render(<LinesContainer disabledMove />).container.innerHTML).toBe('');
  });
});

describe('Lines', () => {
  it('renders nothing itself', () => {
    const { wrapper } = setup();
    const { container } = render(<Lines />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('does nothing while the column width is unknown', () => {
    const { wrapper, container } = setup({ colWidth: 'auto' });
    render(<Lines />, { wrapper });
    tick();
    expect(container.children).toHaveLength(0);
  });

  it('does nothing while the grid width is unknown', () => {
    const { wrapper, container } = setup({ internalWidth: 'auto' });
    render(<Lines />, { wrapper });
    tick();
    expect(container.children).toHaveLength(0);
  });

  it('does nothing without a selected element', () => {
    const { wrapper, container } = setup({ selectedElements: [] });
    render(<Lines />, { wrapper });
    tick();
    expect(container.children).toHaveLength(0);
  });

  it('does nothing when the selected element has no node', () => {
    const { wrapper, container } = setup({ elementsNodes: ref({}) });
    render(<Lines />, { wrapper });
    tick();
    expect(container.children).toHaveLength(0);
  });

  it('does nothing when the element has no lines container', () => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    const { wrapper } = setup({ elementsNodes: ref({ selected: node }) });

    render(<Lines />, { wrapper });
    expect(() => tick()).not.toThrow();
    expect(node.querySelectorAll('.react-grid-panzoom-line')).toHaveLength(0);
  });

  it('creates the grid boundary lines up front', () => {
    const { wrapper, container } = setup();
    render(<Lines />, { wrapper });

    expect(container.querySelectorAll('.react-grid-panzoom-line--top')).toHaveLength(1);
    expect(container.querySelectorAll('.react-grid-panzoom-line--left')).toHaveLength(1);
    expect(container.querySelectorAll('.react-grid-panzoom-line--right')).toHaveLength(1);
  });

  it('waits for panzoom to know the selected element', () => {
    delete panZoomState.elements.selected;
    const { wrapper, container } = setup();
    delete panZoomState.elements.selected;

    render(<Lines />, { wrapper });
    tick();

    expect(container.querySelectorAll('.react-grid-panzoom-line--bottom')).toHaveLength(0);
  });

  it('draws a line towards each neighbour and labels the distance', () => {
    const { wrapper, container } = setup();
    render(<Lines />, { wrapper });
    tick();

    expect(container.querySelectorAll('.react-grid-panzoom-line--bottom')).toHaveLength(1);
    expect(container.querySelectorAll('.react-grid-panzoom-line--top')).toHaveLength(2);
    expect(container.querySelectorAll('.react-grid-panzoom-line--left')).toHaveLength(2);
    expect(container.querySelectorAll('.react-grid-panzoom-line--right')).toHaveLength(2);

    const bottom = container.querySelector('.react-grid-panzoom-line--bottom') as HTMLDivElement;
    expect(bottom.innerHTML).toBe('&nbsp;2'); // rows 3 and 4 are free
    expect(bottom.style.display).toBe('');
  });

  it('hides the label when neighbours are adjacent', () => {
    const { wrapper, container } = setup({
      currentElements: ref([
        selected,
        el({ id: 'bottom', x: 1, y: 3, w: 1, h: 1 }),
        el({ id: 'left', x: 0, y: 2, w: 1, h: 1 }),
      ]),
    });
    render(<Lines />, { wrapper });
    tick();

    const bottom = container.querySelector('.react-grid-panzoom-line--bottom') as HTMLDivElement;
    expect(bottom.innerHTML).toBe('');
    expect(bottom.style.display).toBe('none');
  });

  it('reuses the same line elements across ticks', () => {
    const { wrapper, container } = setup();
    render(<Lines />, { wrapper });

    tick();
    const linesAfterFirstTick = container.querySelectorAll('.react-grid-panzoom-line').length;

    tick();
    expect(container.querySelectorAll('.react-grid-panzoom-line')).toHaveLength(
      linesAfterFirstTick,
    );
  });

  it('drops the lines of neighbours that are gone', () => {
    const currentElements = ref([selected, el({ id: 'bottom', x: 1, y: 5, w: 1, h: 1 })]);
    const { wrapper, container } = setup({ currentElements });

    render(<Lines />, { wrapper });
    tick();
    expect(container.querySelectorAll('.react-grid-panzoom-line--bottom')).toHaveLength(1);

    currentElements.current = [selected];
    tick();
    expect(container.querySelectorAll('.react-grid-panzoom-line--bottom')).toHaveLength(0);
  });

  it('survives a line that was already detached from the dom', () => {
    const currentElements = ref([selected, el({ id: 'bottom', x: 1, y: 5, w: 1, h: 1 })]);
    const { wrapper, container } = setup({ currentElements });

    render(<Lines />, { wrapper });
    tick();

    const bottom = container.querySelector('.react-grid-panzoom-line--bottom');
    bottom.parentNode.removeChild(bottom);

    currentElements.current = [selected];
    expect(() => tick()).not.toThrow();
  });

  it('cleans up every line on unmount', () => {
    const { wrapper, container } = setup();
    const { unmount } = render(<Lines />, { wrapper });
    tick();

    expect(container.querySelectorAll('.react-grid-panzoom-line').length).toBeGreaterThan(0);

    unmount();
    expect(container.querySelectorAll('.react-grid-panzoom-line')).toHaveLength(0);

    // the interval is gone as well
    expect(() => tick()).not.toThrow();
  });

  it('spans the collision search across the whole width of the element', () => {
    const wide = el({ id: 'selected', x: 0, y: 2, w: 3 });
    const { wrapper, container } = setup({
      selectedElements: [wide],
      currentElements: ref([
        wide,
        el({ id: 'bottomLeft', x: 1, y: 6, w: 1, h: 1 }),
        el({ id: 'bottomRight', x: 3, y: 8, w: 1, h: 1 }),
      ]),
    });

    render(<Lines />, { wrapper });
    tick();

    expect(container.querySelectorAll('.react-grid-panzoom-line--bottom')).toHaveLength(2);
  });

  it('is happy with a grid that has no neighbours at all', () => {
    const { wrapper, container } = setup({ currentElements: ref([selected]) });
    render(<Lines />, { wrapper });
    tick();

    expect(container.querySelectorAll('.react-grid-panzoom-line--bottom')).toHaveLength(0);
  });

  it('does not blow up when the hook is used outside of a rendered element', () => {
    const { wrapper } = setup({ elementsNodes: ref({}) });
    expect(() => renderHook(() => null, { wrapper })).not.toThrow();
  });
});
