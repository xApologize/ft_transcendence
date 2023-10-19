import Header from '../Components/Header';
import Footer from '../Components/Footer';
import styled from '@emotion/styled';
import { Box, Typography } from '@mui/material';

const StyledPageAboutUs = styled.div`
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

function AboutUs() {
    return (
        <>
            <Header />
            <StyledPageAboutUs>
                <StyledBox>
                    <Typography>Abous us</Typography>
                </StyledBox>
            </StyledPageAboutUs>
            <Footer />
        </>
    );
}

export default AboutUs;
