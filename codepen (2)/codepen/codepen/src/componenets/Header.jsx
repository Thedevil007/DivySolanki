
import { AppBar, Toolbar, styled } from "@mui/material";
import logo from '../images/AICODEPEN LOGO.png';
const Container = styled(AppBar)`
    background: #060606; /* Black color */
    height:9vh
    `;
const Logo = styled('img')`
height: 65px; /* Adjust the height if necessary */
    width:75px;
    margin-right: 10px
    `;

const Header = () =>{

    return(
        <Container position="static">
            <Toolbar>
            <Logo src={logo} alt="AI CodePen Logo" />
            </Toolbar>
        </Container>
    )

}

export default Header;





