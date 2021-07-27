import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useContext, useEffect } from 'react';
import { LoadingView } from '../components/LoadingView';
import { UserContext } from '../contexts/UserContext';
import { toFormData } from '../helpers/toFormData';

export const Loading: React.FC = () => {
  const navigation = useNavigation();
  const user = useContext(UserContext);

  useEffect(() => {
    (async ()=>{
      try {
        const host = await AsyncStorage.getItem('HOST');
        if(host) {
          user.setHostUrl(host);
  
          const {data: sessionData} = await axios({
            method: 'POST',
            url: host,
            data: toFormData({
              method: 'pwg.session.getStatus'
            }),
            withCredentials: true
          });
      
          if(!sessionData || sessionData.stat !== 'ok' || sessionData.result?.username === 'guest' ) {
            return;
          }
  
          user.setSignedIn(true);
          user.setUser({
            username: sessionData.result.username,
            chunkSize: sessionData.result.upload_form_chunk_size,
            token: sessionData.result.pwg_token,
          });
  
          navigation.reset({index: 0, routes: [{name: 'AlbumList'}]})
          return;
        }
      } catch (err) {
        console.error(err);
      }
      navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
    })();
  }, []);

  return <LoadingView />;
};
