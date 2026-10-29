import { useState } from "react";
import { View, Image, Dimensions,StyleSheet } from "react-native";
import Animated, {
  clamp,
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

const images = [
  "https://cdn.dribbble.com/users/3281732/screenshots/11192830/media/7690704fa8f0566d572a085637dd1eee.jpg?compress=1&resize=1200x1200",
  "https://cdn.dribbble.com/users/3281732/screenshots/13130602/media/592ccac0a949b39f058a297fd1faa38e.jpg?compress=1&resize=1200x1200",
  "https://cdn.dribbble.com/users/3281732/screenshots/9165292/media/ccbfbce040e1941972dbc6a378c35e98.jpg?compress=1&resize=1200x1200",
  "https://cdn.dribbble.com/users/3281732/screenshots/11205211/media/44c854b0a6e381340fbefe276e03e8e4.jpg?compress=1&resize=1200x1200",
  "https://cdn.dribbble.com/users/3281732/screenshots/7003560/media/48d5ac3503d204751a2890ba82cc42ad.jpg?compress=1&resize=1200x1200",
  "https://cdn.dribbble.com/users/3281732/screenshots/6727912/samji_illustrator.jpeg?compress=1&resize=1200x1200",
  "https://cdn.dribbble.com/users/3281732/screenshots/13661330/media/1d9d3cd01504fa3f5ae5016e5ec3a313.jpg?compress=1&resize=1200x1200",
];

const { width } = Dimensions.get("screen");
const _itemSize = width * 0.24;
const _spacing = 12;
const _itemTotalSize = _itemSize + _spacing;

function CarouselItem({
  imageUri,
  index,
  onScrollX,
}: {
  imageUri: string;
  index: number;
  onScrollX: SharedValue<number>;
}) {
  const stylez = useAnimatedStyle(() => {
    return {
      borderWidth: 4, 
      borderColor: interpolateColor(onScrollX.value, [index-1, index, index+1], ['transparent', 'white', 'transparent']),
      transform: [
        {
          translateY: interpolate(
            onScrollX.value,
            [index - 1, index, index + 1],
            [_itemSize / 3, 0, _itemSize / 3],
          ),
        },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          width: _itemSize,
          height: _itemSize,
          borderRadius: _itemSize / 2,
        },
        stylez,
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={{
          flex: 1,
          borderRadius: _itemSize / 2,
        }}
      />
    </Animated.View>
  );
}

export function CircularSlider() {
  const onScrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    onScrollX.value = clamp(e.contentOffset.x / _itemTotalSize, 0, images.length-1);
    const newActiveIndex  = Math.round(onScrollX.value);

    if(activeIndex !== newActiveIndex){
        runOnJS(setActiveIndex)(newActiveIndex)
    }
  });

  return (
    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor:"black" }}>
    <View style={[StyleSheet.absoluteFill]}>
        <Animated.Image entering={FadeIn.duration(500)} exiting={FadeOut.duration(500)} key={`image-${activeIndex}`} source={{uri:images[activeIndex]}} style={{flex:1}}/>
    </View>
      <Animated.FlatList
        style={{ flexGrow: 0, height: _itemSize * 2}}
        contentContainerStyle={{
          gap: _spacing,
          paddingHorizontal: (width - _itemSize) / 2,
        }}
        data={images}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item, index }) => (
          <CarouselItem imageUri={item} index={index} onScrollX={onScrollX} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        // scrolling
        onScroll={onScroll}
        scrollEventThrottle={1000 / 60}
        snapToInterval={_itemSize + _spacing}
        decelerationRate={"fast"}
      />
    </View>
  );
}

