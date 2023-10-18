import { AppBar, Toolbar, Typography } from '@mui/material';
import styled from '@emotion/styled';

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
    right: 20px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

function Footer() {
    return (
        <StyledAppBarFooter color="secondary">
            <StyledCopyrightDiv>
                <Typography>Copyright &copy;</Typography>
            </StyledCopyrightDiv>
            <StyledAboutUsDiv>
                <Typography>about us</Typography>
            </StyledAboutUsDiv>
        </StyledAppBarFooter>
    );
}
export default Footer;
