import styled from "styled-components";
import {useState} from "react";
import {useNotification} from "../../providers/MobileNotifiCationProvider.tsx";
import {setPersonalInformations, type PersonalInformation} from "../../api/auth.ts";
import Papa from "papaparse";

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 16px;

  @media (max-width: 900px) {
    padding: 12px;
  }
`;

const TitleBar = styled.div`
  min-height: 56px;
  
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  div {
    width: 100%;
    
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

  gap: 12px;
`;

const ProcedureList = styled.div`
  flex: 1;
  height: 100%;
  
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  background-color: ${({theme}) => theme.Colors.Background.Secondary};
  border-radius: 12px;
  
  padding: 10px;
  overflow: auto;
`;

const ProcedureItem = styled.div`
  flex: 0 0 auto;
  
  min-height: 10dvh;
  max-height: fit-content;
  width: 100%;
  
  background-color: ${({theme}) => theme.Colors.Background.Primary};
  border-radius: 8px;

  padding: 3dvh;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  color: ${({theme}) => theme.Colors.Content.Primary};
  
  overflow: hidden;
  
  font-size: ${({theme}) => theme.Font.Headline.size};

  h1 {
    font-size: ${({theme}) => theme.Font.Title.size};
  }

  .right {
    width: 20%;
    height: 100%;

    display: flex;

    button {
      width: 100%;
    }
  }

  button {
    height: 5dvh;
    width: 20%;
    background-color: ${({theme}) => theme.Colors.Core.Brand.Primary};
    color: white;
    border: none;
    border-radius: 8px;
    font-size: ${({theme}) => theme.Font.Headline.size};
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${({theme}) => theme.Colors.Core.Brand.Primary}aa;
    }

    &:disabled {
      background-color: ${({theme}) => theme.Colors.Line.Outline};
      cursor: not-allowed;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1dvh;
    text-align: left;

    overflow-y: auto;
    display: block;
    height: 30dvh;

    thead {
      background-color: ${({theme}) => theme.Colors.Background.Secondary};
    }

    th, td {
      border: 1px solid ${({theme}) => theme.Colors.Line.Outline};
      padding: 0.5dvh 1dvh;
    }

    th {
      font-size: ${({theme}) => theme.Font.Headline.size};
    }
  }
`;

function StudentInfoPage() {
  const { showToast } = useNotification();

  const [personalInformations, setPersonalInformationsState] = useState<PersonalInformation[]>([]);

  const uploadFile = (file: File) => {
    Papa.parse(file, {
      header: true,          // 첫 줄을 컬럼명으로 사용
      skipEmptyLines: true,
      complete: (results: { data: any; }) => {
        console.log("파싱 결과:", results.data);

        setPersonalInformationsState(results.data.map((row: any) => ({
          gender: row[Object.keys(row)[2]] == "남" ? "male" : "female",
          mail: row[Object.keys(row)[0]],
          name: row[Object.keys(row)[3]],
          grade: parseInt(row[Object.keys(row)[1]].substring(0, 1)),
          class: parseInt(row[Object.keys(row)[1]].substring(1, 2)),
          number: parseInt(row[Object.keys(row)[1]].substring(2, 4))
        })));
      },
      error: (err: any) => {
        console.error("파싱 실패:", err);
      },
    });
  };

  const handleSetPersonalInformations = async () => {
    try {
      await setPersonalInformations(personalInformations);
      showToast("학생 정보가 성공적으로 등록되었습니다.", "info");
    } catch (e) {
      console.error(e);
      showToast("학생 정보 등록에 실패했습니다. 다시 시도해주세요.", "danger");
    }
  };

  return (
    <Wrapper>
      <TitleBar>
        <div>학생정보 등록</div>
      </TitleBar>
      <ContentWrapper>
        <ProcedureList>
          <ProcedureItem>
            <div>
              <h1>1. 엑셀 양식 다운로드</h1>
              <p>양식에 맞게 정보를 채워주세요.</p>
            </div>
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = "/디미고인_학생정보_양식.csv";
                link.download = "디미고인_학생정보_양식.csv";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              양식 다운로드
            </button>
          </ProcedureItem>
          <ProcedureItem>
            <div>
              <h1>2. 양식 업로드</h1>
              <p>입력한 양식을 저장 후, 업로드해주세요.</p>
            </div>
            <input
              type="file"
              id="file-upload"
              style={{ display: "none" }}
              accept=".csv"
              onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Handle file upload logic here
                uploadFile(file);
              }
              }}
            />
            <button
              onClick={() => {
              document.getElementById("file-upload")?.click();
              }}
            >
              양식 업로드
            </button>
          </ProcedureItem>
          <ProcedureItem>
            <div>
              <h1>3. 업로드 내용 확인</h1>
              <p>업로드된 내용이 맞는지 확인후 맞으면 버튼을 눌러주세요.</p>

              <table>
                <thead>
                  <tr>
                    <th>이메일</th>
                    <th>학번</th>
                    <th>성별</th>
                    <th>이름</th>
                  </tr>
                </thead>
                <tbody>
                  {personalInformations.map((info, index) => (
                    <tr key={index}>
                      <td>{info.mail}</td>
                      <td>{`${info.grade}${info.class}${info.number.toString().padStart(2, "0")}`}</td>
                      <td>{info.gender === "male" ? "남" : "여"}</td>
                      <td>{info.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="right">
              <button
                disabled={personalInformations.length === 0}
                onClick={() => handleSetPersonalInformations()}
              >
                적용
              </button>
            </div>
          </ProcedureItem>
        </ProcedureList>
      </ContentWrapper>
    </Wrapper>
  );
}

export default StudentInfoPage;