import {getTodayWakeup} from "../../api/wakeup.ts";
import {useState} from "react";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";
import styled from "styled-components";
import {AxiosError} from "axios";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({theme}) => theme.Colors.Background.Primary};
  padding: 16px;
`;

const Card = styled.div`
  width: min(420px, 100%);
  border: 1px solid ${({theme}) => theme.Colors.Line.Outline};
  border-radius: 12px;
  background: ${({theme}) => theme.Colors.Background.Secondary};
  padding: 20px;

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.h1`
  margin: 0;
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Title.size};
  line-height: ${({theme}) => theme.Font.Title.lineHeight};
  font-weight: ${({theme}) => theme.Font.Title.weight.strong};
`;

const Desc = styled.p`
  margin: 0;
  color: ${({theme}) => theme.Colors.Content.Secondary};
  font-size: ${({theme}) => theme.Font.Paragraph_Small.size};
  line-height: ${({theme}) => theme.Font.Paragraph_Small.lineHeight};
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled.button`
  min-height: 48px;
  border-radius: ${({theme}) => theme.Radius[400]};
  border: 1px solid ${({theme}) => theme.Colors.Core.Brand.Primary};
  background: ${({theme}) => theme.Colors.Core.Brand.Primary};
  color: ${({theme}) => theme.Colors.Solid.White};

  font-size: ${({theme}) => theme.Font.Body.size};
  line-height: ${({theme}) => theme.Font.Body.lineHeight};
  font-weight: ${({theme}) => theme.Font.Body.weight.regular};

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

function OpenWakeup() {
  const { showToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const run = async (gender: "male" | "female") => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await getTodayWakeup(gender);
      window.open(`https://www.youtube.com/watch?v=${res.video_id}`, "_blank");
    } catch (error) {
      console.error(error);
      const e = error as AxiosError<{error?: {message?: string} | string}>;
      const message =
        typeof e.response?.data?.error === "string"
          ? e.response?.data?.error
          : e.response?.data?.error?.message || "기상송 정보를 불러오지 못했습니다.";

      showToast(message, "danger");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Wrapper>
      <Card>
        <Title>기상송 선택</Title>
        <Desc>원하는 생활관의 오늘 기상송을 선택해 열어보세요.</Desc>
        <ActionRow>
          <ActionButton disabled={isLoading} onClick={() => run("male")}>학봉관 기상송</ActionButton>
          <ActionButton disabled={isLoading} onClick={() => run("female")}>우정학사 기상송</ActionButton>
        </ActionRow>
      </Card>
      <link rel="manifest" href="/manifest_wakeup.json" />
      <link rel="apple-touch-icon" href="/dimigoin.png"/>
      <meta name="apple-mobile-web-app-capable" content="yes"/>
      <meta name="apple-mobile-web-app-title" content="디미고인 기상곡"/>
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
    </Wrapper>
  );
}

export default OpenWakeup;