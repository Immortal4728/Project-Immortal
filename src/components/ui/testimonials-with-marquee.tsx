import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"

interface TestimonialsSectionProps {
    title: string
    description: string
    testimonials: Array<{
        author: TestimonialAuthor
        text: string
        href?: string
    }>
    className?: string
}

export function TestimonialsSection({
    title,
    description,
    testimonials,
    className
}: TestimonialsSectionProps) {
    return (
        <section className={cn(
            "bg-black text-white font-[family-name:var(--font-heading)]",
            "py-24 sm:py-32 px-0 overflow-hidden border-t border-white/5",
            className
        )}>
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center sm:gap-16">
                <div className="flex flex-col items-center gap-6 px-6 sm:gap-8">
                    <span className="px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-300 border border-zinc-800 bg-zinc-900/40 rounded-full">
                        Testimonials
                    </span>
                    <h2 className="max-w-[800px] text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] leading-tight bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                        {title}
                    </h2>
                    <p className="text-md max-w-[600px] font-normal text-zinc-400 sm:text-lg lg:text-xl font-[family-name:var(--font-body)]">
                        {description}
                    </p>
                </div>

                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden pt-8">
                    <div className="group flex w-full overflow-hidden p-4 [--gap:3rem] [gap:var(--gap)] flex-row [--duration:50s]">
                        <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-[marquee_var(--duration)_linear_infinite] flex-row group-hover:[animation-play-state:paused]">
                            {[...Array(4)].map((_, setIndex) => (
                                testimonials.map((testimonial, i) => (
                                    <TestimonialCard
                                        key={`${setIndex}-${i}`}
                                        {...testimonial}
                                    />
                                ))
                            ))}
                        </div>
                    </div>

                    <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-black via-black/80 to-transparent sm:block" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-black via-black/80 to-transparent sm:block" />
                </div>
            </div>
        </section>
    )
}
