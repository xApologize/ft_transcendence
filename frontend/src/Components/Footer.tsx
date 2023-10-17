import { AppBar, Toolbar, Typography } from '@mui/material';
import styled from '@emotion/styled';

const StyledAppBarFooter = styled(AppBar)`
    height: 32px;
    top: auto;
    bottom: 0;
`;

const StyledToolbar = styled(Toolbar)`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StyledCopyrightDiv = styled.div`
    height: 55px;
`;

const StyledAboutUsDiv = styled.div`
    position: absolute;
    right: 20px;
    height: 55px;
`;

function Footer() {
    return (
        <StyledAppBarFooter color="secondary">
            <StyledToolbar>
                <StyledCopyrightDiv>
                    <Typography>Copyright &copy;</Typography>
                </StyledCopyrightDiv>
                <StyledAboutUsDiv>
                    <Typography>about us</Typography>
                </StyledAboutUsDiv>
            </StyledToolbar>
        </StyledAppBarFooter>
    );
}
export default Footer;
