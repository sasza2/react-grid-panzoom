import React from 'react';

type StyleProps = {
  children: string,
}

const Style: React.FC<StyleProps> = ({ children }) => (
  <style>{children}</style>
);

export default Style;
