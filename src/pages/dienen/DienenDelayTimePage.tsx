import styled from "styled-components";
import {useEffect, useMemo, useState} from "react";
import {delayMealTimeline, getMealTimeline, type MealTimelineData} from "../../api/dienen.ts";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";
import {UIButton} from "../../components/ui";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;

  @media (max-width: 900px) {
    padding: 12px;
  }
`;

const Panel = styled.section`
  background: ${({theme}) => theme.Colors.Background.Secondary};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Title.size};
`;

const Sub = styled.p`
  margin: 0;
  color: ${({theme}) => theme.Colors.Content.Secondary};
  font-size: ${({theme}) => theme.Font.Footnote.size};
`;

const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CounterBox = styled.div`
  width: 100%;
  max-width: 320px;
  height: 44px;
  border-radius: ${({theme}) => theme.Radius[400]};
  background: ${({theme}) => theme.Colors.Background.Tertiary};
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: stretch;
  overflow: hidden;

  @media (max-width: 900px) {
    max-width: none;
  }
`;

const CounterButton = styled.button`
  border: 0;
  background: ${({theme}) => theme.Colors.Background.Tertiary};
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Headline.size};
  font-weight: ${({theme}) => theme.Font.Headline.weight.strong};
`;

const CounterValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Callout.size};
  font-weight: ${({theme}) => theme.Font.Callout.weight.strong};
`;

const TimeList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TimeCard = styled.button<{ $selected: boolean }>`
  border: 0;
  background: ${({theme, $selected}) => $selected ? theme.Colors.Core.Brand.Tertiary : theme.Colors.Background.Tertiary};
  border-radius: 10px;
  padding: 10px 12px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TimeTitle = styled.strong`
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Callout.size};
`;

const TimeMeta = styled.span`
  color: ${({theme}) => theme.Colors.Content.Secondary};
  font-size: ${({theme}) => theme.Font.Footnote.size};
`;

const EmptyText = styled.p`
  margin: 0;
  color: ${({theme}) => theme.Colors.Content.Tertiary};
  font-size: ${({theme}) => theme.Font.Body.size};
`;

function getErrorMessage(e: unknown): string {
  const err = e as { response?: { data?: { error?: { message?: string } | string } } };
  if (typeof err?.response?.data?.error === "string") return err.response.data.error;
  return err?.response?.data?.error?.message || "급식 시간 미루기에 실패했습니다.";
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const normalized = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
  const nh = Math.floor(normalized / 60);
  const nm = normalized % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

type FlatTimeOption = {
  time: string;
  meta: string;
};

function flattenTimeline(data: MealTimelineData): FlatTimeOption[] {
  const map = new Map<string, string[]>();

  ([1, 2, 3] as const).forEach((grade) => {
    (data[grade] || []).forEach((item) => {
      const current = map.get(item.time) || [];
      current.push(`${grade}학년(${item.class.join(",")}반)`);
      map.set(item.time, current);
    });
  });

  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([time, gradeMeta]) => ({ time, meta: gradeMeta.join(" / ") }));
}

export default function DienenDelayTimePage() {
  const { showToast } = useNotification();
  const [timeline, setTimeline] = useState<MealTimelineData | null>(null);
  const [source, setSource] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const timeOptions = useMemo(() => flattenTimeline(timeline || {}), [timeline]);
  const dest = source ? addMinutes(source, delayMinutes) : "";

  const updateMinutes = (delta: number) => {
    setDelayMinutes((prev) => Math.min(120, Math.max(1, prev + delta)));
  };

  const loadTodayTimeline = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const data = await getMealTimeline(today);
      setTimeline(data);

      const flat = flattenTimeline(data);
      if (flat.length > 0) setSource(flat[0].time);
    } catch (e) {
      console.error(e);
      showToast(getErrorMessage(e), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodayTimeline();
  }, []);

  const submit = async () => {
    if (!source) {
      showToast("미룰 급식 시간을 선택해주세요.", "warning");
      return;
    }

    if (!delayMinutes || delayMinutes < 1) {
      showToast("미루기 분은 1분 이상이어야 합니다.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      await delayMealTimeline({
        source,
        dest,
        description: `급식 시간을 ${delayMinutes}분 미뤘습니다.`,
      });
      showToast("급식 시간이 미뤄졌습니다.", "info");
      await loadTodayTimeline();
    } catch (e) {
      console.error(e);
      showToast(getErrorMessage(e), "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <Panel>
        <Title>급식 시간 미루기</Title>
        <Sub>오늘 급식 시간표에서 시간을 선택하고, 몇 분 미룰지 지정합니다.</Sub>

        <FieldRow>
          <UIButton size="medium" variant="neutral" onClick={loadTodayTimeline} disabled={isLoading}>오늘 시간표 다시 불러오기</UIButton>
        </FieldRow>

        {timeOptions.length === 0 ? (
          <EmptyText>{isLoading ? "오늘 시간표를 불러오는 중..." : "오늘 등록된 급식 시간이 없습니다."}</EmptyText>
        ) : (
          <TimeList>
            {timeOptions.map((item) => (
              <TimeCard key={item.time} $selected={source === item.time} onClick={() => setSource(item.time)}>
                <TimeTitle>{item.time}</TimeTitle>
                <TimeMeta>{item.meta}</TimeMeta>
              </TimeCard>
            ))}
          </TimeList>
        )}

        <FieldRow>
          <CounterBox>
            <CounterButton type="button" onClick={() => updateMinutes(-1)}>&lt;</CounterButton>
            <CounterValue>{delayMinutes}분</CounterValue>
            <CounterButton type="button" onClick={() => updateMinutes(1)}>&gt;</CounterButton>
          </CounterBox>
        </FieldRow>

        <Sub>{source ? `${source} → ${dest} (${delayMinutes}분 미루기)` : "시간을 먼저 선택해주세요."}</Sub>

        <UIButton size="medium" onClick={submit} disabled={isLoading}>미루기 적용</UIButton>
      </Panel>
    </Wrapper>
  );
}
