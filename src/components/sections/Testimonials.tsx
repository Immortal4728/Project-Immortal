"use client";

import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";

const testimonials = [
    {
        author: {
            name: "Prudhvi",
            handle: "@Sales Manager",
            avatar:
                "/prudhvi.png",
        },
        text: "The architecture provided by Project Immortal scaled beautifully to handle requests without breaking a sweat.",
    },
    {
        author: {
            name: "Venkata Dileep",
            handle: "@HR Manager",
            avatar:
                "/dileep1.png",
        },
        text: "Finally, an engineering team that understands real production constraints. No academic fluff, just hardcore scalability.",
    },
    {
        author: {
            name: "pavan narasimha",
            handle: "@Military Officer",
            avatar:
                "/pavan1.png",
        },
        text: "Their cloud deployment strategies reduced our latency globally. The serverless integrations were seamless.",
    },
    {
        author: {
            name: "pavan yogesh",
            handle: "@manager at salesforce",
            avatar:
                "/pavan2.png",
        },
        text: "Zero-downtime deployments actually became a reality. We push code on Fridays now. Highly recommended.",
    },
    {
        author: {
            name: "Empty spot",
            handle: "@Empty spot",
            avatar:
                "/empty.png",
        },
        text: "Their cloud deployment strategies reduced our latency globally. The serverless integrations were seamless.",
    },
];

export default function Testimonials() {
    return (
        <TestimonialsSection
            title="Trusted by engineering teams"
            description="Join serious founders and organizations who rely on immortal system architectures."
            testimonials={testimonials}
        />
    );
}