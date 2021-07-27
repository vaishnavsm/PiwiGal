import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

export type ZoomableImageProps = {
  children: React.ReactNode,
  zoomMode: boolean;
  zoomModeOff?: ()=>any,
  onClick?: ()=>any;
  imageWidth: number;
  imageHeight: number;
  totalWidth: number;
  totalHeight: number;
  addAlbums?: ()=>any;
  tag?: ()=>any;
}

export const ZoomableImage = ({children,
   zoomMode,
  zoomModeOff, 
  onClick,
  imageWidth, 
  imageHeight,
  totalWidth, 
  totalHeight}: ZoomableImageProps) => {
    const nav = useNavigation();
    useEffect(()=>{
      const listener = (e: any) => {
        if(!zoomMode || !zoomModeOff) return;
        if(zoomModeOff && zoomMode) {
          e.preventDefault();
          zoomModeOff();
        }
      };
      nav.addListener('beforeRemove', listener);
      return () => {
        nav.removeListener('beforeRemove', listener);
      }
    }, []);
  if(!zoomMode) return (
    <>
      {children}
    </>
  );
  return (
    <View>
      <ImageZoom cropWidth={totalWidth}
        cropHeight={totalHeight}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        onClick={()=>{onClick && onClick()}}
        enableCenterFocus={false}
      >
        {children}
      </ImageZoom> 
    </View>
  )
}