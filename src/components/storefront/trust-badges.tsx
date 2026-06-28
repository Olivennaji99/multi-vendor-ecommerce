import { Headset, RotateCcw, ShieldCheck, Star } from "lucide-react";

const badges = [
  { icon: ShieldCheck, title: "Secure Payment", description: "100% secure payment" },
  { icon: RotateCcw, title: "Easy Returns", description: "30-day return policy" },
  { icon: Headset, title: "24/7 Support", description: "Dedicated support" },
  { icon: Star, title: "Trusted by Thousands", description: "4.8 average rating" },
];

export function TrustBadges() {
  return (
    <section className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-6 sm:grid-cols-4">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div key={badge.title} className="flex items-center gap-3">
            <Icon className="size-6 text-primary" />
            <div>
              <p className="text-sm font-medium">{badge.title}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
