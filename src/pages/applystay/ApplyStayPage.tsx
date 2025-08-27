import {
  createStayApply, deleteStayApply,
  getStayApply,
  getStayList,
  getStay,
  type Outing,
  type StayApply,
  type StayListItem,
  type Stay,
  updateStayApply
} from "../../api/stay.ts";
import {renderHtml, searchUser, type User} from "../../api/user.ts";
import {getPersonalInformation, type PersonalInformation} from "../../api/auth.ts";
import styled from "styled-components";
import {useEffect, useRef, useState} from "react";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";
import Loading from "../../components/Loading.tsx";
import {ExportStayAppliesToExcel} from "../../utils/stay2excel.ts";
import {sha256} from "../../utils/sha256.ts";
import {genTable} from "../../utils/staySeatUtil.ts";
import {Input} from "../../styles/components/input.ts";
import CheckBoxOn from "../../assets/icons/checkbox/check_box_checked.svg?react"
import {Button, LightButton} from "../../styles/components/button.ts";
import {makeid} from "../../utils/makeid.ts";
import moment from "moment-timezone";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'moment/dist/locale/ko';
import {stay2format} from "../../utils/stay2format.ts";
import { flushSync } from "react-dom";

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
  
  overflow-y: scroll;
`;

const ControllerContainer = styled.div`
  flex: 1;
  
  display: flex;
  flex-direction: column;

  gap: 2dvh;
  
  color: ${({theme}) => theme.Colors.Content.Primary};
`;

const StretchContainer = styled.div`
  flex: 1;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 1dvh;

  border-radius: 8px;

  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  padding: 2dvh 2dvh;
`;

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

const NoApply = styled.div`
  height: 100%;
  width: 100%;
  
  text-align: center;
  align-content: center;
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Title.size};
`;

const StayApplyCard = styled.div<{opened?: boolean, outingCount: number}>`
  height: auto;
  width: 100%;

  max-height: ${({
                   opened,
                   outingCount
                 }) => opened ? `calc(8dvh + 25dvh + ${outingCount * 17}dvh + 4dvh + 4dvh + 5dvh + 6dvh)` : "8dvh"};
    // max-height: ${({opened}) => opened ? "inherit" : "8dvh"};
  flex: 0 0 auto;

  background-color: ${({theme}) => theme.Colors.Background.Tertiary};
  color: ${({theme}) => theme.Colors.Content.Primary};

  border-radius: 6px;

  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 0 1dvw 2dvh;
  transition: max-height 0.3s ease;
  will-change: max-height;
  overflow: hidden;

  > button {
    display: block;
    flex: 0 0 auto;

    height: 3.5dvh;
    padding: 0;

    margin-top: 2dvh;
  }
`;

const StayApplyCardSummary = styled.div`
  height: 8dvh;
  width: 100%;

  flex: 0 0 auto;
  
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  
  > .left {
    align-content: center;

    font-size: ${({theme}) => theme.Font.Title.size};
  }

  > .right {
    flex: 1;

    text-align: right;
    align-content: center;
    color: ${({theme}) => theme.Colors.Content.Secondary};
  }
`;

const StayApplyDetail = styled.div`
  flex: 0 0 auto;
  
  height: fit-content;
  width: 100%;
`;


const SeatBox = styled.div`
  flex: 0 0 auto;

  height: 25dvh;
  width: 100%;
  
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  border-radius: 8px;
  
  overflow: scroll;
`;

const SeatRow = styled.div<{seat: string | null}>`
  width: fit-content;
  
  white-space: nowrap;
  
  > span {
    display: inline-block;
    
    width: 4.5dvw;
    
    padding: 12px 0;
    margin: 4px;
    
    background-color: ${({theme}) => theme.Colors.Background.Primary};
    border-radius: 8px;
    
    text-align: center;
  }
  
  > span.inactive {
    filter: blur(1.2px) brightness(90%);
  }
  
  > span.taken {
    color: white;
    background-color: ${({theme}) => theme.Colors.Solid.Black};
  }
  
  > span:active {
    background-color: ${({theme}) => theme.Colors.Components.Interaction.Pressed};
  }
  
  > span#${({seat}) => seat} {
    color: white;
    
    background-color: ${({theme}) => theme.Colors.Core.Brand.Primary};
  }
