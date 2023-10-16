import * as React from 'react'
import {
    AppBar,
    Typography,
    Toolbar,
    IconButton,
    Avatar,
    Box,
    Menu,
    Button,
    MenuItem,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

import '../css/Components/header.css'

function header() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }
    return (
        <>
            <AppBar color="secondary" className="appbar">
                <Toolbar>
                    <IconButton edge="start" size="medium" color="inherit">
                        <MenuIcon />
                    </IconButton>
                    <Typography>Transcendance</Typography>
                    <Box className="avatar">
                        <Button
                            id="basic-button"
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                        >
                            <Avatar>T</Avatar>
                        </Button>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                        >
                            <MenuItem>Profile</MenuItem>
                            <MenuItem>Settings</MenuItem>
                            <MenuItem>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
        </>
    )
}

export default header
