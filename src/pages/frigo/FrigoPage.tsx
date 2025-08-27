import styled from "styled-components";
import {Input} from "../../styles/components/input.ts";
import {useEffect, useState} from "react";
import {type FrigoApply, type FrigoTiming, getFrigoApplies} from "../../api/frigo.ts";
import type {User} from "../../api/user.ts";
import {Button} from "../../styles/components/button.ts";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";
import Loading from "../../components/Loading.tsx";

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  
  padding: 2dvh;
  
  gap: 2dvh;
`;

const ApplyList = styled.div`
  flex: 1;  
  
  height: 100%;

  border-radius: 8px;
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  
  padding: 1dvh;
  
  overflow-y: scroll;
`;

const ControllerBox = styled.div`
  height: 100%;
  width: 30%;
  
  display: flex;
  flex-direction: column;
  
  gap: 2dvh;
`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  border-left: ${({theme, border}) => border ? `1px solid ${theme.Colors.Line.Outline}` : "none"};
  
  background-color: ${({theme, selected}) => selected ? theme.Colors.Core.Brand.Primary : "none"};
`;

const Apply = styled.div`
  flex: 0 0 auto;
  
  height: 6dvh;
  
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  border-radius: 8px;
  
  background-color: ${({theme}) => theme.Colors.Background.Primary};
  padding: 0 2dvh;
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  > .left {
    font-size: ${({theme}) => theme.Font.Headline.size};
  }
  
  > .right {
    
  }
`;

function FrigoPage() {
  const { showToast } = useNotification()

  const [searchUser, setSearchUser] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [newUser, setNewUser] = useState<User | null>(null);
  const [newTiming, setNewTiming] = useState<FrigoTiming | null>(null);

  const [applies, setApplies] = useState<FrigoApply[] | null>(null);

  const apply = () => {

  }

  const updateScreen = () => {
    getFrigoApplies().then((data) => {
      setApplies(data);
    }).catch((e) => {
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  useEffect(() => {
    updateScreen();
  }, []);

  return (
    <Wrapper>
      <ApplyList>
        {applies !== null ? applies.map((a) => {
          return (
            <Apply>
              <div className={"left"}>{a.user.grade}{a.user.class}{("0"+a.user.number).slice(-2)} {a.user.name}</div>
              <div className={"right"}>
                <SelectionRow width={"10dvw"}>
                  <SelectionItem selected={a.approved == true}>
                    허가
                  </SelectionItem>
                  <SelectionItem selected={a.approved == null}
                                 border={true}>
                    검토
                  </SelectionItem>
                  <SelectionItem selected={a.approved == false}
                                 border={true}>
                    반려
                  </SelectionItem>
                </SelectionRow>
              </div>
            </Apply>
          );
        }) : Loading()}
      </ApplyList>
      <ControllerBox>
        <FitController>
          <Input placeholder={"학생 이름을 입력해주세요."} onChange={(e) => setSearchUser((e.target as HTMLInputElement).value)} value={searchUser!}></Input>
          <SelectionRow width={"100%"}>
            <SelectionItem selected={newTiming === "afterschool"}
                           onClick={() => setNewTiming("afterschool")}>
              종례 후
            </SelectionItem>
            <SelectionItem selected={newTiming === "dinner"}
                           border={true}
                           onClick={() => setNewTiming("dinner")}>
              저녁시간
            </SelectionItem>
            <SelectionItem selected={newTiming === "after_1st_study"}
                           border={true}
                           onClick={() => setNewTiming("after_1st_study")}>
              야자1T
            </SelectionItem>
            <SelectionItem selected={newTiming === "after_2nd_study"}
                           border={true}
                           onClick={() => setNewTiming("after_2nd_study")}>
              야자2T
            </SelectionItem>
          </SelectionRow>
          <Button onClick={() => apply()}>신청하기</Button>
        </FitController>
      </ControllerBox>
    </Wrapper>
  );
}

export default FrigoPage;