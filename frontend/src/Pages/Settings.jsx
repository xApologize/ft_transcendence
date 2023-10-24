import Header from '../Components/Header';
import Footer from '../Components/Footer';
import styled from '@emotion/styled';
import { Box, Typography } from '@mui/material';

const StyledPageSettings = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StyledBox = styled(Box)`
    height: 50%;
    width: 50%;
    background-color: purple;
    display: flex;
    justify-content: center;
    align-items: center;
`;

function Settings() {
    return (
        <>
            <Header />
            <StyledPageSettings>
                <StyledBox>
                    <Typography>Settings</Typography>
                </StyledBox>
            </StyledPageSettings>
            <Footer />
        </>
    );
}

export default Settings;
