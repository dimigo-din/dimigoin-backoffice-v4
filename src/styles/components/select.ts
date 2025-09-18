import styled from "styled-components";

export const Select = styled.select`
  padding: 0 16px;
  border-radius: 12px;
  background-color: ${({theme}) => theme.Colors.Background.Primary};
  border: 1px solid ${({theme}) => theme.Colors.Line.Outline};
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Paragraph_Large.size};
  line-height: ${({theme}) => theme.Font.Paragraph_Large.lineHeight};
  font-weight: ${({theme}) => theme.Font.Paragraph_Large.weight.regular};
  transition: border-color 0.3s ease;
  
  height: "5dvh";

  &::placeholder {
    color: ${({theme}) => theme.Colors.Content.Secondary};
    font-size: ${({theme}) => theme.Font.Paragraph_Large.size};
    line-height: ${({theme}) => theme.Font.Paragraph_Large.lineHeight};
    font-weight: ${({theme}) => theme.Font.Paragraph_Large.weight.regular};
  }
  &:focus {
    border-color: ${({theme}) => theme.Colors.Core.Brand.Primary};
    outline: none;
  }
`;