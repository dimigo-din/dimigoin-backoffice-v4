import Scenery from "../../assets/imgs/schoolscenery.svg?react"
import styled from "styled-components";
import GoogleLogo from "../../assets/icons/google.svg?react";
import Logo from "../../assets/icons/dimigoin.svg?react";
import {getRedirectUri, googleLogin, getPermission, logout} from "../../api/auth.ts";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";
import {useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {parseJwt} from "../../utils/jwt.ts";

const Wrapper = styled.div`
  height: 100%;
  width: 100%;

  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: ${({theme}) => theme.Colors.Background.Primary};
`;

const Brand = styled.div`
  width: min(360px, calc(100% - 32px));
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
`;

const Title = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 10px;
  margin-bottom: 16px;

  font-size: ${({theme}) => theme.Font.Title.size};
  font-weight: ${({theme}) => theme.Font.Title.weight.strong};

  color: ${({theme}) => theme.Colors.Content.Primary};

  > svg {
    width: 28px;
    height: 28px;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  min-height: 56px;
  border-radius: ${({theme}) => theme.Radius[400]};
  background-color: ${({theme}) => theme.Colors.Core.Brand.Primary};

  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  color: ${({theme}) => theme.Colors.Solid.White};

  p {
    margin: 0;
    color: inherit;
    font-size: ${({theme}) => theme.Font.Body.size};
    line-height: ${({theme}) => theme.Font.Body.lineHeight};
    font-weight: ${({theme}) => theme.Font.Body.weight.regular};
  }

  > svg {
    width: 18px;
    height: 18px;
  }

  &:active {
    background-color: ${({theme}) => theme.Colors.Core.Brand.Secondary};
  }

  &:disabled {
    background-color: ${({theme}) => theme.Colors.Components.Fill.Tertiary};
    color: ${({theme}) => theme.Colors.Content.Tertiary};
    cursor: not-allowed;
  }
`;

const SceneryLayer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  pointer-events: none;

  > svg {
    width: 100%;
    height: auto;
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

        getPermission().then((res) => {
          const permissions = res;

          // 권한 체크
          if(permissions.length === 0) {
            showToast("권한이 없습니다.", "danger");
            logout();
            return;
          }

          localStorage.setItem("id", payload.id);
          localStorage.setItem("name", payload.name);
          localStorage.setItem("picture", payload.picture);
          localStorage.setItem("permissions", JSON.stringify(permissions));

          showToast("로그인에 성공하였습니다.", "info");
          setTimeout(() => {
            location.href = "/";
          }, 3000);
        })
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
        <LoginButton onClick={() => getRedirectUri().then(url => location.href = url).catch(() => showToast("서버에 연결할 수 없습니다", "danger"))}>
          <GoogleLogo/>
          <p>디미고 구글 계정으로 로그인</p>
        </LoginButton>
      </Brand>
      <SceneryLayer>
        <Scenery />
      </SceneryLayer>
    </Wrapper>
  );
}

export default LoginPage;
