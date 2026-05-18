import { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { deleteStay, getStay, getStayList, type Stay, type StayListItem } from "../../api/stay.ts";
import { Text, UIButton } from "../../components/ui";
import { useToast } from "../../providers/ToastProvider.tsx";
import { Button } from "../../styles/components/button.ts";
import { Wrapper, Section } from "../../layouts/MainLayout.tsx";

const fitContainerBackgroundColors = {
  Primary: css`
    background-color: ${({ theme }) => theme.Colors.Background.Standard.Primary};
  `,
  Secondary: css`
    background-color: ${({ theme }) => theme.Colors.Background.Standard.Secondary};
  `,
};

const FitContainer = styled.div<{ color: "Primary" | "Secondary"; padding?: string }>`
  height: fit-content;
  width: 100%;

  border-radius: 12px;

  ${({ color }) => fitContainerBackgroundColors[color]}
  padding: ${({ theme, padding }) => (padding ? padding : `${theme.Component.Spacing[300]} ${theme.Component.Spacing[550]}`)};

  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FillContainer = styled.div<{ padding?: string }>`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: scroll;

  padding: ${({ theme, padding }) => (padding ? padding : `${theme.Component.Spacing[550]} ${theme.Component.Spacing[550]}`)};
  border-radius: 12px;

  background-color: ${({ theme }) => theme.Colors.Background.Standard.Secondary};
`;

const HStack = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const segmentColors = {
  Green: css`
    background-color: ${({ theme }) => theme.Colors.Solid.Translucent.Green};
  `,
  Yellow: css`
    background-color: ${({ theme }) => theme.Colors.Solid.Translucent.Yellow};
  `,
  Red: css`
    background-color: ${({ theme }) => theme.Colors.Solid.Translucent.Red};
  `,
};

const Segment = styled.div<{ color: "Green" | "Yellow" | "Red" }>`
  width: 80px;
  height: 40px;

  display: inline-flex;
  justify-content: center;
  align-items: center;

  border-radius: ${({ theme }) => theme.Component.Radius[300]};
  font-weight: 500;

  ${({ color }) => segmentColors[color]}
`;

// customs
const EmptyState = styled.div`
  height: 100%;
  min-height: 220px;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const StayApplyPeriodWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
`;

const StayApplyPeriod = styled.div`
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.Component.Spacing[400]};

  @media (max-width: 1100px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const ScheduleButton = styled.div<{ $selected?: boolean }>`
  min-height: 56px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  padding: 8px 20px;
  border-radius: 12px;

  background-color: ${({ theme, $selected }) => ($selected ? theme.Colors.Components.Interaction.Focussed : theme.Colors.Components.Translucent.Interactive)};

  &:hover {
    cursor: ${({ $selected }) => ($selected ? "auto" : "pointer")};
  }
`;

type StayStatus = {
  label: string;
  color: "Green" | "Yellow" | "Red";
};

const getErrorMessage = (e: unknown, fallback: string) => {
  const error = e as { response?: { data?: { error?: { message?: string } | string } } };
  const dataError = error.response?.data?.error;

  if (typeof dataError === "string") return dataError;
  return dataError?.message ?? fallback;
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const formatDateRange = (from?: string, to?: string) => {
  if (!from || !to) return "-";

  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return "-";

  const dateFormat = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return `${dateFormat.format(fromDate)} ~ ${dateFormat.format(toDate)}`;
};

const getStayStatus = (stay?: Stay | StayListItem | null): StayStatus => {
  const applyPeriod = stay && "stay_apply_period_stay" in stay ? stay.stay_apply_period_stay : undefined;

  if (!applyPeriod || applyPeriod.length === 0) return { label: "불러오는 중", color: "Yellow" };

  const now = new Date();
  const earliest = new Date(Math.min(...applyPeriod.map((p) => new Date(p.apply_start).getTime())));
  const latest = new Date(Math.max(...applyPeriod.map((p) => new Date(p.apply_end).getTime())));

  if (now < earliest) return { label: "신청전", color: "Red" };
  if (now <= latest) return { label: "신청중", color: "Yellow" };
  return { label: "마감", color: "Green" };
};

type StayListItemWithStatus = StayListItem & { status: StayStatus };

function StayPage() {
  const { showToast } = useToast();
  const [stayList, setStayList] = useState<StayListItemWithStatus[]>([]);
  const [selectedStayId, setSelectedStayId] = useState<string | null>(null);
  const [currentStay, setCurrentStay] = useState<Stay | null>(null);
  const [isLoadingStay, setIsLoadingStay] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<StayStatus>({ label: "불러오는 중", color: "Yellow" });

  const updateScreen = async () => {
    try {
      const list = (await getStayList()).sort(
        (a, b) => new Date(a.stay_from).getTime() - new Date(b.stay_from).getTime(),
      );
      const stays = await Promise.all(list.map((item) => getStay(item.id)));
      const nextStayList = list.map((item, i) => ({ ...item, status: getStayStatus(stays[i]) }));
      setStayList(nextStayList);
      let isStayDeleted = false;
      setSelectedStayId((previous) => {
        if (!previous) return null;
        if (nextStayList.some((stay) => stay.id === previous)) return previous;
        isStayDeleted = true;
        return null;
      });
      if (isStayDeleted) showToast("선택된 잔류 일정이 존재하지 않습니다.", "danger");
    } catch (e) {
      showToast(getErrorMessage(e, "잔류 일정 목록을 불러오지 못했습니다."), "danger");
    }
  };

  // run updateScreen() on initial render
  useEffect(() => {
    updateScreen();
  }, []);

  useEffect(() => {
    if (!selectedStayId) {
      setCurrentStay(null);
      return;
    }

    const loadStay = async () => {
      setIsLoadingStay(true);
      try {
        const stay = await getStay(selectedStayId);
        setCurrentStay(stay);
        setSelectedStatus(getStayStatus(stay));
      } catch (e) {
        showToast(getErrorMessage(e, "잔류 일정을 불러오지 못했습니다."), "danger");
      } finally {
        setIsLoadingStay(false);
      }
    };

    loadStay();
  }, [selectedStayId]);

  const handleDeleteStay = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteStay(id);
      showToast("삭제했습니다.", "info");
      await updateScreen();
    } catch (e) {
      showToast(getErrorMessage(e, "잔류 일정을 삭제하지 못했습니다."), "danger");
    }
  };


  return (
    <Wrapper>
      <Section $width="60%">
        <FitContainer color="Secondary">
          <HStack>
            <Text>
              {(() => {
                if (currentStay) return `${currentStay.name} (${formatDateRange(currentStay.stay_from, currentStay.stay_to)})`;
                if (isLoadingStay) return "잔류 일정을 불러오는 중";
                return "잔류 일정을 선택해주세요";
              })()}
            </Text>
            {currentStay && <Segment color={selectedStatus.color}>{selectedStatus.label}</Segment>}
          </HStack>
        </FitContainer>

        {currentStay ? (
          <FillContainer>
            <FitContainer color="Primary" padding="20px 28px">
              <Text variant="body" weight="strong" as="span">
                신청기간
              </Text>
              <StayApplyPeriodWrapper>
                {[1, 2, 3].map((grade) => {
                  const period = currentStay.stay_apply_period_stay?.find((p) => p.grade === grade);
                  return (
                  <StayApplyPeriod key={grade}>
                    <Text>{grade}학년</Text>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>
                        {formatDateTime(period?.apply_start)}
                      </UIButton>
                      <Text>부터</Text>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>
                        {formatDateTime(period?.apply_end)}
                      </UIButton>
                      <Text>까지</Text>
                    </div>
                  </StayApplyPeriod>
                  );
                })}
              </StayApplyPeriodWrapper>
            </FitContainer>

            <FitContainer color="Primary" padding="20px 28px">
              <HStack>
                <Text variant="body" weight="strong" as="span">
                  잔류기간
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>
                      {formatDateTime(currentStay.stay_from)}
                    </UIButton>
                    <Text>부터</Text>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>
                      {formatDateTime(currentStay.stay_to)}
                    </UIButton>
                    <Text>까지</Text>
                  </div>
                </div>
              </HStack>
            </FitContainer>

            <FitContainer color="Primary" padding="20px 28px">
              <HStack>
                <Text variant="body" weight="strong" as="span">
                  열람실 좌석 (기능 준비중)
                </Text>
                {/* <UISegmentedControl
                  items={[
                    {
                      label: "평소",
                      value: "1",
                    },
                    {
                      label: "3학년 우선",
                      value: "2",
                    },
                  ]}
                  value={seatSegmentValue}
                  onChange={(value) => {
                    setSeatSegmentValue(value as "1" | "2");
                  }}
                  style={{ width: "50%" }}
                /> */}
              </HStack>
            </FitContainer>
          </FillContainer>
        ) : (
          <FillContainer>
            <EmptyState>
              <Text color="secondary">
                {isLoadingStay ? "불러오는 중입니다." : "잔류 일정을 선택해주세요"}
              </Text>
            </EmptyState>
          </FillContainer>
        )}
      </Section>

      <Section $width="40%">
        <FillContainer padding="0">
          <FillContainer>
            <Text weight="strong">잔류 일정 목록</Text>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: "16px",
              }}
            >
              {(() => {
                if (stayList.length === 0) return <Text color="secondary">등록된 잔류 일정이 없습니다.</Text>;
                return stayList.map((stay) => {
                  const selected = stay.id === selectedStayId;
                  const status = selected ? selectedStatus : stay.status;
                  return (
                    <ScheduleButton
                      key={stay.id}
                      $selected={selected}
                      onClick={() => setSelectedStayId(stay.id)}
                    >
                      <Text weight={selected ? "strong" : "regular"}>
                        {stay.name} ({formatDateRange(stay.stay_from, stay.stay_to)})
                      </Text>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Segment color={status.color}>{status.label}</Segment>
                        <Button
                          style={{ width: "80px", height: "40px", padding: 0 }}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteStay(stay.id);
                          }}
                        >
                          <Text weight="strong" style={{ color: "#f4f4f5" }}>
                            삭제
                          </Text>
                        </Button>
                      </div>
                    </ScheduleButton>
                  );
                });
              })()}
            </div>
          </FillContainer>

          <UIButton
            variant={{ size: "Large" }}
            style={{ margin: "24px" }}
            onClick={() => showToast("잔류 일정 추가 기능은 아직 연결되지 않았습니다.", "warning")}
          >
            잔류 일정 추가하기
          </UIButton>
        </FillContainer>
      </Section>
    </Wrapper>
  );
}

export default StayPage;
