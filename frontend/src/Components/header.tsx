import * as React from 'react'
import {
    AppBar,
    Typography,
    Toolbar,
    Avatar,
    Box,
    Menu,
    Button,
    MenuItem,
} from '@mui/material';
import { AccountBox, Logout, Settings } from '@mui/icons-material';
import styled from '@emotion/styled';

interface HomeMenuItem {
    icon: React.ReactNode;
    menuItem: string;
}

const StyledAppBar = styled(AppBar)`
    width: 100%;
    color: secondary;
`;

const StyledBoxAvatar = styled(Box)`
    margin-left: auto;
`;

const StyledMenu = styled(Menu)`
    .MuiMenu-paper {
        width: 120px;
    }
`;

const StyledMenuItem = styled(MenuItem)`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
`;

function header() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const renderMenuItems: HomeMenuItem[] = [
        {
            menuItem: 'Profile',
            icon: <AccountBox />,
        },
        {
            menuItem: 'Settings',
            icon: <Settings />,
        },
        {
            menuItem: 'Logout',
            icon: <Logout />,
        },
    ];

    return (
        <StyledAppBar color="secondary">
            <Toolbar>
                <Typography variant="h5">Transcendance</Typography>
                <StyledBoxAvatar>
                    <Button
                        id="basic-button"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                    >
                        <Avatar>T</Avatar>
                    </Button>
                    <StyledMenu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                    >
                        {renderMenuItems.map((item: HomeMenuItem) => {
                            return (
                                <StyledMenuItem>
                                    {item.icon}
                                    {item.menuItem}
                                </StyledMenuItem>
                            );
                        })}
                    </StyledMenu>
                </StyledBoxAvatar>
            </Toolbar>
        </StyledAppBar>
    );
}

export default header
