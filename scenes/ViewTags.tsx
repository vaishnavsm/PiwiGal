
import { useNavigation, useRoute } from "@react-navigation/native";
import * as React from 'react';
import { listImagesByTag } from "../api/images";
import { ImageType, TagType } from "../api/types";
import { Gallery } from "../components/Gallery";

export function ViewTags() {

  const location = useRoute();
  const tags: TagType[]  = (location.params as any)?.tags;
  const navigate = useNavigation();

  const images = listImagesByTag({
    defaultPage: 0,
    tags,
    union: true
  });

  const startSlideshowOn = async(image: ImageType) => {
    navigate.navigate("TagsSlideshow", {
      image,
      tags,
      page: image.page
    })
  }

  return <Gallery
    images={images}
    heading={tags.length === 1 ? tags[0].name : `${tags.length} Tags`}
    slideshowOn={startSlideshowOn}
  />
}