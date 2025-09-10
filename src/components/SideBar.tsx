import styled from "styled-components";
import {ping} from "../api/auth.ts";
import {useEffect, useState} from "react";
import Divider from "./Divider.tsx";
import {useNavigate} from "react-router-dom";

const Wrapper = styled.div`
  height: 100%;
  width: 17dvw;
  
  display: flex;
  flex-direction: column;
  
  gap: 8px;
  
  background-color: ${({theme}) => theme.Colors.Background.Primary};
  border-radius: 18px;
  
  padding: 2.5dvh 1.8dvw;
`;

const UserWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1dvw;
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  .left {
    > img {
      width: 3dvw;
      
      border-radius: 100%;
    }
  }
  
  .right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    > .name {
      font-size: ${({theme}) => theme.Font.Headline.size};
    }
    
    > .LOGIN {
      font-size: ${({theme}) => theme.Font.Headline.size};
    }
  }
`;

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AccordionSection = styled.div`
  border-radius: 8px;
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  overflow: hidden;
`;

const AccordionHeader = styled.div<{ isOpen: boolean }>`
  height: 5dvh;
  width: 100%;
  padding: 0 1dvw;
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  background-color: ${({theme, isOpen}) => isOpen ? theme.Colors.Background.Tertiary : theme.Colors.Background.Secondary};
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Title.size};
  font-weight: 600;
  
  cursor: pointer;
  transition: background-color 500ms ease;
  
  &:hover {
    background-color: ${({theme}) => theme.Colors.Background.Tertiary};
  }
`;

const AccordionIcon = styled.div<{ isOpen: boolean }>`
  font-size: ${({theme}) => theme.Font.Callout.size};
  transform: ${({isOpen}) => isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 300ms ease;
`;

const AccordionContent = styled.div<{ isOpen: boolean }>`
  max-height: ${({isOpen}) => isOpen ? '300px' : '0'};
  overflow: hidden;
  transition: max-height 500ms ease;
`;

const MenuItem = styled.div<{ selected: boolean }>`
  height: 4.5dvh;
  width: 100%;
  
  padding: 0 2dvw;
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  background-color: ${({theme, selected}) => selected ? theme.Colors.Background.Tertiary : 'transparent'};
  
  align-content: center;
  cursor: pointer;
  
  transition: background-color 200ms ease;
  font-size: ${({theme}) => theme.Font.Headline.size || '14px'};
  
  &:hover {
    background-color: ${({theme}) => theme.Colors.Background.Tertiary};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

function SideBar() {
  let navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const menuList = [
    {
      title: "잔류",
      key: "stay-section",
      items: [
        { key: "stay", label: "잔류 관리" },
        { key: "applystay", label: "잔류 신청 관리" },
        { key: "viewstayseat", label: "열람실 좌석" }
      ]
    },
    {
      title: "금요귀가",
      key: "frigo-section",
      items: [
        { key: "frigo", label: "금요귀가 관리" },
        { key: "applyfrigo", label: "금요귀가 신청 관리" }
      ]
    },
    {
      title: "세탁",
      key: "laundry-section",
      items: [
        { key: "laundrytimeline", label: "세탁 시간표 관리" },
        { key: "laundrymachine", label: "세탁기 관리" },
        { key: "applylaundry", label: "세탁 신청 관리" }
      ]
    },
    {
      title: "기상송",
      key: "wakeup-section",
      items: [
        { key: "wakeup", label: "기상송 열람 및 관리" }
      ]
    }
  ] as const;

  useEffect(() => {
    if (!location.pathname.startsWith("/login")) {
      ping()
    }
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    for (const menu of menuList) {
      if (menu.items.some(item => currentPath.startsWith(`/${item.key}`))) {
        setOpenSection(menu.key);
        break;
      }
    }
  }, []);

  if (!location.pathname.startsWith("/login") && !location.pathname.startsWith("/openwakeup") && !localStorage.getItem("name")) {
    location.href = "/login";
  } else if (location.pathname.startsWith("/login") || location.pathname.startsWith("/openwakeup")) {
    return null;
  }

  const toggleSection = (sectionKey: string) => {
    setOpenSection(openSection === sectionKey ? null : sectionKey);
  };

  return (
    <Wrapper>
      <UserWrapper>
        <div className="left">
          <img src={localStorage.getItem("picture") || "https://i.namu.wiki/i/Bge3xnYd4kRe_IKbm2uqxlhQJij2SngwNssjpjaOyOqoRhQlNwLrR2ZiK-JWJ2b99RGcSxDaZ2UCI7fiv4IDDQ.webp"} alt="프로필 사진"/>
        </div>
        <div className="right">
          <p className={"name"}>{localStorage.getItem("name")} 선생님</p>
          <p className={"hello"}>환영합니다.</p>
        </div>
      </UserWrapper>
      <Divider />
      <MenuWrapper>
        {menuList.map((menu) => (
          <AccordionSection key={menu.key}>
            <AccordionHeader 
              isOpen={openSection === menu.key}
              onClick={() => toggleSection(menu.key)}
            >
              <span>{menu.title}</span>
              <AccordionIcon isOpen={openSection === menu.key}>
                ▼
              </AccordionIcon>
            </AccordionHeader>
            <AccordionContent isOpen={openSection === menu.key}>
              {menu.items.map((item) => (
                <MenuItem 
                  key={item.key}
                  onClick={() => navigate(`/${item.key}`)} 
                  selected={location.pathname.startsWith(`/${item.key}`)}
                >
                  {item.label}
                </MenuItem>
              ))}
            </AccordionContent>
          </AccordionSection>
        ))}
      </MenuWrapper>
    </Wrapper>
  );
}

export default SideBar;