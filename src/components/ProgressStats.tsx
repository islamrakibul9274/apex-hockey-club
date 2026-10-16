import { ArrowUpRight, Goal, MoveUpRight, UsersRound } from "lucide-react";
import Link from "next/link";

const PATHS = [
  {
    label: "BUILD YOUR GAME",
    title: "Train with purpose",
    body: "Explore junior, teen, and adult programs.",
    href: "/programs",
    icon: MoveUpRight,
  },
  {
    label: "FEEL EVERY MOMENT",
    title: "Be there for the action",
    body: "Find your fixture. Choose your seats.",
    href: "/get-ticket",
    icon: Goal,
  },
  {
    label: "FIND YOUR PEOPLE",
    title: "A place in the game",
    body: "Get to know the club behind the crest.",
    href: "/about",
    icon: UsersRound,
  },
];

export default function ProgressStats() {
  return (
    <section className="apex-container" aria-label="Explore Apex Hockey">
      <div className="apex-path-strip">
        {PATHS.map(({ label, title, body, href, icon: Icon }) => (
          <Link href={href} key={href} className="apex-path">
            <Icon size={26} strokeWidth={1.4} aria-hidden="true" />
            <span>
              <small>{label}</small>
              <strong>{title}</strong>
              <span>{body}</span>
            </span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
