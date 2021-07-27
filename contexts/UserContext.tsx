import React, { Dispatch, SetStateAction, useState } from "react";

interface UserType {
  username: string;
  chunkSize?: number;
  token: string;
}

interface UserContextType {
  signedIn: boolean;
  hostUrl: string;
  setSignedIn: Dispatch<SetStateAction<boolean>>;
  setHostUrl: Dispatch<SetStateAction<string>>;
  user?: UserType;
  setUser: Dispatch<SetStateAction<UserType | undefined>>;
}

const defaults: UserContextType = {
  signedIn: false,
  setSignedIn: ()=>{},
  hostUrl: '',
  setHostUrl: ()=>{},
  user: undefined,
  setUser: ()=>{}
};

export const UserContext = React.createContext(defaults);

export const UserContextProvider: React.FC = ({children}) => {
  const [signedIn, setSignedIn] = useState(false);
  const [hostUrl, setHostUrl] = useState('');
  const [user, setUser] = useState<UserType | undefined>(undefined);

  return (
    <UserContext.Provider value={{
      signedIn,
      setSignedIn,
      hostUrl,
      setHostUrl,
      user,
      setUser,
    }}
    >
      {children}
    </UserContext.Provider>
  )
}