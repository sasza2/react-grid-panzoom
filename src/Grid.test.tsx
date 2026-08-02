import { act, render, renderHook } from '@testing-library/react';
import React from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import { GridAPI, GridElement, GridProps } from 'types';
import { createWrapper, ref } from '../test/gridContext';

vi.mock('@sasza/react-panzoom', () => import('../test/panzoomMock'));

const { state: panZoomState, resetPanZoomMock } = await import('../test/panzoomMock');

const Grid = (await import('./Grid')).default;
const GridProvider = (await import('./GridContext')).default;
const { HeightProvider, useGridHeight } = await import('./HeightContext');
const Styles = (await import('./Styles')).default;
const Style = (await import('./Style')).default;
const libraryExports = await import('./index');

const el = (props: Partial<GridElement>): GridElement => ({
  x: 0,
  y: 0,
  w: 1,
  h: 1,
  render: (element) => <span>{`content-${element.id}`}</span>,
  ...props,
} as GridElement);

const renderGrid = (props: Partial<GridProps> = {}, apiRef?: React.MutableRefObject<GridAPI>) => (
  render(
    <Grid
      ref={apiRef}
      cols={4}
      rows={10}
      rowHeight={20}
      gapHorizontal={10}
      gapVertical={10}
      width={230}
      elements={[el({ id: 'a' })]}
      setElements={vi.fn()}
      {...props as GridProps}
    />,
  )
);

const press = () => act(() => { window.dispatchEvent(new Event('pointerdown')); });

beforeEach(() => {
  resetPanZoomMock();
});

afterEach(() => {
  vi.useRealTimers();
  act(() => { window.dispatchEvent(new Event('pointerup')); });
});

describe('the public entry point', () => {
  it('exports the grid and both organizers', () => {
    expect(libraryExports.default).toBeTypeOf('object');
    expect(libraryExports.defaultOrganizeGridElements).toBeTypeOf('function');
    expect(libraryExports.organizeGridElementsWithBringUp).toBeTypeOf('function');
  });
});

describe('Style / Styles', () => {
  it('renders its children into a style tag', () => {
    const { container } = render(<Style>{'.a { color: red; }'}</Style>);
    expect(container.querySelector('style').textContent).toBe('.a { color: red; }');
  });

  it('ships the grid stylesheet', () => {
    const { container } = render(<Styles />);
    expect(container.querySelector('style').textContent).toContain('.react-grid-panzoom');
  });
});

describe('GridProvider', () => {
  it('applies the defaults for every optional prop', () => {
    const { container } = renderGrid({ elements: undefined });
    expect(container.querySelector('.react-grid-panzoom')).not.toBeNull();
  });

  it('computes the column width from the available width', () => {
    renderGrid();
    // (230 - 3 gaps * 10) / 4 cols = 50
    expect(panZoomState.elementProps.a.width).toBe(50);
  });

  it('measures its own width when none is given', () => {
    const getBoundingClientRect = vi.spyOn(HTMLDivElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ width: 430 } as DOMRect);

    renderGrid({ width: undefined });

    // (430 - 3 gaps * 10) / 4 cols = 100
    expect(panZoomState.elementProps.a.width).toBe(100);
    expect(panZoomState.containerProps.width).toBe(430);

    getBoundingClientRect.mockRestore();
  });
});

