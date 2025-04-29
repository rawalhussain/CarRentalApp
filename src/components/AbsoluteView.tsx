import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

interface IAbsoluteViewMethods {
  render: (key: string, jsx: React.JSX.Element) => void
}
interface Props {
  id: string
}
type IChildren = Array<{ key: string; jsx: React.JSX.Element }>
export const AbsoluteViews: { [id: string]: IAbsoluteViewMethods | undefined } = {};

export default function AbsoluteView({ id }: Props) {
  const [children, setChildren] = useState<IChildren>([]);
  const childrenRef = useRef<IChildren>([]);
  useEffect(() => {
    AbsoluteViews[id] = {
      render: (key, jsx) => {
        let newChildren = [...childrenRef?.current];
        const i = newChildren.findIndex(x => x.key == key);
        if (i >= 0) {
          newChildren[i] = { key, jsx };
        } else {newChildren.push({ key, jsx });}
        setChildren(newChildren);
        childrenRef.current = newChildren;
      },
    };

    return () => {
      AbsoluteViews[id] = undefined;
    };
  }, []);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: 100,
        height: 100,
        zIndex: 1,
      }}
    >
      {children.map(({ key, jsx }, index) => {
        return <View key={key}>{jsx}</View>;
      })}
    </View>
  );
}
