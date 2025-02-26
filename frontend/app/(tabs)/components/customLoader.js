// CustomLoader.js
import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

const LOADING_GIF = require('../../../assets/images/sirri_rotate.gif');

const CustomLoader = ({ size = 50, loading_gif = LOADING_GIF, style }) => {
    // Create an animated value that will drive the scale
    const scaleValue = new Animated.Value(1);
  
    // Animation function
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.4, // Expand to 120% of original size
            duration: 800, // Time to expand (in milliseconds)
            useNativeDriver: true, // Better performance
          }),
          Animated.timing(scaleValue, {
            toValue: 0.6, // Shrink to 80% of original size
            duration: 800, // Time to shrink
            useNativeDriver: true,
          }),

          Animated.timing(scaleValue, {
            toValue: 1.0, // Expand to original size
            duration: 600, // Time to expand
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
  
    // Start animation when component mounts
    useEffect(() => {
      startPulseAnimation();
    }, []);
  
    return (
      <View style={[styles.container, style]}>
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
          }}
        >
          <Image
            source={loading_gif}
            style={{
              width: size,
              height: size,
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
  CustomLoader.propTypes = {
    size: PropTypes.number,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  };
  
  export default CustomLoader;