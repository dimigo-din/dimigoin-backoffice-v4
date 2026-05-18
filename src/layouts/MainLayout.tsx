import styled from "styled-components";

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
