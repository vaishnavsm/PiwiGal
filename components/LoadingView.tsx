import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  }
})
export const LoadingView: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={"#444444"} />
    </View>
  );
};
