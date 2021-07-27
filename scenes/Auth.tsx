import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/core';
import axios from 'axios';
import { Button, Center, Heading, Input, VStack } from 'native-base';
import * as React from 'react';
import 'react-native-gesture-handler';
import { UserContext } from '../contexts/UserContext';
import { toFormData } from '../helpers/toFormData';

export function Auth() {
  const user = React.useContext(UserContext);
  const nav = useNavigation();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [host, setHost] = React.useState(user.hostUrl.split("/ws.php")[0] || '');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    try {

      let fullHost = "";
      if(host[host.length - 1] === "/") fullHost = host + "ws.php?format=json";
      else fullHost = host + "/ws.php?format=json"; 
      
      const {data: signinData} = await axios.post(
      fullHost, 
      toFormData({
        method: 'pwg.session.login',
        username,
        password
      }), {withCredentials: true}).catch((err) => {
        console.error(err); 
        return {error: true, data: null}
      });
  
      if(!signinData || !signinData.result) {
        return;
      }
  
      const {data: sessionData} = await axios({
        method: 'POST',
        url: fullHost,
        data: toFormData({
          method: 'pwg.session.getStatus'
        }),
        withCredentials: true
      });
  
      if(!sessionData || sessionData.stat !== 'ok' ) {
        return;
      }

      await AsyncStorage.setItem('HOST', fullHost);

      user.setHostUrl(fullHost);
      user.setSignedIn(true);
      user.setUser({
        username: sessionData.result.username,
        chunkSize: sessionData.result.upload_form_chunk_size,
        token: sessionData.result.pwg_token,
      });

      nav.reset({index: 0, routes: [{name: 'AlbumList'}]})

    } catch(err){
      console.error(err);
    } finally {
      setLoading(false);
    }
  } 

  return (
    <VStack 
      flex={1} 
      justifyContent='center'
      safeArea
      paddingX={5}
    >
      <Center>
        <Heading>Log In To Piwigo</Heading>
      </Center>
      <VStack paddingY={10}>
        <Input
            size="sm"
            variant="underlined"
            placeholder="Host Address"
            value={host}
            onChangeText={setHost}
            _light={{
              placeholderTextColor: "blueGray.400",
            }}
            _dark={{
              placeholderTextColor: "blueGray.50",
            }}
          />

          <Input
            size="sm"
            variant="underlined"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            _light={{
              placeholderTextColor: "blueGray.400",
            }}
            _dark={{
              placeholderTextColor: "blueGray.50",
            }}
          />

          <Input
            size="sm"
            variant="underlined"
            placeholder="Password"
            type="password"
            value={password}
            onChangeText={setPassword}
            _light={{
              placeholderTextColor: "blueGray.400",
            }}
            _dark={{
              placeholderTextColor: "blueGray.50",
            }}
          />
      </VStack>
      <Button size={"md"} onPress={handleLogin} isLoading={loading}>
        Sign In
      </Button>
    </VStack>
  );
}