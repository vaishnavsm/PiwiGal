import { useRoute } from "@react-navigation/native";
import React from 'react';
import { listImagesByAlbum } from "../api/images";
import { ImageType } from "../api/types";
import { Slideshow } from "../components/Slideshow";

export const AlbumSlideshow: React.FC = () => {
  const location = useRoute();
  const params = location.params as any;
  const image: ImageType = params?.image;
  const album = params?.album;
  const defaultPage = params?.page;
  const images = listImagesByAlbum({
    defaultPage,
    album
  });
  return <Slideshow
    image={image}
    images={images}
  />
}