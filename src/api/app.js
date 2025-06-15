import React, {createContext, useState} from 'react';

export const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [isIntro, setIsIntro] = useState(true);

  return <AppContext.Provider value={{isIntro, setIsIntro}}>{children}</AppContext.Provider>;
};
