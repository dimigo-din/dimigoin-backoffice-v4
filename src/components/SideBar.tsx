import { useEffect, useMemo } from "react";
import styled from "styled-components";
import { checkPermission, logout, ping } from "../api/auth.ts";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/icons/dimigoin.svg?react";

type MenuItemType = { key: string; label: string };

type MenuSection = {
  title: string;
  key: string;
  items: MenuItemType[];
};

const Wrapper = styled.aside<{ $mobileOpen: boolean }>`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;

  background-color: ${({ theme }) => theme.Colors.Background.Primary};
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    width: 78dvw;
    max-width: 320px;
    border-radius: 0;
    transform: translateX(${({ $mobileOpen }) => ($mobileOpen ? "0" : "-100%")});
    transition: transform 220ms ease;
    z-index: 9;
  }
`;

const Header = styled.div`
  padding: 28px 20px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.Colors.Line.Divider};
`;

const Brand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.Colors.Content.Primary};

  > svg {
    width: 24px;
    height: 24px;
  }

  > span {
    font-size: ${({ theme }) => theme.Font.Headline.size};
    font-weight: ${({ theme }) => theme.Font.Headline.weight.strong};
  }
`;

const UserRow = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.Colors.Content.Primary};

  .meta {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .role {
      font-size: ${({ theme }) => theme.Font.Footnote.size};
      color: ${({ theme }) => theme.Colors.Content.Secondary};
    }

    .name {
      font-size: ${({ theme }) => theme.Font.Headline.size};
      font-weight: ${({ theme }) => theme.Font.Headline.weight.strong};
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: ${({ theme }) => theme.Colors.Content.Primary};
  background: ${({ theme }) => theme.Colors.Background.Secondary};
  display: none;

  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;

const MenuArea = styled.nav`
  padding: 18px 16px 20px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const SectionTitle = styled.p`
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.Colors.Content.Secondary};
  font-size: ${({ theme }) => theme.Font.Body.size};
  line-height: ${({ theme }) => theme.Font.Body.lineHeight};
`;

const ItemList = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemButton = styled.button<{ $selected: boolean }>`
  width: 100%;
  height: 34px;
  border-radius: 8px;
  padding: 0 12px;
  text-align: left;
  color: ${({ theme, $selected }) => ($selected ? theme.Colors.Content.Primary : theme.Colors.Content.Tertiary)};
  background: ${({ theme, $selected }) => ($selected ? theme.Colors.Background.Tertiary : "transparent")};
  font-size: ${({ theme }) => theme.Font.Body.size};
  line-height: ${({ theme }) => theme.Font.Body.lineHeight};

  &:hover {
    background: ${({ theme }) => theme.Colors.Background.Tertiary};
    color: ${({ theme }) => theme.Colors.Content.Primary};
  }
`;

const UtilityArea = styled.div`
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.Colors.Line.Divider};
`;

const UtilityButton = styled.button<{ $selected?: boolean }>`
  width: 100%;
  height: 40px;
  border-radius: 10px;
  text-align: left;
  padding: 0 12px;
  color: ${({ theme, $selected }) => ($selected ? theme.Colors.Content.Primary : theme.Colors.Content.Secondary)};
  background: ${({ theme, $selected }) => ($selected ? theme.Colors.Background.Tertiary : "transparent")};
`;

const Footer = styled.p`
  margin: 10px 0 0;
  color: ${({ theme }) => theme.Colors.Content.Quaternary};
  text-align: center;
  font-size: ${({ theme }) => theme.Font.Caption.size};
`;