`;

const OutingBox = styled.div`
  flex: 0 0 auto;
  
  height: 15dvh;
  width: 100%;
  
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  border-radius: 8px;
  margin-top: 2dvh;
  
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  
  font-size: ${({theme}) => theme.Font.Body.size};
  
  input {
    height: 4dvh;
    padding: 0;

    //border: none;
    font-size: ${({theme}) => theme.Font.Callout.size};
    text-align: center;
    background-color: inherit;
  }

  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    filter: ${window.matchMedia("(prefers-color-scheme: dark)").matches ? "invert(1)" : "none"};
  }
`;

const InputRow = styled.div<{width?: string}>`
  width: ${({width}) => width || "100%"};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  > Input {
      padding: 0 8px;
  }
`;

const CheckBox = styled.div<{ canceled: boolean }>`
  height: 3vh;
  width: 32%;
  
  border-radius: 12px;
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Paragraph_Large.size};
  line-height: ${({theme}) => theme.Font.Paragraph_Large.lineHeight};
  font-weight: ${({theme, canceled}) => canceled ? theme.Font.Paragraph_Large.weight.regular : theme.Font.Paragraph_Large.weight.weak};
  transition: border-color 0.3s ease, font-weight 0.3s ease;
  
  display: flex;
  gap: 6%;
  align-items: center;
  justify-content: center;
  
  path {
    fill: ${({theme, canceled}) => canceled ? theme.Colors.Core.Brand.Primary : theme.Colors.Content.Quaternary};
    transition: fill 0.3s ease;
  }
`;

const StayCard = styled.div<{current: boolean}>`
  height: 20%;
  width: 100%;
  
  border-radius: 6px;
  background-color: ${({theme, current}) => current ? theme.Colors.Background.Tertiary : theme.Colors.Background.Primary};
  
  font-size: ${({theme}) => theme.Font.Headline.size};
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  text-align: center;
  align-content: center;
  
  transition: background-color 200ms ease;
`;

const ExportButton = styled.div`
  height: 5dvh;
  width: 100%;
  
  text-align: center;
  align-content: center;
  
  background-color: ${({theme}) => theme.Colors.Components.Fill.Primary};
  border-radius: 8px;

  font-size: ${({theme}) => theme.Font.Callout.size};
`;

const SelectionRow = styled.div<{ height?: string, width?: string }>`
  margin-left: ${({width}) => width ? "none" : "2%"};
  
  height: ${({height}) => height || "4dvh"};
  width: ${({width}) => width || "18%"};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  font-size: ${({theme}) => theme.Font.Callout.size};
  
  border: 1px solid ${({theme}) => theme.Colors.Line.Outline};
  border-radius: 12px;
  
  overflow: hidden;
`;

const SelectionItem = styled.div<{ boundState?: boolean | null, border?: boolean, selected: boolean }>`
  flex: 1;
  
  height: 100%;
  
  text-align: center;
  align-content: center;
  
  border-left: ${({theme, border}) => border ? `1px solid ${theme.Colors.Line.Outline}` : "none"};
  
  background-color: ${({theme, selected, boundState}) => 
    selected ? 
        boundState === true ? theme.Colors.Core.Status.Positive :
        boundState === false ? theme.Colors.Core.Status.Negative :
        boundState === null ? theme.Colors.Core.Status.Warning :
          theme.Colors.Core.Brand.Primary
      : "none"
  };
