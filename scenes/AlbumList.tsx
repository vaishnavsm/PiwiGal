import { useNavigation } from '@react-navigation/core';
import axios from 'axios';
import { Box, Divider, Heading, HStack, Image, View, VStack } from 'native-base';
import * as React from 'react';
import { ActivityIndicator, Text, TouchableNativeFeedback } from 'react-native';
import { useQuery } from 'react-query';
import { AlbumType } from '../api/types';
import { MenuButton } from '../components/MenuButton';
import { UserContext } from '../contexts/UserContext';
import { toFormData } from '../helpers/toFormData';


export function AlbumList() {
  const user = React.useContext(UserContext);
  const nav = useNavigation();
  const albums = useQuery('albumList', () => axios
      .post(user.hostUrl, toFormData({
        method: 'pwg.categories.getList'
      }), {withCredentials: true})
      .then(({data}) => {
        if(!data?.result?.categories) return [];

        const res = data.result.categories.map((c: any) => ({
          rank: c.global_rank,
          id: c.id,
          name: c.name,
          numImages: c.nb_images,
          image: c.tn_url,
        } as AlbumType));
        return res;
      })
    )
  
  const openAlbum = (album: AlbumType) => {
    nav.navigate("ViewAlbum", {
      album: album
    })
  }

  return (
    
    <VStack 
      flex={1} 
      justifyContent='center'
      safeArea
    >
      <HStack alignItems="center" paddingX={4}>
        <MenuButton />
        <Box flex={1} justifyContent="center" alignItems="center" paddingX={25} paddingY={35}>
          <Heading>Albums</Heading>
        </Box>
      </HStack>
      <VStack flex={1}>
        {
          albums.isLoading ? <ActivityIndicator size="large" color={"#444444"} />
          : albums.data?.map((album: AlbumType) => (
            <TouchableNativeFeedback key={album.id} onPress={()=>openAlbum(album)}>
              <View>
                <HStack paddingY={1} paddingX={5} >
                  <Image source={{uri: album.image}}
                    size="xl"
                    alt={album.name}
                  />
                  <VStack
                    flex={1}
                    paddingX={10}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Heading>{album.name}</Heading>
                    <Text>{album.numImages} Images</Text>
                  </VStack>
                </HStack>
                <Divider />
              </View>
            </TouchableNativeFeedback>
          ))
        }
      </VStack>
    </VStack>
  );
}