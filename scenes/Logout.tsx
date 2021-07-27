import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useContext, useEffect } from 'react';
import { LoadingView } from '../components/LoadingView';
import { UserContext } from '../contexts/UserContext';
import { toFormData } from '../helpers/toFormData';

export const Logout: React.FC = () => {
  const navigation = useNavigation();
  const user = useContext(UserContext);

  useEffect(() => {
    (async ()=>{
      try {
        await axios({
          method: 'POST',
          url: user.hostUrl,
          data: toFormData({
            method: 'pwg.session.logout'
          }),
          withCredentials: true
        });
        user.setSignedIn(false);
        user.setHostUrl('');
        user.setUser(undefined);
      } catch (err) {
        console.error(err);
      }
      navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
    })();
  }, []);

  return <LoadingView />;
};
