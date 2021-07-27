import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Modal, StyleSheet, TouchableOpacity, View, ViewStyle
} from 'react-native';

const styles = StyleSheet.create({
  outerOpacity: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  innerOpacity: {
    flex: 1,
    backgroundColor: 'transparent',
    elevation: 13,
  },
  background: {
    backgroundColor: '#57575755',
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    elevation: 12,
  },
  view: {
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 40,
  },
});

type Props = {
  children?: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  style?: ViewStyle;
  timeToFade?: number;
};

export const SlidingModal: React.FC<Props> = ({
  children,
  open,
  setOpen,
  style = {},
  timeToFade = 250,
}) => {
  const animation = useRef(new Animated.Value(0)).current;
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (open) {
      setIsBackgroundOpen(true);
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: timeToFade,
        useNativeDriver: true,
      }).start();
      timeout = setTimeout(() => setIsBackgroundOpen(false), timeToFade - 1);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    if (isBackgroundOpen) {
      Animated.timing(animation, {
        toValue: 1,
        duration: timeToFade,
        useNativeDriver: true,
      }).start();
    }
  }, [isBackgroundOpen]);

  return (
    <>
      {
        isBackgroundOpen
        && <Animated.View style={StyleSheet.compose(styles.background, { opacity: animation } as any)} />
      }
      <Modal
        transparent
        visible={open}
        animationType="slide"
        onRequestClose={() => {}}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.outerOpacity}
          onPress={() => setOpen(false)}
        >
          <View style={styles.innerOpacity} />
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={StyleSheet.compose(styles.view as ViewStyle, style)}>
              {children}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
