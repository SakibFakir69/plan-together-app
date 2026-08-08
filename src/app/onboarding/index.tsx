import React, { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
 
  ViewToken,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { handleSkip } from '@/navigation/onboarding/navigation.onboarding'
import { SlideItem,Slide } from '@/components/onboarding/slide-items'
import { PaginationDots } from '@/components/onboarding/pagination-dot'
import { SLIDES } from '@/constants/onboarding/constant-onboarding'






export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<FlatList<Slide>>(null)
  const isLast = activeIndex === SLIDES.length - 1

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index)
      }
    },
    [],
  )

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 })

  const handleNext = () => {
    if (isLast) {
      router.replace('/sign-up')
      return
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true })
  }

  

  return (
    <SafeAreaView className="flex-1 bg-[#F5F3FF]">
      {/* Skip — hidden on last slide, user is already at end */}
      <View className="flex-row items-center justify-end px-6 h-11">
        {!isLast && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} hitSlop={12}>
            <Text className="text-[#6B7280] text-base font-medium">Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Illustration carousel */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        renderItem={({ item }) => <SlideItem item={item} />}
        className="flex-1"
      />

      {/* Bottom content — title, subtitle, dots, CTA */}
      <View className="px-6 pb-10">
        <Text className="text-[#1E1B4B] text-[28px] font-bold text-center tracking-tight">
          {SLIDES[activeIndex].title}
        </Text>
        <Text className="text-[#6B7280] text-base text-center mt-3 leading-6">
          {SLIDES[activeIndex].subtitle}
        </Text>

        <PaginationDots total={SLIDES.length} active={activeIndex} />

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          className="bg-[#4F46E5] rounded-2xl h-14 items-center justify-center flex-row gap-2"
        >
          <Text className="text-lg font-semibold text-white">
            {isLast ? 'Get Started' : `Next  →`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
