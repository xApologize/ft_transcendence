import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';

const StyledBox = styled(Box)`
    background-color: var(--secondary-main);
    width: 33%;
    height: 33%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

function Game() {
    return (
        <StyledBox>
            <Typography variant="h4" align="center">
                Game setting <br /> Game will be pop over
            </Typography>
        </StyledBox>
    );
}
export default Game;
