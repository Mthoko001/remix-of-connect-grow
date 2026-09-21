import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import type { CategoryNode } from "@/lib/categories";

function categoryLink(name: string) {
  return { to: "/suppliers" as const, search: { q: name } };
}

/** Desktop: hover (or click, for keyboard/touch) reveals a dropdown panel. */
export function CategoriesDesktopMenu({ categories }: { categories: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  if (categories.length === 0) return null;

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Categories
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 pt-3">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 rounded-2xl border border-border bg-card p-5 shadow-xl">
            {categories.map((cat) => (
              <div key={cat.category_id}>
                <Link
                  {...categoryLink(cat.name)}
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-foreground hover:text-brand"
                >
                  {cat.name}
                </Link>
                {cat.children.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {cat.children.map((child) => (
                      <li key={child.category_id}>
                        <Link
                          {...categoryLink(child.name)}
                          onClick={() => setOpen(false)}
                          className="text-sm text-muted-foreground hover:text-brand"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Mobile: tapping expands an inline nested list within the drawer. */
export function CategoriesMobileMenu({
  categories,
  onNavigate,
}: {
  categories: CategoryNode[];
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (categories.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        Categories
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="ml-3 mt-1 space-y-2 border-l border-border pl-3">
          {categories.map((cat) => (
            <div key={cat.category_id}>
              <Link
                {...categoryLink(cat.name)}
                onClick={onNavigate}
                className="block rounded-lg px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                {cat.name}
              </Link>
              {cat.children.length > 0 && (
                <div className="ml-2 space-y-1">
                  {cat.children.map((child) => (
                    <Link
                      key={child.category_id}
                      {...categoryLink(child.name)}
                      onClick={onNavigate}
                      className="block rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
