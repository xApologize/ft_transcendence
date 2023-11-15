import * as React from "react"
import {
    AppBar,
    Toolbar,
    Avatar,
    Box,
    Menu,
    Button,
    MenuItem,
    Link,
} from '@mui/material';
import { AccountBox, Settings } from '@mui/icons-material';
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
function header() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const navigate = useNavigate();
    const goToPage = (path) => {
        navigate(path);
    };
    const renderMenuItems = [
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
        //    menuItem: 'Logout',
        //    icon: <Logout />,
        //    onClickHandler: () => goToPage('/Logout'),
        // },
    ];
    const handleTypoClick = () => {
        navigate('/Home');
    };
    return (
        <StyledAppBar color="secondary">
            <Toolbar>
                <Link
                    component="button"
                    color="inherit"
                    underline="none"
                    onClick={handleTypoClick}
                    variant="h5"
                >
                    Transcendance
                </Link>
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
                        {renderMenuItems.map((item, index) => {
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
export default header