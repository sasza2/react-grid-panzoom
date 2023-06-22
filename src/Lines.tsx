import React, { useEffect, useMemo } from 'react';

import { GridElement, Position } from 'types';
import { useGrid } from './hooks/useGrid';
import useCalculateCellPositionByPixels from './hooks/useCalculateCellPositionByPixels';
import useMeasureElementHeight from './hooks/useMeasureElementHeight';
import { createMap } from './helpers/organizeGridElements/createMap';
import { startingElementsWithoutSelected } from './helpers/organizeGridElements/startingElementsWithoutSelected';
import { ElementWrapped } from './helpers/organizeGridElements/types';
import calculatePixelsByCellPosition from './helpers/calculatePixelsByCellPosition';
import { isLengthAuto } from './helpers/isLengthAuto';

export const LINES_CONTAINER = 'react-panzoom-lines';

const rightCollisions = (
  column: number,
  columns: number,
  row: number,
  rowsHeight: number,
  map: Record<string, ElementWrapped>,
) => {
  const collisionsMap: Record<string, { element: GridElement, y: number }> = {};
  for (let r = row; r < row + rowsHeight; r++) {
    for (let c = column; c < columns; c++) {
      const element = map[`${c}_${r}`];
      if (!element) continue;

      collisionsMap[element.element.id] = { element: element.element, y: r };
      break;
    }
  }
  return Object.values(collisionsMap);
};

const leftCollisions = (
  column: number,
  row: number,
  rowsHeight: number,
  map: Record<string, ElementWrapped>,
) => {
  const collisionsMap: Record<string, { element: GridElement, y: number }> = {};
  for (let r = row; r < row + rowsHeight; r++) {
    for (let c = column; c >= 0; c--) {
      const element = map[`${c}_${r}`];
      if (!element) continue;

      collisionsMap[element.element.id] = { element: element.element, y: r };
      break;
    }
  }
  return Object.values(collisionsMap);
};

export const LinesContainer: React.FC = () => (
  <div data-id={LINES_CONTAINER} className="react-grid-panzoom-lines-container" />
);

