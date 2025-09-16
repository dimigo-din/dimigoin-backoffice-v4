import styled from "styled-components";
import CheckBoxOn from "../assets/icons/checkbox/check_box_checked.svg?react"

const Element = styled.div<{ canceled: boolean }>`
  height: 3vh;
  width: 32%;

  border-radius: 12px;
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Paragraph_Large.size};
  line-height: ${({theme}) => theme.Font.Paragraph_Large.lineHeight};
  font-weight: ${({theme, canceled}) => canceled ? theme.Font.Paragraph_Large.weight.regular : theme.Font.Paragraph_Large.weight.weak};
  transition: border-color 0.3s ease, font-weight 0.3s ease;

  display: flex;
  gap: 6%;
  align-items: center;
  justify-content: center;

  path {
    fill: ${({theme, canceled}) => canceled ? theme.Colors.Core.Brand.Primary : theme.Colors.Content.Quaternary};
    transition: fill 0.3s ease;
  }
`;

function CheckBox({ text, canceled, onClick }: { text: string; canceled: boolean; onClick: () => void }) {
  return (
    <Element canceled={canceled} onClick={onClick}>
        <CheckBoxOn />
        <p>{text}</p>
    </Element>
  );
}

export default CheckBox;