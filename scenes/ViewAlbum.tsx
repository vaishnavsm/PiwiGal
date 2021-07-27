import { useNavigation, useRoute } from "@react-navigation/native";
import * as React from 'react';
import { listImagesByAlbum } from "../api/images";
import { AlbumType, ImageType } from "../api/types";
import { Gallery } from "../components/Gallery";


export function ViewAlbum() {

  const location = useRoute();
  const album: AlbumType = (location.params as any)?.album;
  const navigate = useNavigation();

  const images = listImagesByAlbum({
    defaultPage: 0,
    album
  });

  const startSlideshowOn = async(image: ImageType) => {
    navigate.navigate("AlbumSlideshow", {
      image,
      album,
      page: image.page
    })
  }

  return <Gallery
    images={images}
    heading={album.name}
    slideshowOn={startSlideshowOn}
  />
}