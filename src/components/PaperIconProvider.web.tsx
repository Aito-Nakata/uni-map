import React from 'react';
import Icon from './Icon.web';

// Icon provider for React Native Paper
export const PaperIconProvider = (props: any) => {
  const { name, size = 24, color = '#000' } = props;
  
  return (
    <Icon 
      name={name} 
      size={size} 
      color={color} 
    />
  );
};

export default PaperIconProvider;