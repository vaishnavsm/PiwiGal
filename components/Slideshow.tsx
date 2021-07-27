import { Box } from "native-base";
import React, { useContext, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet, TouchableNativeFeedback, View
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { listImages } from "../api/images";
import { ImageType } from "../api/types";
import { OptionsContext } from "../contexts/OptionsContext";
import { TagEditModal } from "./Modals/TagEditModal";
import { ZoomableImage } from "./ZoomableImage";

const MAX_DOUBLE_TIME = 500;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignContent: "center",
  },
});

const SWIPE_TOLERANCE = 7;

enum SlidingStates {
  None,
  Left,
  Right,
}

type SlideshowProps = {
  image: ImageType;
  images: ReturnType<typeof listImages>;
};

export const Slideshow: React.FC<SlideshowProps> = ({ image, images }) => {
  const [sliding, setSliding] = useState(SlidingStates.None);
  const [zoommode, setZoommode] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const options = useContext(OptionsContext);

  const imgRefs = useRef<{
    prevImage: ImageType | undefined;
    nextImage: ImageType | undefined;
  }>({ prevImage: undefined, nextImage: undefined });

  const pageExists = React.useCallback(
    (pageNum: number) =>
      images.data?.pages.map((x) => x.pageNumber).includes(pageNum),
    [images]
  );

  const { prevImage, nextImage } = React.useMemo(() => {
    const currentPage = currentImage.page;
    const pages = images.data?.pages.filter(
      (page) =>
        page.pageNumber > currentPage - 2 && page.pageNumber < currentPage + 2
    );
    const cpage = pages?.filter((page) => page.pageNumber === currentPage)[0];
    if (!cpage) {
      throw Error("Unexpected case where currentPage is unknown!");
    }
    const imgIdx = cpage.list.findIndex((x) => x.id === currentImage.id);

    if (cpage.list.length - imgIdx < 4 && !pageExists(cpage.pageNumber + 1))
      images.fetchNextPage({ pageParam: cpage.pageNumber + 1 });
    if (imgIdx < 4 && cpage.pageNumber > 0 && !pageExists(cpage.pageNumber - 1))
      images.fetchPreviousPage({ pageParam: cpage.pageNumber - 1 });

    let prevImage = null;
    if (imgIdx > 0) prevImage = cpage.list[imgIdx - 1];
    else {
      const prevPage = pages?.filter(
        (page) => page.pageNumber === currentPage - 1
      )[0];
      prevImage = prevPage?.list[prevPage.list.length - 1];
    }
    let nextImage = null;
    if (imgIdx < cpage.list.length - 1) nextImage = cpage.list[imgIdx + 1];
    else {
      const nextPage = pages?.filter(
        (page) => page.pageNumber === currentPage + 1
      )[0];
      nextImage = nextPage?.list[0];
    }
    imgRefs.current = { nextImage, prevImage };
    return { prevImage, nextImage };
  }, [currentImage]);

  const touchRef = useRef({
    firstStart: new Date(),
    lastEnd: new Date(),
    touchCount: 0,
  });

  const handleStartTouch = () => {
    const now = new Date();
    if (touchRef.current.touchCount === 1) {
      if (
        (touchRef.current.lastEnd as unknown as number) -
          (now as unknown as number) >
        MAX_DOUBLE_TIME
      ) {
        touchRef.current.touchCount = 1;
        touchRef.current.firstStart = now;
      } else {
        touchRef.current.touchCount += 1;
      }
    } else {
      touchRef.current.touchCount = 1;
      touchRef.current.firstStart = now;
    }
  };

  const handleEndTouch = () => {
    const now = new Date();
    touchRef.current.lastEnd = now;
    if (touchRef.current.touchCount === 2) {
      if (
        (now as unknown as number) -
          (touchRef.current.firstStart as unknown as number) <
        MAX_DOUBLE_TIME
      ) {
        setZoommode(true);
      }

      touchRef.current.touchCount = 0;
    }
  };

  const { width, height } = Dimensions.get('screen');
  const cardHeight = height;

  const position = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        position.setValue({ x: dx, y: 0 });
        if (dx < -5) {
          setSliding(SlidingStates.Left);
        } else if (dx > 5) {
          setSliding(SlidingStates.Right);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const dist = Math.max(width, height) / SWIPE_TOLERANCE;
        if (gestureState.dx > dist) {
          if (imgRefs.current.prevImage)
            setCurrentImage(imgRefs.current.prevImage);
        } else if (gestureState.dx < -dist) {
          if (imgRefs.current.nextImage)
            setCurrentImage(imgRefs.current.nextImage);
        }
        position.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  return (
    <View style={{
      flex: 1,
      height,
      width,
      backgroundColor: 'black'
    }}>
      <View style={{ height: cardHeight }}>
        <View
          style={{
            height: cardHeight,
            width,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            backgroundColor: "black",
            top: 0,
            left: 0,
          }}
        />
          {!nextImage || sliding !== SlidingStates.Left ? null : (
            <Animated.View
              style={{
                height: cardHeight,
                width,
                padding: 0,
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                backgroundColor: "#111111",
                top: 0,
                left: 0,
              }}
            >
              <Image
                source={{ uri: nextImage.url }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="contain"
              />
            </Animated.View>
          )}
          {!prevImage || sliding !== SlidingStates.Right ? null : (
            <Animated.View
              style={{
                height: cardHeight,
                width,
                padding: 0,
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                backgroundColor: "#111111",
                top: 0,
                left: 0,
              }}
            >
              <Image
                source={{ uri: prevImage.url }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="contain"
              />
            </Animated.View>
          )}

          <Animated.View
            {...panResponder.panHandlers}
            onTouchStart={handleStartTouch}
            onTouchEnd={handleEndTouch}
            style={[
              { transform: position.getTranslateTransform() },
              {
                elevation: 2,
                height: cardHeight,
                width,
                position: "absolute",
                backgroundColor: "#050505",
                top: 0,
                left: 0,
              },
            ]}
          >
            <ZoomableImage
              totalWidth={width}
              totalHeight={height}
              imageWidth={currentImage.width || 200}
              imageHeight={currentImage.height || 200}
              zoomMode={zoommode}
              zoomModeOff={() => setZoommode(false)}
            >
              <Image
                source={{ uri: currentImage.url }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="contain"
              />
            </ZoomableImage>
            {
              (options.taggingMode || zoommode) && (
                <View style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: 80,
                  backgroundColor: "#4578de",
                  elevation: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center'
                }}>
                  {
                    zoommode &&
                    <TouchableNativeFeedback onPress={()=>setZoommode(false)}>
                      <Box padding={6}>
                        <Svg width="32" height="32" viewBox="0 0 24 24">
                          <Path stroke="white" fill="white" d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                        </Svg>
                      </Box>
                    </TouchableNativeFeedback>
                  }
                  <TouchableNativeFeedback onPress={()=>setTagModalOpen(t => !t)}>
                    <Box padding={6}>
                      <Svg width="32" height="32" viewBox="0 0 24 24">
                        <Path stroke="white" fill="white" d="M10.605 0h-10.605v10.609l13.391 13.391 10.609-10.604-13.395-13.396zm-4.191 6.414c-.781.781-2.046.781-2.829.001-.781-.783-.781-2.048 0-2.829.782-.782 2.048-.781 2.829-.001.782.782.781 2.047 0 2.829z"/>
                      </Svg>
                    </Box>
                  </TouchableNativeFeedback>
                  <TouchableNativeFeedback onPress={()=>{}}>
                    <Box padding={6}>
                      <Svg width="32" height="32" viewBox="0 0 24 24">
                        <Path stroke="white" fill="white" d="M21.698 10.658l2.302 1.342-12.002 7-11.998-7 2.301-1.342 9.697 5.658 9.7-5.658zm-9.7 10.657l-9.697-5.658-2.301 1.343 11.998 7 12.002-7-2.302-1.342-9.7 5.657zm12.002-14.315l-12.002-7-11.998 7 11.998 7 12.002-7z"/>
                      </Svg>
                    </Box>
                  </TouchableNativeFeedback>
                </View>
              )
            }
          </Animated.View>
      </View>
      <TagEditModal
        currentImage={currentImage}
        setOpen={setTagModalOpen}
        open={tagModalOpen}
      />
    </View>
  );
};
