import styled from "styled-components";
import type {ReactNode} from "react";
import { useState } from "react";
import SideBar from "../components/SideBar.tsx";
import {MobileNotificationProvider} from "../providers/MobileNotifiCationProvider.tsx";

const Wrapper = styled.div`
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  padding: 10dvh 0;

  background-color: ${({theme}) => theme.Colors.Background.Secondary};

  @media (max-width: 768px) {
    padding: 0; /* mobile: full-bleed */
    justify-content: flex-start;
    align-items: stretch;
  }
`;

const ContentWrapper = styled.div`
  height: 100%;
  width: 70dvw;

  background-color: ${({theme}) => theme.Colors.Background.Primary};
  border-radius: 18px;

  overflow: hidden;

  @media (max-width: 768px) {
    width: 100dvw;
    height: 100dvh;
    border-radius: 0;
  }
`;

const TopBar = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 56px;
    padding: 0 16px;
    border-bottom: 1px solid ${({theme}) => theme.Colors.Line.Outline};
  }
`;

const HamburgerButton = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: ${({theme}) => theme.Colors.Background.Secondary};
    color: ${({theme}) => theme.Colors.Content.Primary};
  }
`;

const Backdrop = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  opacity: ${({$visible}) => ($visible ? 1 : 0)};
  pointer-events: ${({$visible}) => ($visible ? "auto" : "none")};
  transition: opacity 200ms ease;
  z-index: 8; /* below sidebar */

  @media (min-width: 769px) {
    display: none;
  }
`;

function PrimaryLayout({ children } : { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Wrapper>
      <MobileNotificationProvider>
        {/* Sidebar: desktop always visible, mobile as drawer */}
        <SideBar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />

        {/* Backdrop for mobile drawer */}
        <Backdrop $visible={mobileOpen} onClick={() => setMobileOpen(false)} />

        <ContentWrapper>
          <TopBar>
            <HamburgerButton aria-label="Open sidebar" onClick={() => setMobileOpen(true)}>
              ☰
            </HamburgerButton>
            <span style={{ fontWeight: 600 }}>DIMIGOIN Backoffice</span>
          </TopBar>
          {children}
        </ContentWrapper>
      </MobileNotificationProvider>
    </Wrapper>
  );
}

export default PrimaryLayout;
