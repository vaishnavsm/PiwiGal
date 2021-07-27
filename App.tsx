import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Box, Divider, Heading, NativeBaseProvider, Text } from 'native-base';
import * as React from 'react';
import 'react-native-gesture-handler';
import {
  QueryClient,
  QueryClientProvider
} from 'react-query';
import { OptionsContext, OptionsContextProvider } from './contexts/OptionsContext';
import { UserContext, UserContextProvider } from './contexts/UserContext';
import { AlbumList } from './scenes/AlbumList';
import { AlbumSlideshow } from './scenes/AlbumSlideshow';
import { Auth } from './scenes/Auth';
import { Loading } from './scenes/Loading';
import { TagList } from './scenes/TagsList';
import { TagsSlideshow } from './scenes/TagsSlideshow';
import { ViewAlbum } from './scenes/ViewAlbum';
import { ViewTags } from './scenes/ViewTags';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 30000,
      staleTime: 30000
    }
  }
});

const DrawerSlides = ()=>(
  <Stack.Navigator headerMode="none">
    <Stack.Screen name="Loading" component={Loading} />
    <Stack.Screen name="Auth" component={Auth} />
    <Stack.Screen name="Logout" component={Auth} />
    <Stack.Screen name="AlbumList" component={AlbumList} />
    <Stack.Screen name="TagList" component={TagList} />
    <Stack.Screen name="ViewAlbum" component={ViewAlbum} />
    <Stack.Screen name="ViewTags" component={ViewTags} />
    <Stack.Screen name="TagsSlideshow" component={TagsSlideshow} />
    <Stack.Screen name="AlbumSlideshow" component={AlbumSlideshow} />
  </Stack.Navigator>
);

const Sidebar = (props: any) => {
  const user = React.useContext(UserContext);
  const options = React.useContext(OptionsContext);
  return (
    <DrawerContentScrollView {...props}>
      <Box paddingX={4} paddingTop={8} paddingBottom={4}>
        <Heading>PiwiGal</Heading>
        <Text fontSize={16}>Hey, {user.user?.username}</Text>
        <Text fontSize={12} color="#999999">{user.hostUrl.split("/ws")[0]}</Text>
      </Box>
        <DrawerItem labelStyle={{fontSize: 24, textAlign: 'center'}} label="Log Out" onPress={()=>{
          props.navigation.navigate("LogOut");
        }} />
      <Divider marginY={4} />
      <DrawerItem labelStyle={{fontSize: 24, textAlign: 'center'}} label="Albums" onPress={()=>{
        props.navigation.navigate("AlbumList");
      }} />
      <DrawerItem labelStyle={{fontSize: 24, textAlign: 'center'}} label="Keywords" onPress={()=>{
        props.navigation.navigate("TagList");
      }} />
      <DrawerItem 
        labelStyle={{fontSize: 24, textAlign: 'center'}} 
        label="Tagging Mode" 
        style={{ backgroundColor: options.taggingMode ? '#7878e9' : 'white' }}
        onPress={()=>{
        options.setTaggingMode(m => !m);
      }} />
      
      <Box flex={1} />
    </DrawerContentScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <NativeBaseProvider>
        <UserContextProvider>
          <OptionsContextProvider>
            <QueryClientProvider client={queryClient}>
              <Drawer.Navigator 
                initialRouteName="Home" 
                drawerContent={props => <Sidebar {...props} />}
              >
                <Drawer.Screen name="Content" component = {DrawerSlides} />
              </Drawer.Navigator>
            </QueryClientProvider>
          </OptionsContextProvider>
        </UserContextProvider>
      </NativeBaseProvider>
    </NavigationContainer>
  );
}