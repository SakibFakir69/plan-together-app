import React, { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type Slide = {
  id: string
  icon: string
  title: string
  subtitle: string
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: '👨‍👩‍👧',
    title: 'Plan Together',
    subtitle:
      'Harmonize your household. Sync schedules and manage domestic life as a team.',
  },
  {
    id: '2',
    icon: '✅',
    title: 'Delegate With Ease',
    subtitle:
      'Assign tasks to each family member and track progress without the nagging.',
  },
  {
    id: '3',
    icon: '🔔',
    title: 'Stay in Sync, Always',
    subtitle:
      'Smart reminders keep everyone on track. Never miss what matters most.',
  },
]

function SlideItem({ item }: { item: Slide }) {
  return (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="flex-1 items-center justify-center px-6"
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

function PaginationDots({ total, active }: { total: number; active: number }) {
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
      router.replace('/(auth)/sign-up/page')
      return
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true })
  }

  const handleSkip = () => router.replace('/(auth)/sign-in/page')

  return (
    <SafeAreaView className="flex-1 bg-[#F5F3FF]">
      {/* Skip — hidden on last slide, user is already at end */}
      <View className="h-11 px-6 flex-row justify-end items-center">
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
          <Text className="text-white text-lg font-semibold">
            {isLast ? 'Get Started' : `Next  →`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
