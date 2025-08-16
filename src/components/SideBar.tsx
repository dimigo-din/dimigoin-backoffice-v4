import styled from "styled-components";
import {ping} from "../api/auth.ts";
import {useEffect} from "react";
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

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2dvh;
`;

const MenuItem = styled.div<{ selected: boolean }>`
  height: 4dvh;
  width: 100%;
  
  padding: 0 1dvw;
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  background-color: ${({theme, selected}) => selected ? theme.Colors.Background.Tertiary : theme.Colors.Background.Secondary};
  border-radius: 8px;
  
  align-content: center;
  
  transition: background-color 200ms ease;
`;

function SideBar() {
  let navigate = useNavigate();

  const menuList = {
    "stay": "잔류 관리",
    "frigo": "금요귀가 관리",
    "applystay": "잔류 신청 관리",
    "applyfrigo": "금요귀가 신청 관리",
    "wakeup": "기상송 열람 및 관리",
  } as const;

  useEffect(() => {
    if (!location.pathname.startsWith("/login"))
      ping();
  }, []);

  if (!localStorage.getItem("name")) return null;

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
      <Menu>
        {Object.keys(menuList).map((item) => (
          <MenuItem onClick={() => navigate(`/${item}`)} selected={location.pathname.startsWith(`/${item}`)}>
            {menuList[item as keyof typeof menuList]}
          </MenuItem>
        ))}
      </Menu>
    </Wrapper>
  );
}

export default SideBar;