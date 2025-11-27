'use client'

import { useEffect, useRef } from 'react'
import IndexCard from '@/components/indexCard'
import gsap from 'gsap'

export default function ScrollingPlacesColumn({ places }) {
  const scrollContainerRef = useRef(null)
  const group1Ref = useRef(null)
  const group2Ref = useRef(null)
  const group3Ref = useRef(null)
  const group4Ref = useRef(null)

  const timeline1Ref = useRef(null)
  const timeline2Ref = useRef(null)
  const timeline3Ref = useRef(null)
  const timeline4Ref = useRef(null)


  // 無限循環滾動動畫：三列垂直滾動
  useEffect(() => {
    if (
      !places.column1?.length ||
      !places.column2?.length ||
      !places.column3?.length||
      !places.column4?.length

    )
      return

    setTimeout(() => {
      // 第一列：向上滾動（100秒）
      if (group1Ref.current) {
        const timeline1 = gsap.timeline({ repeat: -1 })
        const height1 = group1Ref.current.offsetHeight / 2

        gsap.set(group1Ref.current, { y: 0 })

        timeline1
          .to(group1Ref.current, {
            y: -height1,
            duration: 100,
            ease: 'none',
          })
          .set(group1Ref.current, { y: 0 })

        timeline1Ref.current = timeline1
      }

      // 第二列：向下滾動（100秒）
      if (group2Ref.current) {
        const timeline2 = gsap.timeline({ repeat: -1 })
        const height2 = group2Ref.current.offsetHeight / 2

        gsap.set(group2Ref.current, { y: -height2 })

        timeline2
          .to(group2Ref.current, {
            y: 0,
            duration: 100,
            ease: 'none',
          })
          .set(group2Ref.current, { y: -height2 })

        timeline2Ref.current = timeline2
      }

      // 第三列：向上滾動（100秒）
      if (group3Ref.current) {
        const timeline3 = gsap.timeline({ repeat: -1 })
        const height3 = group3Ref.current.offsetHeight / 2

        gsap.set(group3Ref.current, { y: 0 })

        timeline3
          .to(group3Ref.current, {
            y: -height3,
            duration: 100,
            ease: 'none',
          })
          .set(group3Ref.current, { y: 0 })

        timeline3Ref.current = timeline3
      }

            // 第四列：向下滾動（100秒）
      if (group4Ref.current) {
        const timeline4 = gsap.timeline({ repeat: -1 })
        const height4 = group4Ref.current.offsetHeight / 2

        gsap.set(group4Ref.current, { y: -height4 })

        timeline4
          .to(group4Ref.current, {
            y: 0,
            duration: 100,
            ease: 'none',
          })
          .set(group4Ref.current, { y: -height4 })

        timeline4Ref.current = timeline4
      }

    }, 100)

    return () => {
      timeline1Ref.current?.kill()
      timeline2Ref.current?.kill()
      timeline3Ref.current?.kill()
      timeline4Ref.current?.kill()

    }
  }, [places])

  // Hover 控制函數
  const handleColumnMouseEnter = (timelineRef) => {
    if (timelineRef.current) {
      timelineRef.current.pause()
    }
  }

  const handleColumnMouseLeave = (timelineRef) => {
    if (timelineRef.current) {
      timelineRef.current.resume()
    }
  }

  return (
    <div className="hidden lg:block bg-secondary-900 fixed right-0 top-0 h-full w-1/2 overflow-hidden z-20">
      <div ref={scrollContainerRef} className="h-full flex gap-4 p-2">
        {/* 第一列：向上滾動 */}
        <div
          className="w-[250px] flex-shrink-0 overflow-hidden"
          onMouseEnter={() => handleColumnMouseEnter(timeline1Ref)}
          onMouseLeave={() => handleColumnMouseLeave(timeline1Ref)}
        >
          <div ref={group1Ref} className="flex flex-col gap-1">
            {/* 第一組卡片 */}
            {places.column1.map((place) => (
              <div key={`first-${place.place_id}`} className="w-full">
                <IndexCard
                  place_id={place.place_id}
                  name={place.name}
                  cover_image={place.cover_image}
                  location_name={place.location_name}
                  rating={place.rating}
                  category={place.category}
                />
              </div>
            ))}
            {/* 第一組卡片（複製用於無縫循環） */}
            {places.column1.map((place) => (
              <div key={`first-dup-${place.place_id}`} className="w-full">
                <IndexCard
                  place_id={place.place_id}
                  name={place.name}
                  cover_image={place.cover_image}
                  location_name={place.location_name}
                  rating={place.rating}
                  category={place.category}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 第二列：向下滾動 */}
        <div
          className="w-[250px] flex-shrink-0 overflow-hidden"
          onMouseEnter={() => handleColumnMouseEnter(timeline2Ref)}
          onMouseLeave={() => handleColumnMouseLeave(timeline2Ref)}
        >
          <div ref={group2Ref} className="flex flex-col gap-1">
            {/* 第二組卡片 */}
            {places.column2.map((place) => (
              <div key={`second-${place.place_id}`} className="w-full">
                <IndexCard
                  place_id={place.place_id}
                  name={place.name}
                  cover_image={place.cover_image}
                  location_name={place.location_name}
                  rating={place.rating}
                  category={place.category}
                />
              </div>
            ))}
            {/* 第二組卡片（複製用於無縫循環） */}
            {places.column2.map((place) => (
              <div key={`second-dup-${place.place_id}`} className="w-full">
                <IndexCard
                  place_id={place.place_id}
                  name={place.name}
                  cover_image={place.cover_image}
                  location_name={place.location_name}
                  rating={place.rating}
                  category={place.category}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 第三列：向上滾動 */}
        <div
          className="w-[250px] flex-shrink-0 overflow-hidden"
          onMouseEnter={() => handleColumnMouseEnter(timeline3Ref)}
          onMouseLeave={() => handleColumnMouseLeave(timeline3Ref)}
        >
          <div ref={group3Ref} className="flex flex-col gap-1">
            {/* 第三組卡片 */}
            {places.column3.map((place) => (
              <div key={`third-${place.place_id}`} className="w-full">
                <IndexCard
                  place_id={place.place_id}
                  name={place.name}
                  cover_image={place.cover_image}
                  location_name={place.location_name}
                  rating={place.rating}
                  category={place.category}
                />
              </div>
            ))}
            {/* 第三組卡片（複製用於無縫循環） */}
            {places.column3.map((place) => (
              <div key={`third-dup-${place.place_id}`} className="w-full">
                <IndexCard
                  place_id={place.place_id}
                  name={place.name}
                  cover_image={place.cover_image}
                  location_name={place.location_name}
                  rating={place.rating}
                  category={place.category}
                />
              </div>
            ))}
          </div>
        </div>
        {/* 第四列：向下滾動 */}
        <div
          className="w-[250px] flex-shrink-0 overflow-hidden"
          onMouseEnter={() => handleColumnMouseEnter(timeline4Ref)}
          onMouseLeave={() => handleColumnMouseLeave(timeline4Ref)}
        >
          <div ref={group4Ref} className="flex flex-col gap-1">
            {/* 第四組卡片 */}
            {places.column4.map((place) => (
              <div key={`fourth-${place.place_id}`} className="w-full">
                <IndexCard
                  place_id={place.place_id}
                  name={place.name}
                  cover_image={place.cover_image}
                  location_name={place.location_name}
                  rating={place.rating}
                  category={place.category}
                />
              </div>
            ))}
            {/* 第四組卡片（複製用於無縫循環） */}
            {places.column4.map((place) => (
              <div key={`fourth-dup-${place.place_id}`} className="w-full">
                <IndexCard
                  place_id={place.place_id}
                  name={place.name}
                  cover_image={place.cover_image}
                  location_name={place.location_name}
                  rating={place.rating}
                  category={place.category}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}