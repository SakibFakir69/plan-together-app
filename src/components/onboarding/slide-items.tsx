
import React, { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
} from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export type Slide = {
  id: string
  icon: string
  title: string
  subtitle: string
}


export function SlideItem({ item }: { item: Slide }) {
  return (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="items-center justify-center flex-1 px-6"
    >
      {/* Outer glow ring */}
      <View className="w-72 h-72 rounded-full bg-[#EDE9FE]/40 items-center justify-center">
        {/* Inner circle — matches splash screen icon treatment */}
        <View className="w-52 h-52 rounded-full bg-[#EDE9FE] items-center justify-center">
          <Text style={{ fontSize: 88 }}>{item.icon}</Text>
        </View>
      </View>
    </View>
  )
}