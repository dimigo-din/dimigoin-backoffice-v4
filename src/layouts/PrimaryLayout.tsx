import styled from "styled-components";
import type {ReactNode} from "react";

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  
  background-color: white;
`;

function PrimaryLayout({ children } : { children: ReactNode }) {
 return (
   <Wrapper>
     {children}
   </Wrapper>
 );
}

export default PrimaryLayout;
