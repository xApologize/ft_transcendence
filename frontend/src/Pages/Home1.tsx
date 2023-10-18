import Header from '../Components/Header1';
import Footer from '../Components/Footer';
import styled from '@emotion/styled';

const MainLayout = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 100%;
    height: 100vh;
`;

function Home() {
    return (
        <MainLayout>
            <Header />
            <Footer />
        </MainLayout>
    );
}

export default Home;
