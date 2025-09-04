"use client";

import React from "react";
import ReactDOM from "react-dom";
import styled, { css, keyframes } from "styled-components";

/* ---------- Backdrop brightness ---------- */
const darken = keyframes`
  from { backdrop-filter: brightness(100%); }
  to   { backdrop-filter: brightness(70%); }
`;
const brighten = keyframes`
  from { backdrop-filter: brightness(70%); }
  to   { backdrop-filter: brightness(100%); }
`;

/* ---------- Slide (Right Drawer) ---------- */
const slideInRight = keyframes`
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
`;
const slideOutRight = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
`;

/** 
 * 오른쪽 패널 형태의 전체 오버레이 컨테이너
 * transient prop($isClosing) 사용으로 DOM 속성 누수 방지
 */
const DialogBox = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: stretch;      /* 세로로 꽉 */
  justify-content: flex-end; /* 오른쪽 정렬 */
  z-index: 9999;

  background: transparent;   /* backdrop-filter 보이게 */

  backdrop-filter: ${({ $isClosing }) =>
    $isClosing ? "brightness(90%)" : "brightness(100%)"};

  ${({ $isClosing }) => css`
    animation: ${$isClosing ? brighten : darken} 0.3s ease forwards;
  `}

  pointer-events: auto;
`;

/** 실제 사이드 패널 */
const DialogPanel = styled.div<{ $isClosing: boolean }>`
  width: 45vw;            /* 화면의 45% */
  max-width: 960px;       /* 너무 넓어지지 않도록 상한 */
  min-width: 520px;       /* 너무 좁아지지 않도록 하한 */
  height: 100%;           /* 전체 높이 */
  background-color: ${({ theme }) => theme.Colors.Background.Tertiary};
  border-radius: 16px 0 0 16px; /* 왼쪽만 둥글게 */

  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  ${({ $isClosing }) => css`
    animation: ${$isClosing ? slideOutRight : slideInRight} 0.3s ease forwards;
  `}

  overflow: auto;                /* 내부 스크롤 */
  -webkit-overflow-scrolling: touch;

  padding: 20px 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);

  pointer-events: auto;
`;

const ChildrenWrapper = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

/* 포털 대상 보장 훅 */
function usePortalTarget(id = "__dialog_portal__") {
  const ref = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
    ref.current = el as HTMLElement;
  }, [id]);
  return ref.current;
}

type SelectionDialogProps = {
  isOpen: boolean;
  closeAction?: () => void;
  onOpen?: () => void;
  onCloseEnd?: () => void;
  /** 배경 클릭으로 닫기 허용 여부 (기본 true) */
  backdropClosable?: boolean;
  children: React.ReactNode;
};

function SelectionDialog({
  isOpen,
  closeAction,
  onOpen,
  onCloseEnd,
  backdropClosable = true,
  children,
}: SelectionDialogProps) {
  const [isClosing, setIsClosing] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const first = React.useRef(true);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const onOpenRef = React.useRef<typeof onOpen>(undefined);
  React.useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  // 렌더링 상태 관리
  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  // 문서 스크롤 잠금
  React.useEffect(() => {
    if (!shouldRender) return;
    const orig = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = orig;
    };
  }, [shouldRender]);

  // 열림/닫힘 전환 처리 (❗ onOpen을 의존성에서 제거)
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      if (isOpen) {
        panelRef.current?.focus(); // 즉시 실행
        onOpenRef.current?.();
      }
      return;
    }

    if (!isOpen && shouldRender) {
      setIsClosing(true);
    } else if (isOpen) {
      setTimeout(() => {
        panelRef.current?.focus();
      }, 50);
      onOpenRef.current?.(); // ✅ ref 통해 호출 (열릴 때만)
    }
  }, [isOpen, shouldRender]); // ✅ onOpen 제거됨

  // ESC 닫기
  React.useEffect(() => {
    if (!shouldRender) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeAction?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shouldRender, closeAction]);

  const handleBackdropClick = () => {
    if (!backdropClosable || isClosing) return;
    closeAction?.();
  };

  const handlePanelAnimationEnd = (e: React.AnimationEvent) => {
    // 이벤트가 패널에서 직접 발생한 경우만 처리
    if (e.target === panelRef.current && isClosing) {
      setShouldRender(false);
      setIsClosing(false);
      onCloseEnd?.();
    }
  };

  const portalRoot = usePortalTarget();

  if (!shouldRender) return null;

  const node = (
    <DialogBox
      $isClosing={isClosing}
      onClick={handleBackdropClick}
      aria-hidden={false}
    >
      <DialogPanel
        $isClosing={isClosing}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={panelRef}
        onClick={(e) => {
          // 패널 내부 클릭은 배경 클릭 닫기 이벤트와 분리
          e.preventDefault();
          e.stopPropagation();
        }}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <ChildrenWrapper>{children}</ChildrenWrapper>
      </DialogPanel>
    </DialogBox>
  );

  return portalRoot ? ReactDOM.createPortal(node, portalRoot) : node;
}

export default SelectionDialog;
