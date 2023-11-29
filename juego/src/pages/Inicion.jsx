import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import { Login } from "../services/userServices";
import { UserContext } from "../context/userContext";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";

export const Inicio = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setTokenContext, setUserContext, savedUser } =
        useContext(UserContext);

    const submit = async (e) => {
        e.preventDefault();
        console.log("submit");

        if (email !== "" && password !== "") {
            const data = await Login(email, password);

            console.log(data.user);
            if (!data) {
                alert("error identificacion");
            } else {
                console.log(data.user);
                alert("success ident");
                setTokenContext(data.token);
                setUserContext(data.user);
                savedUser(data.user);
                return navigate("/dashboard");
            }
        }
    };

    return (
        <div className="container">
            <header>
                <h1>RULETA</h1>
            </header>
            <div id="singInDiv"></div>
            <div className="form">
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Enter email"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            autoComplete="on"
                        />
                    </Form.Group>

                    <Button onClick={submit} variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
            <br></br>
            <Link to="/crear">
                <h3 style={{ textDecoration: "none" }} id="title">
                    Crear cuenta
                </h3>
            </Link>
            <br />
            <footer>
                <h2>Encuentranos</h2>
            </footer>
        </div>
    );
};
