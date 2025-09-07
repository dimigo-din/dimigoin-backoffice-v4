import styled from "styled-components";
import {useEffect, useState} from "react";
import {
  getLaundryMachineList,
  getLaundryTimeline,
  getLaundryTimelineList, type LaundryMachine,
  type LaundryTimeline,
  type LaundryTimelineListItem, type LaundryTimelinePayload, updateLaundryTimeline
} from "../../api/laundry.ts";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";
import Loading from "../../components/Loading.tsx";
import {Input} from "../../styles/components/input.ts";
import { Button } from "../../styles/components/button.ts";

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


const FitController = styled.div`
  height: fit-content;
  width: 100%;
  
  display: flex;
  flex-direction: column;

  border-radius: 8px;
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  
  padding: 2dvh 2dvh;
  gap: 1dvh;
`;

const StretchController = styled.div`
  flex: 1;
  width: 100%;
  
  display: flex;
  flex-direction: column;

  border-radius: 8px;
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  
  padding: 2dvh 2dvh;
  gap: 1dvh;
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

const TimelineListItemBlock = styled.div<{ selected: boolean }>`
  height: 5dvh;
  width: 100%;
  
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  border-radius: 8px;
  
  font-size: ${({theme}) => theme.Font.Headline.size};
  background-color: ${({theme, selected}) => selected ? theme.Colors.Components.Translucent.Primary : theme.Colors.Background.Tertiary};
  color: ${({theme}) => theme.Colors.Content.Primary};
  padding: 0 1dvw;
`;

const TimelineListItemEnableIndicator = styled.div<{ enabled?: boolean }>`
  font-size: ${({theme}) => theme.Font.Body.size};
  color: ${({theme}) => theme.Colors.Content.Primary};
  background-color: ${({theme, enabled}) => enabled ? theme.Colors.Core.Status.Positive : theme.Colors.Core.Status.Translucent.Positive};
  
  padding: 0.5dvh 0.5dvw;
  
  border-radius: 6px;
`;

const TimelineDetail = styled.div`
  height: 100%;
  width: 65%;
  
  display: flex;
  flex-direction: column;
  gap: 1dvh;
  
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  border-radius: 8px;
  
  padding: 1dvh 1dvh;
  
  overflow-y: scroll;
`;

const Time = styled.div`
  flex: 0 0 auto;
  
  height: 5dvh;
  width: 100%;
  
  display: flex;
  flex-direction: row;
  align-items: center;
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  background-color: ${({theme}) => theme.Colors.Background.Tertiary};
  border-radius: 8px;

  padding: 1dvh 1dvw;
  
  input {
    padding: 0 1dvh;
  }

  input[type="time"]::-webkit-calendar-picker-indicator {
    filter: ${window.matchMedia("(prefers-color-scheme: dark)").matches ? "invert(1)" : "none"};
  }
`;

const Select = styled.select`
  font-size: ${({theme}) => theme.Font.Headline.size};
  background-color: ${({theme}) => theme.Colors.Background.Quaternary};
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  color: ${({theme}) => theme.Colors.Content.Secondary};
  border: none;
  border-radius: 8px;

  padding: 2px;

  width: auto;
`;

const Text = styled.p`
  color: ${({theme}) => theme.Colors.Content.Primary};
  font-size: ${({theme}) => theme.Font.Callout.size};
`;

const DeleteTime = styled.div`
  margin-left: auto;
  
  border-radius: 6px;
  
  background-color: ${({theme}) => theme.Colors.Core.Status.Negative};
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  padding: 1dvh 1dvw;
`;

const LaundryTimeChildMachine = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  
  margin-left: 2dvh;
`;

const UnassignMachineButton = styled.div`
  margin-left: 0.2dvw;
  
  border-radius: 6px;

  background-color: ${({theme}) => theme.Colors.Core.Status.Negative};
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  padding: 0.3dvh 0.5dvw;
`;

