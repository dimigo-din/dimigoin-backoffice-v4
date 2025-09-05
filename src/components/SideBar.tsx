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
  gap: 1dvh;
  
  .title{
    --line-color:#e5e7eb; /* 선 색 */
    --line-weight:1px; /* 선 두께 */
    --gap: .75rem; /* 글자-선 사이 간격 */


    display:flex;
    align-items:center;
    gap:var(--gap);
    color: ${({theme}) => theme.Colors.Content.Primary};
    font-family: sans-serif;
  }

  .title::before{
    content:"";
    border-top:var(--line-weight) solid var(--line-color);
    flex:0 0 auto; /* 왼쪽 선은 짧게 */
    width:20px;

    background-color: ${({theme}) => theme.Colors.Content.Tertiary};
  }
  .title::after{
    content:"";
    flex:1 1 0; /* 오른쪽 선은 길게 */
    border-top:var(--line-weight) solid var(--line-color);

    background-color: ${({theme}) => theme.Colors.Content.Tertiary};
  }
  .title > span{
    white-space:nowrap;
    font-weight:600;
  }
`;
const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3dvh;
`;

const MenuItem = styled.div<{ selected: boolean }>`
  height: 5dvh;
  width: 100%;
  
  padding: 0 1dvw;
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  background-color: ${({theme, selected}) => selected ? theme.Colors.Background.Tertiary : theme.Colors.Background.Secondary};
  border-radius: 8px;
  
  align-content: center;
  
  transition: background-color 200ms ease;

  font-size: ${({theme}) => theme.Font.Headline.size};
`;

function SideBar() {
  let navigate = useNavigate();

  const menuList = [
    {
      title: "잔류",
      items: [
        { key: "stay", label: "잔류 관리" },
        { key: "applystay", label: "잔류 신청 관리" }
      ]
    },
    {
      title: "금요귀가",
      items: [
        { key: "frigo", label: "금요귀가 관리" },
        { key: "applyfrigo", label: "금요귀가 신청 관리" }
      ]
    },
    {
      title: "세탁",
      items: [
        { key: "laundry", label: "세탁 관리" },
        { key: "applylaundry", label: "세탁 신청 관리" }
      ]
    },
    {
      title: "기상송",
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

  if (!location.pathname.startsWith("/login") && !location.pathname.startsWith("/openwakeup") && !localStorage.getItem("name")) {
    location.href = "/login";
  }else if (location.pathname.startsWith("/login") || location.pathname.startsWith("/openwakeup")) {
    return null;
  }

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
        
        {/* {Object.keys(menuList).map((item) => (
          <MenuItem onClick={() => navigate(`/${item}`)} selected={location.pathname.startsWith(`/${item}`)}>
            {menuList[item as keyof typeof menuList]}
          </MenuItem>
        ))} */}

        {menuList.map((menu) => (
          <div key={menu.title}>
            <Menu>
              <div className="title">
                <span>{menu.title}</span>
              </div>
              {menu.items.map((item) => (
                <MenuItem onClick={() => navigate(`/${item.key}`)} selected={location.pathname.startsWith(`/${item.key}`)}>
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </div>
        ))}
      </MenuWrapper>
    </Wrapper>
  );
}
export default SideBar;