describe('Grid', () => {
  it('renders one panzoom element per element with an id', () => {
    const { getByTestId, queryByTestId } = renderGrid({
      elements: [
        el({ id: 'a' }),
        el({ id: 'b' }),
        { x: 0, y: 0, render: () => null } as GridElement,
      ],
      setElements: vi.fn(),
    });

    expect(getByTestId('element-a').textContent).toContain('content-a');
    expect(getByTestId('element-b')).toBeTruthy();
    expect(queryByTestId('element-undefined')).toBeNull();
  });

  it('renders the children above the grid', () => {
    const { getByText } = renderGrid({ children: <div>overlay</div> });
    expect(getByText('overlay')).toBeTruthy();
  });

  it('renders without children', () => {
    const overlays = '[data-testid="panzoom"] > div[style*="absolute"]';

    expect(renderGrid().container.querySelectorAll(overlays)).toHaveLength(1);
    expect(
      renderGrid({ children: <div>overlay</div> }).container.querySelectorAll(overlays),
    ).toHaveLength(2);
  });

  it('forwards the container callbacks to panzoom', () => {
    const handlers = {
      onContainerChange: vi.fn(),
      onContainerClick: vi.fn(),
      onContainerContextMenu: vi.fn(),
      onContainerPressStart: vi.fn(),
      onContainerPressEnd: vi.fn(),
    };
    renderGrid(handlers);

    panZoomState.containerProps.onContainerClick('click');
    panZoomState.containerProps.onContainerPressStart('start');
    panZoomState.containerProps.onContainerPressEnd('end');
    panZoomState.containerProps.onContextMenu('menu');

    expect(handlers.onContainerClick).toHaveBeenCalledWith('click');
    expect(handlers.onContainerPressStart).toHaveBeenCalledWith('start');
    expect(handlers.onContainerPressEnd).toHaveBeenCalledWith('end');
    expect(handlers.onContainerContextMenu).toHaveBeenCalledWith('menu');
    expect(panZoomState.containerProps.onContainerChange).toBe(handlers.onContainerChange);
  });

  it('clears the cached heights when the container zoom changes', () => {
    renderGrid();
    expect(() => panZoomState.containerProps.onContainerZoomChange()).not.toThrow();
  });

  it('renders a shadow element for every selected element while the mouse is down', () => {
    const { queryByTestId, getByTestId } = renderGrid({
      elements: [el({ id: 'a' })],
    });

    expect(queryByTestId('element-dest-a')).toBeNull();

    press();
    act(() => {
      panZoomState.elementProps.a.onClick({
        e: { preventDefault: vi.fn(), stopPropagation: vi.fn() },
        id: 'a',
        stop: vi.fn(),
      });
    });

    const shadow = getByTestId('element-dest-a');
    expect(shadow.className).toContain('react-panzoom-element-is-shadow');
    // the shadow mirrors the content of the dragged element
    expect(shadow.textContent).toContain('content-a');
  });

  it('renders the help lines while dragging', () => {
    const { container } = renderGrid({ helpLines: true, elements: [el({ id: 'a' })] });

    press();
    act(() => {
      panZoomState.elementProps.a.onClick({
        e: { preventDefault: vi.fn(), stopPropagation: vi.fn() },
        id: 'a',
        stop: vi.fn(),
      });
    });

    expect(container.querySelector('.react-grid-panzoom-lines-container')).not.toBeNull();
  });

  it('drops the selection of elements that disappeared', () => {
    const { rerender, queryByTestId } = renderGrid({ elements: [el({ id: 'a' })] });

    press();
    act(() => {
      panZoomState.elementProps.a.onClick({
        e: { preventDefault: vi.fn(), stopPropagation: vi.fn() },
        id: 'a',
        stop: vi.fn(),
      });
    });
    expect(queryByTestId('element-dest-a')).not.toBeNull();

    rerender(
      <Grid
        cols={4}
        rows={10}
        rowHeight={20}
        width={230}
        elements={[el({ id: 'b' })]}
        setElements={vi.fn()}
      />,
    );

    expect(queryByTestId('element-dest-a')).toBeNull();
  });

  it('exposes the api through the forwarded ref', () => {
    const apiRef = ref<GridAPI>(null);
    renderGrid({}, apiRef);

    expect(apiRef.current.getPanZoom()).toBeTruthy();
    expect(apiRef.current.measureElementsHeight()).toStrictEqual({ a: 1 });
  });
});

describe('HeightContext', () => {
  it('defaults to a height of zero', () => {
    const { result } = renderHook(() => useGridHeight());
    expect(result.current).toBe(0);
  });

  it('derives the grid height from the rows', () => {
    const { wrapper } = createWrapper({
      elements: [], gapVertical: 10, rows: 4, rowHeight: 20,
    });

    const { result } = renderHook(() => useGridHeight(), {
      wrapper: ({ children }) => wrapper({ children: <HeightProvider>{children}</HeightProvider> }),
    });

    expect(result.current).toBe(4 * 30 - 10);
  });

  it('passes the height down to panzoom', () => {
    renderGrid({ rows: 4 });
    expect(panZoomState.containerProps.height).toBe(4 * 30 - 10);
  });
});

describe('GridProvider defaults', () => {
  it('renders children with an empty element list', () => {
    const { getByText } = render(
      <GridProvider cols={4} rows={4} rowHeight={20} setElements={vi.fn()} elements={undefined}>
        <span>child</span>
      </GridProvider>,
    );
    expect(getByText('child')).toBeTruthy();
  });
});
