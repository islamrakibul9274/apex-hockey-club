"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { INITIAL_CAROUSEL_SLIDES, CarouselSlideData } from "@/lib/mockData";
import { FaTicket, FaFire, FaArrowRight } from "react-icons/fa6";

export default function HeroBanner() {
  const [slides, setSlides] = useState<CarouselSlideData[]>(INITIAL_CAROUSEL_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function loadSlides() {
      try {
        const res = await fetch("/api/carousel");
        const data = await res.json();
        if (data.slides && data.slides.length > 0) {
          setSlides(data.slides);
        }
      } catch {
        // use initial
      }
    }
    loadSlides();
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const slide = slides[current] || INITIAL_CAROUSEL_SLIDES[0];

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="w-full relative px-4 sm:px-6 lg:px-8 py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full rounded-3xl overflow-hidden shadow-lg bg-surface-100 min-h-[420px] sm:min-h-[540px] lg:min-h-[580px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority
            className="object-cover object-center opacity-85 transition-all duration-700 scale-105"
          />
          {/* A single directional scrim instead of two stacked black
              gradients. Keeps the headline at 4.5:1+ without turning the
              whole panel into a black box. */}
          <div className="absolute inset-0 bg-linear-to-r from-ink-900/92 via-ink-900/70 to-ink-900/35" />
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-ink-900/85 via-ink-900/25 to-transparent" />
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="absolute inset-x-4 sm:inset-x-8 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
          <button
            onClick={prevSlide}
            className="apex-btn apex-btn-icon bg-surface-0/20 hover:bg-brand-500 text-white border-none backdrop-blur-md pointer-events-auto transition-all hover:scale-110 shadow-lg"
            aria-label="Previous slide"
          >
            ❮
          </button>
          <button
            onClick={nextSlide}
            className="apex-btn apex-btn-icon bg-surface-0/20 hover:bg-brand-500 text-white border-none backdrop-blur-md pointer-events-auto transition-all hover:scale-110 shadow-lg"
            aria-label="Next slide"
          >
            ❯
          </button>
        </div>

        {/* Main Content & CTA */}
        <div className="relative z-10 container mx-auto px-6 sm:px-12 lg:px-16 py-12 max-w-3xl space-y-6 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/90 backdrop-blur-md text-white text-xs font-extrabold uppercase tracking-wider shadow-md animate-scale-in">
            <FaFire className="text-amber-300" />
            {slide.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            {slide.title}
          </h1>

          <p className="text-white text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed"
                style={{ textShadow: "0 1px 10px rgb(17 24 39 / 0.65)" }}>
            {slide.description}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={slide.ctaLink || "/get-ticket"}
              className="apex-btn bg-brand-500 hover:bg-brand-600 text-white border-none rounded-2xl px-8 font-extrabold text-base shadow-xl shadow-red-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <FaTicket />
              {slide.ctaText || "Book Match Tickets"}
            </Link>

            <Link
              href={slide.secondaryCtaLink || "/programs"}
              className="apex-btn bg-surface-0/20 hover:bg-surface-0 text-white hover:text-ink-900 border-none backdrop-blur-md rounded-2xl px-6 font-bold text-base transition-all flex items-center gap-2"
            >
              {slide.secondaryCtaText || "Explore Programs"}
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>

        {/* Slide Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                current === idx ? "w-8 bg-brand-500" : "w-2.5 bg-surface-0/50 hover:bg-surface-0"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
