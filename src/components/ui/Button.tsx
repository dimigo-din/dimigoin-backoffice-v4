import styled, { css } from "styled-components";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "neutral" | "danger" | "ghost";
type ButtonSize = "large" | "medium" | "small";

interface UIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const sizeStyles = {
  large: css`
    height: 56px;
    padding: 0 20px;
  `,
  medium: css`
    height: 48px;
    padding: 0 16px;
  `,
  small: css`
    height: 40px;
    padding: 0 14px;
  `,
};

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.Colors.Core.Brand.Primary};
    color: ${({ theme }) => theme.Colors.Solid.White};
    border: 1px solid ${({ theme }) => theme.Colors.Core.Brand.Primary};
  `,
  neutral: css`
    background-color: ${({ theme }) => theme.Colors.Components.Fill.Secondary};
    color: ${({ theme }) => theme.Colors.Content.Primary};
    border: 1px solid ${({ theme }) => theme.Colors.Line.Outline};
  `,
  danger: css`
    background-color: ${({ theme }) => theme.Colors.Core.Status.Negative};
    color: ${({ theme }) => theme.Colors.Solid.White};
    border: 1px solid ${({ theme }) => theme.Colors.Core.Status.Negative};
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.Colors.Content.Primary};
    border: 1px solid ${({ theme }) => theme.Colors.Line.Outline};
  `,
};

const Root = styled.button<Required<Pick<UIButtonProps, "variant" | "size" | "fullWidth">>>`
  width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};
  min-width: 112px;
  border-radius: ${({ theme }) => theme.Radius[500]};

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.Spacing[100]};

  font-size: ${({ theme }) => theme.Font.Callout.size};
  line-height: ${({ theme }) => theme.Font.Callout.lineHeight};
  font-weight: ${({ theme }) => theme.Font.Callout.weight.strong};

  transition: background-color 140ms ease, border-color 140ms ease, opacity 140ms ease;

  ${({ size }) => sizeStyles[size]}
  ${({ variant }) => variantStyles[variant]}

  &:hover:not(:disabled) {
    filter: brightness(0.97);
  }

  &:active:not(:disabled) {
    filter: brightness(0.92);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};
  }
`;

export function UIButton({
  variant = "primary",
  size = "large",
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}: UIButtonProps) {
  return (
    <Root variant={variant} size={size} fullWidth={fullWidth} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </Root>
  );
}
