import * as React from 'react';
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
import { useNavigate } from 'react-router-dom';

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

interface HomeMenuItem {
    icon: React.ReactNode;
    menuItem: string;
    onClickHandler: (
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        path: string
    ) => void;
}

function header() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const navigate = useNavigate();
    const goToPage = (path: string) => {
        navigate(path);
    };

    const renderMenuItems: HomeMenuItem[] = [
        {
            menuItem: 'Profile',
            icon: <AccountBox />,
            onClickHandler: () => goToPage('/Profile'),
        },
        {
            menuItem: 'Settings',
            icon: <Settings />,
            onClickHandler: () => goToPage('/Settings'),
        },
        //keep commented until i have a login page to redirect to
        // {
        //     menuItem: 'Logout',
        //     icon: <Logout />,
        //     onClickHandler: () => goToPage('/Logout'),
        // },
    ];

    const handleTypoClick = () => {
        navigate('/Home');
    };

    return (
        <StyledAppBar color="secondary">
            <Toolbar>
                <Typography onClick={handleTypoClick} variant="h5">
                    Transcendance
                </Typography>
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
                        {renderMenuItems.map((item: HomeMenuItem, index) => {
                            return (
                                <StyledMenuItem
                                    key={index}
                                    onClick={(click) =>
                                        item.onClickHandler(
                                            click,
                                            item.menuItem
                                        )
                                    }
                                >
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

export default header;
