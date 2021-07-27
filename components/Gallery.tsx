import { Box, Button, FlatList, Heading, HStack, Image, VStack } from 'native-base';
import * as React from 'react';
import { TouchableNativeFeedback, useWindowDimensions } from 'react-native';
import { listImages } from '../api/images';
import { ImageType } from '../api/types';
import { LoadingView } from '../components/LoadingView';
import { MenuButton } from './MenuButton';

export function Gallery({
  images,
  heading,
  slideshowOn,
}: {
  images: ReturnType<typeof listImages>,
  heading: string,
  slideshowOn: (item: ImageType)=>any,
}) {
  const {width, height} = useWindowDimensions();
  const imgDim = Math.floor(Math.min(width, height)/2);

  if(images.isLoading) {
    return (
      <LoadingView />
    )
  } 

  else if(!images.data || images.error) {
    return (
      <VStack 
        flex={1} 
        justifyContent='center'
        alignItems='center'
        safeArea
      >
        <Heading>Hmmm... Something's Wrong</Heading>
      </VStack>
    )
  } 

  else
  return (
    <VStack 
      flex={1} 
      justifyContent='center'
      safeArea
    >
      <FlatList
        flex={1}
        numColumns={2}
        ListHeaderComponent={
          <HStack paddingX={4} alignItems="center">
            <MenuButton />
            <Box 
              flex={1}
              justifyContent="center" 
              alignItems="center" 
              paddingX={25} 
              paddingY={35}
            >
              <Heading>{heading}</Heading>
            </Box>
          </HStack>
        }
        keyExtractor={item => item.id}
        data={images.data.pages.map(x => x.list).flat()}
        renderItem={({item}: {item: ImageType})=>(
          <TouchableNativeFeedback 
            onPress={()=>slideshowOn && slideshowOn(item)}
          >
            <Image 
              width={imgDim} 
              height={imgDim} 
              source={{uri: item.square}} 
              alt="No :(" 
            />
          </TouchableNativeFeedback>
        )}
        
        onEndReached={()=>images.fetchNextPage()}
        ListFooterComponent={
          <Button 
            onPress={()=>images.fetchNextPage()} 
            isLoading={images.isFetchingNextPage}
          >
            Load More
          </Button>
        }
      />
    </VStack>
  );
}