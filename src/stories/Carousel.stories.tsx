import React from 'react';

import { GridElement } from 'types';
import Style from '../Style';
import Grid from '..';

export default { title: 'Carousel' };

type ElementProps = {
  id: number,
}

const Element: React.FC<ElementProps> = ({ id }) => (
  <div className="element">
    {id}
  </div>
);

type CreateCarousel = (props: {
  addX: number,
  addY: number,
  cols: number,
  rows: number,
}) => React.FC

const createCarousel: CreateCarousel = ({
  addX,
  addY,
  cols,
  rows,
}) => {
  const Carousel = () => {
    const [elements, setElements] = React.useState<GridElement[]>(
      () => [...new Array(Math.max(rows, cols))] // eslint-disable-line
        .map((empty, index) => ({
          render: () => <Element id={index + 1} />,
          x: index * addX,
          y: index * addY,
          resizable: false,
        }) as GridElement),
    );

    return (
      <div className="carousel">
        <Style>
          {`
            body {
              font-family: Arial, sans-serif;
            }
            .carousel {
              width: ${90 * cols + addX * 10 * (cols - 1)}px;
            }
            .element {
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 36px;
              height: 100%;
              border: calc(1px / var(--zoom, 1)) solid #d0d7de;
              box-sizing: border-box;
            }
          `}
        </Style>
        <Grid
          cols={cols}
          disabledMove
          disabledZoom
          rowHeight={90}
          rows={rows}
          elements={elements}
          setElements={setElements}
          gapVertical={addY * 10}
          gapHorizontal={addX * 10}
        />
      </div>
    );
  };
  return Carousel;
};

export const vertical = createCarousel({
  addX: 0,
  addY: 1,
  rows: 6,
  cols: 1,
});

export const horizontal = createCarousel({
  addX: 1,
  addY: 0,
  rows: 1,
  cols: 6,
});
