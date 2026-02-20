import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { ping } from "../api/auth.ts";
import Divider from "./Divider.tsx";
import { useLocation, useNavigate } from "react-router-dom";

const Wrapper = styled.aside`
  height: 100%;
  width: 17dvw;

  display: flex;
  flex-direction: column;
  gap: 8px;

  background-color: ${({ theme }) => theme.Colors.Background.Primary};
  border-radius: 18px;
  padding: 2.5dvh 1.8dvw;
`;

const UserWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1dvw;
  color: ${({ theme }) => theme.Colors.Content.Primary};

  .left {
    > img {
      width: 3dvw;
      height: 3dvw;
      object-fit: cover;
      border-radius: 100%;
    }
  }

  .right {
    display: flex;
    flex-direction: column;
    justify-content: center;

    > .name {
      font-size: ${({ theme }) => theme.Font.Headline.size};
    }
    > .hello {
      font-size: ${({ theme }) => theme.Font.Callout.size};
      color: ${({ theme }) => theme.Colors.Content.Secondary};
    }
  }
`;

const MenuWrapper = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AccordionSection = styled.section`
  border-radius: 8px;
  background-color: ${({ theme }) => theme.Colors.Background.Secondary};
  overflow: hidden;
`;

const AccordionHeaderButton = styled.button<{ $isOpen: boolean }>`
  height: 5dvh;
  width: 100%;
  padding: 0 1dvw;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: ${({ theme, $isOpen }) =>
    $isOpen ? theme.Colors.Background.Tertiary : theme.Colors.Background.Secondary};
  color: ${({ theme }) => theme.Colors.Content.Primary};
  font-size: ${({ theme }) => theme.Font.Title.size};
  font-weight: 600;

  cursor: pointer;
  border: solid 1.5px ${({theme}) => theme.Colors.Line.Outline};
  border-radius: 8px;
  text-align: left;
  transition: background-color 300ms ease;

  &:hover {
    background-color: ${({ theme }) => theme.Colors.Background.Tertiary};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const AccordionIcon = styled.span<{ $isOpen: boolean }>`
  display: inline-block;
  font-size: ${({ theme }) => theme.Font.Callout.size};
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 300ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const AccordionContent = styled.div<{ $isOpen: boolean; $max: number }>`
  max-height: ${({ $isOpen, $max }) => ($isOpen ? `${$max}px` : "0")};
  overflow: hidden;
  transition: max-height 300ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const MenuItem = styled.button<{ $selected: boolean }>`
  height: 4.5dvh;
  width: 100%;
  padding: 0 2dvw;

  color: ${({ theme }) => theme.Colors.Content.Primary};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.Colors.Background.Tertiary : "transparent"};

  display: block;
  cursor: pointer;
  border: none;
  text-align: left;
  transition: background-color 200ms ease;
  font-size: ${({ theme }) => theme.Font.Headline.size || "14px"};

  &:hover {
    background-color: ${({ theme }) => theme.Colors.Background.Tertiary};
  }
`;

type MenuItemType = { key: string; label: string };

type MenuSection = {
  title: string;
  key: string;
  items: MenuItemType[];
};

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuList: readonly MenuSection[] = useMemo(
    () => [
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
        title: "기상송",
        key: "wakeup-section",
        items: [{ key: "wakeup", label: "기상송 열람 및 관리" }],
      },
    ],
    []
  );

  const pathname = location.pathname;
  const isAuthFree = pathname.startsWith("/login") || pathname.startsWith("/openwakeup");

  useEffect(() => {
    if (!isAuthFree) {
      ping();
    }
  }, [isAuthFree]);

  if (isAuthFree) return null;

  const name = window.localStorage.getItem("name");
  const picture =
    window.localStorage.getItem("picture") ||
    "https://i.namu.wiki/i/Bge3xnYd4kRe_IKbm2uqxlhQJij2SngwNssjpjaOyOqoRhQlNwLrR2ZiK-JWJ2b99RGcSxDaZ2UCI7fiv4IDDQ.webp";

  useEffect(() => {
    if (!name) {
      navigate("/login", { replace: true });
    }
  }, [name, navigate]);

  const [openSection, setOpenSection] = useState<string | null>(() => window.localStorage.getItem("sidebar.openSection"));

  useEffect(() => {
    for (const menu of menuList) {
      if (menu.items.some((item) => pathname.startsWith(`/${item.key}`))) {
        setOpenSection(menu.key);
        window.localStorage.setItem("sidebar.openSection", menu.key);
        break;
      }
    }
  }, [pathname, menuList]);

  const toggleSection = (sectionKey: string) => {
    setOpenSection((prev) => {
      const next = prev === sectionKey ? null : sectionKey;
      window.localStorage.setItem("sidebar.openSection", next ?? "");
      return next;
    });
  };

  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [contentHeights, setContentHeights] = useState<Record<string, number>>({});

  useEffect(() => {
    const heights: Record<string, number> = {};
    menuList.forEach((m) => {
      const el = contentRefs.current[m.key];
      heights[m.key] = el ? el.scrollHeight : 0;
    });
    setContentHeights(heights);
  }, [menuList]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const heights: Record<string, number> = {};
      menuList.forEach((m) => {
        const el = contentRefs.current[m.key];
        heights[m.key] = el ? el.scrollHeight : 0;
      });
      setContentHeights(heights);
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname, menuList]);

  return (
    <Wrapper>
      <UserWrapper>
        <div className="left">
          <img src={picture} />
        </div>
        <div className="right">
          <p className="name">{name ? `${name} 선생님` : ""}</p>
          <p className="hello">환영합니다.</p>
        </div>
      </UserWrapper>

      <Divider />

      <MenuWrapper>
        {menuList.map((menu) => {
          const isOpen = openSection === menu.key;
          const sectionId = `accordion-${menu.key}`;
          const panelId = `${sectionId}-panel`;
          const max = contentHeights[menu.key] ?? 0;

          return (
            <AccordionSection key={menu.key}>
              <AccordionHeaderButton
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                id={sectionId}
                $isOpen={isOpen}
                onClick={() => toggleSection(menu.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSection(menu.key);
                  }
                }}
              >
                <span>{menu.title}</span>
                <AccordionIcon aria-hidden $isOpen={isOpen}>▼</AccordionIcon>
              </AccordionHeaderButton>

              <AccordionContent
                role="region"
                aria-labelledby={sectionId}
                id={panelId}
                $isOpen={isOpen}
                $max={max}
              >
                <div
                  ref={(el) => {
                    contentRefs.current[menu.key] = el;
                  }}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  {menu.items.map((item) => {
                    const selected = pathname.startsWith(`/${item.key}`);
                    return (
                      <MenuItem
                        key={item.key}
                        type="button"
                        $selected={selected}
                        aria-current={selected ? "page" : undefined}
                        onClick={() => navigate(`/${item.key}`)}
                      >
                        {item.label}
                      </MenuItem>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionSection>
          );
        })}
      </MenuWrapper>
      <Divider />
      <AccordionHeaderButton
        type="button"
        onClick={() => navigate("/studentinfo")}
        $isOpen={false}
      >
        학생정보 등록
      </AccordionHeaderButton>
      <p style={{ fontSize: "12px", color: "#888", textAlign: "center" }}>© 2026 DIMIGOIN Backoffice</p>
    </Wrapper>
  );
}
