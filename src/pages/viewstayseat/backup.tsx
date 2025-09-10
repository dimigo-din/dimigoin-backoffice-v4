import {
  getStayApply,
  getStayList,
  getStay,
  renderHtml,
  type StayApply,
  type StayListItem,
  type Stay,
} from "../../api/stay.ts";
import styled from "styled-components";
import {useEffect, useRef, useState} from "react";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";
import Loading from "../../components/Loading.tsx";
import {genTable} from "../../utils/staySeatUtil.ts";
import {Select} from "../../styles/components/select.ts";
import {Button} from "../../styles/components/button.ts";
import moment from "moment-timezone";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'moment/dist/locale/ko';

const Wrapper = styled.div`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: row;

  gap: 2dvh;

  padding: 2dvh 2dvh;
`;

const StayApplyContainer = styled.div`
  height: 100%;
  width: 65%;

  display: flex;
  flex-direction: column;

  gap: 1dvh;
  padding: 1dvh 1dvh;

  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  border-radius: 8px;
`;

const ControllerContainer = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;

  overflow-y: scroll;

  gap: 2dvh;

  color: ${({theme}) => theme.Colors.Content.Primary};
`;

// const StretchContainer = styled.div`
//   flex: 1;
//   width: 100%;

//   display: flex;
//   flex-direction: column;
//   gap: 1dvh;

//   border-radius: 8px;

//   background-color: ${({theme}) => theme.Colors.Background.Secondary};
//   padding: 2dvh 2dvh;
// `;

const FitContainer = styled.div`
  height: fit-content;
  width: 100%;

  border-radius: 8px;

  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  padding: 2dvh 2dvh;

  display: flex;
  flex-direction: column;
  gap: 1dvh;
`;

const SeatBox = styled.div`
  flex: 0 0 auto;

  height: 100%;
  width: 100%;

  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  border-radius: 8px;

  overflow: scroll;
`;

const SeatRow = styled.div`
  white-space: nowrap;

  > div {
    display: inline-flex;
    justify-content: center;
    align-items: center;

    white-space: pre-line;

    width: 4.5dvw;
    height: 3.5 dvw;

    padding: 4px;

    margin: 4px;

    background-color: ${({theme}) => theme.Colors.Background.Tertiary};
    border-radius: 8px;

    text-align: center;

    color: ${({theme}) => theme.Colors.Content.Secondary};
  }

  > div.taken {
    color: ${({theme}) => theme.Colors.Content.Primary};
    background-color: ${({theme}) => theme.Colors.Background.Primary};
  }
`;

const Text = styled.p`
  color: ${({theme}) => theme.Colors.Content.Primary};
  margin-bottom: 2px;
`;
 
