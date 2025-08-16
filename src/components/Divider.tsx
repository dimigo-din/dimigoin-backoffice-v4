import styled from "styled-components";

const DividerElement = styled.div`
  height: 4px;
  width: 100%;
  
  margin: 10px 0;
  
  border-radius: 2px;
  
  background-color: ${({theme}) => theme.Colors.Line.Divider};
`;
function Divider() {
  return ( <DividerElement>&nbsp;</DividerElement>);
}

export default Divider;