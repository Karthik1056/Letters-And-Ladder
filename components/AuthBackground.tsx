import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from './AnimatedBackground';

interface AuthBackgroundProps {
  children: React.ReactNode;
  withContentContainer?: boolean;
  contentHeight?: string;
}

const AuthBackground: React.FC<AuthBackgroundProps> = ({
  children,
  withContentContainer = true,
  contentHeight,
}) => {
  const insets = useSafeAreaInsets();

  const finalContentHeight = contentHeight || '80%';
  const appNameContainerHeight = `${100 - parseInt(finalContentHeight, 10)}%`;

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {withContentContainer && (
          <View
            style={[styles.appNameContainer, { top: insets.top, height: appNameContainerHeight }]}
          >
            <Text style={styles.appName}>Letters & Ladders</Text>
          </View>
        )}

        {withContentContainer ? (
          <View style={[styles.contentContainer, { height: finalContentHeight }]}>{children}</View>
        ) : (
          children
        )}
      </View>
    </AnimatedBackground>
  );
};

export default AuthBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  appNameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontFamily: 'CustomFont-Bold',
    color: '#3b82f6',
    opacity: 0.9,
    includeFontPadding: false,
  },
});
