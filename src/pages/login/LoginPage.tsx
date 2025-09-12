import Scenery from "../../assets/imgs/schoolscenery.svg?react"
import styled from "styled-components";
import GoogleLogo from "../../assets/icons/google.svg?react";
import Logo from "../../assets/icons/dimigoin.svg?react";
import {getRedirectUri, googleLogin} from "../../api/auth.ts";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";
import {useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {parseJwt} from "../../utils/jwt.ts";

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  
  display: flex;
  flex-direction: column;
`;


const Brand = styled.div`
  flex: 1;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.div`
  display: flex;
  flex-direction: row;

  justify-content: center;
  align-items: center;

  gap: 8px;
  
  margin-top: 10dvh;

  font-size: ${({theme}) => theme.Font.Title.size};
  font-weight: ${({theme}) => theme.Font.Title.weight.strong};
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  > svg {
    height: 3dvh;
    width: 3dvh;
  }
`;

const LoginButton = styled.button`
  display: flex;
  flex-direction: row;

  justify-content: center;
  align-content: center;

  gap: 10px;

  width: 80%;
  margin: 0 auto;

  background-color: ${({theme}) => theme.Colors.Components.Translucent.Primary};
  padding: 16px 12px;
  border-radius: 16px;

  p {
    margin: auto 0;
    color: ${({theme}) => theme.Colors.Content.Primary};
  }

  &:active {
    background-color: ${({theme}) => theme.Colors.Components.Translucent.Tertiary};
  }

  &:disabled {
    background-color: ${({theme}) => theme.Colors.Components.Translucent.Tertiary};
    cursor: not-allowed;
  }
`;

function LoginPage() {
  const {showToast} = useNotification();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code") as string;
    if (code) {
      showToast("로그인중입니다...", "info");
      googleLogin(code).then(({accessToken}) => {
        const payload = parseJwt(accessToken);

        // 권한 체크
        if(payload.permission != 2 && payload.permission != 7) {
          showToast("권한이 없습니다.", "danger");
          return;
        }

        localStorage.setItem("id", payload.id);
        localStorage.setItem("name", payload.name);
        localStorage.setItem("picture", payload.picture);

        if (!localStorage.getItem("personalInformationKey")) {
          let token;
          while (!token) {
            token = prompt("선생님 전용 토큰을 입력해주세요.");
          }
          localStorage.setItem("personalInformationKey", token);
        }

        showToast("로그인에 성공하였습니다.", "info");
        setTimeout(() => {
          location.href = "/";
        }, 3000);
      }).catch((e) => {
        console.error(e);
        showToast("로그인에 실패했습니다.", "danger");
        showToast(e.response.data.error, "danger");
      });
    }
  }, []);
  return (
    <Wrapper>
      <Brand>
        <Title>
          <Logo/>
          <p>디미고인</p>
        </Title>
        <br/>
        <LoginButton onClick={() => getRedirectUri().then(url => location.href = url).catch(() => showToast("서버에 연결할 수 없습니다", "danger"))}>
          <GoogleLogo/>
          <p>디미고 구글 계정으로 로그인</p>
        </LoginButton>
      </Brand>
      <Scenery style={{ height: "fit-content" }} />
    </Wrapper>
  );
}

export default LoginPage;