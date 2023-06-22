import React from 'react';

import { GridElement } from 'types';
import Style from '../Style';
import Grid from '..';

export default { title: 'Grid' };

const PADDING_LEFT = 40;
const MARGIN_Y = 3;
const ROW_HEIGHT = 46 - MARGIN_Y;
const ROWS = 30;

type EmployeeProps = {
  backgroundColor?: string,
  firstName: string,
  lastName: string,
}

const Employee: React.FC<EmployeeProps> = ({ backgroundColor, firstName, lastName }) => (
  <div className="employee" style={{ backgroundColor }}>
    <div className="employee__avatar" />
    <div className="employee__about">
      <div className="employee__fullname">
        {firstName}
        {' '}
        {lastName}
      </div>
      <div className="employee__additional">Today</div>
    </div>
  </div>
);

type TaskProps = {
  name: string,
}

const Task: React.FC<TaskProps> = ({ name }) => (
  <div className="task">
    {name}
  </div>
);

const createGrid = (cols: number, initialElements: GridElement[]) => {
  const GridWrapper = () => {
    const [elements, setElements] = React.useState(initialElements);

    const grid = (() => {
      const time = new Date();
      time.setHours(8);
      time.setMinutes(0);
      time.setSeconds(0);

      const items = [];
      for (let i = 1; i <= ROWS - 1; i++) {
        const minutes = time.getMinutes();
        const item = (
          <div className="time-frame" key={i} style={{ top: ROW_HEIGHT + i * ROW_HEIGHT + MARGIN_Y * i }}>
            <div className="time-frame__hour">
              {`${time.getHours()}:${minutes < 10 ? `0${minutes}` : minutes}`}
            </div>
            <div className="time-frame__line" />
          </div>
        );
        time.setMinutes(time.getMinutes() + 15);
        items.push(item);
      }

      return items;
    })();

    return (
      <>
        <Style>
          {`
            body {
              font-family: Arial, sans-serif;
            }
            .employee {
              margin-top: 23px;
              display: flex;
              height: ${ROW_HEIGHT}px;
              border-radius: 8px;
              background-color: #e7e5f2;
            }
            .employee__about {
              align-self: center;
            }
            .employee__additional {
              color: #555;
              font-weight: 600px;
              font-size: 10px;
            }
            .employee__fullname {
              color: #5d5d9e;
              font-size: 12px;
              font-weight: 600;
            }
            .employee__avatar {
              margin: 0 8px;
              align-self: center;
              width: 28px;
              height: 28px;
              background-color: #fff;
              border-radius: 6px;
            }
            .time-frame {
              display: flex;
              position: absolute;
              width: 100%;
              height: ${ROW_HEIGHT}px;
              font-size: 10px;
            }
            .time-frame__hour {
              position: relative;
              top: -5px;
              justify-self: center;
              width: 40px;
            }
            .time-frame__line {
              width: calc(100% - ${PADDING_LEFT}px);
              height: calc(1px / var(--zoom, 1));
              background-color: #ddd;
            }
            .task {
              padding: 10px;
              width: 100%;
              height: 100%;
              color: #5d5d9e;
              box-sizing: border-box;
              font-size: 12px;
              font-weight: 600;
              background-color: #fff;
              box-shadow: 1px 1px 6px 1px rgba(66, 68, 90, 0.2);
              border-radius: 5px;
            }
          `}
        </Style>
        <React.StrictMode>
          <Grid
            autoOrganizeElements
            cols={cols}
            rowHeight={ROW_HEIGHT}
            rows={ROWS}
            elements={elements}
            setElements={setElements}
            gapHorizontal={70}
            gapVertical={MARGIN_Y}
            paddingLeft={PADDING_LEFT}
            paddingRight={3}
          >
            {grid}
          </Grid>
        </React.StrictMode>
      </>
    );
  };

  return GridWrapper;
};

export const grid = createGrid(5, [
  {
    render: () => <Employee firstName="Paulo" lastName="Santana" />,
    x: 0,
    y: 0,
    w: 1,
    h: 2,
    disabled: true,
  },
  {
    render: () => <Employee firstName="Emily" lastName="Green" backgroundColor="#ffefe7" />,
    x: 1,
    y: 0,
    w: 1,
    h: 2,
    disabled: true,
  },
  {
    render: () => <Employee firstName="Laura" lastName="Boo" backgroundColor="#eff9f8" />,
    x: 2,
    y: 0,
    w: 1,
    h: 2,
    disabled: true,
  },
  {
    render: () => <Task name="Office team meeting" />,
    x: 0,
    y: 3,
    w: 1,
    h: 1,
  },
  {
    render: () => <Task name="Design meeting" />,
    x: 0,
    y: 6,
    w: 3,
    h: 1,
  },
  {
    render: () => <Task name="hi meeting" />,
    x: 1,
    y: 7,
    w: 1,
    h: 3,
  },
  {
    render: () => <Task name="long" />,
    x: 3,
    y: 3,
    w: 1,
    h: 18,
  },
  {
    render: () => <Task name="wide" />,
    x: 0,
    y: 2,
    w: 5,
    h: 1,
  },
]);

export const gridOneColumn = createGrid(1, [
  {
    render: () => <Employee firstName="Paulo" lastName="Santana" />,
    x: 0,
    y: 0,
    w: 1,
    h: 2,
    disabled: true,
  },
  {
    render: () => <Task name="Design meeting" />,
    x: 0,
    y: 4,
    w: 1,
    h: 1,
  },
  {
    render: () => <Task name="Office meeting" />,
    x: 0,
    y: 5,
    w: 1,
    h: 1,
  },
  {
    render: () => <Task name="bla bla" />,
    x: 0,
    y: 7,
    w: 1,
    h: 5,
  },
]);
