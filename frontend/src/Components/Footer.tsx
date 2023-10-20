import { AppBar, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

const StyledAppBarFooter = styled(AppBar)`
    top: auto;
    bottom: 0;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StyledCopyrightDiv = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StyledAboutUsDiv = styled.div`
    position: absolute;
    right: 1%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

function Footer() {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/AboutUs');
    };
    return (
        <StyledAppBarFooter color="secondary">
            <StyledCopyrightDiv>
                <Typography>Copyright &copy; Dream Team 2023</Typography>
            </StyledCopyrightDiv>
            <StyledAboutUsDiv>
                <Typography onClick={handleClick}>About us</Typography>
            </StyledAboutUsDiv>
        </StyledAppBarFooter>
    );
}
export default Footer;
