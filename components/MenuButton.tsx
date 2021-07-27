import { useNavigation } from "@react-navigation/native"
import { Box } from "native-base"
import React, { useCallback } from 'react'
import { Appearance, TouchableNativeFeedback } from "react-native"
import Svg, { Path } from "react-native-svg"

export const MenuButton = ()=>{
  const nav: any = useNavigation();
  const goToMenu = useCallback(()=>nav.toggleDrawer(), [nav]);
  const colorScheme = Appearance.getColorScheme();

  return (
    <TouchableNativeFeedback onPress={goToMenu}>
      <Box padding={4}>
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path stroke="none" fill={'black'} d="M24 6h-24v-4h24v4zm0 4h-24v4h24v-4zm0 8h-24v4h24v-4z"/>
        </Svg>
      </Box>
    </TouchableNativeFeedback>
  )
}