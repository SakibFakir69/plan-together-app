import React, { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
} from 'react-native'





export function PaginationDots({ total, active }: { total: number; active: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2 my-7">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={
            i === active
              ? 'h-2.5 w-7 rounded-full bg-[#4F46E5]'   // pill — active
              : 'h-2.5 w-2.5 rounded-full bg-[#D1D5DB]'  // circle — inactive
          }
        />
      ))}
    </View>
  )
}