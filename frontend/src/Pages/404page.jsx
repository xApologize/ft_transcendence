import styled from '@emotion/styled';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';

const StyledPageNotFound = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

function NotFound() {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/Home');
    };
    return (
        <>
            <Header />
            <StyledPageNotFound>
                <h2>Where the hell are you going?</h2>
                <Link
                    component="button"
                    underline="none"
                    color="inherit"
                    onClick={handleClick}
                >
                    Go back to safety
                </Link>
            </StyledPageNotFound>
            <Footer />
        </>
    );
}

export default NotFound;
