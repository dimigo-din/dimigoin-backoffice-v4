import { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import {
  getStayList,
  type StayListItem,
} from "../../api/stay.ts";
import { Text, UIButton, UISegmentedControl } from "../../components/ui";
import { Button } from "../../styles/components/button.ts";

const Wrapper = styled.div`
  height: 100%;
  width: 100%;

  display: flex;

  gap: 24px;
  padding: 24px;
  overflow-y: auto;
`;

const Section = styled.div<{ $width: string; }>`
  height: 100%;
  width: ${({ $width }) => $width};
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 24px;

  overflow-y: auto;

  @media (max-width: 900px) {
    width: 100%;
    height: auto;
    min-height: 340px;
  }
`;

const fitContainerBackgroundColors = {
  Primary: css`
    background-color: ${({ theme }) => theme.Colors.Background.Standard.Primary};
  `,
  Secondary: css`
    background-color: ${({ theme }) => theme.Colors.Background.Standard.Secondary};
  `,
};

const FitContainer = styled.div<{ color: "Primary" | "Secondary"; padding?: string; }>`
  height: fit-content;
  width: 100%;

  border-radius: 12px;

  ${({ color }) => fitContainerBackgroundColors[color]}
  padding: ${({ theme, padding }) => padding ? padding : `${theme.Component.Spacing[300]} ${theme.Component.Spacing[550]}`};

  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FillContainer = styled.div<{ padding?: string; }>`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: scroll;

  padding: ${({ theme, padding }) => padding ? padding : `${theme.Component.Spacing[550]} ${theme.Component.Spacing[550]}`};
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
}

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
`;

const ScheduleButton = styled.div<{ $selected?: boolean }>`
  height: 56px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0 20px;
  border-radius: 12px;

  background-color: ${({ theme, $selected }) => $selected ? theme.Colors.Components.Interaction.Focussed : theme.Colors.Components.Translucent.Interactive};

  &:hover {
    cursor: ${({ $selected }) => $selected ? "auto" : "pointer"};
  }
`;


function ApplyStayPage() {
  const [stayList, setStayList] = useState<StayListItem[] | null>(null);
  const [seatSegmentValue, setSeatSegmentValue] = useState<"1" | "2">("1");

  const updateScreen = async () => {
    console.log(stayList);
    setStayList(await getStayList());
  }
  
  useEffect(() => {
    updateScreen();
  }, []);

  return (
    <Wrapper>
      <Section $width="60%">
        <FitContainer color="Secondary">
          <HStack>
            <Text>주말잔류 (2026-01-10 ~ 2026-01-11)</Text>
            <Segment color="Yellow">신청중</Segment>
          </HStack>
        </FitContainer>
        <FillContainer>
          <FitContainer color="Primary" padding="20px 28px">
            <Text variant="body" weight="strong" as="span">신청기간</Text>
            <StayApplyPeriodWrapper>
              <StayApplyPeriod>
                <Text>1학년</Text>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>2026.01.11. (목) 20:00</UIButton>
                  <Text>부터</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>2026.01.11. (목) 20:00</UIButton>
                  <Text>까지</Text>
                </div>
              </StayApplyPeriod>
              <StayApplyPeriod>
                <Text>2학년</Text>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>2026.01.11. (목) 20:00</UIButton>
                  <Text>부터</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>2026.01.11. (목) 20:00</UIButton>
                  <Text>까지</Text>
                </div>
              </StayApplyPeriod>
              <StayApplyPeriod>
                <Text>3학년</Text>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>2026.01.11. (목) 20:00</UIButton>
                  <Text>부터</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>2026.01.11. (목) 20:00</UIButton>
                  <Text>까지</Text>
                </div>
              </StayApplyPeriod>
            </StayApplyPeriodWrapper>
          </FitContainer>
          <FitContainer color="Primary" padding="20px 28px">
            <HStack>
              <Text variant="body" weight="strong" as="span">잔류기간</Text>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>2026.01.11. (목) 20:00</UIButton>
                  <Text>부터</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <UIButton variant={{ theme: "Grayscale", style: "Secondary" }}>2026.01.11. (목) 20:00</UIButton>
                  <Text>까지</Text>
                </div>
              </div>
            </HStack>
          </FitContainer>
          <FitContainer color="Primary" padding="20px 28px">
            <HStack>
              <Text variant="body" weight="strong" as="span">열람실 좌석</Text>
              <UISegmentedControl
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
              />
            </HStack>
          </FitContainer>
        </FillContainer>
      </Section>
      <Section $width="40%">
        <FillContainer padding="0">
          <FillContainer>
          <Text weight="strong">잔류 일정 목록</Text>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "16px" }}>
            <ScheduleButton $selected>
              <Text weight="strong">주말잔류 (2026-01-10 ~ 2026-01-11)</Text>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Segment color="Yellow">신청중</Segment>
                <Button style={{ width: "80px", height: "40px", padding: 0 }}>
                  <Text weight="strong" style={{color: "#f4f4f5"}}>삭제</Text>
                </Button>
              </div>
            </ScheduleButton>
            <ScheduleButton>
              <Text>주말잔류 (2026-01-10 ~ 2026-01-11)</Text>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Segment color="Red">신청전</Segment>
                <Button style={{ width: "80px", height: "40px", padding: 0 }}>
                  <Text weight="strong" style={{color: "#f4f4f5"}}>삭제</Text>
                </Button>
              </div>
            </ScheduleButton>
          </div>
          </FillContainer>
          <UIButton variant={{ size: "Large" }} style={{ margin: "24px" }}>
            잔류 일정 추가하기
          </UIButton>
        </FillContainer>
      </Section>
    </Wrapper>
  );
}

export default ApplyStayPage;
