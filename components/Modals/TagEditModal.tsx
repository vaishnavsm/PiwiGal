import axios from 'axios';
import { Badge, Box, FlatList, Heading, HStack, Input, Text, VStack } from 'native-base';
import React, { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { useQueryClient } from 'react-query';
import { getTagsByImage, useListTags } from '../../api/tags';
import { ImageType, TagType } from '../../api/types';
import { SlidingModal } from '../../components/SlidingModal';
import { UserContext } from '../../contexts/UserContext';
import { toFormData } from '../../helpers/toFormData';

type TagEditModalType = {
  currentImage: ImageType;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;

}

const itemToId = (item: any) => item.id;

export const TagEditModal: React.FC<TagEditModalType> = ({
  currentImage,
  open,
  setOpen,
}) => {
  const user = useContext(UserContext);
  const [currentTags, setCurrentTags] = useState<Record<string, TagType>>({});
  const [tagSearch, setTagSearch] = useState('');
  const queryClient = useQueryClient();
  const tags = useListTags(); 

  useEffect(()=>{
    if(!open) return;
    (async () => {

      const rawTags = await getTagsByImage(currentImage, user.hostUrl);

      const tags: TagType[] = rawTags.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        urlName: tag.url_name,
        toDelete: false,
        existing: true,
        toAdd: false,
      }));

      const tagMap: Record<string, TagType> = {};
      tags.forEach((e:TagType) => {
        tagMap[e.id] = e;
      });

      setCurrentTags(tagMap);
      
    })();
  }, [open]);


  const handleSaveTags = useCallback(async ()=>{
    const ct = Object.values(currentTags);
    const toCreate = ct.filter(x => x.id < 0 && x.toAdd === true);
    const results = await Promise.all(
      toCreate.map(tag => axios.post(user.hostUrl,
        toFormData({
          method: "pwg.tags.add",
          name: tag.name
        })).then(({data})=>{
          if(data.stat !== "ok") return null;
          return ({
            oldId: tag.id,
            newId: data.result.id
          })
        })));
    const changeMap: Record<number, number> = {};
    results.forEach(res => {
      if(res) {
        changeMap[res.oldId] = res.newId;
      }
    });

    const finalTagList = ct
      .filter(x => !x.toDelete)
      .map(x => x.id in changeMap ? changeMap[x.id] : x.id)
      .filter(x => x >= 0)
      .join(',');
    
    await axios.post(user.hostUrl, toFormData({
      method: 'pwg.images.setInfo',
      image_id: currentImage.id,
      tag_ids: finalTagList,
      multiple_value_mode: 'replace',
    }), {withCredentials: true});
    await queryClient.invalidateQueries('tags');
    setCurrentTags({});
    setOpen(false);
  }, [
      setOpen, 
      setCurrentTags, 
      queryClient, 
      currentTags, 
      user.hostUrl, 
      currentImage
    ]
  );

  const allTags = useMemo(()=>[
    ...(tags.data || []),
    ...(Object.values(currentTags).filter(x => x.id < 0))
  ]
  .sort((a, b) => {
    const sa = !!currentTags[a.id];
    const sb = !!currentTags[b.id];
    if(sa && sb) return a.count - b.count;
    else if (sa) return -1;
    else if (sb) return 1;
    else return a.count - b.count;  
  })
  , [tags, currentTags]);

  const handleCancel = useCallback(()=>{
    setCurrentTags({}); 
    setOpen(false);
  }, [setOpen, setCurrentTags]);

  const handleAddNewTag = useCallback(()=>{
    const tagsData = tags?.data || [];
    const tag = tagsData.filter(
      (x: TagType) => x.name.toLowerCase() === tagSearch.toLowerCase()
    );

    if(tag.length === 0) {
      setCurrentTags(tags => {
        const n = JSON.parse(JSON.stringify(tags));
        const id = -Math.floor(Math.random()*10000);
        n[id] = {
          id,
          name: tagSearch,
          toDelete: false,
          existing: false,
          toAdd: true,
        };
        return n;
      })
    } else {
      setCurrentTags(tags => {
        const n = JSON.parse(JSON.stringify(tags));
        n[tag[0].id] = {
          ...tag[0],
          ...(n[tag[0].id] ? n[tag[0].id] : {}),
          existing: true,
          toAdd: true,
        };
        return n;
      })
    }

    setTagSearch('');
  }, [tags, setCurrentTags, tagSearch]);

  const filteredTags = useMemo(()=>allTags
      .filter(x => x.name.toLowerCase().includes(tagSearch.toLowerCase())),
    [allTags, tagSearch]);

  const handleToggleTags = useCallback((item: TagType)=>()=>{
    setCurrentTags(ct => {
      const nct = JSON.parse(JSON.stringify(ct));
      const curr = nct[item.id];
      if(!curr) {
        nct[item.id] = {
          ...item,
          toAdd: true,
          existing: true,
          toDelete: false,
        }
      } else if (curr.toAdd) {
        delete nct[curr.id];
      } else {
        nct[curr.id] = {
          ...curr,
          toDelete: !curr.toDelete
        }
      }
      return nct;
    });
  }, [setCurrentTags]);

  return (
  <SlidingModal 
    open={open} 
    setOpen={setOpen} 
    style={{backgroundColor: '#44444477', minHeight: '30%', maxHeight: '40%'}}
  >
    <VStack padding={5}>
      <HStack padding={2} width={"100%"}>
        <Heading flex={1} color="white">Manage Tags</Heading>
        <TouchableNativeFeedback onPress={handleCancel}>
          <Box 
            borderRadius={8} 
            borderRightRadius={0} 
            padding={3} 
            backgroundColor="#ee5140"
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path fill="white" d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/>
          </Svg>
          </Box>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={handleSaveTags}>
          <Box borderRadius={8} borderLeftRadius={0} padding={3} backgroundColor="#40eec2">
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path fill="white" d="M15.003 3h2.997v5h-2.997v-5zm8.997 1v20h-24v-24h20l4 4zm-19 5h14v-7h-14v7zm16 4h-18v9h18v-9z"/>
          </Svg>
          </Box>
        </TouchableNativeFeedback>
      </HStack>
      <HStack padding={2} width={"100%"}>
        <Input color='white' value={tagSearch} onChangeText={setTagSearch} flex={1} variant="outline" placeholder="Search" borderRightRadius={0} />
        <TouchableNativeFeedback onPress={handleAddNewTag}>
          <Box borderRadius={8} borderLeftRadius={0} padding={3} backgroundColor="#40c2ee">
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path fill="white" d="M24 9h-9v-9h-6v9h-9v6h9v9h6v-9h9z"/>
          </Svg>
          </Box>
        </TouchableNativeFeedback>
      </HStack>
      <FlatList 
        numColumns={3}
        data={filteredTags}
        keyExtractor = {itemToId}
        renderItem={item => (
          <Box padding={1}>
            <TouchableNativeFeedback onPress={handleToggleTags(item.item)}>
              <Badge padding={2} variant="solid" colorScheme={
                currentTags[item.item.id] ? (currentTags[item.item.id].toDelete ? 'danger' : 'primary' ) : undefined
              }>
                <Text color="white">
                  {item.item.name}
                </Text>
              </Badge>
            </TouchableNativeFeedback>
          </Box>
        )}
      />
    </VStack>
  </SlidingModal>
  );
};
