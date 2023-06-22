import { GridElement } from 'types';

const copyElements = (elements: GridElement[]) => elements.map((element) => ({ ...element }));

export default copyElements;
