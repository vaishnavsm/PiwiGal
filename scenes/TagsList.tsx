import { useNavigation } from '@react-navigation/core';
import { Badge, Box, Button, FlatList, Heading, HStack, Text, View, VStack } from 'native-base';
import * as React from 'react';
import { ActivityIndicator, TouchableNativeFeedback } from 'react-native';
import { useListTags } from '../api/tags';
import { TagType } from '../api/types';
import { MenuButton } from '../components/MenuButton';


export function TagList() {
  const nav = useNavigation();
  const tags = useListTags();
  const [selectedTags, setSelectedTags] = React.useState<Record<string, TagType>>({})
  const toggleTag = (tag: TagType) => {
    return ()=>{
      setSelectedTags(tags => ({
        ...tags,
        [tag.id]: !tags[tag.id]
      }))
    }
  }
  
  const gotoGallery = ()=>{
    const tagIds = (Object.entries(selectedTags).filter(x => x[1]).map(x => x[0]));
    const tagList = tags.data?.filter(x => tagIds.includes(x.id.toString()));
    nav.navigate("ViewTags", {
      tags: tagList
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
          <Heading>Tags</Heading>
        </Box>
      </HStack>
      <VStack flex={1} alignItems="center">
        {
          tags.isLoading ? <ActivityIndicator size="large" color={"#444444"} />
          : <FlatList 
              numColumns={3} 
              data={tags.data}
              keyExtractor={item => item.id}
              renderItem={({item: tag}) => (
                <Box padding={1}>

                  <TouchableNativeFeedback key={tag.id} onPress={toggleTag(tag)}>
                    <Badge variant="solid" colorScheme={selectedTags[tag.id] ? "primary" : undefined}>
                      <View padding={2}>
                        <Text color="white" fontSize={16}>{tag.name}</Text>
                      </View>
                    </Badge>
                  </TouchableNativeFeedback>
                </Box>
              )}
            />
        }
      </VStack>
      <Box padding={8}>
        <Button rounded={30} onPress={gotoGallery}>See Pictures</Button>
      </Box>
    </VStack>
  );
}