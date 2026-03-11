import { cn } from "@/lib/utils"
import Image from "next/image"

export interface TestimonialAuthor {
    name: string
    handle: string
    avatar: string
}

export interface TestimonialCardProps {
    author: TestimonialAuthor
    text: string
    href?: string
    className?: string
}

export function TestimonialCard({
    author,
    text,
    href,
    className
}: TestimonialCardProps) {
    const Card = href ? 'a' : 'div'

    return (
        <Card
            {...(href ? { href } : {})}
            className={cn(
                "flex flex-col rounded-3xl border border-zinc-800/80",
                "bg-zinc-950/50 backdrop-blur-xl shadow-2xl",
                "p-8 md:p-10 text-start",
                "hover:bg-zinc-900/60 hover:border-zinc-700",
                "max-w-[360px] sm:max-w-[420px] md:max-w-[480px]",
                "transition-all duration-300",
                className
            )}
        >
            <div className="flex items-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 mr-4">
                    <Image
                        src={author.avatar}
                        alt={author.name}
                        fill
                        sizes="64px"
                        className="w-full h-full object-cover object-center"
                    />
                </div>
                <div className="flex flex-col items-start gap-1">
                    <h3 className="text-lg md:text-xl font-bold leading-none text-zinc-100 tracking-tight">
                        {author.name}
                    </h3>
                    <p className="text-sm md:text-base font-medium text-zinc-500">
                        {author.handle}
                    </p>
                </div>
            </div>
            <p className="text-base md:text-lg leading-relaxed mt-8 text-zinc-300 font-[family-name:var(--font-body)]">
                "{text}"
            </p>
        </Card>
    )
}