const Lines: React.FC = () => {
  const {
    cols,
    colWidth,
    elements,
    elementsNodes,
    gapHorizontal,
    gapVertical,
    internalWidth,
    panZoomRef,
    paddingLeft,
    paddingRight,
    rowHeight,
    selectedElements,
  } = useGrid();

  const calculateCellPositionByPixels = useCalculateCellPositionByPixels();
  const measureElementHeight = useMeasureElementHeight();

  const firstSelectedElementId = selectedElements[0]?.id;
  const gridElement = useMemo(() => {
    if (!firstSelectedElementId) return null;
    return elements.find((item) => item.id === firstSelectedElementId) || null;
  }, [elements, firstSelectedElementId]);

  useEffect(() => {
    if (isLengthAuto(colWidth) || isLengthAuto(internalWidth) || !firstSelectedElementId) return;

    const elementNode = elementsNodes.current[firstSelectedElementId];
    if (!elementNode) return;

    const linesContainer = elementNode.querySelector(`[data-id="${LINES_CONTAINER}"]`);
    if (!linesContainer) return;

    const createLine = (direction: string) => {
      const line = document.createElement('div');
      line.classList.add('react-grid-panzoom-line');
      line.classList.add(`react-grid-panzoom-line--${direction}`);
      linesContainer.appendChild(line);
      return line;
    };

    const createRightLine = () => createLine('right');

    const createLeftLine = () => createLine('left');

    const leftLine = createLeftLine();
    const rightLine = createRightLine();

    const elementHeight = measureElementHeight(gridElement);
    const map = createMap(
      startingElementsWithoutSelected(elements, selectedElements),
      measureElementHeight,
    );

    const usedLines: Map<string | number, boolean> = new Map();
    const lines: Record<string | number, HTMLDivElement> = {};

    const drawTextInLine = (lineDiv: HTMLDivElement, value: number) => {
      if (value > 0) {
        lineDiv.innerHTML = `${value}`;
        lineDiv.style.display = null;
      } else {
        lineDiv.innerHTML = '';
        lineDiv.style.display = 'none';
      }
    };

    const clearLines = () => {
      Object.keys(lines).forEach((elementId) => {
        if (!usedLines.has(elementId)) {
          const lineDivElement = lines[elementId];
          delete lines[elementId];
          if (lineDivElement.parentNode) {
            lineDivElement.parentNode.removeChild(lineDivElement);
          }
        }
      });
    };

    const drawRightLines = (elementPosition: Position) => {
      const gridElementPosition = calculateCellPositionByPixels(
        elementPosition.x,
        elementPosition.y,
      );

      rightCollisions(
        gridElementPosition.x,
        cols,
        gridElementPosition.y,
        elementHeight,
        map,
      ).forEach((elementOnRight) => {
        let line = lines[elementOnRight.element.id];
        if (!line) {
          line = createRightLine();
          lines[elementOnRight.element.id] = line;
        }

        const collisionElementRight = calculatePixelsByCellPosition(elementOnRight.element, {
          gapHorizontal, gapVertical, paddingLeft, colWidth, rowHeight,
        });
        const currentElementRight = elementPosition.x + gridElement.w * colWidth;

        const rightWidth = collisionElementRight.x - currentElementRight;

        const top = (elementOnRight.y - gridElementPosition.y + 1) * rowHeight - rowHeight / 2;

        line.style.right = `-${rightWidth}px`;
        line.style.width = `${rightWidth}px`;
        line.style.top = `${top}px`;

        const colsWidth = elementOnRight.element.x - (gridElementPosition.x + gridElement.w);
        drawTextInLine(line, colsWidth);

        usedLines.set(`${elementOnRight.element.id}`, true);
      });
    };

    const drawLeftLines = (elementPosition: Position) => {
      const gridElementPosition = calculateCellPositionByPixels(
        elementPosition.x,
        elementPosition.y,
      );

      leftCollisions(
        gridElementPosition.x,
        gridElementPosition.y,
        elementHeight,
        map,
      ).forEach((elementOnleft) => {
        let line = lines[elementOnleft.element.id];
        if (!line) {
          line = createLeftLine();
          lines[elementOnleft.element.id] = line;
        }

        const collisionElementLeft = calculatePixelsByCellPosition(elementOnleft.element, {
          gapHorizontal, gapVertical, paddingLeft, colWidth, rowHeight,
        });
        const currentElementLeft = elementPosition.x;

        const leftWidth = currentElementLeft
          - (collisionElementLeft.x + elementOnleft.element.w * colWidth);

        const top = (elementOnleft.y - gridElementPosition.y + 1) * rowHeight - rowHeight / 2;

        line.style.left = `-${leftWidth}px`;
        line.style.width = `${leftWidth}px`;
        line.style.top = `${top}px`;

        const colsWidth = gridElementPosition.x
          - (elementOnleft.element.x + elementOnleft.element.w);
        drawTextInLine(line, colsWidth);

        usedLines.set(`${elementOnleft.element.id}`, true);
      });
    };

    const drawLines = (elementPosition: Position) => {
      usedLines.clear();
      drawLeftLines(elementPosition);
      drawRightLines(elementPosition);
      clearLines();
    };

    const timer = setInterval(() => {
      const elementsInMove = panZoomRef.current.getElements();
      const elementDetails = elementsInMove[firstSelectedElementId];
      if (!elementDetails) return;

      const elementPosition = elementDetails.position;
      const gridElementPosition = calculateCellPositionByPixels(
        elementPosition.x,
        elementPosition.y,
      );

      const leftWidth = elementPosition.x - paddingLeft;

      leftLine.style.left = `-${leftWidth}px`;
      leftLine.style.width = `${leftWidth}px`;
      drawTextInLine(leftLine, gridElementPosition.x);

      const rightWidth = internalWidth - paddingRight - elementPosition.x
        - gridElement.w * colWidth;

      rightLine.style.right = `-${rightWidth}px`;
      rightLine.style.width = `${rightWidth}px`;
      drawTextInLine(rightLine, cols - (gridElementPosition.x + gridElement.w));

      drawLines(elementPosition);
    }, 100);

    return () => {
      clearInterval(timer);
      linesContainer.removeChild(leftLine);
      linesContainer.removeChild(rightLine);

      usedLines.clear();
      clearLines();
    };
  }, [colWidth, firstSelectedElementId, gridElement, internalWidth]);

  return null;
};

export default Lines;