`;

const DeleteBtn = styled.div`
  height: 4dvh;
  width: 7%;
  
  text-align: center;
  align-content: center;

  font-size: ${({theme}) => theme.Font.Callout.size};
  background-color: ${({theme}) => theme.Colors.Solid.Translucent.Red};
  
  border: 1px solid ${({theme}) => theme.Colors.Solid.Red};
  border-radius: 12px;
  
  margin-left: 1%;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SuggestBox = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 30dvh;
  overflow-y: auto;
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  border: 1px solid ${({theme}) => theme.Colors.Line.Outline};
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.18);
  z-index: 20;
  min-width: 36rem;
  max-width: 80dvw;
`;

const SuggestItem = styled.div`
  padding: 10px 12px;
  font-size: ${({theme}) => theme.Font.Paragraph_Large.size};
  color: ${({theme}) => theme.Colors.Content.Primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 120ms ease;

  &:hover { background-color: ${({theme}) => theme.Colors.Components.Interaction.Hover}; }
  &:active { background-color: ${({theme}) => theme.Colors.Components.Interaction.Pressed}; }

  .meta { color: ${({theme}) => theme.Colors.Content.Tertiary}; font-size: ${({theme}) => theme.Font.Footnote.size}; }
`;

function ApplyStayPage() {
  moment.locale("ko");

  const { showToast } = useNotification();

  const seatRef = useRef<HTMLSpanElement | null>(null);
  const seatBoxRef = useRef<HTMLDivElement | null>(null);

  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>("");
  const [filterState, setFilterState] = useState<boolean | null | undefined>(undefined);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [nameSearch, setNameSearch] = useState<string>("");
  const [nameResults, setNameResults] = useState<(User & PersonalInformation)[]>([]);
  const [nameLoading, setNameLoading] = useState<boolean>(false);

  const [stayDate, setStayDate] = useState<string>("");

  const [stayList, setStayList] = useState<StayListItem[] | null>(null);
  const [currentStayIndex, setCurrentStayIndex] = useState<number>(0);
  const [currentStay, setCurrentStay] = useState<Stay | null>(null);
  const [stayApplies, setStayApplies] = useState<StayApply[] | null>(null);

  const [selectedApply, setSelectedApply] = useState<StayApply | null>(null);
  const [selectedApplyChecksum, setSelectedApplyChecksum] = useState<string | null>(null);

  const updateScreen = () => {
    getStayList().then((res1) => {
      setStayList(res1);
      if (res1.length > 0) {
        getStay(res1[currentStayIndex].id).then((res3) => {
          setCurrentStay(res3);
          setStayDate(moment(res3.stay_from, "YYYY-MM-DD").tz("Asia/Seoul").format("YYYY년 MM월 DD일 dddd"));
        }).catch((e) => {
          showToast(e.response.data.error.message || e.response.data.error, "danger");
        });

        getStayApply(res1[currentStayIndex].id).then((res2) => {
          setStayApplies(res2);
        }).catch((e) => {
          showToast(e.response.data.error.message || e.response.data.error, "danger");
        });
      }
    }).catch((e) => {
      console.log(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  const close = (callback?: () => void) => {
  setIsClosing(true);
    setTimeout(() => {
      flushSync(() => {
        setIsClosing(false);
        setSelectedApply(null);
        setSelectedApplyChecksum(null);
        setStayApplies((p) => p!.filter((a) => a.id !== "new"));
      });

      if (callback) {
        // 상태 변경이 완전히 반영될 때까지 충분히 기다린 후 콜백 실행
        setTimeout(() => callback(), 100);
      }
    }, 300);
  };

  const openEditor = (apply: StayApply) => {
    // 현재 선택된 에디터가 없으면 바로 열기
    if (selectedApply === null) {
      // 깊은 복사로 완전히 독립적인 객체 생성
      const applyCopy = JSON.parse(JSON.stringify(apply));
      
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const merged = applyCopy.stay_seat + applyCopy.outing.map(a => 
        Object.keys(a).map((k) => String(a[k])).join("")
      ).join("");
      
      sha256(merged).then((data) => {
        setSelectedApplyChecksum(data);
        setSelectedApply(applyCopy);
      });
      return;
    }

    // 같은 탭을 다시 클릭한 경우
    if (selectedApply.id === apply.id) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const merged = selectedApply.stay_seat + selectedApply.outing.map(a => Object.keys(a).map((k) => String(a[k])).join("")).join("");
      sha256(merged).then((data) => {
        if (data !== selectedApplyChecksum) {
          if (confirm("수정사항이 존재합니다. 정말로 닫으시겠습니까?")) {
            close();
          }
        } else {
          close();
        }
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const merged = selectedApply.stay_seat + selectedApply.outing.map(a => Object.keys(a).map((k) => String(a[k])).join("")).join("");
    sha256(merged).then((data) => {
      if (data !== selectedApplyChecksum) {
        if (confirm("다른 열림 탭에 수정사항이 존재합니다. 정말로 닫으시겠습니까?")) {
          // 무한 반복 방지를 위해 새로운 함수로 에디터 열기
          const openNewEditor = (targetApply: StayApply) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const newMerged = targetApply.stay_seat + targetApply.outing.map(a => Object.keys(a).map((k) => String(a[k])).join("")).join("");
            sha256(newMerged).then((newData) => {
              setSelectedApplyChecksum(newData);
              setSelectedApply(targetApply);
            });
          };
          close(() => openNewEditor(apply));
        }
      } else {
        close(() => openEditor(apply));
      }
    });
  };

  const edit = () => {
    if (selectedApply?.id === "new") {
      if (!currentStay) {
        showToast("현재 잔류 정보가 없습니다.", "danger");
        return;
      }
      showToast(currentStay.id, 'info');
      createStayApply({
        stay: currentStay.id,
        user: selectedApply.user.id,
        outing: selectedApply.outing,
        stay_seat: selectedApply.stay_seat,
      }).then(() => {
        showToast("성공했습니다.", "info");
        setNameLoading(false);
        setNameResults([]);
        setSelectedApply(null);
        setSelectedApplyChecksum(null);
        updateScreen();
      }).catch((e) => {
        console.log(e);
        showToast(e.response.data.error.message || e.response.data.error, "danger");
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    updateStayApply({...selectedApply, stay: currentStay.id!, user: selectedApply!.user.id}).then(() => {
      showToast("성공했습니다.", "info");
      close();
      updateScreen();
    }).catch((e) => {
      console.log(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  const deleteApply = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    if (id === 'new') {
      close();
      updateScreen();
      return;
    }

    deleteStayApply(id).then(() => {
      showToast("성공했습니다.", "info");
      close();
      updateScreen();
    }).catch((e) => {
      console.log(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  useEffect(() => {
    updateScreen();
  }, [currentStayIndex]);

  useEffect(() => {
    setIsSuggestOpen(!!nameSearch);
  }, [nameSearch]);

  useEffect(() => {
    if (!nameSearch) { setNameResults([]); return; }
    let alive = true;
    const t = setTimeout(async () => {
      try {
        setNameLoading(true);
        const res = await searchUser(nameSearch);
        if (!alive) return;
        if (res) {
          getPersonalInformation(res.map((r) => r.email)).then((u) => {
            setNameResults(res.map((r, i) => { return u[i] ? { ...r, ...u[i] } : null; }) as (User & PersonalInformation)[]);
          });
        }else {
          setNameResults([]);
        }
      } catch (e) {
        console.log(e);
        setNameResults([]);
      } finally {
        setNameLoading(false);
      }
    }, 180);
    return () => { alive = false; clearTimeout(t); };
  }, [nameSearch]);

  useEffect(() => {
    if (seatBoxRef.current && seatRef.current) {
      const box = seatBoxRef.current;
      const seat = seatRef.current;

      box.scrollTo({
        top: seat.offsetTop - box.clientHeight / 2 + seat.clientHeight / 2 - box.offsetTop,
        left: seat.offsetLeft - box.clientWidth / 2 + seat.clientWidth / 2 - box.offsetLeft,
        behavior: "smooth"
      });
    }
  }, [selectedApply]);


  return (
    <Wrapper>
      <StayApplyContainer>
        {stayApplies ? stayApplies.length > 0 ? stayApplies.filter((a) => `${a.user.grade}${a.user.class}${("0"+a.user.number).slice(-2)} ${a.user.name}`.indexOf(filterText) !== -1 && (filterState === undefined || a.outing.some((o) => o.approved === filterState))).map((apply) => {
          return (
            <StayApplyCard
              opened={!isClosing && !!selectedApply && apply.id === selectedApply.id}
              outingCount={(selectedApply ? selectedApply.outing.length : null) || apply.outing.length}>
              <StayApplyCardSummary>
                <div className="left" onClick={(e) => {
                  if (e.currentTarget === e.target) {
                    openEditor(apply);
                  }
                }}>
                  {apply.id === "new" ? (
                    <InputWrapper>
                      <Input
                        type={"search"}
                        onFocus={() => setIsSuggestOpen(!!nameSearch)}
                        onBlur={() => setTimeout(() => setIsSuggestOpen(false), 120)}
                        onInput={(e) => setNameSearch((e.target as HTMLInputElement).value)}
                        placeholder={"이름으로 검색하세요."}
                        value={nameSearch}
                      />
                      {isSuggestOpen && (
                        <SuggestBox>
                          {nameLoading && (
                            <SuggestItem key="loading" onMouseDown={(e) => e.preventDefault()}>
                              <span>검색 중…</span>
                              <span className="meta">잠시만요</span>
                            </SuggestItem>
                          )}
                          {!nameLoading && nameResults.filter((u) => u).slice(0, 12).map((u) => {
                            const already = stayApplies?.find((sa) => sa.user && sa.user.id === u.id);
                            return (
                              <SuggestItem
                                key={u.id}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  if (already) {
                                    setSelectedApply(already);
                                    setIsSuggestOpen(false);
                                    setNameSearch("");
                                    openEditor(already);
                                    return;
                                  }
                                  const newApply = {
                                    id: "new",
                                    stay_seat: null,
                                    outing: [],
                                    user: u,
                                  } as unknown as StayApply;
                                  console.log(newApply);
                                  setStayApplies((p) => {
                                    const filtered = p ? p.filter((x) => x.id !== "new") : [];
                                    return [newApply, ...filtered];
                                  });
                                  setSelectedApply(newApply);
                                  setIsSuggestOpen(false);
                                  setNameSearch(`${u.grade}${u.class}${("0"+u.number).slice(-2)} ${u.name}`);
                                }}
                              >
                                <span>{u.grade}{u.class}{("0"+u.number).slice(-2)} {u.name}</span>
                              </SuggestItem>
                            );
                          })}
                          {!nameLoading && nameResults.length === 0 && nameSearch && (
                            <SuggestItem key="empty" onMouseDown={(e) => e.preventDefault()}>
                              <span>검색 결과가 없습니다</span>
                              <span className="meta">다른 키워드를 입력해 보세요</span>
                            </SuggestItem>
                          )}
                        </SuggestBox>
                      )}
                    </InputWrapper>
                  ) : (
                    <>{apply.user.grade}{apply.user.class}{("0"+apply.user.number).slice(-2)} {apply.user.name}</>
                  )}
                </div>
                <div className="right" onClick={(e) => {
                  if (e.currentTarget === e.target) {
                    openEditor(apply);
                  }
                }}>
                  외출 {apply.outing.length}건
                </div>
              </StayApplyCardSummary>
              {selectedApply && selectedApply.id === apply.id ? (
                <>
                  <StayApplyDetail>
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
                            <SeatRow seat={selectedApply.stay_seat} key={rowIdx}>
                            {row.map((seat, seatIdx) => {
                              const taken = stayApplies.find(
                              (sapply) =>
                                sapply.stay_seat === seat &&
                                sapply.stay_seat !== selectedApply.stay_seat
                              );
                              return (
                              <span
                                id={seat}
                                ref={selectedApply.stay_seat === seat ? seatRef : null}
                                className={["active", taken ? "taken" : "notTaken"].join(" ")}
                                onClick={() =>
                                setSelectedApply((p) => ({ ...p!, stay_seat: seat }))
                                }
                                key={seat}
                                style={{
                                marginRight: (seatIdx + 1) % 9 === 0 && seatIdx !== row.length - 1 ? "20px" : undefined
                                }}
                              >
                                {taken ? taken.user.name.replace(/[0-9]/g, "") : seat}
                              </span>
                              );
                            })}
                            </SeatRow>
                          ))}
                          </div>
                        ));
                        })()}
                    </SeatBox>
                  </StayApplyDetail>
                  {selectedApply.outing.map((outing) => {
                    const modify = (deleteTarget?: Outing) => {
                      setSelectedApply((p) => {
                        if (deleteTarget)
                          return { ...p!, outing: p!.outing.filter((p2) => p2.id !== deleteTarget.id) };
                        else
                          return { ...p!, outing: p!.outing.map((o) => {
                              return o.id === outing.id ? {
                                ...outing
                              } : o;
                            }) };
                      });
                    }

                    return (
                      <OutingBox>
                        <InputRow>
                          <Input type={"text"}
                                 style={{width: "62%"}}
                                 onInput={(e) => {outing.reason = (e.target as HTMLInputElement).value; modify()}}
                                 value={outing.reason}
                                 placeholder={"외출 사유를 입력하세요.."}/>
                          <SelectionRow>
                            <SelectionItem selected={outing.approved === true}
                                           boundState={true}
                                            onClick={() => {outing.approved = true; modify();}}>
                              허가
                            </SelectionItem>
                            <SelectionItem selected={outing.approved === null}
                                           boundState={null}
                                           border={true}
                                           onClick={() => {outing.approved = null; modify();}}>
                              검토
                            </SelectionItem>
                            <SelectionItem selected={outing.approved === false}
                                           boundState={false}
                                           border={true}
                                           onClick={() => {outing.approved = false; modify();}}>
                              불허
                            </SelectionItem>
                          </SelectionRow>
                          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                          {/* @ts-ignore */}
                          <DeleteBtn onClick={() => {modify(outing)}}>
                            삭제
                          </DeleteBtn>
                        </InputRow>
                        <InputRow>
                          <Input type={"datetime-local"}
                                 onInput={(e) => {outing.from = (e.target as HTMLInputElement).value; modify()}}
                                 onFocus={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                 value={outing.from.split(/[+Z]/)[0]}
                                 step={600}
                                 min="2025-01-01T00:00"/>
                          <p>부터&nbsp;&nbsp;</p>
                          <Input type={"datetime-local"}
                                 onInput={(e) => {outing.to = (e.target as HTMLInputElement).value; modify();}}
                                 onFocus={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                 value={outing.to.split(/[+Z]/)[0]}
                                 step={600}
                                 min="2025-01-01T00:00"/>
                          <p>까지</p>
                        </InputRow>
                        <InputRow>
                          <CheckBox canceled={outing.breakfast_cancel}
                                    onClick={() => {outing.breakfast_cancel = !outing.breakfast_cancel; modify()}}>
                            <CheckBoxOn />
                            <p>아침 취소</p>
                          </CheckBox>
                          &nbsp;&nbsp;
                          <CheckBox canceled={outing.lunch_cancel}
                                    onClick={() => {outing.lunch_cancel = !outing.lunch_cancel; modify()}}>
                            <CheckBoxOn />
                            <p>점심 취소</p>
                          </CheckBox>
                          &nbsp;&nbsp;
                          <CheckBox canceled={outing.dinner_cancel}
                                    onClick={() => {outing.dinner_cancel = !outing.dinner_cancel; modify()}}>
                            <CheckBoxOn />
                            <p>저녁 취소</p>
                          </CheckBox>
                        </InputRow>
                      </OutingBox>
                    )
                  })}
                </>
              ) : null}
              <LightButton type={"yellow"} onClick={() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                setSelectedApply((p) => {
                  return { ...p!, outing: [...p!.outing, {id: makeid(10), reason: "", breakfast_cancel: false, lunch_cancel: false, dinner_cancel: false, from: "", to: "", approved: true}] }
                });
              }}>외출추가</LightButton>
              <LightButton type={"danger"} onClick={() => deleteApply(selectedApply!.id)}>삭제하기</LightButton>
              <Button onClick={() => edit()}>{selectedApply?.id == "new" ? "생성하기" : "수정하기"}</Button>
            </StayApplyCard>
          );
        }) : <NoApply>신청자가 없습니다.</NoApply> : Loading()}
      </StayApplyContainer>
      <ControllerContainer>
        <StretchContainer>
          <p style={{marginBottom: "8px"}}>잔류 대상</p>
          {stayList !== null ? stayList.map((apply) => {
            return (
              <StayCard current={apply.id === currentStay?.id} onClick={() => {close(); setCurrentStayIndex(stayList.indexOf(apply));}}>
                <span>{`${apply.name}`}</span> <span style={{color: "#888"}}>{`(${apply.stay_from} ~ ${apply.stay_to})`}</span>
              </StayCard>
            );
          }) : Loading()}
        </StretchContainer>
        <FitContainer>
          <Button disabled={stayApplies === null || selectedApply?.id === "new"} onClick={() => {
            const newApply = { id: "new", stay_seat: "null", outing: [], user: { email: null, id: null, name: null, permission: null } } as unknown as StayApply;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setStayApplies((p) => [newApply, ...(p || [])]);
            setSelectedApply(newApply);
          }}>잔류자 추가하기</Button>
        </FitContainer>
        <FitContainer>
          <Input type={"search"}
                 onInput={(e) => {setFilterText((e.target as HTMLInputElement).value)}}
                 placeholder={"검색할 문자열을 입력하세요."}
                 value={filterText}/>
          <SelectionRow height={"4dvh"} width={"100%"}>
            <SelectionItem boundState={true}
                           selected={filterState === true}
                           onClick={() => setFilterState(true)}>
              {`허가 (${stayApplies?.reduce((count, apply) => count + apply.outing.filter(outing => outing.approved === true).length, 0) || 0}건)`}
            </SelectionItem>
            <SelectionItem boundState={null}
                           selected={filterState === null}
                           onClick={() => setFilterState(null)}>
              {`검토 (${stayApplies?.reduce((count, apply) => count + apply.outing.filter(outing => outing.approved === null).length, 0) || 0}건)`}
            </SelectionItem>
            <SelectionItem boundState={false}
                           selected={filterState === false}
                           onClick={() => setFilterState(false)}>
              {`불허 (${stayApplies?.reduce((count, apply) => count + apply.outing.filter(outing => outing.approved === false).length, 0) || 0}건)`}
            </SelectionItem>
            <SelectionItem boundState={undefined}
                           selected={filterState === undefined}
                           onClick={() => setFilterState(undefined)}>
              {`모두 (${stayApplies?.reduce((count, apply) => count + apply.outing.length, 0) || 0}건)`}
            </SelectionItem>
          </SelectionRow>
        </FitContainer>
        <FitContainer>
          <ExportButton onClick={() => (stayApplies && currentStay) ? ExportStayAppliesToExcel(currentStay, stayApplies) : undefined}>
            학생 공지용 명단 내보내기
          </ExportButton>
          <ExportButton onClick={() => stayApplies ? renderHtml(stay2format(stayApplies, { date: stayDate, masking: true }), `${stayDate} 잔류 현황 (급식실).pdf`) : () => {}}>
            급식실용 잔류자 명단 내보내기
          </ExportButton>
          <ExportButton onClick={() => stayApplies ? renderHtml(stay2format(stayApplies, { date: stayDate, masking: false }), `${stayDate} 잔류 현황.pdf`) : () => {}}>
            생활관용 잔류자 명단 내보내기
          </ExportButton>
        </FitContainer>
      </ControllerContainer>
    </Wrapper>
  );
}

export default ApplyStayPage;