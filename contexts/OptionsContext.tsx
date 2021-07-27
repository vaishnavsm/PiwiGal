import React, { Dispatch, SetStateAction, useState } from "react";

interface OptionsContextType {
  taggingMode: boolean;
  setTaggingMode: Dispatch<SetStateAction<boolean>>;
}

const defaults: OptionsContextType = {
  taggingMode: false,
  setTaggingMode: ()=>{},
};

export const OptionsContext = React.createContext(defaults);

export const OptionsContextProvider: React.FC = ({children}) => {
  const [taggingMode, setTaggingMode] = useState(false);

  return (
    <OptionsContext.Provider value={{
      taggingMode, setTaggingMode
    }}
    >
      {children}
    </OptionsContext.Provider>
  )
}