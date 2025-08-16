import styled from "styled-components";
import Logo from "../assets/icons/dimigoin.svg?react";

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.div`
  display: flex;
  flex-direction: row;

  justify-content: center;
  align-items: center;

  gap: 1dvw;

  font-size: ${({theme}) => theme.Font.Display.size};
  font-weight: ${({theme}) => theme.Font.Display.weight.strong};
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  > svg {
    height: 5dvh;
    width: 5dvh;
  }
`;

function EmptyPage() {
  return (
    <Wrapper>
      <Title>
        <Logo />
        <p>디미고인</p>
      </Title>
    </Wrapper>
  );
}

export default EmptyPage;