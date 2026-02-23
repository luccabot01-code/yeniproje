"use client"

import { useRef } from "react"
import type { OurStoryItem } from "@/lib/types"
import { Heart } from "lucide-react"
import { motion, useInView } from "framer-motion"

interface OurStorySectionProps {
    storyItems: OurStoryItem[]
}

function StoryItem({ item, index }: { item: OurStoryItem; index: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: "0px 0px -20px 0px" })
    const isLeft = index % 2 === 0

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 * index }}
            className="relative flex items-center"
        >
            {/* Dot on the central line */}
            <div className="absolute left-1/2 -translate-x-1/2 z-20">
                <div className="w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg ring-4 ring-primary/20" />
            </div>

            {isLeft ? (
                <>
                    <div className="w-[calc(50%-28px)] pr-6">
                        {item.image_url && (
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-lg transition-shadow duration-300">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                        )}
                    </div>
                    <div className="w-14 flex-shrink-0" />
                    <div className="w-[calc(50%-28px)] pl-6">
                        <div className="py-2">
                            {item.date && <p className="text-sm font-medium text-primary mb-1">{item.date}</p>}
                            <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-[calc(50%-28px)] pr-6">
                        <div className="py-2 text-right">
                            {item.date && <p className="text-sm font-medium text-primary mb-1">{item.date}</p>}
                            <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                    <div className="w-14 flex-shrink-0" />
                    <div className="w-[calc(50%-28px)] pl-6">
                        {item.image_url && (
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-lg transition-shadow duration-300">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    )
}

function MobileStoryItem({ item, index }: { item: OurStoryItem; index: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: "0px 0px -20px 0px" })
    const isLeft = index % 2 === 0

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -24 : 24 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 * index }}
            className="relative flex items-center gap-0"
        >
            {/* Dot on the central line */}
            <div className="absolute left-1/2 -translate-x-1/2 z-20">
                <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-md ring-4 ring-primary/20" />
            </div>

            {isLeft ? (
                <>
                    {/* Left: image */}
                    <div className="w-[calc(50%-18px)] pr-3">
                        {item.image_url ? (
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-md">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                        ) : (
                            <div className="aspect-[4/3] rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                <Heart className="h-6 w-6 text-primary/30 fill-primary/10" />
                            </div>
                        )}
                    </div>
                    <div className="w-9 flex-shrink-0" />
                    {/* Right: text */}
                    <div className="w-[calc(50%-18px)] pl-3">
                        {item.date && <p className="text-xs font-semibold text-primary mb-0.5 uppercase tracking-wide">{item.date}</p>}
                        <h3 className="font-semibold text-sm text-foreground mb-1 leading-snug">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                </>
            ) : (
                <>
                    {/* Left: text */}
                    <div className="w-[calc(50%-18px)] pr-3 text-right">
                        {item.date && <p className="text-xs font-semibold text-primary mb-0.5 uppercase tracking-wide">{item.date}</p>}
                        <h3 className="font-semibold text-sm text-foreground mb-1 leading-snug">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                    <div className="w-9 flex-shrink-0" />
                    {/* Right: image */}
                    <div className="w-[calc(50%-18px)] pl-3">
                        {item.image_url ? (
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-md">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                        ) : (
                            <div className="aspect-[4/3] rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                <Heart className="h-6 w-6 text-primary/30 fill-primary/10" />
                            </div>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    )
}

export function OurStorySection({ storyItems }: OurStorySectionProps) {
    if (!storyItems || storyItems.length === 0) return null

    return (
        <section aria-label="Our Story">
            <div className="relative bg-card border border-border rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Section header */}
                <div className="pt-12 pb-4 px-6 md:px-10 lg:px-14">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
                            <Heart className="h-7 w-7 text-primary fill-primary/10" aria-hidden="true" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="font-bold text-3xl md:text-4xl tracking-tight text-foreground">Our Story</h2>
                            <p className="text-base md:text-lg text-muted-foreground">The journey that brought us together</p>
                        </div>
                    </div>
                </div>

                {/* Timeline content */}
                <div className="pb-8 px-6 md:px-10 lg:px-14">
                      {/* Mobile: Zigzag timeline */}
                      <div className="block md:hidden relative">
                          {/* Center vertical line */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full" />
                          <div className="space-y-8">
                              {storyItems.map((item, index) => (
                                  <MobileStoryItem key={index} item={item} index={index} />
                              ))}
                          </div>
                          {/* End heart */}
                          <div className="flex justify-center mt-6">
                              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center z-10">
                                  <Heart className="h-4 w-4 text-primary fill-primary" />
                              </div>
                          </div>
                      </div>

                    {/* Desktop: Vertical zigzag timeline */}
                    <div className="hidden md:block relative">
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full" />

                        <div className="space-y-12">
                            {storyItems.map((item, index) => (
                                <StoryItem key={index} item={item} index={index} />
                            ))}
                        </div>

                        <div className="flex justify-center mt-8">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                <Heart className="h-5 w-5 text-primary fill-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
