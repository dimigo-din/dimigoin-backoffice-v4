import styled from "styled-components";
import {useEffect, useState} from "react";
import {deleteWakeupSong, getWakeupSongList, selectWakeupSong, type WakeupApply} from "../../api/wakeup.ts";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";

const Wrapper = styled.div`
  height: 100%;
  
  display: flex;
  flex-direction: column;
`;

const TitleBar = styled.div`
  height: 10%;
  
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  div {
    width: 50%;
    
    font-size: ${({theme}) => theme.Font.Title.size};
    color: ${({theme}) => theme.Colors.Content.Primary};
    
    text-align: center;
    
    align-content: center;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  gap: 1dvh;

  padding: 0 2dvh 2dvh;
`;

const WakeupList = styled.div`
  flex: 1;
  height: 100%;
  
  display: flex;
  flex-direction: column;
  gap: 1dvh;
  
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  border-radius: 12px;
  overflow: hidden;
  
  padding: 1dvh;
`;

const WakeupItem = styled.div`
  flex: 0 0 auto;
  
  height: 12dvh;
  width: 100%;
  
  background-color: ${({theme}) => theme.Colors.Background.Primary};
  border-radius: 8px;
  
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  overflow: hidden;
  
  > .left {
    height: 100%;
    width: 85%;
    
    display: flex;
    flex-direction: row;
    align-items: start;
    
    gap: 0.5dvw;
    padding: 1dvh 2dvh;
    
    img {
      height: 10dvh;
      
      cursor: pointer;
    }
    
    .info {
      .title {
        font-size: ${({theme}) => theme.Font.Headline.size};
      }
      .votes {
        color: ${({theme}) => theme.Colors.Content.Secondary}
      }
    }
  }
  
  > .right {
    width: 15%;
    
    display: flex;
    flex-direction: row;
    justify-content: right;
    
    > div {
      width: 50%;
      text-align: center;
      align-content: center;
      writing-mode: vertical-rl;
      text-orientation: upright;
    }
    
    > .delete {
      background-color: ${({theme}) => theme.Colors.Solid.Translucent.Red};
      border-left: 1px solid ${({theme}) => theme.Colors.Line.Divider};
      
      transition: background-color 300ms ease;
    }
    > .select {
      background-color: ${({theme}) => theme.Colors.Core.Brand.Tertiary};
      border-left: 1px solid ${({theme}) => theme.Colors.Line.Divider};
      
      transition: background-color 300ms ease;
    }

    > .delete:hover {
      background-color: ${({theme}) => theme.Colors.Solid.Red};
    }
    > .select:hover {
      background-color: ${({theme}) => theme.Colors.Core.Brand.Primary};
    }
  }
`;

function WakeupPage() {
  const { showToast } = useNotification();

  const [applies, setApplies] = useState<WakeupApply[] | null>();

  const updateScreen = () => {
    getWakeupSongList().then((data) => {
      setApplies(data.sort((a, b) =>
        (b.wakeupSongVote.filter((v) => v.upvote).length - b.wakeupSongVote.filter((v) => !v.upvote).length)
          -
        (a.wakeupSongVote.filter((v) => v.upvote).length - a.wakeupSongVote.filter((v) => !v.upvote).length)
      ));
    }).catch((e) => {
      console.log(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  const selectSong = (id: string) => {
    if (!confirm("확정하시겠습니까?")) return;
    selectWakeupSong(id).then(() => {
      showToast("성공했습니다.", "info");
      updateScreen();
    }).catch((e) => {
      console.log(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  const deleteSong = (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    deleteWakeupSong(id).then(() => {
      showToast("성공했습니다.", "info");
      updateScreen();
    }).catch((e) => {
      console.log(e);
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  useEffect(() => {
    updateScreen();
  }, []);

  return (
    <Wrapper>
      <TitleBar>
        <div>남학생 기상송 신청목록</div>
        <div>여학생 기상송 신청목록</div>
      </TitleBar>
      <ContentWrapper>
        <WakeupList>
          {applies && applies.filter((a) => a.gender === "male").map((apply, i) => {
            return (
              <WakeupItem key={i}>
                <div className="left">
                  <img src={apply.video_thumbnail} alt={apply.video_title} onClick={() => {window.open(`https://www.youtube.com/watch?v=${apply.video_id}`, "_blank")}}/>
                  <div className="info">
                    <div className="title">{apply.video_title.substring(0, 20)}{apply.video_title.length > 20 ? "..." : ""}</div>
                    <div className="votes">
                      좋아요 {apply.wakeupSongVote.filter((v) => v.upvote).length}개
                      싫어요 {apply.wakeupSongVote.filter((v) => !v.upvote).length}개
                    </div>
                  </div>
                </div>
                <div className="right">
                  <div className="delete" onClick={() => deleteSong(apply.id)}>삭제하기</div>
                  <div className="select" onClick={() => selectSong(apply.id)}>확정하기</div>
                </div>
              </WakeupItem>
            );
          })}
        </WakeupList>
        <WakeupList>
          {applies && applies.filter((a) => a.gender === "female").map((apply, i) => {
            return (
              <WakeupItem key={i}>
                <div className="left">
                  <img src={apply.video_thumbnail} alt={apply.video_title} onClick={() => {window.open(`https://www.youtube.com/watch?v=${apply.video_id}`, "_blank")}}/>
                  <div className="info">
                    <div className="title">{apply.video_title.substring(0, 20)}{apply.video_title.length > 20 ? "..." : ""}</div>
                    <div className="votes">
                      좋아요 {apply.wakeupSongVote.filter((v) => v.upvote).length}개
                      싫어요 {apply.wakeupSongVote.filter((v) => !v.upvote).length}개
                    </div>
                  </div>
                </div>
                <div className="right">
                  <div className="delete" onClick={() => deleteSong(apply.id)}>삭제하기</div>
                  <div className="select" onClick={() => selectSong(apply.id)}>확정하기</div>
                </div>
              </WakeupItem>
            );
          })}
        </WakeupList>
      </ContentWrapper>
    </Wrapper>
  );
}

export default WakeupPage;