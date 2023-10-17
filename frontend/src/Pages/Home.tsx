import Header from "../Components/header";
import Chat from '../Components/chat';
import Game from '../Components/game';
import styled from '@emotion/styled';

const MainLayout = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 100%;
    height: 100vh;
`;

const Container = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    min-width: 100%;
    height: 100%;
`;
function Home() {
    return (
        <MainLayout>
            <Header />
            <Container>
                <Chat />
                <Game />
            </Container>
        </MainLayout>
    );
}

export default Home;