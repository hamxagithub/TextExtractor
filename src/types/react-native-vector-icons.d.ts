declare module 'react-native-vector-icons/MaterialIcons' {
  import React from 'react';
  import { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  declare const Icon: React.FC<IconProps>;
  export default Icon;
}
