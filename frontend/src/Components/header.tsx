import { AppBar, Container, Typography, Toolbar } from '@mui/material'
import Adbicon from '@mui/icons-material/adb'
function header() {
    return (
        <>
            <AppBar position="static" color="secondary">
                <Container fixed>
                    <Toolbar disableGutters variant="dense">
                        <Adbicon
                            sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
                        />
                        <Typography>Transcendance</Typography>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    )
}

export default header
