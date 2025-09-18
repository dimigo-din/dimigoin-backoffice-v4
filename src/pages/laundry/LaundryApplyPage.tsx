import styled from "styled-components";
import {useEffect, useState} from "react";
import {
  getLaundryMachineList,
  getLaundryTimeline,
  getLaundryTimelineList, 
  getLaundryApplyList, 
  createLaundryApply,
  deleteLaundryApply,
  type LaundryMachine,
  type LaundryTimeline,
  type CreateLaundryApplyPayload,
  type LaundryApply
} from "../../api/laundry.ts";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";
import Loading from "../../components/Loading.tsx";
import { Button } from "../../styles/components/button.ts";
import SearchStudent from "../../components/SearchStudent.tsx";
import {type User} from "../../api/user.ts";
import {type PersonalInformation} from "../../api/auth.ts";
import { Select } from "../../styles/components/select.ts";

const Wrapper = styled.div`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  padding: 2dvh;

  gap: 2dvh;
`;

const ControllerBox = styled.div`
  flex: 1;
  height: 100%;
  
  display: flex;
  flex-direction: column;
  
  gap: 2dvh;
`;

const BodyBox = styled.div`
  height: 100%;
  width: 65%;
  
  display: flex;
  flex-direction: row;
  align-items: center;
  
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  > hr {
    width: 0.7px;
    height: 85%; 
    border: 1px solid ${({theme}) => theme.Colors.Background.Quaternary};
  }
`;

const LaundryListContainer = styled.div`
  flex: 1;
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 1dvh;

  padding: 1dvh 1dvh;
  overflow-y: scroll;
`;

const FitController = styled.div`
  height: fit-content;
  width: 100%;
  
  display: flex;
  flex-direction: column;

  border-radius: 12px;
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  padding: 2dvh 2dvh;
  gap: 1dvh;
`;

const StretchController = styled.div`
  flex: 1;
  width: 100%;
  
  display: flex;
  flex-direction: column;

  border-radius: 12px;
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  padding: 2dvh 2dvh;
  gap: 1dvh;
`;

const Text = styled.p`
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Callout.size};
  font-weight: 600;
`;

const LaundryApply = styled.div<{ selected?: boolean }>`
  flex: 0 0 auto;
  
  height: 5dvh;
  width: 100%;
  
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  color: ${({theme}) => theme.Colors.Content.Primary};

  font-size: ${({theme}) => theme.Font.Headline.size};
  
  background-color: ${({theme}) => theme.Colors.Background.Tertiary};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  padding: 1dvh 1dvw;

  ${({ selected, theme }) => selected &&
  `background-color: ${theme.Colors.Core.Brand.Primary};`}
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

const SelectionItem = styled.div<{ border?: boolean, selected: boolean }>`
  flex: 1;
  
  height: 100%;
  
  text-align: center;
  align-content: center;
  
  color: ${({theme, selected}) => selected ? theme.Colors.Solid.White : theme.Colors.Content.Primary};
  
  border-left: ${({theme, border}) => border ? `1px solid ${theme.Colors.Line.Outline}` : "none"};
  
  background-color: ${({theme, selected}) => selected ? theme.Colors.Core.Brand.Primary : "none"};
