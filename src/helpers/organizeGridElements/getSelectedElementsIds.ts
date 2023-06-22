import { GridElement } from 'types';

type GetSelectedElementsIds = (selectedElements: Array<GridElement>) => Array<string | number>

// eslint-disable-next-line
export const getSelectedElementsIds: GetSelectedElementsIds = (selectedElements) => selectedElements.map((element) => element.id);
