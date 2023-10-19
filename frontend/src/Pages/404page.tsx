import styled from '@emotion/styled';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const StyledPageNotFound = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

function NotFound() {
    return (
        <>
            <Header />
            <StyledPageNotFound>
                <p>Where the hell are you going?</p>
            </StyledPageNotFound>
            <Footer />
        </>
    );
}

export default NotFound;
