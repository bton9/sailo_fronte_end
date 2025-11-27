import Image from 'next/image'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export default function DesktopImageGallery({
  images,
  productName,
  imageRefs,
  getImageDescription,
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center aspect-[3/4] bg-gray-100">
        <p className="text-muted-foreground">無圖片</p>
      </div>
    )
  }

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="space-y-4 pe-10">
        {images.map((image, index) => (
          <div
            key={index}
            ref={(el) => (imageRefs.current[index] = el)}
            id={`pdp-image-${index}`}
            className="relative max-w-[750px] mx-auto lg:mx-0 aspect-[3/4] bg-gray-50 overflow-hidden scroll-mt-24 cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={image}
              alt={`${productName} - ${getImageDescription(index)}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 650px"
            />
          </div>
        ))}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={images.map((src) => ({ src }))}
        index={currentIndex}
      />
    </>
  )
}
