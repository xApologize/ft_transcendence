import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';

const StyledPageProfile = styled.div`
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
function Profile() {
    return (
        <>
            <Header />
            <StyledPageProfile>
                <StyledBox>
                    <Typography>Profile</Typography>
                </StyledBox>
            </StyledPageProfile>
            <Footer />
        </>
    );
}

export default Profile;
