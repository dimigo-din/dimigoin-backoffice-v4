import {getTodayWakeup} from "../../api/wakeup.ts";
import {useEffect} from "react";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";

function OpenWakeup() {
  const { showToast } = useNotification();

  const run = (gender: "male" | "female") => {

    getTodayWakeup(gender).then((res) => {
      window.open(`https://www.youtube.com/watch?v=${res.video_id}`, "_blank");
    }).catch((e) => {
      console.log(e)
      showToast(e.response.data.error.message || e.response.data.error, "danger");
    });
  }

  useEffect(() => {
    if (confirm("학봉관 기상곡을 보려면 확인을, 우정학사 기상곡을 보려면 취소를 눌러주세요.")) {
      run("male");
    }else {
      run("female");
    }
  }, []);

  return (
    <>
      <link rel="manifest" href="/manifest_wakeup.json" />
      <link rel="apple-touch-icon" href="/dimigoin.png"/>
      <meta name="apple-mobile-web-app-capable" content="yes"/>
      <meta name="apple-mobile-web-app-title" content="디미고인 기상곡"/>
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
    </>
  );
}

export default OpenWakeup;