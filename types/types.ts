import { PropsWithChildren } from 'react'
import { ElementOptions, API as PanZoomAPI, PanZoomOptions } from '@sasza/react-panzoom'

type RenderElement = (element?: GridElement) => JSX.Element

export type GridElement = {
  id?: string | number,
  family?: string,
  fullHeight?: boolean,
  x: number,
  y: number,
  w?: number,
  h?: number | 'auto',
  render: RenderElement,
  resizable?: boolean,
  disabled?: boolean,
  draggableSelector?: string,
}

export type Pixels = number

export type MeasureElementHeight = (element: GridElement) => number

export type Position = {
  x: Pixels,
  y: Pixels,
}

export type GridAPI = {
  calculateCellPositionByPixels: (x: Pixels, y: Pixels) => Position;
  getPanZoom: () => PanZoomAPI,
  grabElement: (elementId: string | number, position?: Position) => void;
  measureElementHeight: (elementId: string | number) => number | null;
  measureElementsHeight: () => Record<string | number, number>;
  getElementsPaddingBottom: () => Record<string | number, number>;
  organizeElements: (selectedElements?: GridElement[]) => void,
}

export type SetElements = (elements: GridElement[], { type }: { type: 'programmatic' | 'user' }) => void;

export type OrganizeGridElementsProps = {
  startingElements: Array<GridElement>,
  cols: number,
  measureElementHeight: MeasureElementHeight,
  rows: number | 'auto',
  selectedElements: Array<GridElement>,
}

export type OrganizeGridElements = (props: OrganizeGridElementsProps) => GridElement[]

export type GridProps = PropsWithChildren<{
  autoOrganizeElements?: boolean,
  boundary?: boolean,
  disabledMove?: boolean,
  disabledScrollHorizontal?: boolean,
  disabledScrollVertical?: boolean,
  disabledZoom?: boolean,
  elements: Array<GridElement>,
  elementResizerWidth?: number,
  helpLines?: boolean,
  ref?: React.MutableRefObject<GridAPI>,
  rowHeight: number,
  cols: number,
  rows: number | 'auto',
  setElements: SetElements,
  gapHorizontal?: number,
  gapVertical?: number,
  onContainerChange?: PanZoomOptions['onContainerChange'],
  onContainerContextMenu?: PanZoomOptions['onContextMenu'],
  onElementStartResizing?: ElementOptions['onStartResizing'],
  onElementClick?: (element: GridElement) => void,
  onElementContextMenu?: ElementOptions['onContextMenu'],
  onElementsMeasureUpdate?: (elementsHeight: Record<number | string, number>) => void,
  organizeGridElements?: OrganizeGridElements,
  paddingLeft?: number,
  paddingRight?: number,
  scrollSpeed?: number,
  width?: number,
  zoomInitial?: number;
  zoomMax?: number;
  zoomMin?: number;
  zoomSpeed?: number;
}>
