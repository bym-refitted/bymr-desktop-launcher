<script lang="ts" module>
  import { tv, type VariantProps } from "tailwind-variants";

  const buttonVariants = tv({
    base: "focus-visible:ring-primary/40 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-[color,background-color,box-shadow,filter] outline-none select-none focus-visible:ring-3 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-semibold shadow-[0_6px_18px_-8px_var(--primary)] hover:shadow-[0_8px_24px_-8px_var(--primary)] hover:brightness-110",
        secondary:
          "bg-secondary text-secondary-foreground font-semibold shadow-[0_6px_18px_-8px_var(--secondary)] hover:brightness-110",
        outline:
          "border-border-strong text-muted-foreground hover:bg-accent hover:text-foreground border",
        soft: "bg-primary/15 text-primary font-semibold hover:bg-primary/25",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        destructive:
          "bg-destructive/15 text-destructive hover:bg-destructive/25",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-12 px-5 text-[15px]",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  });

  type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
  type ButtonSize = VariantProps<typeof buttonVariants>["size"];
</script>

<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLButtonAttributes, "class"> {
    /** Extra classes, merged over the variant's classes. */
    class?: string;
    /** The visual style; defaults to the teal primary button. */
    variant?: ButtonVariant;
    /** The height and padding; defaults to 40px tall. */
    size?: ButtonSize;
  }

  let {
    class: className,
    variant,
    size,
    type = "button",
    children,
    ...rest
  }: Props = $props();
</script>

<button
  class={buttonVariants({ variant, size, class: className })}
  {type}
  {...rest}
>
  {@render children?.()}
</button>
