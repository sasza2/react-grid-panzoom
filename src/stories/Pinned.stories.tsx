import React from 'react';

import { GridElement } from 'types';
import Style from '../Style';
import Grid from '..';

export default { title: 'Pinned' };

type ProjectProps = {
  name: string,
}

const Project: React.FC<ProjectProps> = ({ name }) => (
  <div className="project">
    <span className="project__name">{name}</span>
  </div>
);

export const pinned = () => {
  const [elements, setElements] = React.useState([
    {
      render: () => <Project name="arrows" />,
      x: 0,
      y: 0,
    },
    {
      render: () => <Project name="react-panzoom" />,
      x: 1,
      y: 0,
    },
    {
      render: () => <Project name="react-drawing" />,
      x: 0,
      y: 1,
    },
    {
      render: () => <Project name="sand" />,
      x: 1,
      y: 1,
    },
    {
      render: () => <Project name="react-arrows" />,
      x: 0,
      y: 2,
    },
    {
      render: () => <Project name="react-url-sync" />,
      x: 1,
      y: 2,
    },
  ] as GridElement[]);

  return (
    <>
      <Style>
        {`
          body {
            font-family: Arial, sans-serif;
          }
          .project {
            padding: 16px;
            height: 100%;
            border: calc(1px / var(--zoom, 1)) solid #d0d7de;
            border-radius: 5px;
            box-sizing: border-box;
          }
          .project__name {
            color: #0969da;
            font-weight: 600;
          }
        `}
      </Style>
      <Grid
        boundary
        cols={3}
        rowHeight={90}
        rows={5}
        elements={elements}
        setElements={setElements}
        gapHorizontal={20}
        gapVertical={20}
      />
    </>
  );
};
