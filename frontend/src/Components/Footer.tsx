import { AppBar, Toolbar } from '@mui/material';
import styled from '@emotion/styled';

const StyledAppBarFooter = styled(AppBar)`
    height: 30px;
    top: auto;
    bottom: 0;
`;

function Footer() {
    return (
        <StyledAppBarFooter color="secondary">
            <Toolbar></Toolbar>
        </StyledAppBarFooter>
    );
}
export default Footer;
