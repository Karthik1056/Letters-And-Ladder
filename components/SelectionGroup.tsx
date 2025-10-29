import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface SelectionGroupProps<T extends string> {
  title: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  items: { label: string; value: T }[];
  selectedValue: T | T[] | null;
  onSelect: (value: T) => void;
  allowMultiple?: boolean;
  style?: any;
}

interface SelectItemProps<T extends string> {
  item: { label: string; value: T };
  isSelected: boolean;
  onPress: (value: T) => void;
  index: number;
}

function SelectItem<T extends string>({ item, isSelected, onPress, index }: SelectItemProps<T>) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 70, withSpring(1, { damping: 12, stiffness: 100 }));
    opacity.value = withDelay(index * 70, withTiming(1, { duration: 300 }));
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={animatedContainerStyle}>
      <Pressable
        key={item.value}
        onPress={() => onPress(item.value)}
        className={`bg-white rounded-2xl px-8 py-5 m-2 border-2 shadow-sm ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-200'
            : 'border-gray-300'
        }`}
        style={({ pressed }) => [
          { marginHorizontal: 8, marginVertical: 6 },
          pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
        ]}
      >
        <Text
          className={`text-lg font-sans text-center ${
            isSelected ? 'text-blue-700 font-bold' : 'text-gray-900'
          }`}
        >
          {item.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function SelectionGroup<T extends string>({
  title,
  iconName,
  items,
  selectedValue,
  onSelect,
  allowMultiple,
  style,
}: SelectionGroupProps<T>) {
  const selectedItemScale = useSharedValue(1);

  const animatedSelectedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: selectedItemScale.value }],
  }));

  useEffect(() => {
    selectedItemScale.value = withSpring(selectedValue ? 1.05 : 1, {
      damping: 10,
      stiffness: 150,
    });
  }, [selectedValue]);

  return (
    <Animated.View
      className="w-full items-center mb-8 bg-white rounded-3xl p-6 shadow-md"
      style={style}
    >
      <View className="flex-row items-center justify-center mb-6">
        <Ionicons name={iconName} size={28} color="#374151" style={{ marginRight: 12 }} />
        <Text className="text-3xl font-bold text-center text-gray-800 tracking-wide">
          {title}
        </Text>
      </View>
      <View className="flex-row flex-wrap justify-center">
        {items.map((item, index) => {
          const isSelected = Array.isArray(selectedValue)
            ? selectedValue.includes(item.value)
            : selectedValue === item.value;

          return (
            <SelectItem
              key={item.value}
              item={item}
              isSelected={isSelected}
              onPress={onSelect}
              index={index}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}
