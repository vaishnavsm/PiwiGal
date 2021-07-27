import { useRoute } from "@react-navigation/native";
import React from 'react';
import { listImagesByTag } from "../api/images";
import { ImageType } from "../api/types";
import { Slideshow } from "../components/Slideshow";

export const TagsSlideshow: React.FC = () => {
  const location = useRoute();
  const params = location.params as any;
  const image: ImageType = params?.image;
  const tags = params?.tags;
  const defaultPage = params?.page;
  const images = listImagesByTag({
    defaultPage,
    tags,
    union: false
  });
  return <Slideshow
    image={image}
    images={images}
  />
}