import styled from "styled-components";
import type {ReactNode} from "react";
import SideBar from "../components/SideBar.tsx";
import {MobileNotificationProvider} from "../providers/MobileNotifiCationProvider.tsx";

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
  
  padding: 10dvh 0;
  
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
`;

const ContentWrapper = styled.div`
  height: 100%;
  width: 70dvw;
  
  background-color: ${({theme}) => theme.Colors.Background.Primary};
  border-radius: 18px;
  
  overflow: hidden;
`;

function PrimaryLayout({ children } : { children: ReactNode }) {
  return (
   <Wrapper>
     <MobileNotificationProvider>
       <SideBar />
       <ContentWrapper>
         {children}
       </ContentWrapper>
     </MobileNotificationProvider>
   </Wrapper>
 );
}

export default PrimaryLayout;
