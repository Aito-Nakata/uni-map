import React, { useState, useRef } from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, IconButton, Portal, Modal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface StorePhotosCarouselProps {
  photos: string[];
}

const { width: screenWidth } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 200;

const StorePhotosCarousel: React.FC<StorePhotosCarouselProps> = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  if (!photos || photos.length === 0) {
    return (
      <View style={styles.placeholderContainer}>
        <Icon name="photo-camera" size={48} color="#ccc" />
        <Text style={styles.placeholderText}>写真がありません</Text>
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setCurrentIndex(index);
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setShowFullscreen(true);
  };

  const navigateFullscreen = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && fullscreenIndex > 0) {
      setFullscreenIndex(fullscreenIndex - 1);
    } else if (direction === 'next' && fullscreenIndex < photos.length - 1) {
      setFullscreenIndex(fullscreenIndex + 1);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.carousel}
        >
          {photos.map((photo, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => openFullscreen(index)}
              style={styles.imageContainer}
            >
              <Image
                source={{ uri: photo }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <Icon name="fullscreen" size={24} color="white" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {photos.length > 1 && (
          <>
            {/* Pagination dots */}
            <View style={styles.pagination}>
              {photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex && styles.paginationDotActive
                  ]}
                />
              ))}
            </View>

            {/* Counter */}
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {currentIndex + 1} / {photos.length}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Fullscreen Modal */}
      <Portal>
        <Modal
          visible={showFullscreen}
          onDismiss={() => setShowFullscreen(false)}
          contentContainerStyle={styles.fullscreenModal}
        >
          <View style={styles.fullscreenContainer}>
            <IconButton
              icon="close"
              iconColor="white"
              size={28}
              style={styles.closeButton}
              onPress={() => setShowFullscreen(false)}
            />

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: fullscreenIndex * screenWidth, y: 0 }}
              onScroll={(event) => {
                const scrollPosition = event.nativeEvent.contentOffset.x;
                const index = Math.round(scrollPosition / screenWidth);
                setFullscreenIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {photos.map((photo, index) => (
                <View key={index} style={styles.fullscreenImageContainer}>
                  <Image
                    source={{ uri: photo }}
                    style={styles.fullscreenImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>

            {photos.length > 1 && (
              <>
                {/* Navigation arrows */}
                {fullscreenIndex > 0 && (
                  <IconButton
                    icon="chevron-left"
                    iconColor="white"
                    size={32}
                    style={styles.navButtonLeft}
                    onPress={() => navigateFullscreen('prev')}
                  />
                )}

                {fullscreenIndex < photos.length - 1 && (
                  <IconButton
                    icon="chevron-right"
                    iconColor="white"
                    size={32}
                    style={styles.navButtonRight}
                    onPress={() => navigateFullscreen('next')}
                  />
                )}

                {/* Fullscreen counter */}
                <View style={styles.fullscreenCounter}>
                  <Text style={styles.fullscreenCounterText}>
                    {fullscreenIndex + 1} / {photos.length}
                  </Text>
                </View>
              </>
            )}
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CAROUSEL_HEIGHT,
    position: 'relative',
  },
  carousel: {
    height: CAROUSEL_HEIGHT,
  },
  imageContainer: {
    width: screenWidth,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 4,
  },
  placeholderContainer: {
    height: CAROUSEL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    marginTop: 8,
    color: '#999',
    fontSize: 16,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  counter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: 'black',
    margin: 0,
  },
  fullscreenContainer: {
    flex: 1,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullscreenImageContainer: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: screenWidth,
    height: '100%',
  },
  navButtonLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  navButtonRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullscreenCounter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  fullscreenCounterText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StorePhotosCarousel;