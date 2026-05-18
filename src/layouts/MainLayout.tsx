import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.Component.Spacing[550]};

  padding: ${({ theme }) => theme.Component.Spacing[550]};

  height: 100%;

  overflow-y: auto;
`;

export const Section = styled.div<{ $width: string }>`
  display: flex;
  flex-direction: column;
  gap: 24px;

  width: ${({ $width }) => $width};
  min-width: 0;
  height: 100%;


  overflow-y: auto;

  @media (max-width: 900px) {
    width: 100%;
    height: auto;
    min-height: 340px;
  }
`;

const fitContainerBackgroundColors = {
  Primary: css`
    background-color: ${({ theme }) => theme.Colors.Background.Standard.Primary};
  `,
  Secondary: css`
    background-color: ${({ theme }) => theme.Colors.Background.Standard.Secondary};
  `,
};

export const FitContainer = styled.div<{ color: "Primary" | "Secondary"; padding?: string }>`
  height: fit-content;
  width: 100%;

  border-radius: 12px;

  ${({ color }) => fitContainerBackgroundColors[color]}
  padding: ${({ theme, padding }) => (padding ? padding : `${theme.Component.Spacing[300]} ${theme.Component.Spacing[550]}`)};

  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FillContainer = styled.div<{ padding?: string }>`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: scroll;

  padding: ${({ theme, padding }) => (padding ? padding : `${theme.Component.Spacing[550]} ${theme.Component.Spacing[550]}`)};
  border-radius: 12px;

  background-color: ${({ theme }) => theme.Colors.Background.Standard.Secondary};
`;
