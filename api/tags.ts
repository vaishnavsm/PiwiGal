import axios from "axios";
import { useContext } from "react";
import { useQuery } from "react-query";
import { UserContext } from "../contexts/UserContext";
import { toFormData } from "../helpers/toFormData";
import { ImageType, TagType } from "./types";


export const useListTags = ()=>{
  const user = useContext(UserContext);
  return useQuery<TagType[]>('tags', ()=>axios.post(
    user.hostUrl,
    toFormData({
      method: 'pwg.tags.getList',
    }),
    { withCredentials: true }
    ).then(({data}) => {
      return data.result.tags.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        count: tag.counter,
      } as  TagType)) 
      .sort((a: TagType, b: TagType) => b.count - a.count);
    })
  )
}

export const getTagsByImage = (image: ImageType, hostUrl: string) => 
 axios.post(hostUrl, toFormData({
    method: 'pwg.images.getInfo',
    image_id: image.id
  }), {withCredentials: true})
  .then(({data}) => data?.result?.tags || []);