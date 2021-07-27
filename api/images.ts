import axios from "axios";
import { useContext, useMemo } from "react";
import { useInfiniteQuery } from "react-query";
import { UserContext } from "../contexts/UserContext";
import { toFormData } from "../helpers/toFormData";
import { AlbumType, ImageType, TagType } from "./types";


export const listImages = (query: any, tag: string, defaultPage = 0) => {
  const user = useContext(UserContext);
  return useInfiniteQuery<{
    list: ImageType[],
    pageNumber: number
  }>(tag, ({pageParam}) => axios
      .post(user.hostUrl, toFormData({...query, page: pageParam || defaultPage}), {withCredentials: true})
      .then(({data}) => {
        if(!data?.result?.images) return {list: [], pageNumber: pageParam || defaultPage};
        const res = data.result.images.map((c: any) => ({
          url: c.element_url,
          square: c.derivatives.medium.url,
          name: c.file,
          id: c.id,
          page: pageParam || defaultPage,
          width: c.width,
          height: c.height,
        } as ImageType));
        
        return {list: res, pageNumber: pageParam || defaultPage};
      }),
      {
        getNextPageParam: (lastPage) => lastPage.pageNumber + 1,
        getPreviousPageParam: (firstPage) => firstPage.pageNumber + 1,
      }
    );
}

export const listImagesByAlbum = ({ defaultPage, album }: {
  defaultPage: number,
  album: AlbumType
}) => {
  return listImages({
    method: 'pwg.categories.getImages',
    cat_id: album.id,
    page: defaultPage,
    per_page: 16,
  }, "albumImages"+album.id, defaultPage);
}

export const listImagesByTag = ({ defaultPage, tags, union = false }: {
  defaultPage: number;
  tags: TagType[];
  union: boolean
}) => {
  const tagsListRaw = useMemo( ()=>tags.map(x => x.id), [tags] );
  const tagsList = tagsListRaw.length === 1 ? tagsListRaw[0] : tagsListRaw;
  const tagsListStr = tagsList.toString();
  return listImages({
    method: 'pwg.tags.getImages',
    tag_id: tagsList,
    page: defaultPage,
    per_page: 16,
    tag_mode_and: !union
  }, 'tagImages'+tagsListStr,defaultPage);
}