`;


function LaundryApplyPage() {
  const { showToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const [machines, setMachines] = useState<LaundryMachine[]>([]);
  const [applies, setApplies] = useState<LaundryApply[]>([]);
  const [currentTimeline, setCurrentTimeline] = useState<LaundryTimeline | null>(null);

  const [filterGrade, setFilterGrade] = useState<1 | 2 | 3 | null>(null);
  const [filterGender, setFilterGender] = useState<"male" | "female" | null>(null);

  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);

  const [nameResults, setNameResults] = useState<(User & PersonalInformation)[]>([]);
  const [nameLoading, setNameLoading] = useState<boolean>(false);
  const [nameSearch, setNameSearch] = useState<string>("");
  const [newUser, setNewUser] = useState<User | null>(null);
  const [applyMachineId, setApplyMachineId] = useState<string | null>(null);
  const [applyTimeId, setApplyTimeId] = useState<string | null>(null);

  const [cancleMachineId, setCancleMachineId] = useState<string | null>(null);
  const [cancleTimeId, setCancleTimeId] = useState<string | null>(null);

  const updateScreen = () => {
    setIsLoading(true);

    getLaundryMachineList().then((res) => {
      setMachines(res.sort((a, b) => {
        if (a.gender !== b.gender) {
          return a.gender === "male" ? -1 : 1;
        }
        
        if (a.type !== b.type) {
          return a.type === "washer" ? -1 : 1;
        }
        
        const aGrade = currentTimeline?.times.find(t => t.assigns.find(assign => assign.id === a.id))?.grade || 0;
        const bGrade = currentTimeline?.times.find(t => t.assigns.find(assign => assign.id === b.id))?.grade || 0;
        if (aGrade !== bGrade) {
          return parseInt(aGrade.toString()) - parseInt(bGrade.toString());
        }
        
        return a.name.localeCompare(b.name);
      }));

      if(res.length > 0) setSelectedMachine(0);
    }).catch((err) => {
      console.error(err);
      showToast("세탁기 목록을 불러오는데 실패했습니다.", "warning");
    });

    getLaundryTimelineList().then((res) => {
      const currentTimelineId = res.find(timeline => timeline.enabled);
      if (currentTimelineId) {
        getLaundryTimeline(currentTimelineId.id).then((timeline) => {
          setCurrentTimeline(timeline);
        }).catch((err) => {
          console.error(err);
          showToast("세탁 타임라인을 불러오는데 실패했습니다.", "warning");
        });
      }
    }).catch((err) => {
      console.error(err);
      showToast("세탁 타임라인을 불러오는데 실패했습니다.", "warning");
    });

    getLaundryApplyList().then((res) => {
      setApplies(res);


      console.log(res);
    }).catch((err) => {
      console.error(err);
      showToast("세탁 신청 목록을 불러오는데 실패했습니다.", "warning");
    }).finally(() => {
      setIsLoading(false);

      console.log(applies);
    });
  };

  useEffect(() => {
    updateScreen();
  }, []);

  const applyLaundry = () => {
    if(newUser === null || applyMachineId === null || applyTimeId === null) {
      showToast("학생, 세탁기, 시간을 모두 선택해주세요.", "warning");
      return;
    }

    const dto: CreateLaundryApplyPayload = {
      user: newUser.id,
      machine: applyMachineId,
      laundryTime: applyTimeId
    };

    createLaundryApply(dto).then(() => {
      showToast("세탁 신청이 완료되었습니다.", "info");
      setNewUser(null);
      setNameSearch("");
      setApplyMachineId(null);
      setApplyTimeId(null);
      updateScreen();
    }).catch((e: any) => {
      showToast(e.response.data.error.message || e.response.data.error || "세탁 신청에 실패했습니다.", "danger");
    });
  }

  const deleteLaundry = () => {
    if(cancleMachineId === null || cancleTimeId === null) {
      showToast("세탁기, 시간을 모두 선택해주세요.", "warning");
      return;
    }

    const apply = applies.find(a => a.laundryMachine.id === cancleMachineId && a.laundryTime.id === cancleTimeId);
    if(!apply) {
      showToast("해당 세탁 신청을 찾을 수 없습니다.", "warning");
      return;
    }

    deleteLaundryApply(apply.id).then(() => {
      showToast("세탁 신청이 취소되었습니다.", "info");
      updateScreen();
    }).catch((e: any) => {
      showToast(e.response.data.error.message || e.response.data.error || "세탁 신청 취소에 실패했습니다.", "danger");
    });
  }

  return (
      <Wrapper>
          <BodyBox>
            <LaundryListContainer>
              {isLoading ? <Loading/> : (
                machines.filter(m => {
                const timelineGrade = currentTimeline?.times.find(t => t.assigns.find(a => a.id === m.id))?.grade;
                const gradeFilter = filterGrade === null || timelineGrade?.includes(filterGrade);
                const genderFilter = filterGender === null || m.gender === filterGender;
                return gradeFilter && genderFilter;
                }).map((m) => {
                const timelineGrade = currentTimeline?.times.find(t => t.assigns.find(a => a.id === m.id))?.grade;

                return (
                  <LaundryApply key={m.id} selected={selectedMachine === machines.indexOf(m)} onClick={() => setSelectedMachine(machines.indexOf(m))}>
                  <span>{`[${m.type === "washer" ? "세탁기" : "건조기"}] ${m.name}`}</span>
                  <span>{`(${timelineGrade}학년 ${m.gender === "male" ? "남자" : "여자"})`}</span>
                  </LaundryApply>
                );
                })
              )}
            </LaundryListContainer>
            <hr/>
            <LaundryListContainer>
              {isLoading ? <Loading/> : (
                selectedMachine !== null && machines[selectedMachine] && (
                  currentTimeline?.times.filter(t => t.assigns.find(a => a.id === machines[selectedMachine].id)).sort((a, b) => a.time.localeCompare(b.time)).map((time) => (
                    <LaundryApply key={time.id}>
                      <span>{time.time}</span>
                      {(() => {
                        const user = applies.find(a => a.laundryMachine.id === machines[selectedMachine].id && a.laundryTime.id === time.id)?.user;
                        return user && <span>{`${user.grade}${user.class}${("0"+user.number).slice(-2)} ${user.name}`}</span>
                      })()}
                    </LaundryApply>
                  ))
              ))}
            </LaundryListContainer>
          </BodyBox>
          <ControllerBox>
            <FitController>
              <Text>분류</Text>
              <SelectionRow width={"100%"}>
                <SelectionItem selected={filterGrade === 1}
                              onClick={() => {setFilterGrade(1); setSelectedMachine(null)}}>
                  1학년
                </SelectionItem>
                <SelectionItem selected={filterGrade === 2}
                              border={true}
                              onClick={() => {setFilterGrade(2); setSelectedMachine(null)}}>
                  2학년
                </SelectionItem>
                <SelectionItem selected={filterGrade === 3}
                              border={true}
                              onClick={() => {setFilterGrade(3); setSelectedMachine(null)}}>
                  3학년
                </SelectionItem>
                <SelectionItem selected={filterGrade === null}
                              border={true}
                              onClick={() => {setFilterGrade(null); setSelectedMachine(null)}}>
                  모두
                </SelectionItem>
              </SelectionRow>
              <SelectionRow width={"100%"}>
                <SelectionItem selected={filterGender === "male"}
                              onClick={() => {setFilterGender("male"); setSelectedMachine(null)}}>
                  남자
                </SelectionItem>
                <SelectionItem selected={filterGender === "female"}
                              border={true}
                              onClick={() => {setFilterGender("female"); setSelectedMachine(null)}}>
                  여자
                </SelectionItem>
                <SelectionItem selected={filterGender === null}
                              border={true}
                              onClick={() => {setFilterGender(null); setSelectedMachine(null)}}>
                  모두
                </SelectionItem>
              </SelectionRow>
            </FitController>
            <FitController>
              <Text>세탁/건조 신청</Text>
              <SearchStudent
                setNewUser={setNewUser}
                nameResults={nameResults}
                setNameResults={setNameResults}
                nameLoading={nameLoading}
                setNameLoading={setNameLoading}
                nameSearch={nameSearch}
                setNameSearch={setNameSearch}
              />
              <Select style={{height: "5dvh"}} value={applyMachineId || ""} onChange={(e) => {
                if(e.target.value === "") {
                  setApplyMachineId(null);
                  setApplyTimeId(null);
                  return;
                }

                setApplyMachineId(e.target.value);
                setApplyTimeId(null);
              }}>
                <option value={""}>세탁/건조기 선택</option>
                {selectedMachine !== null && machines.map((m) => {
                  const timelineGrade = currentTimeline?.times.find(t => t.assigns.find(a => a.id === m.id))?.grade;

                  return <option key={m.id} value={m.id}>{`[${m.type === "washer" ? "세탁기" : "건조기"}] ${m.name} (${timelineGrade}학년)`}</option>
                })}
              </Select>
              <Select style={{height: "5dvh"}} value={applyTimeId || ""} onChange={(e) => {
                if(e.target.value === "") {
                  setApplyTimeId(null);
                  return;
                }

                setApplyTimeId(e.target.value);
              }}>
                <option value={""}>세탁/건조 시간 선택</option>
                {
                  selectedMachine !== null && applyMachineId !== null && currentTimeline?.times
                  .filter(t => t.assigns.find(a => a.id === applyMachineId))
                  .filter(time => !applies.find(a => a.laundryMachine.id === applyMachineId && a.laundryTime.id === time.id))
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((time) => (
                  <option key={time.id} value={time.id}>{time.time}</option>
                  ))
                }
              </Select>
              <Button type={"primary"} style={{height: "5dvh", padding: 0}} disabled={newUser === null || applyMachineId === null || applyTimeId === null} onClick={applyLaundry}>세탁/건조 신청</Button>
            </FitController>
            <StretchController>
              <Text>세탁/건조 신청 취소</Text>
              <Select style={{height: "5dvh"}} value={cancleMachineId || ""} onChange={(e) => {
                if(e.target.value === "") {
                  setCancleMachineId(null);
                  setCancleTimeId(null);
                  return;
                }

                setCancleMachineId(e.target.value);
                setCancleTimeId(null);
              }}>
                <option value={""}>세탁/건조기 선택</option>
                {selectedMachine !== null && machines.map((m) => {
                  const timelineGrade = currentTimeline?.times.find(t => t.assigns.find(a => a.id === m.id))?.grade;

                  return <option key={m.id} value={m.id}>{`[${m.type === "washer" ? "세탁기" : "건조기"}] ${m.name} (${timelineGrade}학년)`}</option>
                })}
              </Select>
              <Select style={{height: "5dvh"}} value={cancleTimeId || ""} onChange={(e) => {
                if(e.target.value === "") {
                  setCancleTimeId(null);
                  return;
                }

                setCancleTimeId(e.target.value);
              }}>
                <option value={""}>세탁/건조 시간 선택</option>
                {
                  selectedMachine !== null && cancleMachineId !== null && currentTimeline?.times
                  .filter(t => t.assigns.find(a => a.id === cancleMachineId))
                  .filter(time => applies.find(a => a.laundryMachine.id === cancleMachineId && a.laundryTime.id === time.id))
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((time) => {
                    const user = applies.find(a => a.laundryMachine.id === cancleMachineId && a.laundryTime.id === time.id)?.user;
                    return <option key={time.id} value={time.id}>{`${time.time} ${user ? ` (${user.grade}${user.class}${("0"+user.number).slice(-2)} ${user.name})` : ""}`}</option>
                  })
                }
              </Select>
              <Button type={"primary"} style={{height: "5dvh", padding: 0}} disabled={cancleMachineId === null || cancleTimeId === null} onClick={deleteLaundry}>세탁/건조 신청 취소</Button>
            </StretchController>
          </ControllerBox>
      </Wrapper>
  );

}

export default LaundryApplyPage;