function getSections(): MenuSection[] {
  const sections_manage: MenuSection[] = [
    {
      title: "잔류",
      key: "stay-section",
      items: [
        { key: "stay", label: "잔류 관리" },
        { key: "applystay", label: "잔류 신청 관리" },
        { key: "viewstayseat", label: "열람실 좌석" },
      ],
    },
    {
      title: "금요귀가",
      key: "frigo-section",
      items: [
        { key: "frigo", label: "금요귀가 관리" },
        { key: "applyfrigo", label: "금요귀가 신청 관리" },
      ],
    },
    {
      title: "세탁",
      key: "laundry-section",
      items: [
        { key: "laundrytimeline", label: "세탁 시간표 관리" },
        { key: "laundrymachine", label: "세탁기 관리" },
        { key: "applylaundry", label: "세탁 신청 관리" },
      ],
    },
    {
      title: "기상곡",
      key: "wakeup-section",
      items: [{ key: "wakeup", label: "기상송 열람 및 관리" }],
    },
  ];

  const sections_dienen: MenuSection[] = [
    {
      title: "디넌",
      key: "dienen-section",
      items: [
        { key: "dienen_time", label: "급식 시간 조회" },
        { key: "dienen_edittime", label: "급식 시간 관리" },
        { key: "dienen_delaytime", label: "급식 시간 미루기" },
      ],
    },
  ];

  const hasManagePermission = checkPermission("manage_permission");
  const hasDienenPermission = checkPermission("dienen");

  const sections: MenuSection[] = [];
  if (hasManagePermission) sections.push(...sections_manage);
  if (hasDienenPermission) sections.push(...sections_dienen);
  return sections;
}

export default function SideBar({
  mobileOpen = false,
  onClose,
  onNavigate,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;
  const isAuthFree = pathname.startsWith("/login") || pathname.startsWith("/openwakeup");

  const menuList = useMemo(() => getSections(), []);
  const name = window.localStorage.getItem("name");
  const hasManagePermission = checkPermission("manage_permission");
  const hasDienenPermission = checkPermission("dienen");

  useEffect(() => {
    if (!isAuthFree) {
      ping();
    }
  }, [isAuthFree]);

  useEffect(() => {
    if (!isAuthFree && !name) {
      navigate("/login", { replace: true });
    }
  }, [isAuthFree, name, navigate]);

  if (isAuthFree) return null;

  const teacherRole = hasManagePermission ? "선생님" : hasDienenPermission ? "디넌" : "선생님";

  return (
    <Wrapper $mobileOpen={mobileOpen}>
      <CloseButton aria-label="Close sidebar" onClick={() => onClose?.()}>✕</CloseButton>

      <Header>
        <Brand>
          <Logo />
          <span>디미고인</span>
        </Brand>
        <UserRow>
          <div className="meta">
            <span className="role">{teacherRole}</span>
            <span className="name">{name ?? "-"}</span>
          </div>
        </UserRow>
      </Header>

      <MenuArea>
        {menuList.map((menu) => (
          <section key={menu.key}>
            <SectionTitle>{menu.title}</SectionTitle>
            <ItemList>
              {menu.items.map((item) => {
                const selected = pathname.startsWith(`/${item.key}`);
                return (
                  <ItemButton
                    key={item.key}
                    type="button"
                    $selected={selected}
                    aria-current={selected ? "page" : undefined}
                    onClick={() => {
                      navigate(`/${item.key}`);
                      onNavigate?.();
                    }}
                  >
                    {item.label}
                  </ItemButton>
                );
              })}
            </ItemList>
          </section>
        ))}
      </MenuArea>

      <UtilityArea>
        {hasManagePermission ? (
          <UtilityButton
            type="button"
            $selected={pathname.startsWith("/studentinfo")}
            onClick={() => {
              navigate("/studentinfo");
              onNavigate?.();
            }}
          >
            학생정보 등록
          </UtilityButton>
        ) : null}
        <UtilityButton
            type="button"
            $selected={pathname.startsWith("/logout")}
            onClick={() => {
              logout();
              navigate("/login");
              onNavigate?.();
            }}
          >
            로그아웃
          </UtilityButton>
        <Footer>© 2026 DIMIGOIN Backoffice</Footer>
      </UtilityArea>
    </Wrapper>
  );
}
