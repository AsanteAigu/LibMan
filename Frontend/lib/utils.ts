import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Stitch's typography scale (text-headline-lg, text-label-md, ...) uses names
// tailwind-merge can't recognize as font-size utilities, so by default it
// lumps them into the "text-color" group and silently drops whichever
// text-color/text-size class comes first (e.g. `text-on-primary text-label-md`
// loses text-on-primary). Registering the scale here fixes that.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-lg",
            "headline-lg",
            "headline-lg-mobile",
            "headline-md",
            "body-lg",
            "body-md",
            "label-md",
            "label-sm",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
