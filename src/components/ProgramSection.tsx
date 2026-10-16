"use client";

import { freshImage } from "@/lib/images";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { INITIAL_PROGRAMS, type ProgramData } from "@/lib/mockData";
import RegisterButton from "@/components/RegisterButton";

export default function ProgramSection() {
  const [programs, setPrograms] = useState<ProgramData[]>(INITIAL_PROGRAMS);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/programs", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.programs?.length) setPrograms(data.programs);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <section
      id="programs"
      className="apex-container apex-section"
      aria-labelledby="programs-heading"
    >
      <div className="apex-section-heading">
        <div>
          <p className="apex-eyebrow">THE APEX ACADEMY</p>
          <h2 id="programs-heading" className="apex-display">
            EVERY PLAYER.
            <br />
            <span>A NEXT LEVEL.</span>
          </h2>
        </div>
        <div className="apex-section-aside">
          <p>
            From finding your feet to finding your edge. Choose the pathway that
            meets you where you are.
          </p>
          <Link className="apex-text-link" href="/programs">
            Explore all programs <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="apex-program-grid">
        {programs.slice(0, 3).map((program, index) => (
          <article key={program.id} className="apex-program-card">
            <Link
              href={`/programs#${program.id}`}
              className="apex-program-photo"
              aria-label={`Explore ${program.title}`}
            >
              <Image
                src={freshImage(program.image)}
                alt="Hockey players training on an indoor ice rink"
                fill
                sizes="(max-width: 767px) 100vw, 33vw"
                className="object-cover"
              />
              <span className="apex-program-number">0{index + 1}</span>
              <span className="apex-program-age">{program.ageGroup}</span>
            </Link>
            <div className="apex-program-body">
              <p className="apex-eyebrow">{program.category} DEVELOPMENT</p>
              <h3>{program.title}</h3>
              <p className="apex-program-description">{program.description}</p>
              <div className="apex-program-meta">
                <span>
                  <Clock3 size={14} aria-hidden="true" /> {program.duration}
                </span>
                <span>
                  {program.spotsLeft > 0
                    ? `${program.spotsLeft} places available`
                    : "Enquire for availability"}
                </span>
              </div>
              <div className="apex-program-bottom">
                <span>
                  <strong>${program.price}</strong>
                  <small> / program</small>
                </span>
                <RegisterButton
                  program={{
                    id: program.id,
                    title: program.title,
                    ageGroup: program.ageGroup,
                    price: program.price,
                    duration: program.duration,
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