function LaundryTimelinePage() {
  const { showToast } = useNotification();

  const [timelineList, setTimelineList] = useState<LaundryTimelineListItem[] | null>(null);
  const [currentTimeline, setCurrentTimeline] = useState<LaundryTimeline | null>(null);
  const [machineList, setMachineList] = useState<LaundryMachine[] | null>(null);

  const [filterGrade, setFilterGrade] = useState<1 | 2 | 3 | null>(null);

  const updateScreen = () => {
    getLaundryMachineList().then((data) => {
      setMachineList(data);
    }).catch((e) => {
      console.error(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
    getLaundryTimelineList().then((data) => {
      setTimelineList(data);

      if (currentTimeline) {
        getTimeline(currentTimeline.id);
      }
    }).catch((e) => {
      console.error(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  const getTimeline = (id: string) => {
    getLaundryTimeline(id).then((data) => {
      setCurrentTimeline(data);
    }).catch((e) => {
      console.error(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });;
  }

  const updateGradeForTime = (id: string, grade: 1 | 2 | 3) => {
    if (!currentTimeline) return;

    const payload: LaundryTimelinePayload & { id: string } = {
      id: currentTimeline.id,
      name: currentTimeline.name,
      triggeredOn: currentTimeline.triggeredOn,
      times: currentTimeline.times.map((time) => {
        return {
          time: time.time,
          grade: time.id === id ? grade : time.grade,
          assigns: time.assigns.map((assign) => assign.id),
        };
      })
    };

    updateLaundryTimeline(payload).then(() => {
      showToast("성공했습니다", "info");
      updateScreen();
    }).catch((e) => {
      console.error(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  const updateTimeForTime = (id: string, changed_time: string) => {
    if (!currentTimeline) return;

    const payload: LaundryTimelinePayload & { id: string } = {
      id: currentTimeline.id,
      name: currentTimeline.name,
      triggeredOn: currentTimeline.triggeredOn,
      times: currentTimeline.times.map((time) => {
        return {
          time: time.id === id ? changed_time : time.time,
          grade: time.grade,
          assigns: time.assigns.map((assign) => assign.id),
        };
      })
    };

    updateLaundryTimeline(payload).then(() => {
      showToast("성공했습니다", "info");
      updateScreen();
    }).catch((e) => {
      console.error(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  const deleteTime = (id: string) => {
    if (!currentTimeline) return;

    const payload: LaundryTimelinePayload & { id: string } = {
      id: currentTimeline.id,
      name: currentTimeline.name,
      triggeredOn: currentTimeline.triggeredOn,
      times: currentTimeline.times.filter((time) => time.id !== id).map((time) => {
        return {
          time: time.time,
          grade: time.grade,
          assigns: time.assigns.map((assign) => assign.id),
        };
      }),
    };

    updateLaundryTimeline(payload).then(() => {
      showToast("성공했습니다", "info");
      updateScreen();
    }).catch((e) => {
      console.error(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  const addTime = () => {
    if (!currentTimeline) return;

    let new_grade = null;
    let new_time = null;

    if (filterGrade === null) {
      while (!new_grade) {
        const tmp = prompt("대상 학년을 입력해주세요.");
        if (tmp === null) return;
        if (!(tmp === "1" || tmp === "2" || tmp === "3"))
          continue;
        new_grade = parseInt(tmp) as 1 | 2 | 3;
      }
    }else {
      new_grade = filterGrade;
    }

    while (!new_time) {
      const tmp = prompt("대상 시간을 입력해주세요. (24시 기준입니다. 예: 14:00)");
      if (tmp === null) return;

      const timeRegexp = /^((1[0-9])|(2[0-3])|(0[0-9])):([0-5][0-9])$/g;
      if (tmp.match(timeRegexp)) {
        new_time = tmp;
      }
    }

    const payload: LaundryTimelinePayload & { id: string } = {
      id: currentTimeline.id,
      name: currentTimeline.name,
      triggeredOn: currentTimeline.triggeredOn,
      times: currentTimeline.times.map((time) => {
        return {
          time: time.time,
          grade: time.grade,
          assigns: time.assigns.map((assign) => assign.id),
        };
      }).concat({ time: new_time, grade: new_grade, assigns: [] }),
    };

    updateLaundryTimeline(payload).then(() => {
      showToast("성공했습니다", "info");
      updateScreen();
    }).catch((e) => {
      console.error(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  const assignMachine = (timeid: string, machineid: string) => {
    if (!currentTimeline || machineid === "add") return;

    const payload: LaundryTimelinePayload & { id: string } = {
      id: currentTimeline.id,
      name: currentTimeline.name,
      triggeredOn: currentTimeline.triggeredOn,
      times: currentTimeline.times.map((time) => {
        if (time.id === timeid)
          return {
            time: time.time,
            grade: time.grade,
            assigns: time.assigns.map((assign) => assign.id).concat(machineid),
          };
        return {
          time: time.time,
          grade: time.grade,
          assigns: time.assigns.map((assign) => assign.id),
        };
      }),
    };

    updateLaundryTimeline(payload).then(() => {
      showToast("성공했습니다", "info");
      updateScreen();
    }).catch((e) => {
      console.error(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  const unassignMachine = (timeid: string, machineid: string) => {
    if (!currentTimeline) return;

    const payload: LaundryTimelinePayload & { id: string } = {
      id: currentTimeline.id,
      name: currentTimeline.name,
      triggeredOn: currentTimeline.triggeredOn,
      times: currentTimeline.times.map((time) => {
        return {
          time: time.time,
          grade: time.grade,
          assigns: time.assigns.filter((assign) => time.id === timeid && assign.id !== machineid).map((assign) => assign.id),
        };
      }),
    };

    updateLaundryTimeline(payload).then(() => {
      showToast("성공했습니다", "info");
      updateScreen();
    }).catch((e) => {
      console.error(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  useEffect(() => {
    updateScreen();
  }, []);

  return (
    <Wrapper>
      <TimelineDetail>
        {currentTimeline && currentTimeline.times.filter((time) => filterGrade === null || time.grade === filterGrade).map((time) => {
          return (
            <>
              <Time>
                <Input type={"time"} value={time.time} onChange={(e) => updateTimeForTime(time.id, e.target.value)} />
                &nbsp;
                -
                &nbsp;
                <Select value={time.grade} onInput={(e) => {updateGradeForTime(time.id, parseInt((e.target as HTMLSelectElement).value) as 1 | 2 | 3)}}>
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </Select>
                <DeleteTime onClick={() => deleteTime(time.id)}>삭제</DeleteTime>
              </Time>
              {time.assigns.map((assign) => {
                return (
                  <LaundryTimeChildMachine>
                    <Text>ㄴ</Text>
                    <Select value={assign.id}>
                      {machineList && machineList.map((machine) => {
                        return (
                          <option value={machine.id}>({machine.gender === "male" ? "남" : "여"}) {machine.name} {machine.type === "washer" ? "세탁기" : "건조기"}</option>
                        );
                      })}
                    </Select>
                    <UnassignMachineButton onClick={() => unassignMachine(time.id, assign.id)}>삭제</UnassignMachineButton>
                  </LaundryTimeChildMachine>
                );
              })}
              <LaundryTimeChildMachine>
                <Text>ㄴ</Text>
                <Select value={"add"} onInput={(e) => assignMachine(time.id, (e.target as HTMLSelectElement).value)}>
                  <option value={"add"}>추가하기</option>
                  {machineList && machineList.map((machine) => {
                    return (
                      <option value={machine.id}>({machine.gender === "male" ? "남" : "여"}) {machine.name} {machine.type === "washer" ? "세탁기" : "건조기"}</option>
                    );
                  })}
                </Select>
              </LaundryTimeChildMachine>
            </>
          );
        })}
      </TimelineDetail>
      <ControllerBox>
        <StretchController>
          <Text>세탁 일정 목록</Text>
          {timelineList !== null ? timelineList.map((tli) => {
            return (
              <TimelineListItemBlock selected={!!currentTimeline && (currentTimeline.id === tli.id)} onClick={() => getTimeline(tli.id)}>
                {tli.name}
                <TimelineListItemEnableIndicator enabled={tli.enabled}>
                  {tli.enabled ? "활성" : "비활성"}
                </TimelineListItemEnableIndicator>
              </TimelineListItemBlock>
            );
          }) : (<Loading />)}
        </StretchController>
        {currentTimeline && (
          <>
            <FitController>
              <Text>분류</Text>
              <SelectionRow width={"100%"}>
                <SelectionItem selected={filterGrade === 1}
                               onClick={() => setFilterGrade(1)}>
                  1학년 ({currentTimeline.times.filter((time) => time.grade === 1).length}건)
                </SelectionItem>
                <SelectionItem selected={filterGrade === 2}
                               border={true}
                               onClick={() => setFilterGrade(2)}>
                  2학년 ({currentTimeline.times.filter((time) => time.grade === 2).length}건)
                </SelectionItem>
                <SelectionItem selected={filterGrade === 3}
                               border={true}
                               onClick={() => setFilterGrade(3)}>
                  3학년 ({currentTimeline.times.filter((time) => time.grade === 3).length}건)
                </SelectionItem>
                <SelectionItem selected={filterGrade === null}
                               border={true}
                               onClick={() => setFilterGrade(null)}>
                  모두 ({currentTimeline.times.length}건)
                </SelectionItem>
              </SelectionRow>
            </FitController>
            <FitController>
              <Button onClick={() => addTime()}>세탁시간 추가하기</Button>
            </FitController>
          </>
        )}
      </ControllerBox>
    </Wrapper>
  );
}

export default LaundryTimelinePage;