"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();

    // Do not render header on the home page
    if (pathname === '/') {
        return null;
    }

    return (
        <header className="w-full flex justify-center items-center py-4 sm:py-6 absolute top-0 left-0 z-50">
            <div
                className="text-3xl opacity-60 cursor-pointer hover:opacity-100 transition-opacity duration-300"
                style={{ fontFamily: "'Caveat Brush', cursive" }}
                onClick={() => router.push('/')}
                title="Go to Home Page"
            >
                EchoTypes
            </div>
        </header>
    );
} 