function ViewStaySeatPage() {
  moment.locale("ko");

  const { showToast } = useNotification();

  const seatBoxRef = useRef<HTMLDivElement | null>(null);

  const [stayList, setStayList] = useState<StayListItem[] | null>(null);
  const [currentStayIndex, setCurrentStayIndex] = useState<number>(0);
  const [currentStay, setCurrentStay] = useState<Stay | null>(null);
  const [stayApplies, setStayApplies] = useState<StayApply[] | null>(null);

  const updateScreen = async () => {
    getStayList().then((res1) => {
      setStayList(res1.sort((a, b) => new Date(b.stay_from).getTime() - new Date(a.stay_from).getTime()));
      if (res1.length > 0) {
        getStay(res1[currentStayIndex].id).then((res3) => {
          setCurrentStay(res3);
        }).catch((e) => {
          showToast(e.response.data.error.message || e.response.data.error, "danger");
        });

        getStayApply(res1[currentStayIndex].id).then((res2) => {
          setStayApplies(res2.sort((a, b) => {
            return a.user.grade - b.user.grade ||
                   a.user.class - b.user.class ||
                   a.user.number - b.user.number;
          }));
        }).catch((e) => {
          showToast(e.response.data.error.message || e.response.data.error, "danger");
        });
      }
    }).catch((e) => {
      console.error(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

    const downloadImage = async () => {

        function collectStyledComponentsCSS() {
            const styleEls = Array.from(
                document.querySelectorAll<HTMLStyleElement>(
                'style[data-styled], style[data-styled-version]'
                )
            );
            // textContent만 모아 인라인 CSS로 반환
            const cssText = styleEls.map((el) => el.textContent ?? "").join("\n");
            return cssText.trim();
        }

        // 2) (선택) 웹폰트도 함께 로드하고 싶다면 링크 태그 그대로 끼워넣기
        function collectFontAndExtraLinks() {
            // 필요한 경우에만 사용 (없으면 빈 문자열 반환)
            const links = Array.from(
                document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
            )
                .map((el) => el.outerHTML)
                .join("\n");
            return links; // CORS로 인해 외부 CSS 내용까지 읽어오진 못하므로 링크 그대로 둠
        }

        // 3) 서버로 보낼 HTML 조립
        function buildExportHTML(targetEl: HTMLElement) {
            const scCSS = collectStyledComponentsCSS(); // ★ styled-components CSS
            const extraLinks = collectFontAndExtraLinks(); // (선택) 외부 폰트/스타일
            const styleBlock = scCSS ? `<style id="sc-inline">${scCSS}</style>` : "";

            // 서버가 그대로 주입해도 스타일이 먼저 적용되도록 <style>을 맨 앞에 둔다.
            // 캡처 대상엔 id를 달아두면 서버에서 그 요소만 스크린샷 떠도 됨(추후 확장).
            return `
                ${extraLinks}
                ${styleBlock}
                <div id="capture-target">
                ${targetEl.outerHTML}
                </div>
            `.trim();
        }

        if (!seatBoxRef.current) {
            showToast("좌석 배치도를 불러오는 중입니다...", "warning");
            return;
        }

        try {
            const html = buildExportHTML(seatBoxRef.current);
            // 서버는 동일 DTO(단일 html 문자열)만 받는다고 가정
            await renderHtml(html, "잔류좌석.png");
            showToast("이미지 내보내기 시작", "info");
        } catch (e: any) {
            console.error(e);
            showToast("내보내기 실패", "danger");
        }
    };

  useEffect(() => {
    updateScreen();

    console.log(currentStay);
    console.log(stayApplies);

  }, [currentStayIndex]);

  return (
    <Wrapper>
        <StayApplyContainer>
            {currentStay && (
                <SeatBox ref={seatBoxRef}>
                    {(() => {
                        const table = genTable();
                        const groupedRows: string[][][] = [];
                        for (let i = 0; i < table.length; i += 2) {
                            groupedRows.push(table.slice(i, i + 2));
                        }
                        return groupedRows.map((group, idx) => (
                            <div key={idx} style={{ marginBottom: "16px" }}>
                                {group.map((row, rowIdx) => (
                                    <SeatRow key={rowIdx}>
                                    {row.map((seat, seatIdx) => {
                                        const taken = stayApplies?.find(
                                        (sapply) =>
                                            sapply.stay_seat === seat
                                        );
                                        return (
                                        <div
                                            id={seat}
                                            className={[taken ? "taken" : "notTaken"].join(" ")}
                                            key={seat}
                                            style={{
                                            marginRight: (seatIdx + 1) % 9 === 0 && seatIdx !== row.length - 1 ? "20px" : undefined
                                            }}
                                        >
                                        {seat}
                                        <br/>
                                        {taken ? `${taken.user.grade}${taken.user.class}${("0"+taken.user.number).slice(-2)}`: ""}
                                        <br/>
                                        {taken ? `${taken.user.name.replace(/[0-9]/g, "")}` : ""}
                                        <br/>
                                        </div>
                                        );
                                    })}
                                    </SeatRow>
                                ))}
                            </div>
                        ));
                    })()}
                </SeatBox>
            )}
        </StayApplyContainer>
        <ControllerContainer>
            <FitContainer>
                <Text>잔류 일정</Text>
                <Select style={{height: "5dvh"}} value={currentStayIndex} onChange={(e) => {close(); setCurrentStayIndex(parseInt(e.target.value))}}>
                    {stayList !== null ? stayList.map((apply) => {
                    return (
                        <option key={apply.id} value={stayList.indexOf(apply)}>
                        <span>{`${apply.name}`}</span> <span style={{color: "#888"}}>{`(${apply.stay_from} ~ ${apply.stay_to})`}</span>
                        </option>
                    );
                    }) : Loading()}
                </Select>
            </FitContainer>
            <FitContainer>
                <Text>파일 내보내기</Text>
                <Button type={"primary"} style={{height: "5dvh", padding: "0"}} onClick={downloadImage}>내보내기</Button>
            </FitContainer>
        </ControllerContainer>
    </Wrapper>
  );
}

export default ViewStaySeatPage;