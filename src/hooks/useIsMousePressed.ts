import { useEffect, useState } from 'react';

const useIsMousePressed = (): boolean => {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMouseDown = () => {
      setPressed(true);
    };

    const onMouseUp = () => {
      setPressed(false);
    };

    window.addEventListener('pointerdown', onMouseDown);
    window.addEventListener('pointerup', onMouseUp);

    return () => {
      window.removeEventListener('pointerdown', onMouseDown);
      window.removeEventListener('pointerup', onMouseUp);
    };
  }, []);

  return pressed;
};

export default useIsMousePressed;
