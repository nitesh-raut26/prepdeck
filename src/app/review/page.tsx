import type { Metadata } from "next";
import { getFlashcards } from "@/lib/content";
import { ReviewDeck } from "@/components/review-deck";

export const metadata: Metadata = {
  title: "Review",
  description:
    "Spaced-repetition review of every flashcard you've rated, scheduled at 1/3/7/14/30/60/90-day intervals.",
};

export default function ReviewPage() {
  const cards = getFlashcards();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Spaced repetition
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-subtle">
        Rate flashcards as you study and they come back right before you&rsquo;d
        forget them. Recall each answer out loud before revealing — retrieval is
        what builds the memory, not rereading.
      </p>
      <hr className="my-7 border-line" />
      <ReviewDeck cards={cards} />
    </div>
  );
}
