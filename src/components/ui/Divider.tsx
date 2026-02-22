import styled, { css } from "styled-components";

type DividerSize = "large" | "medium" | "small";

interface UIDividerProps {
  size?: DividerSize;
}

const sizeMap = {
  large: css`
    height: 8px;
  `,
  medium: css`
    height: 4px;
  `,
  small: css`
    height: 1px;
  `,
};

const Root = styled.hr<{ $size: DividerSize }>`
  width: 100%;
  border: 0;
  margin: 0;
  background-color: ${({ theme }) => theme.Colors.Line.Divider};
  ${({ $size }) => sizeMap[$size]}
`;

export function UIDivider({ size = "small" }: UIDividerProps) {
  return <Root $size={size} />;
}
