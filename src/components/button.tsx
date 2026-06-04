import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button as UIButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared SAA button — composes the shadcn `ui/button` primitive (Slot/asChild,
 * focus + press behaviour) and layers the SAA design on top via className.
 *
 * The Gold/Shadow effect shows only on hover (filled → outer `gold-shadow`;
 * text/icon → content `gold-glow`); selected text/icon keep the glow.
 * Disabled shares one grey look across variants.
 */
const saaButton = cva(
  cn(
    // SAA metrics override the shadcn base (h, radius, padding, type, icon size)
    "h-14 gap-2 rounded px-4 text-base font-semibold text-secondary-1",
    "[&_svg:not([class*='size-'])]:size-6",
    // shared disabled look: grey fill, full opacity (kill shadcn opacity-50), outer shadow, no glow
    "disabled:border-transparent disabled:bg-[#BFBFBF] disabled:text-[#595959] disabled:opacity-100 disabled:gold-shadow disabled:[filter:none]",
  ),
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-2 hover:bg-[#FFF8E1] hover:gold-shadow",
        secondary:
          "border border-border-detail bg-primary/10 hover:bg-primary/40 hover:gold-shadow",
        text: "bg-transparent hover:bg-primary/10 hover:gold-glow",
        icon: "size-14 bg-transparent p-0 hover:bg-primary/10 hover:gold-glow",
      },
      selected: { true: "", false: "" },
    },
    compoundVariants: [
      {
        variant: "text",
        selected: true,
        // selected text button: square (no radius), gold underline only + glow
        // (border-0 resets shadcn's all-side border, border-b adds the underline)
        class: "rounded-none border-0 border-b border-primary text-primary gold-glow",
      },
      { variant: "icon", selected: true, class: "text-primary gold-glow" },
    ],
    defaultVariants: { variant: "primary", selected: false },
  },
);

export interface ButtonProps
  extends Omit<React.ComponentProps<typeof UIButton>, "variant" | "size">,
    VariantProps<typeof saaButton> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className,
  variant,
  selected,
  leftIcon,
  rightIcon,
  asChild,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(saaButton({ variant, selected }), className);

  // asChild: render as the passed element (e.g. a Next <Link>) so CTAs stay a
  // single valid <a> instead of an invalid <a><button> nesting. The icons are
  // injected INTO the child (Radix Slot requires exactly one child).
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return (
      <UIButton asChild className={classes} {...props}>
        {React.cloneElement(
          children,
          undefined,
          leftIcon,
          children.props.children,
          rightIcon,
        )}
      </UIButton>
    );
  }

  return (
    <UIButton className={classes} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </UIButton>
  );
}
